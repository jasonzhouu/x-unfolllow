function getFollowingList() {
  return Array.from(document.querySelectorAll('[data-testid="UserCell"]'));
}

function getLastInteractionDate(userCell) {
  // This is a placeholder. Twitter doesn't provide this information directly.
  // You would need to implement a more complex solution to track interactions.
  return new Date(); // For now, we'll assume all interactions are recent
}

async function unfollowUser(userCell) {
  const unfollowButton = userCell.querySelector('[data-testid="unfollow"]');
  if (unfollowButton) {
    // Click the unfollow button
    unfollowButton.click();
    
    // Wait for the confirmation dialog to appear
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find and click the confirm button in the dialog
    const confirmButton = document.querySelector('[data-testid="confirmationSheetConfirm"]');
    if (confirmButton) {
      confirmButton.click();
      
      // Wait for the unfollow action to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if the unfollow was successful
      const followButton = userCell.querySelector('[data-testid="follow"]');
      if (followButton) {
        console.log("Successfully unfollowed user");
        return true;
      } else {
        console.log("Unfollow action might have failed");
        return false;
      }
    } else {
      console.log("Confirmation dialog not found");
      return false;
    }
  } else {
    console.log("Unfollow button not found");
    return false;
  }
}

async function startUnfollowProcess() {
  const followingList = getFollowingList();
  let unfollowCount = 0;

  for (const userCell of followingList) {
    const lastInteraction = getLastInteractionDate(userCell);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    if (lastInteraction < threeMonthsAgo) {
      if (await unfollowUser(userCell)) {
        unfollowCount++;
      }
      // Add a delay between unfollows to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  alert(`Unfollowed ${unfollowCount} accounts.`);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "startUnfollow") {
    if (window.location.href.includes("twitter.com/") && window.location.href.includes("/following")) {
      startUnfollowProcess().then(() => {
        sendResponse({status: "completed"});
      });
      return true; // Indicates that the response will be sent asynchronously
    } else {
      sendResponse({status: "error", message: "Not on Twitter following page"});
    }
  }
});
