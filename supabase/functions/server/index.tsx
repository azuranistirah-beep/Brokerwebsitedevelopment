// Investoft Backend - Main Server
// Simple minimal version to ensure deployment succeeds

Deno.serve((req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Simple health check response
  return new Response(
    JSON.stringify({ 
      ok: true, 
      service: "Investoft Backend",
      version: "18.0.0",
      timestamp: new Date().toISOString(),
      status: "operational"
    }), 
    {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      }
    }
  );
});
