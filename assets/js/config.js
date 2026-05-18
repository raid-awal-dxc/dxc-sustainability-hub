
(function(){
  if (!window.ENV) {
    window.ENV = {
      SUPABASE_URL: "https://xumlsuztbidtgawiplff.supabase.co",
      SUPABASE_ANON_KEY: "sb_publishable_Y3CbHu7ASRYD9ZDB7j4N-Q_OuaTHekc",
      PASS_THRESHOLD: 75,
      // Optional redirects (can be overridden in a separate config file)
      AUTH_CONFIRM_REDIRECT: window.location.origin + '/login.html',
      PASSWORD_RESET_REDIRECT: window.location.origin + '/reset.html'
    };
  }
})();
