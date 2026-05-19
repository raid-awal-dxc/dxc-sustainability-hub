// Copy this file to `config.local.js` and edit values to override defaults in development.
// Include it before `supabase.js` in your pages if you want to customize redirects or keys.
(function () {
  window.ENV = window.ENV || {};
  // Example overrides — set to your app's landing pages
  window.ENV.AUTH_CONFIRM_REDIRECT =
    "https://raid-awal-dxc.github.io/dxc-sustainability-hub/login.html";
  window.ENV.PASSWORD_RESET_REDIRECT =
    "https://raid-awal-dxc.github.io/dxc-sustainability-hub/reset.html";
  window.ENV.OAUTH_REDIRECT =
    "https://raid-awal-dxc.github.io/dxc-sustainability-hub/login.html";
  window.ENV.DXC_EMAIL_DOMAIN = "dxc.com";
  // Use your tenant id/domain for single-tenant Entra apps.
  // Examples: '<tenant-id-guid>' or 'contoso.onmicrosoft.com'
  // Leave empty to rely on Supabase Azure Tenant URL setting.
  window.ENV.ENTRA_TENANT = "";
  // You can also override SUPABASE_URL and SUPABASE_ANON_KEY here if needed.
  // window.ENV.SUPABASE_URL = 'https://your.supabase.co';
  // window.ENV.SUPABASE_ANON_KEY = 'public-anon-key';
})();
