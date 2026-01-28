# Configuration Guide for Glimmer Fic Spotify Integration

## Step-by-Step Setup

### 1. Register Spotify Application

1. Visit the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create an App"
4. Fill in the details:
   - **App Name**: Glimmer Fic Spotify Integration
   - **App Description**: Chrome extension to integrate Glimmer Fic with Spotify
   - **Redirect URIs**: (We'll add this after loading the extension)
5. Accept the terms and click "Create"
6. Copy your **Client ID** from the app page

### 2. Configure Extension Files

#### manifest.json

Replace the following placeholders:

```json
"oauth2": {
  "client_id": "YOUR_SPOTIFY_CLIENT_ID",  // Replace with your actual Client ID
  "scopes": [
    "user-modify-playback-state",
    "user-read-playback-state"
  ]
},
"key": "YOUR_EXTENSION_KEY"  // Optional: Can be removed for development
```

**Note**: The `key` field is optional for development. You can remove it entirely or generate a proper extension key for production.

#### background.js

Replace the following at the top of the file:

```javascript
const SPOTIFY_CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID';  // Replace with your actual Client ID
```

### 3. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" using the toggle in the top-right corner
3. Click "Load unpacked"
4. Navigate to and select your extension directory
5. The extension should now appear in the list

### 4. Get Extension ID

1. From the `chrome://extensions/` page, locate your extension
2. Copy the **Extension ID** (it looks like: `abcdefghijklmnopqrstuvwxyz123456`)

### 5. Configure Spotify Redirect URI

1. Return to your Spotify app in the [Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click "Edit Settings"
3. Under "Redirect URIs", add:
   ```
   https://<YOUR_EXTENSION_ID>.chromiumapp.org/spotify
   ```
   Replace `<YOUR_EXTENSION_ID>` with the actual ID from step 4
4. Click "Add"
5. Scroll down and click "Save"

### 6. Test the Extension

1. Open the included `test.html` file in Chrome
2. Click "Authenticate with Spotify"
3. Authorize the extension
4. Try the search and play functionality with a test song

## Content Script Configuration

The content script is configured to run on Glimmer Fic pages. Update the `matches` pattern in `manifest.json` if needed:

```json
"content_scripts": [
  {
    "matches": ["*://*.glimmerfic.com/*"],  // Update this pattern as needed
    "js": ["content.js"]
  }
]
```

Common pattern examples:
- All sites: `"*://*/*"`
- Specific domain: `"*://example.com/*"`
- Multiple domains: `["*://site1.com/*", "*://site2.com/*"]`

## Required Spotify Scopes

The extension requests the following scopes:

- `user-modify-playback-state`: Control playback (play, pause, skip)
- `user-read-playback-state`: Read current playback state

Add additional scopes if needed:
- `user-read-currently-playing`: Get currently playing track
- `user-read-recently-played`: Access recently played tracks
- `playlist-modify-public`: Modify public playlists
- `playlist-modify-private`: Modify private playlists

Update both `manifest.json` and `background.js` if you add scopes.

## Security Considerations

1. **Never commit credentials**: Keep your Client ID separate from source control
2. **Use environment variables**: Consider using a config file that's in `.gitignore`
3. **Client Secret**: For Chrome extensions using implicit grant flow, no client secret is needed
4. **HTTPS only**: Spotify OAuth requires HTTPS redirect URIs

## Troubleshooting

### "Invalid Client ID"
- Verify the Client ID is correct in both files
- Check for extra spaces or quotes

### "Invalid Redirect URI"
- Ensure the extension ID matches exactly
- Verify the URI is added in Spotify Dashboard
- Format must be: `https://<extension-id>.chromiumapp.org/spotify`

### "No Active Device"
- Open Spotify (desktop, web, or mobile)
- Start playing any song
- The extension can then control that device

### Token Expiration
- Tokens are automatically refreshed
- Stored in `chrome.storage.local`
- Re-authenticate if you see auth errors

## Development vs Production

### Development
- Use "Load unpacked" in Chrome
- Extension ID changes each time you reload
- Update Spotify redirect URI when ID changes

### Production
- Generate a stable extension key
- Package as `.crx` file
- Publish to Chrome Web Store
- Extension ID remains constant

## Additional Resources

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api/)
- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [chrome.identity API](https://developer.chrome.com/docs/extensions/reference/identity/)
