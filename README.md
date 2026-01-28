# Glimmer Fic Music Player

A Chrome Extension that automatically plays songs from YouTube Music when detected in Glimmer Fic stories.

## How It Works

Write song tags in your stories:
```
//SONG: The Glitch Mob - Animus Vox//
```

The extension:
1. Detects the song tag as the story text is streamed
2. Opens/updates a YouTube Music tab
3. Searches for the song
4. Auto-plays the result
5. Returns focus to your story

## Installation

1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select this folder

## Files

- `manifest.json` - Extension config
- `content_glimmer.js` - Detects song tags
- `background.js` - Manages YouTube Music tab
- `content_yt_music.js` - Auto-plays results

## Architecture

**Content Scripts:**
- Listen for `//SONG: Artist - Title//` patterns
- Handle streamed text (character-by-character spans)
- Debounce to prevent duplicates

**Background Worker:**
- Single persistent YouTube Music tab
- Message passing between scripts
- Auto-switch focus after 4 seconds

**Permissions:**
- `tabs` - Manage YouTube Music
- `*://music.youtube.com/*` - YouTube Music access
- `*://*.glimmerfics.com/*` - Story content access

## Technical Highlights

✅ Chrome Manifest V3 architecture  
✅ Content script communication patterns  
✅ Service worker state management  
✅ DOM mutation observation & text parsing  
✅ Focus-friendly UX (returns to reading)
