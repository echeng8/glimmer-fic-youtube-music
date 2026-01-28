// Content Script for Glimmer Fic Spotify Integration
// This script runs on Glimmer Fic pages and sends song requests to the background worker

/**
 * Send a search and play request to the background service worker
 * @param {string} artist - Artist name
 * @param {string} title - Track title
 * @returns {Promise<Object>} Result from background worker
 */
async function searchAndPlaySong(artist, title) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: 'searchAndPlay',
        artist: artist,
        title: title
      },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      }
    );
  });
}

/**
 * Request Spotify authentication
 * @returns {Promise<Object>} Authentication result
 */
async function authenticateSpotify() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: 'authenticate'
      },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      }
    );
  });
}

// Example usage: Detect song information from the page and play it
// This is a placeholder - actual implementation depends on Glimmer Fic page structure
function detectAndPlaySong() {
  // Example: Look for song metadata in the page
  // You'll need to adjust these selectors based on actual Glimmer Fic page structure
  const artistElement = document.querySelector('[data-artist]');
  const titleElement = document.querySelector('[data-title]');
  
  if (artistElement && titleElement) {
    const artist = artistElement.textContent.trim();
    const title = titleElement.textContent.trim();
    
    console.log(`Detected song: ${artist} - ${title}`);
    
    searchAndPlaySong(artist, title)
      .then(result => {
        if (result.success) {
          console.log('Successfully playing:', result.track);
          // You could show a notification to the user here
        } else {
          console.error('Failed to play song:', result.error);
        }
      })
      .catch(error => {
        console.error('Error sending message:', error);
      });
  }
}

// Example: Listen for custom events that might trigger song playback
document.addEventListener('glimmerFicSongRequest', (event) => {
  const { artist, title } = event.detail;
  
  if (artist && title) {
    searchAndPlaySong(artist, title)
      .then(result => {
        if (result.success) {
          console.log('Song played:', result.track);
        } else {
          console.error('Failed to play:', result.error);
        }
      });
  }
});

console.log('Glimmer Fic Spotify content script loaded');

// Export functions for use in page context if needed
window.glimmerSpotify = {
  searchAndPlay: searchAndPlaySong,
  authenticate: authenticateSpotify
};
