import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's auth
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { action_type, action_details } = await req.json();

    const VALID_ACTION_TYPES = new Set([
      'ai_chat',
      'ai_search',
      'file_process',
      'profile_view',
      'profile_delete',
      'file_history_view',
      'file_history_delete',
    ]);
    const MAX_ACTION_TYPE_LEN = 50;
    const MAX_DETAILS_BYTES = 4 * 1024; // 4 KB

    if (
      !action_type ||
      typeof action_type !== 'string' ||
      action_type.length > MAX_ACTION_TYPE_LEN ||
      !VALID_ACTION_TYPES.has(action_type)
    ) {
      return new Response(
        JSON.stringify({ error: 'Invalid action_type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action_details !== undefined && action_details !== null) {
      const isPlainObject =
        typeof action_details === 'object' &&
        !Array.isArray(action_details);
      if (!isPlainObject) {
        return new Response(
          JSON.stringify({ error: 'action_details must be an object' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      try {
        if (new TextEncoder().encode(JSON.stringify(action_details)).length > MAX_DETAILS_BYTES) {
          return new Response(
            JSON.stringify({ error: 'action_details exceeds 4 KB limit' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch {
        return new Response(
          JSON.stringify({ error: 'action_details is not serializable' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get user agent and IP from request headers
    const userAgent = req.headers.get('user-agent') ?? null;
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 
               req.headers.get('x-real-ip') ?? null;

    // Use service role client to insert audit log (bypasses RLS)
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { error: insertError } = await supabaseAdmin
      .from('audit_log')
      .insert({
        user_id: user.id,
        action_type,
        action_details: action_details ?? null,
        user_agent: userAgent,
        ip_address: ip,
      });

    if (insertError) {
      console.error('Failed to insert audit log:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to log event' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Audit log error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
