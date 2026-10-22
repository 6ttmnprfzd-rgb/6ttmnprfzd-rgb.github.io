/* Show each format's own final photograph from Pages CMS. */
(()=>{
  'use strict';
  const block=document.querySelector('.format-end-cta[data-photo-field]');
  if(!block)return;
  const image=block.querySelector('.end-cta-photo');
  const key=block.dataset.photoField;
  if(!image||!key)return;
  function safeImagePath(value){
    if(typeof value!=='string')return null;
    const path=value.trim().replace(/^\/+/, '');
    if(!/^(?:images\/)?[A-Za-z0-9_.%()\-]+\.(?:jpe?g|png|webp|avif)$/i.test(path) || path.includes('..'))return null;
    return '/'+path;
  }
  fetch('/site-media.json',{cache:'no-store'})
    .then(response=>{if(!response.ok)throw Error('Media settings unavailable');return response.json()})
    .then(data=>{
      const candidate=safeImagePath(data?.[key]);
      if(candidate)image.src=candidate;
    })
    .catch(()=>{/* Keep the local fallback photo if settings cannot be read. */});
})();