
import React from 'react';
import type { Tweet } from '../types';
import { LinkIcon } from './icons';

interface TweetCardProps {
  tweet: Tweet;
}

export const TweetCard: React.FC<TweetCardProps> = ({ tweet }) => {
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
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
