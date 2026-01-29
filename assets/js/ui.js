
async function requireAuth(redirectTo='login.html'){ const {data:{user}}=await supabaseClient.auth.getUser(); if(!user) window.location.href=redirectTo; return user; }
async function getCurrentUser(){ const {data:{user}}=await supabaseClient.auth.getUser(); return user; }
function setActiveNav(){ const path=location.pathname.split('/').pop(); document.querySelectorAll('nav a').forEach(a=>{ if(a.getAttribute('href')===path) a.classList.add('active'); }); }
document.addEventListener('DOMContentLoaded', setActiveNav);
