/**
 * supabase.js
 * ------------------------------------------------------------------
 * The ONLY file that touches the Supabase JS SDK directly. database.js
 * calls getSupabaseClient() and never imports/creates the client
 * itself. This keeps the URL/key handling in one place and means
 * swapping SDK versions never touches database.js.
 *
 * Requires the Supabase JS CDN script to be loaded on the page BEFORE
 * this file (see index.html) — it exposes a global `supabase.createClient`.
 * ------------------------------------------------------------------
 */

let _client = null;
let _warned = false;

function getSupabaseClient() {
  if (CONFIG.USE_DEMO_DATA) return null; // demo mode never needs a client

  if (_client) return _client;

  const looksUnconfigured =
    !CONFIG.SUPABASE_URL ||
    !CONFIG.SUPABASE_ANON_KEY ||
    CONFIG.SUPABASE_URL.includes('YOUR-PROJECT-REF') ||
    CONFIG.SUPABASE_ANON_KEY.includes('YOUR-SUPABASE');

  if (looksUnconfigured) {
    if (!_warned) {
      console.error('[supabase.js] CONFIG.SUPABASE_URL / SUPABASE_ANON_KEY are not set. ' +
        'Fill them in js/config.js, or set USE_DEMO_DATA back to true.');
      _warned = true;
    }
    return null;
  }

  if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
    console.error('[supabase.js] Supabase JS SDK not found on window. Check that the ' +
      '@supabase/supabase-js CDN <script> tag in index.html loads before js/supabase.js.');
    return null;
  }

  _client = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  return _client;
}
