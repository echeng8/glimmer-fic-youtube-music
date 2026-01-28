# Glimmer Fic Spotify Integration

Chrome extension (Manifest V3) to automatically play Spotify songs on Glimmer Fic.

## Features

- **Spotify OAuth2 Authentication**: Uses `chrome.identity.launchWebAuthFlow` for secure authentication
- **Playback Control**: Requests `user-modify-playback-state` and `user-read-playback-state` scopes
- **Message-based Communication**: Content script sends search queries (Artist + Title) to background worker
- **Automatic Search & Play**: Background worker searches Spotify and plays matching tracks

## Setup Instructions

### 1. Get Spotify API Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Note your **Client ID**
4. Add a redirect URI: `https://<YOUR_EXTENSION_ID>.chromiumapp.org/spotify`

### 2. Configure the Extension

1. Open `manifest.json` and replace:
   - `YOUR_SPOTIFY_CLIENT_ID` with your actual Spotify Client ID
   - `YOUR_EXTENSION_KEY` with your extension key (generate one or remove this field)

2. Open `background.js` and replace:
   - `YOUR_SPOTIFY_CLIENT_ID` with your actual Spotify Client ID

### 3. Load the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the extension directory

### 4. Get Extension ID

After loading, note your extension ID from `chrome://extensions/`
Update the Spotify redirect URI in your Spotify app settings to match:
```
https://<YOUR_EXTENSION_ID>.chromiumapp.org/spotify
```

## File Structure

```
.
├── manifest.json      # Extension manifest (Manifest V3)
├── background.js      # Background service worker
├── content.js         # Content script for Glimmer Fic pages
└── README.md         # This file
```

## How It Works

### Background Service Worker (`background.js`)

The background service worker handles:

1. **Authentication** (`authenticateSpotify`):
   - Uses `chrome.identity.launchWebAuthFlow` for OAuth2
   - Requests scopes: `user-modify-playback-state`, `user-read-playback-state`
   - Stores access token in `chrome.storage.local`
   - Automatically refreshes tokens before expiry

2. **Message Listener**:
   - Listens for messages from content script
   - Accepts `action: 'searchAndPlay'` with `artist` and `title`
   - Accepts `action: 'authenticate'` for manual auth

3. **Search & Play Flow** (`searchAndPlay`):
   - Searches Spotify API for track matching artist + title
   - Plays the first matching track on active Spotify device
   - Returns success/error status with track details

### Content Script (`content.js`)

The content script:
- Runs on Glimmer Fic pages (configured in manifest.json)
- Sends search requests to background worker via `chrome.runtime.sendMessage`
- Provides example functions for detecting songs and triggering playback

### API Endpoints Used

- **Authentication**: `https://accounts.spotify.com/authorize`
- **Search**: `https://api.spotify.com/v1/search`
- **Play**: `https://api.spotify.com/v1/me/player/play`

## Usage Example

From content script or page context:

```javascript
// Search and play a song
chrome.runtime.sendMessage({
  action: 'searchAndPlay',
  artist: 'The Beatles',
  title: 'Hey Jude'
}, (response) => {
  if (response.success) {
    console.log('Playing:', response.track);
  } else {
    console.error('Error:', response.error);
  }
});
```

## Requirements

- Chrome browser (version 88+)
- Active Spotify Premium account
- Spotify app open with an active device

## Troubleshooting

**"No active Spotify device found"**
- Open Spotify desktop or web player
- Start playing any song first
- Then the extension can control playback

**Authentication fails**
- Verify Client ID matches in both `manifest.json` and `background.js`
- Ensure redirect URI is correctly configured in Spotify Dashboard
- Check that extension ID matches the redirect URI

**Search returns no results**
- Verify artist and title spelling
- Try simplifying the search query
- Check Spotify API availability

## License

MIT License - see LICENSE file for details
