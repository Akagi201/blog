/**
 * Cloudflare Worker for serving Akagi201 Blog static site
 * Uses modern Workers Assets API for simple static file serving
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Try to serve the requested asset
    let response = await env.ASSETS.fetch(request);
    
    // If not found (404), try to serve as directory with index.html
    if (response.status === 404) {
      // For clean URLs: /path -> /path/index.html
      if (!url.pathname.includes('.')) {
        const indexPath = url.pathname.endsWith('/') 
          ? url.pathname + 'index.html'
          : url.pathname + '/index.html';
        response = await env.ASSETS.fetch(new URL(indexPath, request.url));
      }
      
      // Still 404? Return index.html for SPA routing
      if (response.status === 404) {
        response = await env.ASSETS.fetch(new URL('/', request.url));
      }
    }
    
    // Add security and cache headers
    const headers = new Headers(response.headers);
    
    // Security headers
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-XSS-Protection', '1; mode=block');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Cache headers based on file type
    if (url.pathname.match(/\.(css|js|jpg|jpeg|png|gif|svg|webp|woff|woff2|ttf|eot)$/)) {
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (url.pathname.match(/\.(html|xml|json)$/)) {
      headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
    }
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers,
    });
  }
};
