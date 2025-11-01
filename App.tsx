
declare const chrome: any;

import React, { useState, useEffect } from 'react';
import { Settings } from './components/Settings';
import { SettingsIcon, RefreshIcon, DownloadIcon } from './components/icons';

const App: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [stats, setStats] = useState({ total: 0, today: 0 });
  const [storageMode, setStorageMode] = useState<'local' | 'supabase'>('local');

  useEffect(() => {
    // Load stats from local storage
    chrome.storage.local.get(['tweets'], (result) => {
      const tweets = result.tweets || [];
      const today = new Date().toDateString();
      const todayCount = tweets.filter((t: any) => 
        new Date(t.captured_at).toDateString() === today
      ).length;
      setStats({ total: tweets.length, today: todayCount });
    });

    // Check storage mode
    chrome.storage.sync.get(['supabaseUrl', 'supabaseAnonKey'], (items) => {
      if (items.supabaseUrl && items.supabaseAnonKey) {
        setStorageMode('supabase');
      }
    });
  }, []);

  const handleExport = () => {
    chrome.storage.local.get(['tweets'], (result) => {
      const tweets = result.tweets || [];
      const dataStr = JSON.stringify(tweets, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `twitter-likes-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const handleClear = () => {
    if (confirm('Clear all local data? This cannot be undone!')) {
      chrome.storage.local.set({ tweets: [] }, () => {
        setStats({ total: 0, today: 0 });
        alert('Local data cleared!');
      });
    }
  };

  const handleRefresh = () => {
    chrome.storage.local.get(['tweets'], (result) => {
      const tweets = result.tweets || [];
      const today = new Date().toDateString();
      const todayCount = tweets.filter((t: any) => 
        new Date(t.captured_at).toDateString() === today
      ).length;
      setStats({ total: tweets.length, today: todayCount });
    });
  };

  return (
    <div className="w-[400px] h-[500px] bg-gray-900 text-gray-100 font-sans p-4 flex flex-col">
      <header className="flex justify-between items-center pb-3 border-b border-gray-700">
        <h1 className="text-xl font-bold text-sky-400">Twitter Like Catcher</h1>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
            aria-label="Refresh"
          >
            <RefreshIcon className="w-5 h-5" />
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

      {showSettings ? (
        <Settings 
          onSave={() => {
            setShowSettings(false);
            handleRefresh();
          }} 
          onCancel={() => setShowSettings(false)} 
        />
      ) : (
        <main className="flex-grow flex flex-col mt-4">
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h2 className="text-lg font-semibold mb-3">Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Total Captured</p>
                  <p className="text-2xl font-bold text-sky-400">{stats.total}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Today</p>
                  <p className="text-2xl font-bold text-green-400">{stats.today}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h2 className="text-lg font-semibold mb-3">Storage Mode</h2>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">
                  {storageMode === 'local' ? '📁 Local Only' : '☁️ Supabase + Local'}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${storageMode === 'local' ? 'bg-yellow-900 text-yellow-300' : 'bg-green-900 text-green-300'}`}>
                  {storageMode === 'local' ? 'Offline' : 'Synced'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {storageMode === 'local' 
                  ? 'Configure Supabase in settings to enable cloud sync'
                  : 'Data is backed up locally and synced to Supabase'}
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h2 className="text-lg font-semibold mb-3">Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={handleExport}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded-md transition-colors"
                >
                  <DownloadIcon className="w-4 h-4" />
                  Export to JSON
                </button>
                <button
                  onClick={handleClear}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                >
                  Clear Local Data
                </button>
              </div>
            </div>
          </div>
        </main>
      )}

      <footer className="text-center text-xs text-gray-500 pt-3 mt-auto border-t border-gray-700">
        <p>V2.0 - Dual Storage Edition</p>
      </footer>
    </div>
  );
};

export default App;
