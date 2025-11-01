
export interface QuotedTweet {
  id: string;
  author_name: string;
  author_handle: string;
  tweet_text: string;
}

export interface Tweet {
  id: string;
  captured_at: string;
  author_name: string;
  author_handle: string;
  tweet_text: string;
  tweet_url: string;
  tags?: string[];
  quoted_tweet?: QuotedTweet;
}

export type TweetForStorage = Omit<Tweet, 'captured_at'>;
