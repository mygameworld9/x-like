-- Create tweets table for Twitter Like Catcher extension

CREATE TABLE IF NOT EXISTS public.tweets (
    id TEXT PRIMARY KEY,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    author_name TEXT NOT NULL,
    author_handle TEXT NOT NULL,
    tweet_text TEXT NOT NULL,
    tweet_url TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    quoted_tweet JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tweets_captured_at ON public.tweets(captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_tweets_author_handle ON public.tweets(author_handle);
CREATE INDEX IF NOT EXISTS idx_tweets_tags ON public.tweets USING GIN(tags);

-- Enable Row Level Security (RLS)
ALTER TABLE public.tweets ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
-- You can customize this based on your security requirements
CREATE POLICY "Allow all operations for authenticated users" 
ON public.tweets 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tweets_updated_at 
    BEFORE UPDATE ON public.tweets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust if needed)
GRANT ALL ON public.tweets TO anon, authenticated;
