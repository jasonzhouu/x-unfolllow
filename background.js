const REDIRECT_URI = chrome.identity.getRedirectURL();
const OAUTH2_ENDPOINT = 'https://twitter.com/i/oauth2/authorize';
const SCOPE = 'users.read follows.read follows.write tweet.read like.read';

chrome.runtime.onInstalled.addListener(function() {
  console.log("Twitter Unfollow Assistant installed");
});

function getAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['clientId'], function(result) {
      if (!result.clientId) {
        reject(new Error("Client ID not set. Please set it in the extension popup."));
        return;
      }

      chrome.identity.launchWebAuthFlow({
        url: `${OAUTH2_ENDPOINT}?response_type=token&client_id=${result.clientId}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPE)}`,
        interactive: true
      }, (redirectUrl) => {
        if (chrome.runtime.lastError || !redirectUrl) {
          reject(chrome.runtime.lastError || new Error("Failed to get auth token"));
        } else {
          const url = new URL(redirectUrl);
          const params = new URLSearchParams(url.hash.slice(1));
          resolve(params.get('access_token'));
        }
      });
    });
  });
}

async function getUserId(token) {
  const response = await fetch('https://api.twitter.com/2/users/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.data.id;
}

async function getRecentInteractions(token, userId) {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const startTime = threeMonthsAgo.toISOString();

  // Get recent likes
  const likesResponse = await fetch(`https://api.twitter.com/2/users/${userId}/liked_tweets?max_results=100&start_time=${startTime}&tweet.fields=author_id`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const likesData = await likesResponse.json();

  // Get recent tweets (including replies)
  const tweetsResponse = await fetch(`https://api.twitter.com/2/users/${userId}/tweets?max_results=100&start_time=${startTime}&tweet.fields=in_reply_to_user_id`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const tweetsData = await tweetsResponse.json();

  const interactedAccounts = new Set();

  // Add authors of liked tweets
  likesData.data?.forEach(tweet => interactedAccounts.add(tweet.author_id));

  // Add users replied to
  tweetsData.data?.forEach(tweet => {
    if (tweet.in_reply_to_user_id) {
      interactedAccounts.add(tweet.in_reply_to_user_id);
    }
  });

  return Array.from(interactedAccounts);
}

async function getFollowing(token, userId) {
  let following = [];
  let paginationToken = null;

  do {
    const url = `https://api.twitter.com/2/users/${userId}/following?max_results=1000${paginationToken ? `&pagination_token=${paginationToken}` : ''}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    following = following.concat(data.data || []);
    paginationToken = data.meta.next_token;
  } while (paginationToken);

  return following;
}

async function unfollowUser(token, userId) {
  const response = await fetch(`https://api.twitter.com/2/users/me/following/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.status === 200;
}

async function unfollowInactiveUsers(token, userId) {
  const interactedAccounts = await getRecentInteractions(token, userId);
  const following = await getFollowing(token, userId);
  
  const accountsToUnfollow = following.filter(user => !interactedAccounts.includes(user.id));
  
  let unfollowCount = 0;
  for (const user of accountsToUnfollow) {
    const unfollowed = await unfollowUser(token, user.id);
    if (unfollowed) {
      unfollowCount++;
    }
    // Add a delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return unfollowCount;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startUnfollow") {
    getAuthToken()
      .then(async token => {
        const userId = await getUserId(token);
        const unfollowCount = await unfollowInactiveUsers(token, userId);
        sendResponse({status: "completed", result: `Unfollowed ${unfollowCount} accounts.`});
      })
      .catch(error => {
        sendResponse({status: "error", message: error.message});
      });
    return true; // Indicates that the response will be sent asynchronously
  }
});
