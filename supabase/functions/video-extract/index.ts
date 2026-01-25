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

// Instagram extraction using RapidAPI
async function extractInstagram(url: string, apiKey: string): Promise<VideoResult> {
  const apis = [
    {
      name: 'instagram-bulk-scraper-api',
      url: 'https://instagram-bulk-scraper-api.p.rapidapi.com/media_download_by_shortcode',
      host: 'instagram-bulk-scraper-api.p.rapidapi.com',
      method: 'GET',
      getUrl: (inputUrl: string) => {
        // Extract shortcode from URL
        const match = inputUrl.match(/\/(p|reel|reels)\/([A-Za-z0-9_-]+)/);
        const shortcode = match ? match[2] : '';
        return `https://instagram-bulk-scraper-api.p.rapidapi.com/media_download_by_shortcode?shortcode=${shortcode}`;
      },
      parseResponse: (data: any) => {
        if (data.data?.main_media_hd || data.data?.video_url) {
          return {
            success: true,
            platform: 'instagram',
            title: 'Instagram Reel',
            thumbnail: data.data?.thumbnail_url,
            videos: [{
              quality: 'HD',
              url: data.data?.main_media_hd || data.data?.video_url,
            }],
          };
        }
        return null;
      },
    },
    {
      name: 'instagram-scraper-api3',
      url: 'https://instagram-scraper-api3.p.rapidapi.com/post',
      host: 'instagram-scraper-api3.p.rapidapi.com',
      method: 'GET',
      getUrl: (inputUrl: string) => `https://instagram-scraper-api3.p.rapidapi.com/post?url=${encodeURIComponent(inputUrl)}`,
      parseResponse: (data: any) => {
        const videos: VideoResult['videos'] = [];
        if (data.video_url) {
          videos.push({ quality: 'HD', url: data.video_url });
        }
        if (data.video_versions) {
          data.video_versions.forEach((v: any, i: number) => {
            if (v.url && !videos.some(vid => vid.url === v.url)) {
              videos.push({ quality: i === 0 ? 'HD' : 'SD', url: v.url });
            }
          });
        }
        if (videos.length > 0) {
          return {
            success: true,
            platform: 'instagram',
            title: data.caption?.text?.substring(0, 50) || 'Instagram Video',
            thumbnail: data.thumbnail_url || data.display_url,
            author: data.user?.username,
            videos,
          };
        }
        return null;
      },
    },
  ];

  for (const api of apis) {
    try {
      console.log(`Trying Instagram API: ${api.name}`);
      const response = await fetch(api.getUrl(url), {
        method: api.method,
        headers: {
          'x-rapidapi-host': api.host,
          'x-rapidapi-key': apiKey,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`${api.name} response:`, JSON.stringify(data).substring(0, 300));
        const result = api.parseResponse(data);
        if (result) return result;
      } else {
        console.log(`${api.name} failed with status:`, response.status);
      }
    } catch (error) {
      console.error(`${api.name} error:`, error);
    }
  }

  return {
    success: false,
    platform: 'instagram',
    error: 'Unable to fetch this content. It may be from a private account.',
  };
}

// Facebook extraction using RapidAPI
async function extractFacebook(url: string, apiKey: string): Promise<VideoResult> {
  const apis = [
    {
      name: 'facebook-video-downloader3',
      url: 'https://facebook-video-downloader3.p.rapidapi.com/download/',
      host: 'facebook-video-downloader3.p.rapidapi.com',
      getUrl: (inputUrl: string) => `https://facebook-video-downloader3.p.rapidapi.com/download/?url=${encodeURIComponent(inputUrl)}`,
      parseResponse: (data: any) => {
        const videos: VideoResult['videos'] = [];
        if (data.hd) videos.push({ quality: 'HD', url: data.hd });
        if (data.sd) videos.push({ quality: 'SD', url: data.sd });
        if (data.url) videos.push({ quality: 'HD', url: data.url });
        if (videos.length > 0) {
          return {
            success: true,
            platform: 'facebook',
            title: data.title || 'Facebook Video',
            thumbnail: data.thumbnail,
            videos,
          };
        }
        return null;
      },
    },
    {
      name: 'social-media-video-downloader',
      url: 'https://social-media-video-downloader.p.rapidapi.com/smvd/get/facebook',
      host: 'social-media-video-downloader.p.rapidapi.com',
      getUrl: (inputUrl: string) => `https://social-media-video-downloader.p.rapidapi.com/smvd/get/facebook?url=${encodeURIComponent(inputUrl)}`,
      parseResponse: (data: any) => {
        if (data.links && data.links.length > 0) {
          const videos = data.links
            .filter((link: any) => link.link)
            .map((link: any, i: number) => ({
              quality: link.quality || (i === 0 ? 'HD' : 'SD'),
              url: link.link,
              size: link.size,
            }));
          if (videos.length > 0) {
            return {
              success: true,
              platform: 'facebook',
              title: data.title || 'Facebook Video',
              thumbnail: data.picture,
              duration: data.duration,
              videos,
            };
          }
        }
        return null;
      },
    },
  ];

  for (const api of apis) {
    try {
      console.log(`Trying Facebook API: ${api.name}`);
      const response = await fetch(api.getUrl(url), {
        method: 'GET',
        headers: {
          'x-rapidapi-host': api.host,
          'x-rapidapi-key': apiKey,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`${api.name} response:`, JSON.stringify(data).substring(0, 300));
        const result = api.parseResponse(data);
        if (result) return result;
      } else {
        console.log(`${api.name} failed with status:`, response.status);
      }
    } catch (error) {
      console.error(`${api.name} error:`, error);
    }
  }

  return {
    success: false,
    platform: 'facebook',
    error: 'Unable to fetch this content. It may be from a private account.',
  };
}

// YouTube extraction using RapidAPI
async function extractYouTube(url: string, apiKey: string): Promise<VideoResult> {
  // Extract video ID
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
    return { success: false, platform: 'youtube', error: 'Invalid YouTube URL' };
  }

  const apis = [
    {
      name: 'ytstream-download-youtube-videos',
      getUrl: () => `https://ytstream-download-youtube-videos.p.rapidapi.com/dl?id=${videoId}`,
      host: 'ytstream-download-youtube-videos.p.rapidapi.com',
      parseResponse: (data: any) => {
        const videos: VideoResult['videos'] = [];
        if (data.formats) {
          data.formats
            .filter((f: any) => f.url && f.mimeType?.includes('video') && f.hasAudio !== false)
            .slice(0, 4)
            .forEach((f: any) => {
              videos.push({
                quality: f.qualityLabel || f.quality || 'SD',
                url: f.url,
                size: f.contentLength,
              });
            });
        }
        if (videos.length > 0) {
          return {
            success: true,
            platform: 'youtube',
            title: data.title || 'YouTube Video',
            thumbnail: data.thumbnail?.[0]?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            author: data.channelTitle,
            duration: data.lengthSeconds ? `${Math.floor(data.lengthSeconds / 60)}:${(data.lengthSeconds % 60).toString().padStart(2, '0')}` : undefined,
            videos,
          };
        }
        return null;
      },
    },
    {
      name: 'youtube-video-download-info',
      getUrl: () => `https://youtube-video-download-info.p.rapidapi.com/dl?id=${videoId}`,
      host: 'youtube-video-download-info.p.rapidapi.com',
      parseResponse: (data: any) => {
        const videos: VideoResult['videos'] = [];
        if (data.link) {
          Object.entries(data.link).forEach(([key, value]: [string, any]) => {
            if (value && typeof value === 'object' && value[0]) {
              videos.push({
                quality: key,
                url: value[0],
              });
            }
          });
        }
        if (videos.length > 0) {
          return {
            success: true,
            platform: 'youtube',
            title: data.title || 'YouTube Video',
            thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            duration: data.duration,
            videos: videos.slice(0, 4),
          };
        }
        return null;
      },
    },
  ];

  for (const api of apis) {
    try {
      console.log(`Trying YouTube API: ${api.name}`);
      const response = await fetch(api.getUrl(), {
        method: 'GET',
        headers: {
          'x-rapidapi-host': api.host,
          'x-rapidapi-key': apiKey,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`${api.name} response:`, JSON.stringify(data).substring(0, 300));
        const result = api.parseResponse(data);
        if (result) return result;
      } else {
        console.log(`${api.name} failed with status:`, response.status);
      }
    } catch (error) {
      console.error(`${api.name} error:`, error);
    }
  }

  // Fallback: Return video info with external link
  try {
    const metaResponse = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
    if (metaResponse.ok) {
      const metaData = await metaResponse.json();
      return {
        success: true,
        platform: 'youtube',
        title: metaData.title || 'YouTube Video',
        author: metaData.author_name,
        thumbnail: metaData.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        videos: [{
          quality: 'Download Page',
          url: `https://www.y2mate.com/youtube/${videoId}`,
        }],
      };
    }
  } catch (e) {
    console.error('Fallback metadata fetch failed:', e);
  }

  return {
    success: false,
    platform: 'youtube',
    error: 'Unable to fetch this video.',
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('cf-connecting-ip') || 'unknown';
    
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

    try {
      new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    const platform = detectPlatform(url);
    if (!platform) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unsupported platform. We support Instagram, Facebook, and YouTube.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
