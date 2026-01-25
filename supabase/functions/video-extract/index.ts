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

// All-in-one social media downloader API (supports multiple platforms)
async function extractWithAllInOne(url: string, platform: string, apiKey: string): Promise<VideoResult | null> {
  try {
    console.log(`Trying all-in-one API for ${platform}`);
    const response = await fetch(`https://all-in-one-video-downloader.p.rapidapi.com/Download?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'all-in-one-video-downloader.p.rapidapi.com',
        'x-rapidapi-key': apiKey,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`all-in-one response:`, JSON.stringify(data).substring(0, 500));
      
      const videos: VideoResult['videos'] = [];
      
      // Handle different response formats
      if (data.links && Array.isArray(data.links)) {
        data.links.forEach((link: any) => {
          if (link.url || link.link) {
            videos.push({
              quality: link.quality || link.label || 'HD',
              url: link.url || link.link,
              size: link.size,
            });
          }
        });
      }
      
      if (data.url) {
        videos.push({ quality: 'HD', url: data.url });
      }
      
      if (data.medias && Array.isArray(data.medias)) {
        data.medias.forEach((media: any) => {
          if (media.url) {
            videos.push({
              quality: media.quality || 'HD',
              url: media.url,
              size: media.formattedSize,
            });
          }
        });
      }
      
      if (videos.length > 0) {
        return {
          success: true,
          platform,
          title: data.title || `${platform.charAt(0).toUpperCase() + platform.slice(1)} Video`,
          thumbnail: data.thumbnail || data.picture,
          duration: data.duration,
          author: data.author,
          videos: videos.slice(0, 4),
        };
      }
    } else {
      console.log(`all-in-one failed with status:`, response.status);
    }
  } catch (error) {
    console.error('all-in-one error:', error);
  }
  return null;
}

// SaveFrom-style API
async function extractWithSaveFrom(url: string, platform: string, apiKey: string): Promise<VideoResult | null> {
  try {
    console.log(`Trying savefrom API for ${platform}`);
    const response = await fetch('https://savefrom1.p.rapidapi.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'savefrom1.p.rapidapi.com',
        'x-rapidapi-key': apiKey,
      },
      body: JSON.stringify({ url }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`savefrom response:`, JSON.stringify(data).substring(0, 500));
      
      const videos: VideoResult['videos'] = [];
      
      if (data.url) {
        // Single URL response
        videos.push({ quality: 'HD', url: Array.isArray(data.url) ? data.url[0] : data.url });
      }
      
      if (data.urls && Array.isArray(data.urls)) {
        data.urls.forEach((item: any) => {
          if (item.url) {
            videos.push({
              quality: item.quality || item.name || 'HD',
              url: item.url,
              size: item.size,
            });
          }
        });
      }
      
      if (videos.length > 0) {
        return {
          success: true,
          platform,
          title: data.meta?.title || data.title || `${platform.charAt(0).toUpperCase() + platform.slice(1)} Video`,
          thumbnail: data.thumb || data.thumbnail,
          duration: data.meta?.duration,
          videos: videos.slice(0, 4),
        };
      }
    } else {
      console.log(`savefrom failed with status:`, response.status);
    }
  } catch (error) {
    console.error('savefrom error:', error);
  }
  return null;
}

// Instagram extraction using RapidAPI
async function extractInstagram(url: string, apiKey: string): Promise<VideoResult> {
  // Try all-in-one first
  let result = await extractWithAllInOne(url, 'instagram', apiKey);
  if (result) return result;
  
  // Try savefrom
  result = await extractWithSaveFrom(url, 'instagram', apiKey);
  if (result) return result;

  const apis = [
    {
      name: 'instagram-downloader-download-instagram-videos-stories1',
      getUrl: (inputUrl: string) => `https://instagram-downloader-download-instagram-videos-stories1.p.rapidapi.com/?url=${encodeURIComponent(inputUrl)}`,
      host: 'instagram-downloader-download-instagram-videos-stories1.p.rapidapi.com',
      parseResponse: (data: any) => {
        const videos: VideoResult['videos'] = [];
        if (data.result && Array.isArray(data.result)) {
          data.result.forEach((item: any) => {
            if (item.url) {
              videos.push({
                quality: item.type === 'video' ? 'HD' : 'Image',
                url: item.url,
              });
            }
          });
        }
        if (data.video) {
          videos.push({ quality: 'HD', url: data.video });
        }
        if (videos.length > 0) {
          return {
            success: true,
            platform: 'instagram',
            title: data.title || 'Instagram Video',
            thumbnail: data.thumb || data.thumbnail,
            videos,
          };
        }
        return null;
      },
    },
    {
      name: 'instagram-bulk-scraper-api',
      getUrl: (inputUrl: string) => {
        const match = inputUrl.match(/\/(p|reel|reels)\/([A-Za-z0-9_-]+)/);
        const shortcode = match ? match[2] : '';
        return `https://instagram-bulk-scraper-api.p.rapidapi.com/media_download_by_shortcode?shortcode=${shortcode}`;
      },
      host: 'instagram-bulk-scraper-api.p.rapidapi.com',
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
      name: 'instagram-scraper-api2',
      getUrl: (inputUrl: string) => `https://instagram-scraper-api2.p.rapidapi.com/v1/post_info?code_or_id_or_url=${encodeURIComponent(inputUrl)}`,
      host: 'instagram-scraper-api2.p.rapidapi.com',
      parseResponse: (data: any) => {
        const videos: VideoResult['videos'] = [];
        if (data.data?.video_url) {
          videos.push({ quality: 'HD', url: data.data.video_url });
        }
        if (data.data?.video_versions) {
          data.data.video_versions.forEach((v: any, i: number) => {
            if (v.url && !videos.some(vid => vid.url === v.url)) {
              videos.push({ quality: i === 0 ? 'HD' : 'SD', url: v.url });
            }
          });
        }
        if (videos.length > 0) {
          return {
            success: true,
            platform: 'instagram',
            title: data.data?.caption?.text?.substring(0, 50) || 'Instagram Video',
            thumbnail: data.data?.thumbnail_url,
            author: data.data?.user?.username,
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
    platform: 'instagram',
    error: 'Unable to fetch this content. Please ensure the video is from a public account and you are subscribed to the required RapidAPI services.',
  };
}

// Facebook extraction using RapidAPI
async function extractFacebook(url: string, apiKey: string): Promise<VideoResult> {
  // Try all-in-one first
  let result = await extractWithAllInOne(url, 'facebook', apiKey);
  if (result) return result;
  
  // Try savefrom
  result = await extractWithSaveFrom(url, 'facebook', apiKey);
  if (result) return result;

  const apis = [
    {
      name: 'facebook-video-downloader3',
      getUrl: (inputUrl: string) => `https://facebook-video-downloader3.p.rapidapi.com/download/?url=${encodeURIComponent(inputUrl)}`,
      host: 'facebook-video-downloader3.p.rapidapi.com',
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
      getUrl: (inputUrl: string) => `https://social-media-video-downloader.p.rapidapi.com/smvd/get/facebook?url=${encodeURIComponent(inputUrl)}`,
      host: 'social-media-video-downloader.p.rapidapi.com',
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
    {
      name: 'facebook-reel-and-video-downloader',
      getUrl: (inputUrl: string) => `https://facebook-reel-and-video-downloader.p.rapidapi.com/app/main.php?url=${encodeURIComponent(inputUrl)}`,
      host: 'facebook-reel-and-video-downloader.p.rapidapi.com',
      parseResponse: (data: any) => {
        const videos: VideoResult['videos'] = [];
        if (data.links?.hd) videos.push({ quality: 'HD', url: data.links.hd });
        if (data.links?.sd) videos.push({ quality: 'SD', url: data.links.sd });
        if (data.links?.Download_Link) videos.push({ quality: 'HD', url: data.links.Download_Link });
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
    error: 'Unable to fetch this content. Please ensure the video is public and you are subscribed to the required RapidAPI services.',
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

  // Try all-in-one first
  let result = await extractWithAllInOne(url, 'youtube', apiKey);
  if (result) return result;
  
  // Try savefrom
  result = await extractWithSaveFrom(url, 'youtube', apiKey);
  if (result) return result;

  const apis = [
    {
      name: 'youtube-media-downloader',
      getUrl: () => `https://youtube-media-downloader.p.rapidapi.com/v2/video/details?videoId=${videoId}`,
      host: 'youtube-media-downloader.p.rapidapi.com',
      parseResponse: (data: any) => {
        const videos: VideoResult['videos'] = [];
        if (data.videos?.items) {
          data.videos.items
            .filter((item: any) => item.url && item.hasAudio)
            .slice(0, 4)
            .forEach((item: any) => {
              videos.push({
                quality: item.quality || item.label || 'HD',
                url: item.url,
                size: item.sizeText,
              });
            });
        }
        if (videos.length > 0) {
          return {
            success: true,
            platform: 'youtube',
            title: data.title || 'YouTube Video',
            thumbnail: data.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            author: data.channel?.name,
            duration: data.lengthText,
            videos,
          };
        }
        return null;
      },
    },
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
