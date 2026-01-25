import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VideoResult {
  success: boolean;
  platform: string;
  title?: string;
  thumbnail?: string;
  duration?: string;
  author?: string;
  videos?: {
    quality: string;
    url: string;
    size?: string;
  }[];
  error?: string;
}

// Rate limiting
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now - entry.timestamp > RATE_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT) {
    return false;
  }
  
  entry.count++;
  return true;
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now - entry.timestamp > RATE_WINDOW_MS) {
      rateLimitMap.delete(ip);
    }
  }
}, 60000);

function detectPlatform(url: string): string | null {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('instagram.com') || lowerUrl.includes('instagr.am')) {
    return 'instagram';
  }
  if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.watch') || lowerUrl.includes('fb.com')) {
    return 'facebook';
  }
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return 'youtube';
  }
  return null;
}

function isInstagramStory(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  return lowerUrl.includes('/stories/') || lowerUrl.includes('/story/');
}

async function extractInstagram(url: string, apiKey: string): Promise<VideoResult> {
  try {
    // Using RapidAPI's Instagram downloader
    const response = await fetch('https://instagram-scraper-api2.p.rapidapi.com/v1/post_info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com',
        'x-rapidapi-key': apiKey,
      },
      body: JSON.stringify({ code_or_id_or_url: url }),
    });

    if (!response.ok) {
      console.error('Instagram API error:', response.status);
      // Fallback: try alternative API
      return await extractInstagramFallback(url, apiKey);
    }

    const data = await response.json();
    console.log('Instagram API response:', JSON.stringify(data).substring(0, 500));

    if (data.data) {
      const post = data.data;
      const videos: VideoResult['videos'] = [];

      // Extract video URLs
      if (post.video_url) {
        videos.push({ quality: 'HD', url: post.video_url });
      }
      if (post.video_versions && Array.isArray(post.video_versions)) {
        post.video_versions.forEach((v: any, i: number) => {
          if (v.url && !videos.some(vid => vid.url === v.url)) {
            videos.push({ quality: i === 0 ? 'HD' : 'SD', url: v.url });
          }
        });
      }

      // Handle carousel posts
      if (post.carousel_media && Array.isArray(post.carousel_media)) {
        post.carousel_media.forEach((item: any) => {
          if (item.video_url) {
            videos.push({ quality: 'HD', url: item.video_url });
          }
        });
      }

      return {
        success: true,
        platform: 'instagram',
        title: post.caption?.text?.substring(0, 100) || 'Instagram Video',
        thumbnail: post.thumbnail_url || post.display_url,
        author: post.user?.username || 'Unknown',
        videos: videos.length > 0 ? videos : undefined,
      };
    }

    return await extractInstagramFallback(url, apiKey);
  } catch (error) {
    console.error('Instagram extraction error:', error);
    return await extractInstagramFallback(url, apiKey);
  }
}

async function extractInstagramFallback(url: string, apiKey: string): Promise<VideoResult> {
  try {
    // Alternative API
    const response = await fetch(`https://social-media-video-downloader.p.rapidapi.com/smvd/get/instagram?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'social-media-video-downloader.p.rapidapi.com',
        'x-rapidapi-key': apiKey,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        platform: 'instagram',
        error: 'Unable to fetch this content. It may be from a private account.',
      };
    }

    const data = await response.json();
    console.log('Instagram fallback response:', JSON.stringify(data).substring(0, 500));

    if (data.links && data.links.length > 0) {
      const videos = data.links
        .filter((link: any) => link.link)
        .map((link: any, i: number) => ({
          quality: link.quality || (i === 0 ? 'HD' : 'SD'),
          url: link.link,
          size: link.size,
        }));

      return {
        success: true,
        platform: 'instagram',
        title: data.title || 'Instagram Video',
        thumbnail: data.picture,
        duration: data.duration,
        videos,
      };
    }

    return {
      success: false,
      platform: 'instagram',
      error: 'No downloadable content found. Ensure the post is public.',
    };
  } catch (error) {
    console.error('Instagram fallback error:', error);
    return {
      success: false,
      platform: 'instagram',
      error: 'Failed to extract video. Please try again later.',
    };
  }
}

async function extractFacebook(url: string, apiKey: string): Promise<VideoResult> {
  try {
    const response = await fetch(`https://social-media-video-downloader.p.rapidapi.com/smvd/get/facebook?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'social-media-video-downloader.p.rapidapi.com',
        'x-rapidapi-key': apiKey,
      },
    });

    if (!response.ok) {
      console.error('Facebook API error:', response.status);
      return {
        success: false,
        platform: 'facebook',
        error: 'Unable to fetch this content. It may be from a private account.',
      };
    }

    const data = await response.json();
    console.log('Facebook API response:', JSON.stringify(data).substring(0, 500));

    if (data.links && data.links.length > 0) {
      const videos = data.links
        .filter((link: any) => link.link)
        .map((link: any, i: number) => ({
          quality: link.quality || (i === 0 ? 'HD' : 'SD'),
          url: link.link,
          size: link.size,
        }));

      return {
        success: true,
        platform: 'facebook',
        title: data.title || 'Facebook Video',
        thumbnail: data.picture,
        duration: data.duration,
        videos,
      };
    }

    return {
      success: false,
      platform: 'facebook',
      error: 'No downloadable content found. Ensure the post is public.',
    };
  } catch (error) {
    console.error('Facebook extraction error:', error);
    return {
      success: false,
      platform: 'facebook',
      error: 'Failed to extract video. Please try again later.',
    };
  }
}

async function extractYouTube(url: string, apiKey: string): Promise<VideoResult> {
  try {
    // Extract video ID from YouTube URL
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube.com/watch')) {
      const urlParams = new URL(url).searchParams;
      videoId = urlParams.get('v') || '';
    } else if (url.includes('youtube.com/shorts/')) {
      videoId = url.split('shorts/')[1]?.split('?')[0] || '';
    }

    if (!videoId) {
      return {
        success: false,
        platform: 'youtube',
        error: 'Invalid YouTube URL',
      };
    }

    // Using RapidAPI YouTube downloader
    const response = await fetch(`https://youtube-media-downloader.p.rapidapi.com/v2/video/details?videoId=${videoId}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'youtube-media-downloader.p.rapidapi.com',
        'x-rapidapi-key': apiKey,
      },
    });

    if (!response.ok) {
      console.error('YouTube API error:', response.status);
      return await extractYouTubeFallback(url, apiKey);
    }

    const data = await response.json();
    console.log('YouTube API response:', JSON.stringify(data).substring(0, 500));

    if (data.status && data.videos?.items) {
      const videos = data.videos.items
        .filter((item: any) => item.url && item.hasAudio)
        .slice(0, 4)
        .map((item: any) => ({
          quality: item.quality || 'SD',
          url: item.url,
          size: item.sizeText,
        }));

      return {
        success: true,
        platform: 'youtube',
        title: data.title || 'YouTube Video',
        thumbnail: data.thumbnails?.[0]?.url,
        duration: data.lengthText,
        author: data.channel?.name,
        videos,
      };
    }

    return await extractYouTubeFallback(url, apiKey);
  } catch (error) {
    console.error('YouTube extraction error:', error);
    return await extractYouTubeFallback(url, apiKey);
  }
}

async function extractYouTubeFallback(url: string, apiKey: string): Promise<VideoResult> {
  try {
    const response = await fetch(`https://social-media-video-downloader.p.rapidapi.com/smvd/get/youtube?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'social-media-video-downloader.p.rapidapi.com',
        'x-rapidapi-key': apiKey,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        platform: 'youtube',
        error: 'Unable to fetch this video.',
      };
    }

    const data = await response.json();
    console.log('YouTube fallback response:', JSON.stringify(data).substring(0, 500));

    if (data.links && data.links.length > 0) {
      const videos = data.links
        .filter((link: any) => link.link && link.mimeType?.includes('video'))
        .slice(0, 4)
        .map((link: any, i: number) => ({
          quality: link.quality || (i === 0 ? '720p' : '360p'),
          url: link.link,
          size: link.size,
        }));

      return {
        success: true,
        platform: 'youtube',
        title: data.title || 'YouTube Video',
        thumbnail: data.picture,
        duration: data.duration,
        videos,
      };
    }

    return {
      success: false,
      platform: 'youtube',
      error: 'No downloadable content found.',
    };
  } catch (error) {
    console.error('YouTube fallback error:', error);
    return {
      success: false,
      platform: 'youtube',
      error: 'Failed to extract video. Please try again later.',
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('cf-connecting-ip') || 
                     'unknown';
    
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for Instagram Stories
    if (isInstagramStory(url)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Instagram Stories are restricted by platform limitations. This tool supports public Reels and Posts only.',
          isStoryUrl: true
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Detect platform
    const platform = detectPlatform(url);
    if (!platform) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unsupported platform. We support Instagram, Facebook, and YouTube.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get API key
    const apiKey = Deno.env.get('RAPIDAPI_KEY');
    if (!apiKey) {
      console.error('RAPIDAPI_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Service temporarily unavailable. Please try again later.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Extracting ${platform} video from: ${url}`);

    let result: VideoResult;
    switch (platform) {
      case 'instagram':
        result = await extractInstagram(url, apiKey);
        break;
      case 'facebook':
        result = await extractFacebook(url, apiKey);
        break;
      case 'youtube':
        result = await extractYouTube(url, apiKey);
        break;
      default:
        result = { success: false, platform: 'unknown', error: 'Unsupported platform' };
    }

    console.log('Extraction result:', result.success ? 'Success' : result.error);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Video extraction error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'An unexpected error occurred. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
