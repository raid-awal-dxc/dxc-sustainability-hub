
(function(){ if(!window.supabase){console.error('Supabase JS not loaded');return;} window.supabaseClient=window.supabase.createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);})();
