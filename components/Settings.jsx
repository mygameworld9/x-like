
import React, { useState, useEffect } from 'react';

export const Settings = ({ onSave, onCancel }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    setStatus('Loading...');
    chrome.storage.sync.get(['supabaseUrl', 'supabaseAnonKey'], (items) => {
      if (items.supabaseUrl) setUrl(items.supabaseUrl);
      if (items.supabaseAnonKey) setKey(items.supabaseAnonKey);
      setStatus('');
    });
  }, []);

  const handleSave = () => {
    setStatus('Saving...');
    chrome.storage.sync.set({
      supabaseUrl: url.trim(),
      supabaseAnonKey: key.trim(),
    }, () => {
      if (chrome.runtime.lastError) {
        setStatus(`Error: ${chrome.runtime.lastError.message}`);
      } else {
        setStatus('Saved!');
        setTimeout(() => {
          onSave();
        }, 1000);
      }
    });
  };

  return (
    <div className="absolute inset-0 bg-gray-900 bg-opacity-95 p-4 flex flex-col z-10">
      <h2 className="text-lg font-bold text-sky-400 mb-4">Settings</h2>
      <div className="space-y-4 flex-grow">
        <div>
          <label htmlFor="supabase-url" className="block text-sm font-medium text-gray-300 mb-1">
            Supabase URL
          </label>
          <input
            type="url"
            id="supabase-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-sky-500 focus:border-sky-500"
            placeholder="https://your-project.supabase.co"
          />
        </div>
        <div>
          <label htmlFor="supabase-key" className="block text-sm font-medium text-gray-300 mb-1">
            Supabase Anon Key
          </label>
          <input
            type="text"
            id="supabase-key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-sky-500 focus:border-sky-500"
            placeholder="ey..."
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400 h-5">{status}</span>
        <div className="flex space-x-2">
           <button onClick={onCancel} className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
