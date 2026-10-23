/* Format finales use a desktop CMS image and an optional separate phone image. */
(()=>{
  'use strict';
  const block=document.querySelector('.format-end-cta[data-photo-field]');
  if(!block)return;
  const image=block.querySelector('.end-cta-photo');
  const key=block.dataset.photoField;
  if(!image||!key)return;

  // A picture keeps both versions responsive, without relying on JS resize events.
  const picture=document.createElement('picture');
  const mobile=document.createElement('source');
  mobile.media='(max-width:760px)';
  image.before(picture);
  picture.append(mobile,image);

  // The previous blurred duplicate is no longer needed.
  block.querySelector('.end-cta-photo-blur')?.remove();

  function safeImagePath(value){
    if(typeof value!=='string')return null;
    const path=value.trim().replace(/^\\/+/, '');
    if(!/^(?:images\\/)?[A-Za-z0-9_.%()\\-]+\\.(?:jpe?g|png|webp|avif)$/i.test(path) || path.includes('..'))return null;
    return '/'+path;
  }
  fetch('/site-media.json',{cache:'no-store'})
    .then(response=>{if(!response.ok)throw Error('Media settings unavailable');return response.json()})
    .then(data=>{
      const desktop=safeImagePath(data?.[key]);
      const phone=safeImagePath(data?.[key+'_mobile']);
      if(desktop)image.src=desktop;
      // Missing mobile photo safely falls back to the desktop image.
      if(phone)mobile.srcset=phone;
      else mobile.removeAttribute('srcset');
    })
    .catch(()=>{/* The existing HTML image remains the fallback. */});
})();