
import { createClient } from '@supabase/supabase-js';

let supabase = null;

const getSupabaseClient = () => {
  return new Promise((resolve, reject) => {
    if (supabase) {
      return resolve(supabase);
    }

    chrome.storage.sync.get(['supabaseUrl', 'supabaseAnonKey'], (items) => {
      if (chrome.runtime.lastError) {
        return reject(new Error(chrome.runtime.lastError.message));
      }
      
      const { supabaseUrl, supabaseAnonKey } = items;

      if (!supabaseUrl || !supabaseAnonKey) {
        return reject(new Error("Supabase credentials not set. Please configure them in the extension settings."));
      }

      try {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
        resolve(supabase);
      } catch(e) {
        reject(new Error("Failed to initialize Supabase client. Check your URL and Key in settings."));
      }
    });
  });
};

export const addTweet = async (tweet) => {
  const client = await getSupabaseClient();
  const { data, error } = await client
    .from('tweets')
    .upsert({ ...tweet, captured_at: new Date().toISOString() }, { onConflict: 'id' });

  if (error) {
    console.error('Supabase error:', error.message);
    throw new Error(`Failed to save tweet: ${error.message}`);
  }
  
  console.log('Tweet saved successfully:', data);
  return data;
};

export const getRecentTweets = async (limit = 20) => {
    const client = await getSupabaseClient();
    const { data, error } = await client
        .from('tweets')
        .select('*')
        .order('captured_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Supabase error fetching tweets:', error.message);
        throw new Error(`Failed to fetch recent tweets: ${error.message}`);
    }

    return data || [];
};
