
(function(){
  const THEME_KEY='sh_theme';
  const root=document.documentElement;
  function systemPref(){ return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
  function setLogo(theme){ document.querySelectorAll('.site-logo').forEach(img=>{ const dark=img.getAttribute('data-logo-dark'); const light=img.getAttribute('data-logo-light'); img.style.opacity=0.85; setTimeout(()=>{ img.src = theme==='dark' ? (dark||img.src) : (light||img.src); img.style.opacity=1; }, 60); }); }
  function applyTheme(t){ const theme=t||localStorage.getItem(THEME_KEY)||systemPref(); root.setAttribute('data-theme', theme); localStorage.setItem(THEME_KEY, theme); const btn=document.querySelector('[data-theme-toggle]'); if(btn){ const isDark=theme==='dark'; btn.setAttribute('aria-pressed', String(isDark)); btn.title=isDark?'Switch to light mode':'Switch to dark mode'; } setLogo(theme); }
  function toggle(){ const current=root.getAttribute('data-theme')||systemPref(); applyTheme(current==='dark'?'light':'dark'); }
  document.addEventListener('click', e=>{ if(e.target.closest('[data-theme-toggle]')) toggle(); });
  window.SHTheme={applyTheme,toggle};
  applyTheme();
  if(window.matchMedia){ const mq=window.matchMedia('(prefers-color-scheme: dark)'); mq.addEventListener('change', ()=>{ const saved=localStorage.getItem(THEME_KEY); if(!saved) applyTheme(); }); }
})();
