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
 // Match the homepage: Новый год follows Галерея in the phone menu.
 const mobileNav=menu.querySelector('.mobile-menu-panel');
 if(mobileNav&&!mobileNav.querySelector('a[href="/novogodniy-korporativ/"]')){
   const newYear=document.createElement('a');
   newYear.href='/novogodniy-korporativ/';
   newYear.textContent='Новый год';
   const gallery=mobileNav.querySelector('a[href="/#gallery"]');
   if(gallery)gallery.after(newYear);
   else mobileNav.appendChild(newYear);
 }
 menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.open=false}));
 document.addEventListener('pointerdown',e=>{if(menu.open&&!menu.contains(e.target))menu.open=false},{passive:true});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')menu.open=false});
})();

/* Original homepage juggling-club pointer, only for a mouse or trackpad. */
(()=>{
 'use strict';
 if(!window.matchMedia('(hover:hover) and (pointer:fine)').matches)return;
 if(document.querySelector('.club-pointer'))return;
 const pointer=document.createElement('div');
 pointer.className='club-pointer';
 pointer.setAttribute('aria-hidden','true');
 pointer.innerHTML=`<svg viewBox="0 0 43 62" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
 <path d="M7 6 L13 13 L7 13 Z" fill="#ed082c" stroke="#111" stroke-width="1"/>
 <g transform="rotate(-27 17 31)">
 <rect x="13.5" y="36" width="9" height="20" rx="3.5" fill="#fafafa" stroke="#171717" stroke-width="1.5"/>
 <rect x="13.5" y="36" width="9" height="5" fill="#ed082c"/>
 <rect x="12" y="32" width="12" height="6" rx="2" fill="#111"/>
 <path d="M12 30 C10 26 7.5 21 8 16 C8.5 8.5 13 4 18 4 C23 4 27.5 8.5 28 16 C28.5 21 26 26 24 30 L22 33 L14 33 Z" fill="#fff" stroke="#171717" stroke-width="1.7"/>
 <path d="M9.1 21 C13 23 23 23 26.9 21 L24 30 L22 33 L14 33 L12 30 Z" fill="#ed082c"/>
 <path d="M12.5 11 C16 8 21 8 24 11" fill="none" stroke="#ddd" stroke-width="1.2"/>
 <rect x="14.5" y="51" width="7" height="5" rx="2" fill="#ed082c"/>
 </g></svg><span class="club-pointer-label"></span>`;
 document.body.appendChild(pointer);
 const label=pointer.querySelector('.club-pointer-label');
 const interactive='a,button,summary,[role="button"],.format-genre,.format-pop-gallery-tile';
 const textFields='input,textarea,select,[contenteditable="true"]';
 const graphiteOpen=()=>!!document.querySelector('dialog[open]');
 function move(e){
   if(e.pointerType && e.pointerType!=='mouse')return;
   if(graphiteOpen()){pointer.classList.remove('visible');return}
   const target=e.target;
   if(!(target instanceof Element)||target.closest(textFields)){
     pointer.classList.remove('visible');return;
   }
   const hit=target.closest(interactive);
   pointer.classList.toggle('action',!!hit);
   if(hit){
     let value='ПЕРЕЙТИ';
     if(hit.matches('.format-genre')||hit.closest('.format-genre'))value='УЗНАТЬ БОЛЬШЕ';
     else if(hit.matches('summary'))value='РАСКРЫТЬ';
     else if(hit.closest('.format-pop-gallery-tile'))value='СМОТРЕТЬ';
     else if(hit.matches('a[href^="mailto:"],a[href^="tel:"]')||hit.classList.contains('btn')||hit.classList.contains('cta'))value='СВЯЗАТЬСЯ';
     label.textContent=value;
   }
   pointer.style.transform=`translate3d(${e.clientX-7}px,${e.clientY-6}px,0)`;
   pointer.classList.add('visible');
 }
 document.addEventListener('pointermove',move,{passive:true});
 document.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')pointer.classList.add('press')});
 document.addEventListener('pointerup',()=>pointer.classList.remove('press'));
 document.addEventListener('pointercancel',()=>pointer.classList.remove('press'));
 document.addEventListener('mouseout',e=>{if(!e.relatedTarget)pointer.classList.remove('visible')});
 window.addEventListener('blur',()=>pointer.classList.remove('visible'));
 document.documentElement.classList.add('club-cursor-active');
})();

/* SEO format header: expandable service pages under Форматы. */
(()=>{
 'use strict';
 const header=document.querySelector('.site-head.top');
 if(!header)return;
 const pages=[
  ['РАУС','/raus/'],['ШОУ','/show/'],['НОМЕРА','/nomera/']
 ];
 const disclosures=[];
 for(const nav of header.querySelectorAll('nav.links, nav.mobile-menu-panel')){
   const link=nav.querySelector('a[href="/#formats"]');
   if(!link)continue;
   const menu=document.createElement('details');
   menu.className='formats-nav-dropdown';
   const summary=document.createElement('summary');
   summary.textContent='Форматы';
   summary.setAttribute('aria-label','Форматы — раскрыть список');
   const panel=document.createElement('div');
   panel.className='formats-nav-dropdown-panel';
   panel.setAttribute('role','group');
   panel.setAttribute('aria-label','Отдельные страницы форматов');
   for(const [title,url] of pages){
      const a=document.createElement('a');
      a.href=url;a.textContent=title;
      if(nav.classList.contains('mobile-menu-panel')){
       a.addEventListener('click',()=>{
         const mobile=header.querySelector('.mobile-menu');
         if(mobile)mobile.open=false;
       });
      }
      panel.appendChild(a);
   }
   menu.append(summary,panel);
   link.replaceWith(menu);
   disclosures.push(menu);
 }
 if(!disclosures.length)return;
 document.addEventListener('pointerdown',e=>{
  for(const menu of disclosures){
    if(menu.open&&!menu.contains(e.target))menu.open=false;
  }
 },{passive:true});
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    for(const menu of disclosures)menu.open=false;
  }
 });
})();
