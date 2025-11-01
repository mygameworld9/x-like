
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export const Settings = ({ onSave, onCancel }) => {
  const { t, language, setLanguage } = useLanguage();
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    setStatus(t('settings.loading'));
    chrome.storage.sync.get(['supabaseUrl', 'supabaseAnonKey'], (items) => {
      if (items.supabaseUrl) setUrl(items.supabaseUrl);
      if (items.supabaseAnonKey) setKey(items.supabaseAnonKey);
      setStatus('');
    });
  }, [t]);

  const handleSave = () => {
    setStatus(t('settings.saving'));
    chrome.storage.sync.set({
      supabaseUrl: url.trim(),
      supabaseAnonKey: key.trim(),
    }, () => {
      if (chrome.runtime.lastError) {
        setStatus(`Error: ${chrome.runtime.lastError.message}`);
      } else {
        setStatus(t('settings.saved'));
        setTimeout(() => {
          onSave();
        }, 1000);
      }
    });
  };

  return (
    <div className="absolute inset-0 bg-gray-900 bg-opacity-95 p-4 flex flex-col z-10">
      <h2 className="text-lg font-bold text-sky-400 mb-4">{t('settings.title')}</h2>
      <div className="space-y-4 flex-grow">
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-1">
            {t('settings.language')}
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="en">English</option>
            <option value="zh">中文</option>
          </select>
        </div>
        <div>
          <label htmlFor="supabase-url" className="block text-sm font-medium text-gray-300 mb-1">
            {t('settings.supabaseUrl')}
          </label>
          <input
            type="url"
            id="supabase-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-sky-500 focus:border-sky-500"
            placeholder={t('settings.urlPlaceholder')}
          />
        </div>
        <div>
          <label htmlFor="supabase-key" className="block text-sm font-medium text-gray-300 mb-1">
            {t('settings.supabaseKey')}
          </label>
          <input
            type="text"
            id="supabase-key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-sky-500 focus:border-sky-500"
            placeholder={t('settings.keyPlaceholder')}
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400 h-5">{status}</span>
        <div className="flex space-x-2">
           <button onClick={onCancel} className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors">
            {t('settings.cancel')}
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors">
            {t('settings.save')}
          </button>
        </div>
      </div>
    </div>
  );
};
