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
  // Same editorial heading hierarchy as the homepage's genre catalog.
  const modalHeader=dialog.querySelector('.format-genres-modal-head');
  const modalTitle=modalHeader?.querySelector('h2');
  if(modalHeader&&modalTitle){
    const heading=document.createElement('div');
    heading.className='format-genres-heading-copy';
    const brand=document.createElement('p');
    brand.className='format-genres-brand-line';
    brand.innerHTML='<span>НОГИ</span><small class="format-genres-brand-v">в</small><span>РУКИ</span><span class="format-genres-brand-part">/ АРТИСТЫ</span>';
    heading.append(brand,modalTitle);
    modalHeader.insertBefore(heading,modalHeader.firstChild);
  }
  if(!document.getElementById('format-genres-home-heading-style')){
    const style=document.createElement('style');
    style.id='format-genres-home-heading-style';
    style.textContent=`
      .format-genres-modal-head .format-genres-heading-copy{display:flex;flex-direction:column;align-items:flex-start;gap:14px;min-width:0}
      .format-genres-modal-head .format-genres-brand-line{display:flex;align-items:baseline;gap:4px;margin:0!important;color:#ff5b79!important;font:850 11px/1.1 Arial,sans-serif;letter-spacing:.11em;text-transform:uppercase}
      .format-genres-modal-head .format-genres-brand-v{font-size:8px;letter-spacing:0;margin:0 1px;color:#ff5b79;text-transform:none!important}
      .format-genres-modal-head .format-genres-brand-part{margin-left:4px}
      .format-genres-modal-head .format-genres-heading-copy h2{position:relative;margin:0 0 8px!important;font:950 clamp(29px,4.2vw,43px)/1 Arial,sans-serif!important;letter-spacing:-.052em!important;text-transform:uppercase;color:#fff!important}
      .format-genres-modal-head .format-genres-heading-copy h2::after{content:"";display:block;width:67px;height:4px;margin-top:13px;background:#f20a3a;border-radius:3px;transform:skewX(-18deg)}
      @media(max-width:650px){.format-genres-modal-head .format-genres-brand-line{font-size:10px}.format-genres-modal-head .format-genres-heading-copy{gap:11px}.format-genres-modal-head .format-genres-heading-copy h2{font-size:clamp(26px,7.5vw,36px)!important}}
    `;
    document.head.appendChild(style);
  }
  // Adjust long title words to fit without splitting their letters.
  const measuring=document.createElement('canvas').getContext('2d');
  function fitTitles(container){
    if(!measuring)return;
    for(const title of container.querySelectorAll('.format-genre-title')){
      title.style.removeProperty('font-size');
      const style=getComputedStyle(title);
      const base=parseFloat(style.fontSize);
      const available=title.clientWidth-4;
      if(!base||available<=0)continue;
      // CSS turns labels uppercase, so canvas must measure the displayed glyphs,
      // not the shorter, mixed-case source text.
      const words=(title.textContent||'').trim().split(/\s+/).map(w=>w.toLocaleUpperCase('ru-RU'));
      const spacing=parseFloat(style.letterSpacing)||0;
      measuring.font=style.fontWeight+' '+base+'px '+style.fontFamily;
      const longest=Math.max(0,...words.map(word=>
        measuring.measureText(word).width+Math.max(0,word.length-1)*spacing
      ));
      if(longest>available){
        const minimum=container===grid?9:11;
        const fitted=Math.max(minimum,Math.floor(base*available/longest));
        title.style.fontSize=fitted+'px';
      }
    }
  }
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
  window.addEventListener('resize',()=>{fitTitles(track);if(dialog.open)fitTitles(grid)},{passive:true});
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
    requestAnimationFrame(()=>fitTitles(grid));
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
      fitTitles(track);
      updateArrows();
    })
    .catch(e=>console.warn('Using original genre-card content:',e));
  fitTitles(track);
  updateArrows();
  window.addEventListener('load',()=>{fitTitles(track);updateArrows()},{once:true});
})();
