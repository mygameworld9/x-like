
// Define your keywords here. Keys are the tags, values are arrays of keywords.
const KEYWORD_MAP = {
  'react': ['react', 'reactjs', 'nextjs', 'remix'],
  'typescript': ['typescript', 'ts'],
  'ai': ['ai', 'artificial intelligence', 'machine learning', 'llm', 'gemini'],
  'webdev': ['web development', 'frontend', 'backend', 'css'],
  'design': ['ui/ux', 'design system', 'figma', 'tailwindcss'],
  'database': ['database', 'sql', 'postgres', 'supabase'],
  'opensource': ['open source', 'oss'],
};

export const analyzeTweet = (tweet) => {
  const content = (tweet.tweet_text + ' ' + (tweet.quoted_tweet?.tweet_text || '')).toLowerCase();
  const tags = new Set();

  for (const [tag, keywords] of Object.entries(KEYWORD_MAP)) {
    for (const keyword of keywords) {
      if (content.includes(keyword.toLowerCase())) {
        tags.add(tag);
        break; // Move to the next tag once a match is found
      }
    }
  }

  return {
    ...tweet,
    tags: Array.from(tags),
  };
};
