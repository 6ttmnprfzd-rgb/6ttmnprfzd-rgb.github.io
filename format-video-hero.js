/* Load each format page's own hero video from Pages CMS; leave other videos untouched. */
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
 video.addEventListener('canplay',()=>{
   hero.classList.add('has-video');
   if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
     const attempt=video.play();
     if(attempt&&typeof attempt.catch==='function')attempt.catch(()=>{});
   }
 },{once:true});
 video.addEventListener('error',()=>hero.classList.remove('has-video'));
 fetch('/site-media.json',{cache:'no-store'})
  .then(r=>{if(!r.ok)throw Error('site-media.json unavailable');return r.json()})
  .then(data=>{
    if(!data||!validPath(data[key]))return;
    video.src='/'+data[key].trim();
    video.load();
  })
  .catch(err=>console.warn('Format hero uses poster image:',err));
})();
