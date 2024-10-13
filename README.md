# Twitter Unfollow Assistant

Twitter Unfollow Assistant is a browser extension that helps you manage your Twitter following list by identifying and unfollowing accounts you haven't interacted with recently.

## Features

- Authenticates with Twitter API using OAuth 2.0
- Identifies accounts you follow but haven't interacted with in the last 3 months
- Allows you to select which accounts to unfollow
- Provides a simple user interface to manage the unfollowing process

## Installation

1. Clone this repository or download the source code.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the directory containing the extension files.

## Usage

1. Click on the extension icon in your browser toolbar.
2. Enter your Twitter API Client ID (you need to create a Twitter Developer account and app to get this).
3. Click "Save Client ID".
4. Click "Find Accounts to Unfollow" to fetch the list of accounts you haven't interacted with recently.
5. Select the accounts you want to unfollow from the list.
6. Click "Unfollow Selected" to unfollow the chosen accounts.

## Requirements

- Google Chrome browser (or any Chromium-based browser that supports Chrome extensions)
- Twitter Developer account and API credentials

## Technical Details

- Built using HTML, CSS, and JavaScript
- Uses Chrome Extension APIs for storage and authentication
- Interacts with Twitter API v2 for fetching user data and managing follows

## Privacy and Security

This extension requires access to your Twitter account to function. It only performs the actions you explicitly request and does not store any of your Twitter data outside of your local browser storage.

## Limitations

- The extension can only fetch the last 100 likes and tweets due to API limitations. For heavy Twitter users, this might not cover the full 3-month period.
- Twitter API has rate limits that may affect the speed of operations for users with many followers.

## Contributing

Contributions to improve the Twitter Unfollow Assistant are welcome. Please feel free to submit pull requests or create issues for bugs and feature requests.

## License

[MIT License](LICENSE)

## Disclaimer

This project is not affiliated with, officially connected to, or endorsed by Twitter, Inc. Use at your own risk and in compliance with Twitter's terms of service.
