
import { addTweet } from './services/supabaseService.js';
import { analyzeTweet } from './services/keywordService.js';

chrome.runtime.onInstalled.addListener(() => {
  console.log("Twitter Like Catcher extension installed.");
});

const handleLikedTweet = async (message, sender, sendResponse) => {
    console.log("Background script received TWEET_LIKED:", message.payload);
    try {
        const tweetWithTags = analyzeTweet(message.payload);
        await addTweet(tweetWithTags);
        
        chrome.action.setBadgeBackgroundColor({ color: '#10B981' });
        chrome.action.setBadgeText({ text: '✓' });
        setTimeout(() => chrome.action.setBadgeText({ text: '' }), 3000);

        sendResponse({ success: true });
    } catch (error) {
        console.error("Error processing tweet:", error);
        
        chrome.action.setBadgeBackgroundColor({ color: '#EF4444' });
        chrome.action.setBadgeText({ text: 'ERR' });
        setTimeout(() => chrome.action.setBadgeText({ text: '' }), 3000);
        
        sendResponse({ success: false, error: error.message });
    }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TWEET_LIKED') {
    handleLikedTweet(message, sender, sendResponse);
    return true; // Indicates that the response is sent asynchronously
  }
});
