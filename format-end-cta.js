/* Show each format's own final photograph from Pages CMS. */
(()=>{
  'use strict';
  const block=document.querySelector('.format-end-cta[data-photo-field]');
  if(!block)return;
  const image=block.querySelector('.end-cta-photo');
  const key=block.dataset.photoField;
  if(!image||!key)return;
  // The mobile finale blends a blurred copy of the same CMS photo into the clear image.
  const blurred=image.cloneNode(false);
  blurred.className='end-cta-photo-blur';
  blurred.alt='';
  blurred.setAttribute('aria-hidden','true');
  blurred.removeAttribute('loading');
  image.before(blurred);
  function setImageSource(src){
    image.src=src;
    blurred.src=src;
  }
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
      if(candidate)setImageSource(candidate);
    })
    .catch(()=>{/* Keep the local fallback photo if settings cannot be read. */});
})();