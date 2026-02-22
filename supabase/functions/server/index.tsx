import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  
  if (url.pathname.includes('/health')) {
    return Response.json({ status: 'ok', timestamp: Date.now() }, { headers: corsHeaders });
  }

  return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
});
