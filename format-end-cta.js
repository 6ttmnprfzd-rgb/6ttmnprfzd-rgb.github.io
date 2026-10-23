/* Format finales use a desktop CMS image and an optional separate phone image. */
(()=>{
  'use strict';
  const block=document.querySelector('.format-end-cta[data-photo-field]');
  if(!block)return;
  const image=block.querySelector('.end-cta-photo');
  const key=block.dataset.photoField;
  if(!image||!key)return;

  const picture=document.createElement('picture');
  const mobile=document.createElement('source');
  mobile.media='(max-width:760px)';
  image.before(picture);
  picture.append(mobile,image);

  block.querySelector('.end-cta-photo-blur')?.remove();

  function safeImagePath(value){
    if(typeof value!=='string')return null;
    const path=value.trim().replace(/^\/+/, '');
    if(!/^(?:images\/)?[A-Za-z0-9_.%()\-]+\.(?:jpe?g|png|webp|avif)$/i.test(path) || path.includes('..'))return null;
    return '/'+path;
  }
  fetch('/site-media.json',{cache:'no-store'})
    .then(response=>{if(!response.ok)throw Error('Media settings unavailable');return response.json()})
    .then(data=>{
      const desktop=safeImagePath(data?.[key]);
      const phone=safeImagePath(data?.[key+'_mobile']);
      if(desktop)image.src=desktop;
      if(phone)mobile.srcset=phone;
      else mobile.removeAttribute('srcset');
    })
    .catch(()=>{/* Existing HTML photo stays as the fallback. */});
})();
