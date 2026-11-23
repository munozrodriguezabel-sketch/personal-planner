(function () {
  const SUPABASE_URL = 'https://zufzqisouxputjqyfbzs.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_0gWD7YP09TGbZ5zdZN-64g_f6MaOZQI';

  if (window.supabase && typeof window.supabase.createClient === 'function') {
    window.supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );
  } else {
    window.supabaseClient = null;
  }
})();