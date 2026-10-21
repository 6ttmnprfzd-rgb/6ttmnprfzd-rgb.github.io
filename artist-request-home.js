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
    modal.classList.add('artist-cms-acrobat');
    selected=artistToPage[key];
    modal.dataset.cmsArtistSlug=selected;photos=null;
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

/* Load lightweight navigation without editing the huge homepage HTML. */
(()=>{
  if(document.querySelector('script[data-artist-genre-navigation]'))return;
  const s=document.createElement('script');
  s.src='/artist-genre-navigation.js?v=20261021d';
  s.dataset.artistGenreNavigation='true';
  document.head.appendChild(s);
})();

/* Load the small, homepage-only genre catalog stylesheet after inline site styles. */
(()=>{
  if(document.querySelector('link[data-genre-catalog-polish]'))return;
  const sheet=document.createElement('link');
  sheet.rel='stylesheet';
  sheet.href='/genre-catalog-polish.css?v=20261021a';
  sheet.dataset.genreCatalogPolish='true';
  document.head.appendChild(sheet);
})();


/* Open the existing media library from every homepage artist popup. */
document.addEventListener('DOMContentLoaded',()=>{
  const opener=document.getElementById('open-media');
  if(!opener)return;

  // A standalone artist page can link to /#media-library.
  if(window.location.hash==='#media-library')opener.click();

  document.addEventListener('click',event=>{
    const link=event.target.closest?.('#artist-dialog #stilts-gallery-link');
    if(!link)return;
    event.preventDefault();
    event.stopPropagation();
    const dialog=document.getElementById('artist-dialog');
    if(dialog?.open)dialog.close();
    requestAnimationFrame(()=>opener.click());
  },true);
});


/* Atmosphere redesign 4/4: semantic media-library row inside the existing button. */
document.addEventListener('DOMContentLoaded',()=>{
  const button=document.getElementById('open-media');
  if(!button||button.dataset.mediaRowReady)return;
  button.dataset.mediaRowReady='true';
  const symbol=document.createElement('span');
  symbol.className='wc-media-row-icon';
  symbol.setAttribute('aria-hidden','true');
  symbol.innerHTML='<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';
  const copy=document.createElement('span');
  copy.className='wc-media-row-copy';
  const label=document.createElement('span');
  label.className='wc-media-row-kicker';
  label.textContent='МЕДИАТЕКА';
  const title=document.createElement('span');
  title.className='wc-media-row-title';
  title.textContent='Смотреть все фото и видео';
  copy.append(label,title);
  const arrow=document.createElement('span');
  arrow.className='wc-media-row-arrow';
  arrow.textContent='↗';
  arrow.setAttribute('aria-hidden','true');
  button.replaceChildren(symbol,copy,arrow);
  button.setAttribute('aria-label','Смотреть все фото и видео');
});

/* Keep genre catalog covers synchronized with the first photo in Pages CMS.
   Apply also to the full-catalog clones; site-media.json may load afterwards. */
document.addEventListener('DOMContentLoaded',()=>{
  const slugByCard={
    stilts:'hodulisty',juggling:'zhonglery',mime:'mimy',
    unicycle:'unitsiklisty',magic:'mikromag',acrobat:'akrobaty',
    cyrwheel:'koleso-sira',knife:'balans-na-nozhe',
    canes:'ekvilibr-na-trostyah',hoops:'hulahupy',
    zorb:'gimnastka-v-zorb-share',
    aerialring:'gimnastka-v-parternom-koltse',
    diabolo:'diabolo',rollers:'ekvilibr-na-katushkah',
    chairs:'ekvilibr-na-stulyah',contact:'kontaktnoe-zhonglirovanie',
    ladder:'volnostoyashchaya-lestnitsa',hatter:'shlyapnik'
  };
  const containers=[
    document.querySelector('#genres .genres-featured'),
    document.querySelector('#all-genres-dialog .genre-all-grid')
  ].filter(Boolean);
  if(!containers.length)return;
  const safeCover=value=>{
    if(typeof value!=='string')return null;
    const path=value.trim().replace(/^\/+/, '');
    return /^images\/[a-zA-Z0-9_.\/-]+$/.test(path)&&!path.includes('..')?'/'+path:null;
  };
  fetch('/artist-media.json',{cache:'no-store'})
    .then(response=>{
      if(!response.ok)throw Error('Artist covers unavailable');
      return response.json();
    })
    .then(data=>{
      const covers=new Map();
      for(const [key,slug] of Object.entries(slugByCard)){
        const photos=data?.[slug]?.photos;
        const first=(Array.isArray(photos)?photos:[])
          .map(item=>safeCover(item?.image)).find(Boolean);
        if(first)covers.set(key,first);
      }
      const syncCovers=container=>{
        container.querySelectorAll('.genre[data-artist]').forEach(card=>{
          const src=covers.get(card.dataset.artist);
          if(!src)return;
          const visual=card.querySelector('.genre-img');
          if(!visual)return;
          let img=visual.querySelector('img');
          if(!img){
            img=document.createElement('img');
            img.alt=card.querySelector('h3')?.textContent?.trim()||'Цирковой артист';
            img.loading='lazy';
            visual.replaceChildren(img);
          }
          if(img.getAttribute('src')!==src)img.setAttribute('src',src);
          visual.classList.remove('genre-placeholder');
          card.classList.remove('genre-pending');
        });
      };
      // The homepage's separate site-media loader can finish later and
      // replace covers. Restore the CMS cover whenever that happens.
      const observer=new MutationObserver(()=>{
        containers.forEach(syncCovers);
      });
      containers.forEach(container=>{
        observer.observe(container,{
          subtree:true,childList:true,attributes:true,attributeFilter:['src']
        });
        syncCovers(container);
      });
    }).catch(error=>console.warn('Genre covers unavailable',error));
});


/* Shared CMS copy and pricing for all 18 genre cards. */
document.addEventListener('DOMContentLoaded',()=>{
  const dialog=document.getElementById('artist-dialog');
  const heading=dialog?.querySelector('#artist-dialog-title');
  const description=dialog?.querySelector('#artist-dialog-description');
  const price=dialog?.querySelector('#artist-dialog-price');
  if(!dialog||!heading||!description||!price)return;
  const priceNote=dialog.querySelector('.artist-price-note');
  const tooltip=dialog.querySelector('#artist-price-tooltip');
  const nativeInfo=document.querySelector('.stilts-info-native-inner p');
  const originalNote=priceNote?.textContent||'';
  const originalTooltip=tooltip?.textContent||'';
  const originalNativeInfo=nativeInfo?.textContent||'';
  const clean=value=>typeof value==='string'?value.trim():'';
  const configs=[
    {key:'stilts',slug:'hodulisty',title:"Ходулисты"},
    {key:'juggling',slug:'zhonglery',title:"Жонглёры"},
    {key:'mime',slug:'mimy',title:"Мимы"},
    {key:'unicycle',slug:'unitsiklisty',title:"Унициклисты"},
    {key:'magic',slug:'mikromag',title:"Микромаг"},
    {key:'acrobat',slug:'akrobaty',title:"Акробаты"},
    {key:'cyrwheel',slug:'koleso-sira',title:"Колесо Сира"},
    {key:'knife',slug:'balans-na-nozhe',title:"Баланс на ноже"},
    {key:'canes',slug:'ekvilibr-na-trostyah',title:"Эквилибр на тростях"},
    {key:'hoops',slug:'hulahupy',title:"Хулахупы"},
    {key:'zorb',slug:'gimnastka-v-zorb-share',title:"Гимнастка в Зорб-шаре"},
    {key:'aerialring',slug:'gimnastka-v-parternom-koltse',title:"Гимнастка в партерном кольце"},
    {key:'diabolo',slug:'diabolo',title:"Диаболо"},
    {key:'rollers',slug:'ekvilibr-na-katushkah',title:"Эквилибр на катушках"},
    {key:'chairs',slug:'ekvilibr-na-stulyah',title:"Эквилибр на стульях"},
    {key:'contact',slug:'kontaktnoe-zhonglirovanie',title:"Контактное жонглирование"},
    {key:'ladder',slug:'volnostoyashchaya-lestnitsa',title:"Вольностоящая лестница"},
    {key:'hatter',slug:'shlyapnik',title:"Шляпник"}
  ];
  fetch('/artist-content.json',{cache:'no-store'}).then(response=>{
    if(!response.ok)throw Error('Artist text unavailable');
    return response.json();
  }).then(data=>{
    const items=configs.map(config=>{
      const cms=data?.[config.slug];
      if(!cms||typeof cms!=='object')return null;
      return {...config,
        cmsTitle:clean(cms.title),
        cmsDescription:clean(cms.description),
        cmsPrice:clean(cms.price),
        cmsNote:clean(cms.price_note)
      };
    }).filter(Boolean);
    if(!items.length)return;
    const syncNames=()=>{
      items.forEach(item=>{
        if(!item.cmsTitle)return;
        document.querySelectorAll(
          '#genres .genres-featured .genre[data-artist="'+item.key+'"], '+
          '#all-genres-dialog .genre-all-grid .genre[data-artist="'+item.key+'"]'
        ).forEach(card=>{
          const label=card.querySelector('h3');
          if(label&&label.textContent!==item.cmsTitle)label.textContent=item.cmsTitle;
          card.setAttribute('aria-label','Подробнее: '+item.cmsTitle);
        });
      });
    };
    const grid=document.querySelector('#all-genres-dialog .genre-all-grid');
    if(grid)new MutationObserver(syncNames).observe(grid,{childList:true});
    syncNames();
    const restoreNotes=()=>{
      if(priceNote)priceNote.textContent=originalNote;
      if(tooltip)tooltip.textContent=originalTooltip;
      if(nativeInfo)nativeInfo.textContent=originalNativeInfo;
    };
    const update=()=>{
      const title=heading.textContent.trim();
      const slug=dialog.dataset.cmsArtistSlug;
      const active=items.find(item=>item.slug===slug)||items.find(item=>title===item.title||(item.cmsTitle&&title===item.cmsTitle));
      if(!active){restoreNotes();return;}
      if(active.cmsTitle&&title!==active.cmsTitle)heading.textContent=active.cmsTitle;
      if(active.cmsDescription)description.textContent=active.cmsDescription;
      if(active.cmsPrice)price.textContent=active.cmsPrice;
      dialog.classList.toggle('artist-cms-long-price',clean(price.textContent).length>19);
      const note=active.cmsNote;
      if(priceNote)priceNote.textContent=note||originalNote;
      if(tooltip)tooltip.textContent=note||originalTooltip;
      if(nativeInfo)nativeInfo.textContent=note||originalNativeInfo;
    };
    new MutationObserver(update).observe(heading,{childList:true,characterData:true,subtree:true});
    update();
  }).catch(error=>console.warn('Artist text unavailable; keeping original copy',error));
});
