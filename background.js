
import { addTweet } from './services/supabaseService.js';
import { analyzeTweet } from './services/keywordService.js';

chrome.runtime.onInstalled.addListener(() => {
  console.log("Twitter Like Catcher extension installed.");
});

// Save to local storage
const saveToLocal = (tweet) => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['tweets'], (result) => {
      const tweets = result.tweets || [];
      // Add captured_at timestamp
      const tweetWithTimestamp = { ...tweet, captured_at: new Date().toISOString() };
      // Check if tweet already exists
      const exists = tweets.some(t => t.id === tweet.id);
      if (!exists) {
        tweets.push(tweetWithTimestamp);
        chrome.storage.local.set({ tweets }, () => {
          console.log('Tweet saved to local storage');
          resolve(true);
        });
      } else {
        console.log('Tweet already exists in local storage');
        resolve(false);
      }
    });
  });
};

const handleLikedTweet = async (message, sender, sendResponse) => {
    console.log("Background script received TWEET_LIKED:", message.payload);
    
    const tweetWithTags = analyzeTweet(message.payload);
    
    // Always save to local storage first
    await saveToLocal(tweetWithTags);
    
    // Try to save to Supabase if configured
    try {
        await addTweet(tweetWithTags);
        console.log('Tweet saved to both local and Supabase');
        
        chrome.action.setBadgeBackgroundColor({ color: '#10B981' });
        chrome.action.setBadgeText({ text: '✓' });
        setTimeout(() => chrome.action.setBadgeText({ text: '' }), 3000);

        sendResponse({ success: true, storage: 'both' });
    } catch (error) {
        console.warn("Supabase save failed, but saved locally:", error.message);
        
        // Yellow badge for local-only save
        chrome.action.setBadgeBackgroundColor({ color: '#F59E0B' });
        chrome.action.setBadgeText({ text: '📁' });
        setTimeout(() => chrome.action.setBadgeText({ text: '' }), 3000);
        
        sendResponse({ success: true, storage: 'local', warning: error.message });
    }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TWEET_LIKED') {
    handleLikedTweet(message, sender, sendResponse);
    return true;
  }
});
