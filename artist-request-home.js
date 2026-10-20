/* Main-page popup: the existing request form opens over artist cards too. */
document.addEventListener('DOMContentLoaded',()=>{
  const dialog=document.getElementById('artist-dialog');
  const cta=dialog?.querySelector('.artist-cta');
  const requestOpener=document.querySelector('[data-request-open]');
  if(!dialog||!cta||!requestOpener)return;
  cta.addEventListener('click',e=>{
    e.preventDefault();
    if(dialog.open)dialog.close();
    requestOpener.click();
  });
});

/* Sync homepage artist popups with Pages CMS media. */
document.addEventListener('DOMContentLoaded',()=>{
  const modal=document.getElementById('artist-dialog');
  if(!modal)return;
  const artistToPage={
    stilts:'hodulisty',juggling:'zhonglery',mime:'mimy',unicycle:'unitsiklisty',
    magic:'mikromag',acrobat:'akrobaty',cyrwheel:'koleso-sira',
    knife:'balans-na-nozhe',canes:'ekvilibr-na-trostyah',hoops:'hulahupy',
    zorb:'gimnastka-v-zorb-share',aerialring:'gimnastka-v-parternom-koltse',
    diabolo:'diabolo',rollers:'ekvilibr-na-katushkah',
    chairs:'ekvilibr-na-stulyah',contact:'kontaktnoe-zhonglirovanie'
  };
  const photo=modal.querySelector('#artist-dialog-photo');
  const frame=modal.querySelector('.artist-photo-wrap');
  const counter=modal.querySelector('#artist-photo-count');
  const end=modal.querySelector('#stilts-gallery-end');
  const prev=modal.querySelector('.artist-photo-prev');
  const next=modal.querySelector('.artist-photo-next');
  const videoWrap=modal.querySelector('#artist-video-wrap');
  const video=modal.querySelector('#artist-video');
  if(!photo||!frame||!counter||!end||!prev||!next)return;
  let selected=null,photos=null,slide=0,request=0,touchX=null;
  function safePath(p,dir){
    if(typeof p!=='string')return null;
    p=p.trim().replace(/^\/+/,'');
    if(!p.startsWith(dir+'/')||p.includes('..')||/[?#<>"']/.test(p))return null;
    return '/'+p;
  }
  function draw(){
    if(!photos)return;
    frame.hidden=photos.length===0;
    counter.textContent=photos.length?'':'';
    if(!photos.length){
      photo.hidden=true;
      end.hidden=true;
      prev.hidden=next.hidden=true;
      return;
    }
    const last=slide===photos.length;
    photo.hidden=last;end.hidden=!last;
    prev.hidden=next.hidden=false;
    if(!last){
      photo.src=photos[slide].url;
      photo.alt=photos[slide].alt;
    }
    counter.textContent=last?'Галерея':(slide+1)+' / '+photos.length;
  }
  function move(n){
    if(!photos||!photos.length)return;
    slide=(slide+n+photos.length+1)%(photos.length+1);
    draw();
  }
  function applyVideo(value){
    if(!video||!videoWrap)return;
    const url=safePath(value,'videos');
    if(!url){
      video.pause();video.removeAttribute('src');video.load();
      videoWrap.hidden=true;modal.classList.add('artist-no-video');
      return;
    }
    video.pause();video.muted=true;video.src=url;video.load();
    videoWrap.hidden=false;modal.classList.remove('artist-no-video');
    if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      const promise=video.play();if(promise&&promise.catch)promise.catch(()=>{});
    }
  }
  async function refresh(slug){
    const id=++request;
    photos=null;
    try{
      const response=await fetch('/artist-media.json?v='+Date.now(),{cache:'no-store'});
      if(!response.ok)throw Error('artist media not available');
      const data=await response.json();
      if(id!==request||!modal.open||selected!==slug)return;
      const m=data?.[slug];
      if(!m)return;
      if(Array.isArray(m.photos)){
        photos=m.photos.map((p,i)=>{
          const url=safePath(p?.image,'images');
          return url?{url,alt:typeof p.alt==='string'&&p.alt.trim()?p.alt:modal.querySelector('#artist-dialog-title')?.textContent+' — фото '+(i+1)}:null;
        }).filter(Boolean);
        slide=0;
        draw();
      }
      if(typeof m.video==='string')applyVideo(m.video);
    }catch(error){console.warn('Artist media update unavailable; keeping original photos.',error);}
  }
  function choose(key){
    if(!Object.prototype.hasOwnProperty.call(artistToPage,key))return;
    selected=artistToPage[key];photos=null;
    // The popup opens in a later click handler; run after that event has finished.
    setTimeout(()=>{if(modal.open&&selected===artistToPage[key])refresh(selected)},0);
  }
  document.addEventListener('click',e=>{
    const card=e.target.closest?.('.genre[data-artist]');
    if(card)choose(card.dataset.artist);
  },true);
  document.addEventListener('keydown',e=>{
    if(e.key!=='Enter'&&e.key!==' ')return;
    const card=e.target.closest?.('.genre[data-artist]');
    if(card)choose(card.dataset.artist);
  },true);
  document.addEventListener('click',e=>{
    const target=e.target.closest?.('.artist-photo-prev,.artist-photo-next');
    if(!target||!modal.open||!modal.contains(target)||!photos)return;
    e.preventDefault();e.stopImmediatePropagation();
    move(target.classList.contains('artist-photo-next')?1:-1);
  },true);
  frame.addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX},{capture:true,passive:true});
  frame.addEventListener('touchend',e=>{
    if(!photos||touchX===null||!modal.open)return;
    const delta=e.changedTouches[0].clientX-touchX;touchX=null;
    if(Math.abs(delta)>45){
      e.stopImmediatePropagation();
      move(delta<0?1:-1);
    }
  },{capture:true,passive:true});
  modal.addEventListener('close',()=>{selected=null;photos=null;++request;});
});
