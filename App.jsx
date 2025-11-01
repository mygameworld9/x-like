
import React, { useState, useEffect, useCallback } from 'react';
import { TweetCard } from './components/TweetCard.jsx';
import { Spinner } from './components/Spinner.jsx';
import { Settings } from './components/Settings.jsx';
import { RefreshIcon, SettingsIcon } from './components/icons.jsx';
import { getRecentTweets } from './services/supabaseService.js';


const App = () => {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const fetchTweets = useCallback(() => {
    setLoading(true);
    setError(null);
    getRecentTweets()
      .then(data => {
        setTweets(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching tweets:', error);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // Check if Supabase is configured before fetching
    chrome.storage.sync.get(['supabaseUrl', 'supabaseAnonKey'], (items) => {
      if (!items.supabaseUrl || !items.supabaseAnonKey) {
        setError("Supabase is not configured. Please open settings.");
        setLoading(false);
      } else {
        fetchTweets();
      }
    });
  }, [fetchTweets]);
  
  const handleSettingsSaved = () => {
    setShowSettings(false);
    fetchTweets(); // Refresh tweets after saving new settings
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Spinner />
        </div>
      );
    }
    if (error) {
       return (
        <div className="flex flex-col items-center justify-center h-full text-red-400 text-center">
          <p>Error: {error}</p>
          {error.includes("configured") && (
             <button
                onClick={() => setShowSettings(true)}
                className="mt-4 px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors"
              >
                Open Settings
              </button>
          )}
        </div>
      );
    }
    if (tweets.length > 0) {
      return (
        <div className="space-y-4">
          {tweets.map((tweet) => (
            <TweetCard key={tweet.id} tweet={tweet} />
          ))}
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>No tweets captured yet. Like a tweet on Twitter!</p>
      </div>
    );
  };

  return (
    <div className="w-[400px] h-[500px] bg-gray-900 text-gray-100 font-sans p-4 flex flex-col">
      <header className="flex justify-between items-center pb-3 border-b border-gray-700">
        <h1 className="text-xl font-bold text-sky-400">Twitter Like Catcher</h1>
        <div className="flex items-center space-x-2">
            <button
                onClick={fetchTweets}
                disabled={loading}
                className="p-2 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Refresh tweets"
            >
                <RefreshIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                aria-label="Settings"
            >
                <SettingsIcon className="w-5 h-5" />
            </button>
        </div>
      </header>
      <main className="flex-grow overflow-y-auto mt-4 pr-2 -mr-2 relative">
        {showSettings ? <Settings onSave={handleSettingsSaved} onCancel={() => setShowSettings(false)} /> : renderContent()}
      </main>
      <footer className="text-center text-xs text-gray-500 pt-3 mt-auto border-t border-gray-700">
        <p>V2.0 - Cloud Sync Edition</p>
      </footer>
    </div>
  );
};

export default App;
