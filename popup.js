document.addEventListener('DOMContentLoaded', function() {
  const clientIdInput = document.getElementById('clientId');
  const saveClientIdButton = document.getElementById('saveClientId');
  const startUnfollowButton = document.getElementById('startUnfollow');
  const clientIdSection = document.getElementById('clientIdSection');
  const statusDiv = document.getElementById('status');

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
    chrome.runtime.sendMessage({action: "startUnfollow"}, function(response) {
      if (response.status === "completed") {
        statusDiv.textContent = "Unfollow process completed.";
      } else {
        statusDiv.textContent = "Error: " + response.message;
      }
    });
  });
});
