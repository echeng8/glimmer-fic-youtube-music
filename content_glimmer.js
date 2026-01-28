// Content script: Detects song tags in Glimmer Fic stories and triggers playback

const SONG_PATTERN = /\/\/SONG:\s*([^-]+?)\s*-\s*(.+?)\/\/?/gi;
let processedSongs = new Set();
let debounceTimer = null;

function getPageText() {
  const containers = document.querySelectorAll('.animated-markdown, #chat-messages');
  let text = '';
  containers.forEach(c => (text += c.textContent + '\n'));
  return text || document.body.textContent;
}

function findSongs(text) {
  const songs = [];
  let match;
  while ((match = SONG_PATTERN.exec(text)) !== null) {
    songs.push({
      full: match[0],
      artist: match[1].trim(),
      title: match[2].trim()
    });
  }
  return songs;
}

function playSong(artist, title) {
  const query = `${artist} - ${title}`;
  
  if (!chrome.runtime?.id) return;
  
  try {
    chrome.runtime.sendMessage({
      type: 'PLAY_SONG',
      query,
      artist,
      title
    });
    console.log(`[Glimmer] 🎵 ${query}`);
  } catch (e) {
    console.error('[Glimmer] Send failed');
  }
}

function scan() {
  const songs = findSongs(getPageText());
  if (!songs.length) return;
  
  const latest = songs[songs.length - 1];
  if (processedSongs.has(latest.full)) return;
  
  processedSongs.add(latest.full);
  playSong(latest.artist, latest.title);
}

function debouncedScan() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(scan, 300);
}

scan();
const observer = new MutationObserver(debouncedScan);
observer.observe(document.body, { childList: true, subtree: true });
