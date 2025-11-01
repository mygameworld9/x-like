console.log('%c[Twitter Like Catcher] Script loaded', 'color: blue; font-weight: bold');

if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
  console.error('%c[Twitter Like Catcher] ERROR: Chrome APIs not available', 'color: red; font-weight: bold');
  throw new Error('Chrome extension APIs not available');
}

console.log('%c[Twitter Like Catcher] ✓ APIs ready', 'color: green; font-weight: bold');

function expandTweetText(tweetArticle) {
  const buttons = tweetArticle.querySelectorAll('[role="button"],button');
  buttons.forEach(btn => {
    const text = btn.innerText;
    if (text.includes('显示更多') || text.includes('Show more') || text === '...') {
      console.log('Expanding tweet text...');
      btn.click();
    }
  });
}

document.body.addEventListener('click', function(e) {
  const likeBtn = e.target.closest('[data-testid="like"]');
  if (!likeBtn) return;
  
  console.log('Like button clicked');
  
  const tweetArticle = likeBtn.closest('article');
  if (!tweetArticle) {
    console.log('No article found');
    return;
  }

  expandTweetText(tweetArticle);

  setTimeout(() => {
    if (!chrome?.runtime?.id) {
      console.warn('%c[Twitter Like Catcher] Extension was reloaded. Please refresh this page.', 'color: orange; font-weight: bold');
      alert('Twitter Like Catcher extension was updated. Please refresh this page to continue.');
      return;
    }

    const authorLink = tweetArticle.querySelector('a[href*="/status/"]');
    let tweetLink = '';
    let authorId = '';
    let tweetId = '';
    
    if (authorLink) {
      const href = authorLink.getAttribute('href');
      tweetLink = 'https://x.com' + href;
      const parts = href.split('/');
      authorId = parts.length > 1 ? parts[1] : '';
      tweetId = parts.length > 3 ? parts[3] : '';
    }

    const tweetTextEl = tweetArticle.querySelector('[data-testid="tweetText"]');
    const text = tweetTextEl ? tweetTextEl.innerText : '[No text]';

    if (!tweetId || !authorId) {
      console.log('Missing required data:', {tweetId, authorId});
      return;
    }

    // Extract images (exclude avatars and emojis)
    const imgLinks = Array.from(tweetArticle.querySelectorAll('img')).filter(img => {
      // Exclude avatars
      const isAvatar =
        (img.alt && ['Avatar', '头像', 'Profile image', 'Profile photo'].includes(img.alt)) ||
        img.src.includes('/profile_images/') || img.src.includes('profile_banners');
      // Exclude emojis
      const isEmoji = img.alt && (img.alt === 'Emoji' || img.alt === '表情');
      // Keep media images
      const isMediaImg =
        (img.src.includes('media') || img.src.includes('twimg')) &&
        (
          img.parentNode?.parentNode?.getAttribute('role') === 'group' ||
          img.parentNode?.getAttribute('data-testid') === 'tweetPhoto' ||
          img.parentNode?.getAttribute('role') === 'group'
        ) &&
        img.naturalWidth >= 60 && img.naturalHeight >= 60;
      return !isAvatar && !isEmoji && isMediaImg;
    }).map(img => img.src);

    // Extract video links
    let videoLinks = [];
    const iStatusLink = tweetArticle.querySelector('a[href*="/i/status/"]');
    if (iStatusLink) {
      videoLinks.push("https://x.com" + iStatusLink.getAttribute('href'));
    }
    const videoEls = Array.from(tweetArticle.querySelectorAll('video'));
    videoEls.forEach(video => {
      if (video.src) videoLinks.push(video.src);
      Array.from(video.querySelectorAll('source')).forEach(source => {
        if (source.src) videoLinks.push(source.src);
      });
    });

    const data = {
      id: tweetId,
      author_name: authorId,
      author_handle: authorId,
      tweet_text: text,
      tweet_url: tweetLink,
      images: imgLinks.length > 0 ? imgLinks : undefined,
      videos: videoLinks.length > 0 ? videoLinks : undefined
    };

    console.log('Sending tweet data:', data);
    
    try {
      chrome.runtime.sendMessage({ type: 'TWEET_LIKED', payload: data }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('%c[Twitter Like Catcher] Error:', 'color: red', chrome.runtime.lastError.message);
          if (chrome.runtime.lastError.message.includes('Extension context invalidated')) {
            alert('Extension was reloaded. Please refresh this page.');
          }
        } else {
          console.log('%c✓ Tweet saved successfully!', 'color: green; font-weight: bold');
        }
      });
    } catch (error) {
      console.error('%c[Twitter Like Catcher] Failed to send message:', 'color: red', error);
      if (error.message.includes('Extension context invalidated')) {
        alert('Extension was reloaded. Please refresh this page to continue.');
      }
    }
  }, 200);
}, true);
