// Fix: Declare chrome as any to resolve type errors when @types/chrome is not available.
declare const chrome: any;

import { addTweet, getRecentTweets } from './services/supabaseService';
import { analyzeTweet } from './services/keywordService';

chrome.runtime.onInstalled.addListener(() => {
  console.log("Twitter Like Catcher extension installed.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TWEET_LIKED') {
    console.log("Background script received TWEET_LIKED:", message.payload);
    (async () => {
      try {
        const tweetWithTags = analyzeTweet(message.payload);
        await addTweet(tweetWithTags);
        
        chrome.action.setBadgeBackgroundColor({ color: '#10B981' });
        chrome.action.setBadgeText({ text: '✓' });
        setTimeout(() => chrome.action.setBadgeText({ text: '' }), 3000);

        sendResponse({ success: true });
      } catch (error: any) {
        console.error("Error processing tweet:", error);
        
        chrome.action.setBadgeBackgroundColor({ color: '#EF4444' });
        chrome.action.setBadgeText({ text: 'ERR' });
        setTimeout(() => chrome.action.setBadgeText({ text: '' }), 3000);
        
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true; // Indicates that the response is sent asynchronously
  }

  if (message.type === 'GET_RECENT_TWEETS') {
    (async () => {
      try {
        const tweets = await getRecentTweets();
        sendResponse({ success: true, data: tweets });
      } catch (error: any) {
        console.error("Error fetching recent tweets:", error);
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true; // Indicates that the response is sent asynchronously
  }
});