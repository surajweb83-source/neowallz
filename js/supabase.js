// ================================
//   NeoWallz — supabase.js
//   Supabase Connection
// ================================

// ⚠️ IMPORTANT: Apna Supabase URL aur Key yahan daalo
// Supabase dashboard → Settings → API → Copy karo

const SUPABASE_URL = 'https://egakwdhcgvjnevlkuntv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Kc0ljCOQoCD3uYWC2D_ufA_iHcTQweW';

// Supabase client banao
// CDN se load hoga — login.html mein script tag hai
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export kar do
window._supabase = supabase;