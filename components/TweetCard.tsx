
import React from 'react';
import type { Tweet } from '../types';
import { LinkIcon } from './icons';
import { useLanguage } from '../i18n/LanguageContext';

interface TweetCardProps {
  tweet: Tweet;
}

export const TweetCard: React.FC<TweetCardProps> = ({ tweet }) => {
  const { t } = useLanguage();
  const [imageErrors, setImageErrors] = React.useState<Set<number>>(new Set());
  
  const handleImageError = (idx: number) => {
    setImageErrors(prev => new Set(prev).add(idx));
  };
  
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + t('timeAgo.years');
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + t('timeAgo.months');
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + t('timeAgo.days');
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + t('timeAgo.hours');
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + t('timeAgo.minutes');
    return Math.floor(seconds) + t('timeAgo.seconds');
  };
    
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-sky-500 transition-all duration-200">
      <div className="flex justify-between items-start">
        <div>
            <p className="font-bold">{tweet.author_name}</p>
            <p className="text-sm text-gray-400">@{tweet.author_handle}</p>
        </div>
        <a href={tweet.tweet_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-400">
            <LinkIcon className="w-4 h-4" />
        </a>
      </div>
      <p className="my-3 text-gray-200 whitespace-pre-wrap">{tweet.tweet_text}</p>
      
      {/* Images */}
      {tweet.images && tweet.images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 my-3">
          {tweet.images.map((img, idx) => (
            <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="relative">
              {imageErrors.has(idx) ? (
                <div className="w-full h-32 flex items-center justify-center bg-gray-700 rounded border border-gray-600">
                  <div className="text-center text-gray-400">
                    <svg className="w-8 h-8 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xs">Image</p>
                  </div>
                </div>
              ) : (
                <img 
                  src={img} 
                  alt={`Image ${idx + 1}`} 
                  className="w-full h-32 object-cover rounded border border-gray-600 hover:border-sky-500 transition-colors"
                  loading="lazy"
                  crossOrigin="anonymous"
                  onError={() => handleImageError(idx)}
                />
              )}
            </a>
          ))}
        </div>
      )}
      
      {/* Videos */}
      {tweet.videos && tweet.videos.length > 0 && (
        <div className="my-3 space-y-2">
          {tweet.videos.map((video, idx) => (
            <a 
              key={idx} 
              href={video} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300 bg-gray-700/50 rounded px-3 py-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
              </svg>
              <span className="truncate">{video.includes('x.com') ? 'View Video' : `Video ${idx + 1}`}</span>
            </a>
          ))}
        </div>
      )}
      
      {tweet.quoted_tweet && (
          <div className="border-l-2 border-gray-600 pl-3 my-2 text-sm">
            <p className="font-semibold text-gray-300">{tweet.quoted_tweet.author_name} <span className="text-gray-500">@{tweet.quoted_tweet.author_handle}</span></p>
            <p className="text-gray-400 mt-1">{tweet.quoted_tweet.tweet_text}</p>
          </div>
      )}
      <div className="flex flex-wrap gap-2 mt-3 items-center">
        {tweet.tags?.map((tag) => (
          <span key={tag} className="bg-sky-900/50 text-sky-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
            #{tag}
          </span>
        ))}
        <span className="text-xs text-gray-500 ml-auto">{timeAgo(tweet.captured_at)}</span>
      </div>
    </div>
  );
};
