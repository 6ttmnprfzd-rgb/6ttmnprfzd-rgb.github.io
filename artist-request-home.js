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
    chairs:'ekvilibr-na-stulyah',contact:'kontaktnoe-zhonglirovanie',
    ladder:'volnostoyashchaya-lestnitsa',hatter:'shlyapnik'
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


/* Extra artist genres: freestanding ladder and Hatter.
   Build cards from the small script instead of rewriting the huge homepage HTML. */
document.addEventListener('DOMContentLoaded',()=>{
  const root=document.getElementById('genres');
  const track=root?.querySelector('.genres-featured');
  const dialog=document.getElementById('artist-dialog');
  if(!root||!track||!dialog)return;
  const artists=[
    {
      key:'ladder',slug:'volnostoyashchaya-lestnitsa',
      title:'Вольностоящая лестница',
      description:'Цирковой эквилибр на вольностоящей лестнице — зрелищный номер, в котором артист демонстрирует равновесие и точность движений.'
    },
    {
      key:'hatter',slug:'shlyapnik',title:'Шляпник',
      description:'Цирковое выступление с использованием шляп и выразительных трюков. Формат и наполнение подбираются под мероприятие.'
    }
  ];
  const priceNote='Стоимость зависит от формата выступления, даты, площадки и технических условий. Подробности уточняем при обсуждении мероприятия.';
  const originalNote=dialog.querySelector('.artist-price-note')?.textContent||'';
  const originalVideoLabel=dialog.querySelector('.artist-video-label')?.textContent||'';
  dialog.addEventListener('close',()=>{
    const note=dialog.querySelector('.artist-price-note');
    const label=dialog.querySelector('.artist-video-label');
    if(note)note.textContent=originalNote;
    if(label)label.textContent=originalVideoLabel;
  });
  const cards=[];
  const safePhoto=path=>{
    if(typeof path!=='string')return null;
    path=path.trim().replace(/^\/+/,'');
    return path.startsWith('images/')&&!path.includes('..')&&!/[?#<>"']/.test(path)?'/'+path:null;
  };
  function openArtist(info){
    const heading=dialog.querySelector('#artist-dialog-title');
    const description=dialog.querySelector('#artist-dialog-description');
    const price=dialog.querySelector('#artist-dialog-price');
    const photo=dialog.querySelector('#artist-dialog-photo');
    const wrap=dialog.querySelector('.artist-photo-wrap');
    const count=dialog.querySelector('#artist-photo-count');
    const end=dialog.querySelector('#stilts-gallery-end');
    const videoWrap=dialog.querySelector('#artist-video-wrap');
    const video=dialog.querySelector('#artist-video');
    if(dialog.open)return;
    heading.textContent=info.title;
    description.textContent=info.description;
    price.textContent='Стоимость по запросу';
    const note=dialog.querySelector('.artist-price-note');
    if(note)note.textContent=priceNote;
    if(photo){photo.hidden=true;photo.removeAttribute('src')}
    if(wrap)wrap.hidden=true;
    if(end)end.hidden=true;
    if(count)count.textContent='';
    if(video){video.pause();video.removeAttribute('src');video.load()}
    if(videoWrap)videoWrap.hidden=true;
    const videoLabel=dialog.querySelector('.artist-video-label');
    if(videoLabel)videoLabel.textContent=info.title.toUpperCase()+' · В ДВИЖЕНИИ';
    dialog.classList.add('stilts-showcase','artist-no-video');
    dialog.showModal();
    // CMS photo and video data load through the shared artist-request-home.js handler.
  }
  artists.forEach(info=>{
    if(track.querySelector('[data-artist="'+info.key+'"]'))return;
    const card=document.createElement('article');
    card.className='genre genre-pending';
    card.dataset.artist=info.key;
    card.setAttribute('role','button');
    card.setAttribute('tabindex','0');
    card.setAttribute('aria-haspopup','dialog');
    card.setAttribute('aria-label','Подробнее: '+info.title);
    const visual=document.createElement('div');
    visual.className='genre-img genre-placeholder';
    const placeholder=document.createElement('span');
    placeholder.textContent='НОГИ В РУКИ';
    visual.appendChild(placeholder);
    const label=document.createElement('h3');
    label.textContent=info.title;
    if(info.title.length>=23)label.classList.add('genre-title-verylong');
    else if(info.title.length>=16)label.classList.add('genre-title-long');
    card.append(visual,label);
    card.addEventListener('click',()=>openArtist(info));
    card.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){e.preventDefault();openArtist(info)}
    });
    track.appendChild(card);
    cards.push(card);
  });
  // The homepage's existing carousel listeners captured the original 16 cards.
  // Keep its counter accurate for the two additional cards, without replacing the carousel.
  const count=root.querySelector('.genres-count');
  function updateCount(){
    if(!count)return;
    const all=[...track.querySelectorAll('.genre')];
    if(!all.length)return;
    const step=all.length>1?all[1].offsetLeft-all[0].offsetLeft:track.clientWidth;
    const index=step>0?Math.max(0,Math.min(all.length-1,Math.round(track.scrollLeft/step))):0;
    count.textContent=String(index+1).padStart(2,'0')+' / '+String(all.length).padStart(2,'0');
  }
  track.addEventListener('scroll',updateCount,{passive:true});
  window.addEventListener('resize',updateCount);
  updateCount();
  // "All genres" is built by a pre-existing script from the old 16 cards.
  // Append clones after that script first opens the gallery.
  const toggle=root.querySelector('.genre-all-toggle');
  const allDialog=document.getElementById('all-genres-dialog');
  const grid=allDialog?.querySelector('#genre-all-grid');
  toggle?.addEventListener('click',()=>{
    if(!grid)return;
    cards.forEach(original=>{
      if(grid.querySelector('[data-artist="'+original.dataset.artist+'"]'))return;
      const copy=original.cloneNode(true);
      copy.addEventListener('click',()=>{
        if(allDialog.open)allDialog.close();
        toggle.setAttribute('aria-expanded','false');
        original.click();
      });
      copy.addEventListener('keydown',e=>{
        if(e.key==='Enter'||e.key===' '){e.preventDefault();copy.click()}
      });
      grid.appendChild(copy);
    });
  });
  // Populate carousel covers from the first CMS photo, as for existing cards.
  fetch('/artist-media.json',{cache:'no-store'}).then(r=>{
    if(!r.ok)throw Error('Artist media unavailable');
    return r.json();
  }).then(data=>{
    for(const info of artists){
      const cover=safePhoto(data?.[info.slug]?.photos?.[0]?.image);
      const card=track.querySelector('[data-artist="'+info.key+'"]');
      if(!card||!cover)continue;
      const visual=card.querySelector('.genre-img');
      const img=document.createElement('img');
      img.src=cover;img.alt=info.title;img.loading='lazy';
      visual.replaceChildren(img);
      visual.classList.remove('genre-placeholder');
      card.classList.remove('genre-pending');
    }
  }).catch(()=>{});
});
