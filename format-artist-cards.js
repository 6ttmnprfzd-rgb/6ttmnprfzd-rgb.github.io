/* Keep format-page genre previews in sync with Pages CMS artist media. */
(()=>{
  'use strict';
  const cards=[...document.querySelectorAll('section.content .artists a.artist[href]')];
  if(!cards.length)return;
  const allowedPath=path=>typeof path==='string' &&
    /^images\/[a-zA-Z0-9_.-]+$/.test(path.trim());
  const slugFor=link=>{
    try{
      const url=new URL(link.getAttribute('href'),location.origin);
      if(url.origin!==location.origin)return null;
      const segments=url.pathname.split('/').filter(Boolean);
      return segments.length===1?segments[0]:null;
    }catch(_){return null;}
  };
  fetch('/artist-media.json',{cache:'no-store'})
    .then(response=>{if(!response.ok)throw Error('CMS media not available');return response.json();})
    .then(media=>{
      for(const card of cards){
        const slug=slugFor(card);
        if(!slug||!media?.[slug])continue;
        const item=media[slug].photos?.find(p=>allowedPath(p?.image));
        const img=card.querySelector('img');
        if(!item||!img)continue;
        const url='/'+item.image.trim();
        if(img.getAttribute('src')!==url){
          img.src=url;
          img.decoding='async';
        }
        if(typeof item.alt==='string' && item.alt.trim())img.alt=item.alt.trim();
      }
    })
    .catch(error=>console.warn('Keeping the existing genre photos:',error));
})();
