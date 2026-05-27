(function () {
  if (!window.ENV) {
    window.ENV = {
      SUPABASE_URL: "https://xumlsuztbidtgawiplff.supabase.co",
      SUPABASE_ANON_KEY: "sb_publishable_Y3CbHu7ASRYD9ZDB7j4N-Q_OuaTHekc",
      PASS_THRESHOLD: 75,
      // Demo user: set to true to expose a demo password login on the login page.
      // When enabled, set `DEMO_USER_EMAIL` to the demo account's email in your DB.
      DEMO_USER_ENABLED: true,
      DEMO_USER_EMAIL: "demo@placeholder.com",
      // Optional redirects (can be overridden in a separate config file)
      AUTH_CONFIRM_REDIRECT: window.location.origin + "/login.html",
      PASSWORD_RESET_REDIRECT: window.location.origin + "/reset.html",
      OAUTH_REDIRECT: window.location.origin + "/login.html",
      DXC_EMAIL_DOMAIN: "dxc.com",
      ENTRA_TENANT: "",
    };
  }
})();
