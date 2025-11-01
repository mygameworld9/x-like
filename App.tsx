declare const chrome: any;

import React, { useState, useEffect } from 'react';
import { Settings } from './components/Settings';
import { SettingsIcon, RefreshIcon, DownloadIcon, LinkIcon } from './components/icons';
import { useLanguage } from './i18n/LanguageContext';

const App: React.FC = () => {
  const { t } = useLanguage();
  const [showSettings, setShowSettings] = useState(false);
  const [showTweets, setShowTweets] = useState(false);
  const [stats, setStats] = useState({ total: 0, today: 0 });
  const [storageMode, setStorageMode] = useState<'local' | 'supabase'>('local');
  const [tweets, setTweets] = useState<any[]>([]);
  const [selectedTweets, setSelectedTweets] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    if (!chrome?.storage) return;
    
    chrome.storage.local.get(['tweets'], (result) => {
      if (chrome.runtime.lastError) {
        console.error('Error loading tweets:', chrome.runtime.lastError);
        return;
      }
      const loadedTweets = result.tweets || [];
      setTweets(loadedTweets.reverse());
      
      const today = new Date().toDateString();
      const todayCount = loadedTweets.filter((t: any) => {
        try {
          return new Date(t.captured_at).toDateString() === today;
        } catch {
          return false;
        }
      }).length;
      setStats({ total: loadedTweets.length, today: todayCount });
    });

    chrome.storage.sync.get(['supabaseUrl', 'supabaseAnonKey'], (items) => {
      if (chrome.runtime.lastError) return;
      if (items.supabaseUrl && items.supabaseAnonKey) {
        setStorageMode('supabase');
      }
    });
  };

  const handleExportAll = () => {
    if (tweets.length === 0) {
      alert(t('alerts.noDataToExport'));
      return;
    }
    exportTweets(tweets, 'all');
  };

  const handleExportSelected = () => {
    if (selectedTweets.size === 0) {
      alert(t('alerts.selectTweetsToExport'));
      return;
    }
    const selected = tweets.filter(t => selectedTweets.has(t.id));
    exportTweets(selected, 'selected');
  };

  const exportTweets = (tweetsToExport: any[], type: string) => {
    const dataStr = JSON.stringify(tweetsToExport, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `twitter-likes-${type}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleTweetSelection = (id: string) => {
    const newSelected = new Set(selectedTweets);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTweets(newSelected);
  };

  const selectAll = () => {
    setSelectedTweets(new Set(tweets.map(t => t.id)));
  };

  const deselectAll = () => {
    setSelectedTweets(new Set());
  };

  const handleClear = () => {
    if (!chrome?.storage) return;
    if (confirm(t('alerts.clearConfirm'))) {
      chrome.storage.local.set({ tweets: [] }, () => {
        if (chrome.runtime.lastError) {
          alert(t('alerts.clearFailed'));
          return;
        }
        setTweets([]);
        setStats({ total: 0, today: 0 });
        alert(t('alerts.clearSuccess'));
      });
    }
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="w-[400px] h-[500px] bg-gray-900 text-gray-100 font-sans p-4 flex flex-col">
      <header className="flex justify-between items-center pb-3 border-b border-gray-700">
        <h1 className="text-xl font-bold text-sky-400">{t('app.title')}</h1>
        <div className="flex gap-2">
          <button onClick={loadStats} className="p-2 rounded-full hover:bg-gray-800 transition-colors" aria-label={t('header.refresh')}>
            <RefreshIcon className="w-5 h-5" />
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-full hover:bg-gray-800 transition-colors" aria-label={t('header.settings')}>
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {showSettings ? (
        <Settings onSave={() => { setShowSettings(false); loadStats(); }} onCancel={() => setShowSettings(false)} />
      ) : showTweets ? (
        <main className="flex-grow flex flex-col mt-4 overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">{t('tweets.title')} ({tweets.length})</h2>
            <button onClick={() => setShowTweets(false)} className="text-sm text-gray-400 hover:text-white">{t('tweets.back')}</button>
          </div>
          
          <div className="flex gap-2 mb-3">
            <button onClick={selectAll} className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded">{t('tweets.selectAll')}</button>
            <button onClick={deselectAll} className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded">{t('tweets.deselectAll')}</button>
            <button onClick={handleExportSelected} disabled={selectedTweets.size === 0} className="text-xs px-2 py-1 bg-sky-600 hover:bg-sky-700 rounded disabled:opacity-50 disabled:cursor-not-allowed ml-auto">
              {t('tweets.exportSelected')} ({selectedTweets.size})
            </button>
          </div>

          <div className="flex-grow overflow-y-auto space-y-2">
            {tweets.map((tweet) => (
              <div key={tweet.id} className={`p-3 rounded border cursor-pointer transition-colors ${selectedTweets.has(tweet.id) ? 'bg-sky-900 border-sky-500' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`} onClick={() => toggleTweetSelection(tweet.id)}>
                <div className="flex items-start gap-2">
                  <input type="checkbox" checked={selectedTweets.has(tweet.id)} onChange={() => {}} className="mt-1" />
                  <div className="flex-grow">
                    <p className="text-sm font-semibold text-gray-300">@{tweet.author_handle}</p>
                    <p className="text-xs text-gray-400 mt-1">{truncateText(tweet.tweet_text)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <a href={tweet.tweet_url} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <LinkIcon className="w-3 h-3" />{t('tweets.view')}
                      </a>
                      <span className="text-xs text-gray-500">{new Date(tweet.captured_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      ) : (
        <main className="flex-grow flex flex-col mt-4 overflow-hidden">
          <div className="space-y-4 overflow-y-auto">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h2 className="text-lg font-semibold mb-3">{t('statistics.title')}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">{t('statistics.totalCaptured')}</p>
                  <p className="text-2xl font-bold text-sky-400">{stats.total}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">{t('statistics.today')}</p>
                  <p className="text-2xl font-bold text-green-400">{stats.today}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h2 className="text-lg font-semibold mb-3">{t('storage.title')}</h2>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">{storageMode === 'local' ? t('storage.localOnly') : t('storage.supabase')}</span>
                <span className={`text-xs px-2 py-1 rounded ${storageMode === 'local' ? 'bg-yellow-900 text-yellow-300' : 'bg-green-900 text-green-300'}`}>{storageMode === 'local' ? t('storage.offline') : t('storage.synced')}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">{storageMode === 'local' ? t('storage.localDesc') : t('storage.supabaseDesc')}</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h2 className="text-lg font-semibold mb-3">{t('actions.title')}</h2>
              <div className="space-y-2">
                <button onClick={() => setShowTweets(true)} className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">{t('actions.viewTweets')}</button>
                <button onClick={handleExportAll} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded-md transition-colors">
                  <DownloadIcon className="w-4 h-4" />{t('actions.exportAll')}
                </button>
                <button onClick={handleClear} className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors">{t('actions.clearLocal')}</button>
              </div>
            </div>
          </div>
        </main>
      )}

      <footer className="text-center text-xs text-gray-500 pt-3 mt-auto border-t border-gray-700">
        <p>{t('app.version')}</p>
      </footer>
    </div>
  );
};

export default App;
