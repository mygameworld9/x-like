-- Add media column to tweets table to store images and videos

-- Add media column (stores array of media URLs and types)
ALTER TABLE public.tweets 
ADD COLUMN IF NOT EXISTS media JSONB DEFAULT '[]';

-- Media JSON structure example:
-- [
--   {"type": "photo", "url": "https://pbs.twimg.com/media/..."},
--   {"type": "video", "url": "https://video.twimg.com/...", "thumbnail": "https://..."}
-- ]

-- Create index for media queries
CREATE INDEX IF NOT EXISTS idx_tweets_media ON public.tweets USING GIN(media);

-- Comment on the column
COMMENT ON COLUMN public.tweets.media IS 'Array of media objects with type and URL';
