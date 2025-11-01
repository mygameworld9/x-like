// Fix: Declare chrome as any to resolve type errors when @types/chrome is not available.
declare const chrome: any;

import type { TweetForStorage, QuotedTweet } from './types';

console.log("Twitter Like Catcher content script loaded.");

const extractTweetData = (tweetArticle: HTMLElement): TweetForStorage | null => {
  try {
    const idElement = tweetArticle.querySelector('a[href*="/status/"]');
    const id = idElement?.getAttribute('href')?.split('/status/')[1]?.split('?')[0];

    const authorName = (tweetArticle.querySelector('[data-testid="User-Name"]')?.textContent || '').trim();
    const authorHandle = (tweetArticle.querySelector('div[dir="ltr"] > span')?.textContent || '').trim();

    const tweetText = (tweetArticle.querySelector('[data-testid="tweetText"]')?.textContent || '').trim();
    const tweetUrl = `https://twitter.com${idElement?.getAttribute('href')}`;
    
    if (!id || !authorName || !authorHandle || !tweetText) {
      console.warn("Could not extract all required tweet data.", { id, authorName, authorHandle, tweetText });
      return null;
    }

    // Check for and extract quoted tweet
    const quotedTweetContainer = tweetArticle.querySelector('div[role="link"] article');
    let quoted_tweet: QuotedTweet | undefined;
    if (quotedTweetContainer) {
        const quotedIdElement = quotedTweetContainer.querySelector('a[href*="/status/"]');
        const quotedId = quotedIdElement?.getAttribute('href')?.split('/status/')[1]?.split('?')[0];
        const quotedAuthorName = (quotedTweetContainer.querySelector('[data-testid="User-Name"]')?.textContent || '').trim();
        const quotedAuthorHandle = (quotedTweetContainer.querySelector('div[dir="ltr"] > span')?.textContent || '').trim();
        const quotedTweetText = (quotedTweetContainer.querySelector('[data-testid="tweetText"]')?.textContent || '').trim();
        
        if (quotedId && quotedAuthorName && quotedAuthorHandle) {
            quoted_tweet = {
                id: quotedId,
                author_name: quotedAuthorName,
                author_handle: quotedAuthorHandle,
                tweet_text: quotedTweetText
            };
        }
    }

    return { id, author_name: authorName, author_handle: authorHandle, tweet_text: tweetText, tweet_url: tweetUrl, quoted_tweet };
  } catch (error) {
    console.error("Error extracting tweet data:", error);
    return null;
  }
};

document.body.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  const likeButton = target.closest('[data-testid="like"], [data-testid="unlike"]');

  if (likeButton) {
    // We only care about liking, not unliking
    if (likeButton.getAttribute('data-testid') === 'unlike') {
      console.log('Tweet unliked, skipping capture.');
      return;
    }

    const tweetArticle = likeButton.closest('article[data-testid="tweet"]');
    if (tweetArticle) {
      setTimeout(() => { // Give DOM a moment to update if needed
        const tweetData = extractTweetData(tweetArticle as HTMLElement);
        if (tweetData) {
          console.log("Sending liked tweet to background script:", tweetData);
          chrome.runtime.sendMessage({ type: 'TWEET_LIKED', payload: tweetData });
        }
      }, 100);
    }
  }
}, true); // Use capture phase to catch the event early