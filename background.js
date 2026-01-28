// Service worker: Manages YouTube Music tabs and auto-play

async function findYouTubeMusicTab() {
  const tabs = await chrome.tabs.query({ url: '*://music.youtube.com/*' });
  return tabs.length > 0 ? tabs[0] : null;
}

async function closeOtherYouTubeMusicTabs(keepTabId = null) {
  const tabs = await chrome.tabs.query({ url: '*://music.youtube.com/*' });
  for (const tab of tabs) {
    if (keepTabId === null || tab.id !== keepTabId) {
      await chrome.tabs.remove(tab.id);
    }
  }
}

async function playOnYouTubeMusic(query, originTabId) {
  const searchUrl = `https://music.youtube.com/search?q=${encodeURIComponent(query)}`;
  
  try {
    const existingTab = await findYouTubeMusicTab();
    
    if (existingTab) {
      await closeOtherYouTubeMusicTabs(existingTab.id);
      await chrome.tabs.update(existingTab.id, { url: searchUrl, active: true });
    } else {
      await chrome.tabs.create({ url: searchUrl, active: true });
    }
    
    setTimeout(async () => {
      if (originTabId) {
        try {
          await chrome.tabs.update(originTabId, { active: true });
        } catch (e) {}
      }
    }, 4000);
    
    console.log(`[Background] 🎵 ${query}`);
    return { success: true, message: `Playing: ${query}` };
  } catch (error) {
    console.error('[Background] Error:', error);
    return { success: false, message: error.message };
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PLAY_SONG') {
    playOnYouTubeMusic(message.query, sender.tab?.id)
      .then(sendResponse)
      .catch(e => sendResponse({ success: false, message: e.message }));
    return true;
  }
});
