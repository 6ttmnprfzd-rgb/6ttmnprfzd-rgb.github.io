/* Genre carousel for format landing pages. Uses the same 18 titles,
   thumbnails and ordering as the homepage; all links retain SEO URLs. */
(()=>{
  'use strict';
  const section=document.querySelector('.format-genre-section');
  if(!section)return;
  const track=section.querySelector('.format-genres-track');
  const prev=section.querySelector('.format-genre-prev');
  const next=section.querySelector('.format-genre-next');
  const open=section.querySelector('.format-genres-all');
  const dialog=document.querySelector('#format-genres-modal');
  if(!track||!dialog||!prev||!next||!open)return;
  const grid=dialog.querySelector('.format-genres-modal-grid');
  const close=dialog.querySelector('.format-genres-close');
  const slugFromCard=a=>{
    try{
      const path=new URL(a.href,location.href);
      if(path.origin!==location.origin)return null;
      const parts=path.pathname.split('/').filter(Boolean);
      return parts.length===1?parts[0]:null;
    }catch(_){return null;}
  };
  function step(){
    const cards=[...track.querySelectorAll('.format-genre')];
    if(cards.length<2)return track.clientWidth*.8;
    return cards[1].offsetLeft-cards[0].offsetLeft;
  }
  function updateArrows(){
    prev.disabled=track.scrollLeft<=3;
    next.disabled=track.scrollLeft>=track.scrollWidth-track.clientWidth-3;
  }
  prev.addEventListener('click',()=>track.scrollBy({left:-step(),behavior:'smooth'}));
  next.addEventListener('click',()=>track.scrollBy({left:step(),behavior:'smooth'}));
  track.addEventListener('scroll',updateArrows,{passive:true});
  window.addEventListener('resize',updateArrows,{passive:true});
  track.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'||e.key==='ArrowLeft'){
      e.preventDefault();
      track.scrollBy({left:(e.key==='ArrowRight'?1:-1)*step(),behavior:'smooth'});
    }
  });
  function renderModal(){
    grid.replaceChildren();
    for(const card of track.querySelectorAll('.format-genre')){
      const copy=card.cloneNode(true);
      copy.removeAttribute('tabindex');
      grid.appendChild(copy);
    }
  }
  open.addEventListener('click',()=>{
    renderModal();
    if(typeof dialog.showModal==='function')dialog.showModal();
    else dialog.setAttribute('open','');
    close.focus();
  });
  const shut=()=>{
    if(dialog.open&&typeof dialog.close==='function')dialog.close();
    else dialog.removeAttribute('open');
  };
  document.querySelectorAll('a[href="/#genres"]').forEach(link=>{
    link.addEventListener('click',e=>{e.preventDefault();open.click()});
  });
  close.addEventListener('click',shut);
  dialog.addEventListener('click',e=>{if(e.target===dialog)shut()});
  // Sync actual homepage order and CMS-backed hero photos without delaying links.
  fetch('/format-home-genres.json',{cache:'no-store'})
    .then(r=>{if(!r.ok)throw Error('genre feed unavailable');return r.json()})
    .then(rows=>{
      if(!Array.isArray(rows)||rows.length!==18)return;
      const cards=new Map([...track.querySelectorAll('.format-genre')].map(a=>[slugFromCard(a),a]));
      for(const row of rows){
        if(!row||!cards.has(row.slug))continue;
        const card=cards.get(row.slug);
        if(typeof row.image==='string' && /^images\/[A-Za-z0-9_.-]+$/.test(row.image)){
          const img=card.querySelector('img');
          if(img)img.src='/'+row.image;
        }
        if(typeof row.title==='string' && row.title.trim()){
          const title=card.querySelector('.format-genre-title');
          if(title)title.textContent=row.title;
        }
        track.appendChild(card);
      }
      track.scrollLeft=0;
      updateArrows();
    })
    .catch(e=>console.warn('Using original genre-card content:',e));
  updateArrows();
  window.addEventListener('load',updateArrows,{once:true});
})();
