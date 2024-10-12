document.addEventListener('DOMContentLoaded', function() {
  const clientIdInput = document.getElementById('clientId');
  const saveClientIdButton = document.getElementById('saveClientId');
  const startUnfollowButton = document.getElementById('startUnfollow');
  const clientIdSection = document.getElementById('clientIdSection');
  const statusDiv = document.getElementById('status');
  const accountListDiv = document.getElementById('accountList');
  const unfollowSelectedButton = document.getElementById('unfollowSelected');

  // Check if Client ID is already saved
  chrome.storage.local.get(['clientId'], function(result) {
    if (result.clientId) {
      clientIdSection.style.display = 'none';
      startUnfollowButton.style.display = 'block';
    }
  });

  saveClientIdButton.addEventListener('click', function() {
    const clientId = clientIdInput.value.trim();
    if (clientId) {
      chrome.storage.local.set({clientId: clientId}, function() {
        statusDiv.textContent = "Client ID saved successfully!";
        clientIdSection.style.display = 'none';
        startUnfollowButton.style.display = 'block';
      });
    } else {
      statusDiv.textContent = "Please enter a valid Client ID.";
    }
  });

  startUnfollowButton.addEventListener('click', function() {
    statusDiv.textContent = "Fetching accounts...";
    chrome.runtime.sendMessage({action: "getAccountsToUnfollow"}, function(response) {
      if (response.status === "completed") {
        displayAccountList(response.accounts);
      } else {
        statusDiv.textContent = "Error: " + response.message;
      }
    });
  });

  unfollowSelectedButton.addEventListener('click', function() {
    const selectedUsers = Array.from(document.querySelectorAll('input[name="unfollowUser"]:checked')).map(checkbox => checkbox.value);
    if (selectedUsers.length === 0) {
      statusDiv.textContent = "Please select at least one account to unfollow.";
      return;
    }
    statusDiv.textContent = "Unfollowing selected accounts...";
    chrome.runtime.sendMessage({action: "unfollowSelected", selectedUsers: selectedUsers}, function(response) {
      if (response.status === "completed") {
        statusDiv.textContent = response.result;
        accountListDiv.innerHTML = '';
        unfollowSelectedButton.style.display = 'none';
      } else {
        statusDiv.textContent = "Error: " + response.message;
      }
    });
  });

  function displayAccountList(accounts) {
    accountListDiv.innerHTML = '';
    accounts.forEach(account => {
      const accountDiv = document.createElement('div');
      accountDiv.innerHTML = `
        <input type="checkbox" name="unfollowUser" value="${account.id}" id="user_${account.id}">
        <label for="user_${account.id}">${account.name} (@${account.username})</label>
      `;
      accountListDiv.appendChild(accountDiv);
    });
    unfollowSelectedButton.style.display = 'block';
    statusDiv.textContent = `Found ${accounts.length} accounts you haven't interacted with recently.`;
  }
});
