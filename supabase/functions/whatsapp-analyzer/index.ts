import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting - simple in-memory store (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now - entry.timestamp > RATE_WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return false;
  }
  
  if (entry.count >= RATE_LIMIT) {
    return true;
  }
  
  entry.count++;
  return false;
}

// Sanitize input - remove potential XSS and limit length
function sanitizeInput(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  // Limit to 15000 characters (reasonable for chat analysis, prevents resource exhaustion)
  const limited = text.slice(0, 15000);
  
  // Remove potential script tags and dangerous patterns
  return limited
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

// Parse WhatsApp chat to extract participants
function parseWhatsAppChat(chatText: string): { personA: string; personB: string; messages: Array<{ sender: string; message: string; time: string }> } {
  const lines = chatText.split('\n').filter(line => line.trim());
  const participants = new Map<string, number>();
  const messages: Array<{ sender: string; message: string; time: string }> = [];
  
  // Common WhatsApp formats:
  // [DD/MM/YY, HH:MM:SS] Name: Message
  // DD/MM/YYYY, HH:MM - Name: Message
  const patterns = [
    /^\[?(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)\]?\s*[-–]?\s*([^:]+):\s*(.+)$/i,
    /^(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)\s*[-–]\s*([^:]+):\s*(.+)$/i,
  ];
  
  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const [, date, time, sender, message] = match;
        const cleanSender = sender.trim();
        
        // Skip system messages
        if (cleanSender.toLowerCase().includes('messages and calls are end-to-end encrypted') ||
            cleanSender.toLowerCase().includes('created group') ||
            cleanSender.toLowerCase().includes('added') ||
            cleanSender.toLowerCase().includes('left') ||
            cleanSender.toLowerCase().includes('changed')) {
          continue;
        }
        
        participants.set(cleanSender, (participants.get(cleanSender) || 0) + 1);
        messages.push({ sender: cleanSender, message: message.trim(), time: `${date} ${time}` });
        break;
      }
    }
  }
  
  // Get top 2 participants
  const sorted = [...participants.entries()].sort((a, b) => b[1] - a[1]);
  const personA = sorted[0]?.[0] || 'Person A';
  const personB = sorted[1]?.[0] || 'Person B';
  
  return { personA, personB, messages };
}

// Calculate basic stats
function calculateStats(messages: Array<{ sender: string; message: string; time: string }>, personA: string, personB: string) {
  let aMessages = 0, bMessages = 0;
  let aFirstCount = 0, bFirstCount = 0;
  let aTotalLength = 0, bTotalLength = 0;
  let aEmojis = 0, bEmojis = 0;
  
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  
  let lastSender = '';
  let conversationStarts = 0;
  
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const isA = msg.sender === personA;
    
    if (isA) {
      aMessages++;
      aTotalLength += msg.message.length;
      aEmojis += (msg.message.match(emojiRegex) || []).length;
    } else if (msg.sender === personB) {
      bMessages++;
      bTotalLength += msg.message.length;
      bEmojis += (msg.message.match(emojiRegex) || []).length;
    }
    
    // Track who starts conversations (after gap or first message)
    if (i === 0 || lastSender !== msg.sender) {
      if (i === 0 || isNewConversation(messages, i)) {
        conversationStarts++;
        if (isA) aFirstCount++;
        else if (msg.sender === personB) bFirstCount++;
      }
    }
    lastSender = msg.sender;
  }
  
  return {
    totalMessages: messages.length,
    aMessages,
    bMessages,
    aFirstCount,
    bFirstCount,
    aAvgLength: aMessages > 0 ? Math.round(aTotalLength / aMessages) : 0,
    bAvgLength: bMessages > 0 ? Math.round(bTotalLength / bMessages) : 0,
    aEmojis,
    bEmojis,
  };
}

function isNewConversation(messages: Array<{ sender: string; message: string; time: string }>, index: number): boolean {
  if (index === 0) return true;
  // Simple heuristic - consider it a new conversation start
  return index > 0 && messages[index - 1].sender !== messages[index].sender;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
    if (isRateLimited(clientIP)) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait a minute before trying again." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { chatText, mode, language = 'telugu-english' } = await req.json();
    
    if (!chatText || typeof chatText !== 'string') {
      return new Response(
        JSON.stringify({ error: "Please paste a valid WhatsApp chat export." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sanitizedChat = sanitizeInput(chatText);
    
    if (sanitizedChat.length < 50) {
      return new Response(
        JSON.stringify({ error: "Chat is too short. Please paste a longer conversation." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validModes = ['love', 'friendship', 'roast', 'family', 'work', 'drama'];
    const validLanguages = ['english', 'telugu', 'hindi', 'telugu-english', 'hindi-english'];
    const analysisMode = validModes.includes(mode) ? mode : 'love';
    const responseLanguage = validLanguages.includes(language) ? language : 'telugu-english';
    
    // Parse the chat
    const { personA, personB, messages } = parseWhatsAppChat(sanitizedChat);
    
    if (messages.length < 5) {
      return new Response(
        JSON.stringify({ error: "Not enough messages found. Make sure you're pasting an exported WhatsApp chat." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stats = calculateStats(messages, personA, personB);
    
    // Language instructions for AI
    const languageInstructions: Record<string, string> = {
      'english': 'Write all responses in ENGLISH only. Use casual, fun English expressions.',
      'telugu': 'Write all responses in PURE TELUGU (తెలుగు) only. Use Telugu script (e.g., "చాలా బాగుంది!", "ఏంటి రా!", "సరదాగా ఉంది!"). No English words.',
      'hindi': 'Write all responses in PURE HINDI (हिंदी) only. Use Devanagari script (e.g., "बहुत अच्छा!", "क्या बात है!", "मजेदार है!"). No English words.',
      'telugu-english': 'Mix TELUGU and ENGLISH naturally. Use Telugu phrases like "Enti ra!", "Baaga untundi", "Chala bagundi", "Ade ga!", "Super ra!", "Antha ne", mixed with English. Write Telugu in English letters (Romanized Telugu).',
      'hindi-english': 'Mix HINDI and ENGLISH naturally. Use Hindi phrases like "Kya baat hai!", "Bahut badhiya", "Mast hai!", "Sahi hai!", "Ekdum jhakaas", mixed with English. Write Hindi in English letters (Romanized Hindi).'
    };

    // Mode-specific prompts with language consideration
    const modePrompts: Record<string, string> = {
      love: `You are a fun, slightly dramatic relationship analyzer. Analyze this chat between ${personA} and ${personB} as a LOVE/ROMANCE analysis. Be entertaining, use emojis, and give fun relationship insights. Focus on romantic chemistry, flirting patterns, and love vibes.`,
      friendship: `You are a fun friendship analyzer. Analyze this chat between ${personA} and ${personB} as a FRIENDSHIP analysis. Be entertaining, use emojis, and highlight friendship dynamics, inside jokes potential, and bestie energy.`,
      roast: `You are a witty, fun roaster (NOT offensive or mean). Analyze this chat between ${personA} and ${personB} with playful roasts. Keep it light and funny, never hurtful or personal attacks.`,
      family: `You are a warm family dynamics analyzer. Analyze this chat between ${personA} and ${personB} as a FAMILY analysis. Focus on care patterns, who worries more, typical Indian family dynamics (like asking about food, health, marriage questions). Be loving and wholesome with gentle humor.`,
      work: `You are a professional (but fun) workplace analyzer. Analyze this chat between ${personA} and ${personB} as a WORK/OFFICE analysis. Highlight workplace dynamics like who's the boss energy, who's more professional, who uses more formal language, typical office chat patterns.`,
      drama: `You are a dramatic, filmy analyzer like a TV show narrator. Analyze this chat between ${personA} and ${personB} with maximum DRAMA and suspense! Treat it like a soap opera plot. Find hidden meanings, plot twists, and dramatic moments. Be theatrical and over-the-top entertaining!`
    };

    // Include compatibility score for love mode
    const compatibilityPrompt = analysisMode === 'love' ? `,
  "compatibility": {
    "percentage": <number 50-99, fun compatibility score>,
    "zodiacMatch": "<creative zodiac-style match description like 'Fire meets Water - explosive chemistry!' in the response language>",
    "elementAnalysis": "<describe their elemental energy - earth, fire, water, air style analysis>",
    "futurePredict": "<fun prediction about their future together, can be dramatic or sweet>",
    "loveLanguage": "<what their love languages seem to be based on chat>",
    "communicationStyle": "<how they communicate as a couple - direct, playful, mysterious etc>"
  }` : '';

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const sampleMessages = messages.slice(0, 50).map(m => `${m.sender}: ${m.message}`).join('\n');

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `${modePrompts[analysisMode]}

LANGUAGE REQUIREMENT: ${languageInstructions[responseLanguage]}

IMPORTANT: This is for ENTERTAINMENT ONLY. Be fun and engaging, not scientific. Make sure there are NO spelling mistakes in any language.
${analysisMode === 'love' ? '\nCRITICAL: You MUST include the "compatibility" object in your response for love mode analysis! This is required!\n' : ''}
Respond in this EXACT JSON format (no markdown, just JSON):
{
  "personAInterest": <number 0-100>,
  "personBInterest": <number 0-100>,
  "personAEmotionalTone": "<one word emotion>",
  "personBEmotionalTone": "<one word emotion>",
  "personAHiddenIntent": "<fun, creative one-liner about their hidden intent>",
  "personBHiddenIntent": "<fun, creative one-liner>",
  "replySpeedVerdict": "<who replies faster and what it means, fun take>",
  "overallVibes": "<fun 2-3 word vibe description>",
  "verdict": "<A catchy, screenshot-worthy verdict sentence in 10-15 words. Make it memorable and fun!>",
  "funFact": "<A quirky observation about their chat pattern>"${compatibilityPrompt}
}`
          },
          {
            role: "user",
            content: `Chat Statistics:
- Total messages: ${stats.totalMessages}
- ${personA}: ${stats.aMessages} messages, avg length ${stats.aAvgLength} chars, ${stats.aEmojis} emojis, started convos ${stats.aFirstCount} times
- ${personB}: ${stats.bMessages} messages, avg length ${stats.bAvgLength} chars, ${stats.bEmojis} emojis, started convos ${stats.bFirstCount} times

Sample messages:
${sampleMessages}

Analyze this ${analysisMode} mode chat! Remember to respond in ${responseLanguage} format.${analysisMode === 'love' ? ' You MUST include the compatibility object with percentage, zodiacMatch, elementAnalysis, futurePredict, loveLanguage and communicationStyle fields!' : ''}`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Service is busy. Please try again in a few seconds." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    
    // Parse AI response
    let analysis;
    try {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      // Fallback analysis
      analysis = {
        personAInterest: Math.round(50 + (stats.aMessages / stats.totalMessages) * 50),
        personBInterest: Math.round(50 + (stats.bMessages / stats.totalMessages) * 50),
        personAEmotionalTone: "Friendly",
        personBEmotionalTone: "Friendly",
        personAHiddenIntent: "Wants to keep the conversation going",
        personBHiddenIntent: "Enjoying the chat vibes",
        replySpeedVerdict: "Both seem equally engaged!",
        overallVibes: "Good Energy",
        verdict: "This chat has potential! Keep the conversation flowing 💬",
        funFact: `${personA} sent ${stats.aEmojis} emojis while ${personB} sent ${stats.bEmojis}!`
      };
    }

    // Build response - DO NOT store any chat data
    const result = {
      personA,
      personB,
      stats: {
        totalMessages: stats.totalMessages,
        personAMessages: stats.aMessages,
        personBMessages: stats.bMessages,
        whoTextsFirst: stats.aFirstCount > stats.bFirstCount ? personA : personB,
        textsFirstPercentage: Math.round((Math.max(stats.aFirstCount, stats.bFirstCount) / (stats.aFirstCount + stats.bFirstCount || 1)) * 100),
      },
      analysis: {
        ...analysis,
        mode: analysisMode
      }
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("WhatsApp analyzer error:", error);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again!" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
