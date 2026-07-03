// ============================================
// Visual Seven — Supabase Client Configuration
// ============================================

const SUPABASE_URL = "https://hmkdibaglrnpbbrfscmy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhta2RpYmFnbHJucGJicmZzY215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMDkzNDksImV4cCI6MjA5Mjg4NTM0OX0.IpNwNPZVNkpl7BaP_CjNkDDoKwZePRU3t70TxkyGVCc";

// Guard: make sure the Supabase CDN has loaded before we try to use it
if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('[Visual Seven] Supabase CDN failed to load. Check your internet connection or CDN URL.');
}

var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Get public URL for a file in the project-images bucket
 */
function getImageUrl(filePath) {
    const { data } = supabase.storage.from('project-images').getPublicUrl(filePath);
    return data.publicUrl;
}
