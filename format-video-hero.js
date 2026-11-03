/* Start each format hero immediately from HTML, then sync changes made in Pages CMS. */
(()=>{
 'use strict';
 const hero=document.querySelector('.format-video-hero[data-video-field]');
 if(!hero)return;
 const video=hero.querySelector('video.format-video-hero-video');
 if(!video)return;
 const key=hero.dataset.videoField;
 const validPath=path=>typeof path==='string' &&
   /^(?:(?:images|videos)\/)?[A-Za-z0-9_.-]+\.(?:mp4|mov)$/i.test(path.trim()) &&
   !path.includes('..');
 video.muted=true;
 video.playsInline=true;
 video.setAttribute('webkit-playsinline','');
 const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
 const tryPlay=()=>{
   if(reducedMotion.matches||document.hidden)return;
   const attempt=video.play();
   if(attempt&&typeof attempt.catch==='function')attempt.catch(()=>{});
 };
 video.addEventListener('canplay',()=>{
   hero.classList.add('has-video');
   tryPlay();
 });
 video.addEventListener('error',()=>hero.classList.remove('has-video'));
 window.addEventListener('pageshow',tryPlay);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)tryPlay()});
 fetch('/site-media.json',{cache:'no-store'})
  .then(r=>{if(!r.ok)throw Error('site-media.json unavailable');return r.json()})
  .then(data=>{
    if(!data||!validPath(data[key]))return;
    const nextSrc='/'+data[key].trim();
    if(video.getAttribute('src')!==nextSrc){
      hero.classList.remove('has-video');
      video.src=nextSrc;
      video.load();
    }
  })
  .catch(err=>console.warn('Format hero uses poster image:',err));
})();
