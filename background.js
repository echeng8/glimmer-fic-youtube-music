// Background Service Worker for Glimmer Fic Spotify Integration
// Handles Spotify OAuth2 authentication and message passing

// Spotify API configuration
const SPOTIFY_CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID';
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_REDIRECT_URI = chrome.identity.getRedirectURL('spotify');
const SPOTIFY_SCOPES = [
  'user-modify-playback-state',
  'user-read-playback-state'
];

// Access token storage
let accessToken = null;
let tokenExpiry = null;

/**
 * Authenticate with Spotify using OAuth2
 * @returns {Promise<string>} Access token
 */
async function authenticateSpotify() {
  // Check if we have a valid token
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  // Build OAuth URL
  const authUrl = new URL(SPOTIFY_AUTH_URL);
  authUrl.searchParams.append('client_id', SPOTIFY_CLIENT_ID);
  authUrl.searchParams.append('response_type', 'token');
  authUrl.searchParams.append('redirect_uri', SPOTIFY_REDIRECT_URI);
  authUrl.searchParams.append('scope', SPOTIFY_SCOPES.join(' '));

  try {
    // Launch web auth flow
    const redirectUrl = await chrome.identity.launchWebAuthFlow({
      url: authUrl.toString(),
      interactive: true
    });

    // Extract access token from redirect URL
    const urlParams = new URLSearchParams(redirectUrl.split('#')[1]);
    accessToken = urlParams.get('access_token');
    const expiresIn = parseInt(urlParams.get('expires_in') || '3600', 10);
    
    // Set token expiry time (subtract 5 minutes for safety)
    tokenExpiry = Date.now() + (expiresIn - 300) * 1000;

    // Store token in chrome.storage for persistence
    await chrome.storage.local.set({
      accessToken,
      tokenExpiry
    });

    return accessToken;
  } catch (error) {
    console.error('Spotify authentication failed:', error);
    throw error;
  }
}

/**
 * Search for a track on Spotify
 * @param {string} artist - Artist name
 * @param {string} title - Track title
 * @returns {Promise<Object>} Track object
 */
async function searchTrack(artist, title) {
  const token = await authenticateSpotify();
  
  const query = encodeURIComponent(`artist:${artist} track:${title}`);
  const searchUrl = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`;

  const response = await fetch(searchUrl, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.tracks || !data.tracks.items || data.tracks.items.length === 0) {
    throw new Error('No tracks found');
  }

  return data.tracks.items[0];
}

/**
 * Play a track on Spotify
 * @param {string} trackUri - Spotify track URI
 * @returns {Promise<void>}
 */
async function playTrack(trackUri) {
  const token = await authenticateSpotify();
  
  const playUrl = 'https://api.spotify.com/v1/me/player/play';

  const response = await fetch(playUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      uris: [trackUri]
    })
  });

  if (!response.ok) {
    // Handle case where no active device is found
    if (response.status === 404) {
      throw new Error('No active Spotify device found. Please open Spotify and start playing something first.');
    }
    throw new Error(`Play failed: ${response.status} ${response.statusText}`);
  }
}

/**
 * Handle search and play flow
 * @param {string} artist - Artist name
 * @param {string} title - Track title
 * @returns {Promise<Object>} Result object
 */
async function searchAndPlay(artist, title) {
  try {
    console.log(`Searching for: ${artist} - ${title}`);
    
    // Search for the track
    const track = await searchTrack(artist, title);
    console.log(`Found track: ${track.name} by ${track.artists[0].name}`);
    
    // Play the track
    await playTrack(track.uri);
    console.log('Track playing successfully');
    
    return {
      success: true,
      track: {
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        uri: track.uri
      }
    };
  } catch (error) {
    console.error('Search and play failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Message listener for content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);
  
  // Handle search query from content script
  if (message.action === 'searchAndPlay') {
    const { artist, title } = message;
    
    if (!artist || !title) {
      sendResponse({
        success: false,
        error: 'Artist and title are required'
      });
      return true;
    }
    
    // Perform search and play (async)
    searchAndPlay(artist, title).then(result => {
      sendResponse(result);
    });
    
    // Return true to indicate we'll respond asynchronously
    return true;
  }
  
  // Handle authentication request
  if (message.action === 'authenticate') {
    authenticateSpotify()
      .then(token => {
        sendResponse({
          success: true,
          authenticated: true
        });
      })
      .catch(error => {
        sendResponse({
          success: false,
          error: error.message
        });
      });
    
    return true;
  }
  
  // Unknown action
  sendResponse({
    success: false,
    error: 'Unknown action'
  });
});

// Load stored token on startup
chrome.runtime.onStartup.addListener(async () => {
  const data = await chrome.storage.local.get(['accessToken', 'tokenExpiry']);
  if (data.accessToken && data.tokenExpiry) {
    accessToken = data.accessToken;
    tokenExpiry = data.tokenExpiry;
  }
});

// Also load on installation
chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get(['accessToken', 'tokenExpiry']);
  if (data.accessToken && data.tokenExpiry) {
    accessToken = data.accessToken;
    tokenExpiry = data.tokenExpiry;
  }
});

console.log('Glimmer Fic Spotify background service worker loaded');
