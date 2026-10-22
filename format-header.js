/* Reuse the homepage navigation behavior on the light format pages. */
(()=>{
 'use strict';
 const header=document.querySelector('.site-head.top');
 if(!header)return;
 const update=()=>header.classList.toggle('is-floating',window.scrollY>65);
 update();
 window.addEventListener('scroll',update,{passive:true});
 const menu=header.querySelector('.mobile-menu');
 if(!menu)return;
 menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.open=false}));
 document.addEventListener('pointerdown',e=>{if(menu.open&&!menu.contains(e.target))menu.open=false},{passive:true});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')menu.open=false});
})();
