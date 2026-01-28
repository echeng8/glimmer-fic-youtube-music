// Content script: Auto-plays search results on YouTube Music

function isSearchPage() {
  return window.location.href.includes('/search?q=');
}

function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve) => {
    const element = document.querySelector(selector);
    if (element) return resolve(element);
    
    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

async function playFirstResult() {
  await new Promise(r => setTimeout(r, 3000));
  
  const selectors = [
    'button[aria-label="Play"]',
    'yt-button-shape button[aria-label="Play"]',
    'ytmusic-responsive-list-item-renderer:first-of-type .title',
    'ytmusic-responsive-list-item-renderer:first-of-type'
  ];
  
  for (const selector of selectors) {
    const element = await waitForElement(selector, 2000);
    if (element) {
      try {
        element.click();
        console.log('[YT Music]  Playing');
        return true;
      } catch (e) {}
    }
  }
  return false;
}

async function handleAutoPlay() {
  if (!isSearchPage()) return;
  await playFirstResult();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', handleAutoPlay);
} else {
  handleAutoPlay();
}

let lastUrl = window.location.href;
new MutationObserver(() => {
  const url = window.location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    if (isSearchPage()) handleAutoPlay();
  }
}).observe(document.body, { childList: true, subtree: true });
