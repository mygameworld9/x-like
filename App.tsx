
// Fix: Declare chrome as any to resolve type errors when @types/chrome is not available.
declare const chrome: any;

import React, { useState, useEffect, useCallback } from 'react';
import type { Tweet } from './types';
import { TweetCard } from './components/TweetCard';
import { Spinner } from './components/Spinner';
import { RefreshIcon } from './components/icons';


const App: React.FC = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTweets = useCallback(() => {
    setLoading(true);
    setError(null);
    if (chrome && chrome.runtime) {
      chrome.runtime.sendMessage({ type: 'GET_RECENT_TWEETS' }, (response) => {
        if (chrome.runtime.lastError) {
          setError('Error connecting to the extension background script.');
          console.error(chrome.runtime.lastError.message);
          setLoading(false);
          return;
        }

        if (response?.success) {
          setTweets(response.data);
        } else {
          setError(response?.error || 'Failed to fetch tweets.');
        }
        setLoading(false);
      });
    } else {
        // Mock data for development outside extension context
        console.warn("chrome.runtime API not available. Using mock data.");
        setTimeout(() => {
            setTweets([
                { id: '1', author_name: 'React Dev', author_handle: 'reactdev', tweet_text: 'Just released a new version of our UI library! Check it out. #react #typescript', tweet_url: '#', tags: ['react', 'typescript'], captured_at: new Date().toISOString() },
                { id: '2', author_name: 'Tailwind CSS', author_handle: 'tailwindcss', tweet_text: 'Utility-first CSS is the future. Here is why you should be using it for your next project.', tweet_url: '#', tags: ['css', 'design'], captured_at: new Date().toISOString() }
            ]);
            setLoading(false);
        }, 1000);
    }
  }, []);

  useEffect(() => {
    fetchTweets();
  }, [fetchTweets]);

  return (
    <div className="w-[400px] h-[500px] bg-gray-900 text-gray-100 font-sans p-4 flex flex-col">
      <header className="flex justify-between items-center pb-3 border-b border-gray-700">
        <h1 className="text-xl font-bold text-sky-400">Twitter Like Catcher</h1>
        <button
          onClick={fetchTweets}
          disabled={loading}
          className="p-2 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Refresh tweets"
        >
          <RefreshIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>
      <main className="flex-grow overflow-y-auto mt-4 pr-2 -mr-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-400 text-center">
            <p>Error: {error}</p>
          </div>
        ) : tweets.length > 0 ? (
          <div className="space-y-4">
            {tweets.map((tweet) => (
              <TweetCard key={tweet.id} tweet={tweet} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No tweets captured yet. Like a tweet on Twitter!</p>
          </div>
        )}
      </main>
      <footer className="text-center text-xs text-gray-500 pt-3 mt-auto border-t border-gray-700">
        <p>V2.0 - Cloud Sync Edition</p>
      </footer>
    </div>
  );
};

export default App;