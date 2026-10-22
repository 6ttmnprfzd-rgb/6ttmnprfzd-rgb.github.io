/* Format detail dialogs: use the same short brand breadcrumb as the other overlays. */
document.addEventListener('DOMContentLoaded',()=>{
  const label=document.querySelector('#format-modal .format-modal-panel .eyebrow');
  if(label) label.innerHTML='<span class="format-brand-lockup">НОГИ <span class="format-brand-small-v">в</span> РУКИ / ФОРМАТЫ</span>';
});

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

  // Standalone artist pages link here with the source genre preserved.
  if(window.location.hash==='#media-library'){
    const incoming=new URLSearchParams(window.location.search).get('from-artist');
    if(incoming&&/^[a-z0-9-]+$/.test(incoming)){
      const overlay=document.getElementById('media-overlay');
      if(overlay){
        overlay.dataset.returnArtistSlug=incoming;
        overlay.dataset.returnSource='standalone';
      }
      // Keep the public media URL clean after capturing the origin.
      window.history.replaceState(window.history.state,'',window.location.pathname+'#media-library');
    }
    opener.click();
  }

  document.addEventListener('click',event=>{
    const link=event.target.closest?.('#artist-dialog #stilts-gallery-link');
    if(!link)return;
    event.preventDefault();
    event.stopPropagation();
    const dialog=document.getElementById('artist-dialog');
    const slug=dialog?.dataset.cmsArtistSlug;
    const overlay=document.getElementById('media-overlay');
    if(overlay&&slug){
      overlay.dataset.returnArtistSlug=slug;
      overlay.dataset.returnSource='homepage';
    }
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


/* Return from the common media library to the artist that opened it.
   The link is absent for ordinary gallery visits. No large HTML changes. */
document.addEventListener('DOMContentLoaded',()=>{
  const overlay=document.getElementById('media-overlay');
  const panel=overlay?.querySelector('.media-panel');
  const head=panel?.querySelector('.media-head');
  if(!overlay||!panel||!head||panel.querySelector('.media-artist-back'))return;
  const slugs={
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
  const back=document.createElement('button');
  back.className='media-artist-back';
  back.type='button';
  back.hidden=true;
  const arrow=document.createElement('span');
  arrow.className='media-artist-back-arrow';
  arrow.setAttribute('aria-hidden','true');
  arrow.textContent='←';
  const label=document.createElement('span');
  label.textContent='Вернуться к артисту';
  back.append(arrow,label);
  panel.insertBefore(back,head);

  // Only add a graphite surface once the return link reaches the sticky edge.
  const updateStickySurface=()=>{
    const topPadding=parseFloat(getComputedStyle(panel).paddingTop)||0;
    const isStuck=!back.hidden&&panel.scrollTop>=Math.max(8,topPadding-1);
    back.classList.toggle('is-stuck',isStuck);
  };
  panel.addEventListener('scroll',updateStickySurface,{passive:true});

  const update=()=>{
    const slug=overlay.dataset.returnArtistSlug;
    back.hidden=overlay.hidden||!Object.values(slugs).includes(slug);
    updateStickySurface();
  };
  let wasOpen=!overlay.hidden;
  const observer=new MutationObserver(()=>{
    const isOpen=!overlay.hidden;
    // Only clear a previous origin after the library actually closes.
    // On an artist click the origin is recorded BEFORE the library opens.
    if(wasOpen&&!isOpen){
      delete overlay.dataset.returnArtistSlug;
      delete overlay.dataset.returnSource;
    }
    wasOpen=isOpen;
    update();
  });
  observer.observe(overlay,{
    attributes:true,
    attributeFilter:['hidden','data-return-artist-slug','data-return-source']
  });
  update();

  back.addEventListener('click',()=>{
    const slug=overlay.dataset.returnArtistSlug;
    const source=overlay.dataset.returnSource;
    if(!Object.values(slugs).includes(slug))return;
    overlay.querySelector('.media-close')?.click();
    if(source==='standalone'){
      window.location.assign('/'+encodeURIComponent(slug)+'/');
      return;
    }
    const key=Object.keys(slugs).find(item=>slugs[item]===slug);
    requestAnimationFrame(()=>{
      const card=document.querySelector('#genres .genres-featured .genre[data-artist="'+key+'"]');
      if(card)card.click();
      else window.location.assign('/'+encodeURIComponent(slug)+'/');
    });
  });
});

/* Pages CMS price catalogue: populate the existing three-tab popup without rewriting index.html.
   If the JSON cannot be loaded or validated, the original HTML price list remains usable. */
document.addEventListener('DOMContentLoaded',()=>{
  const overlay=document.getElementById('price-overlay');
  if(!overlay)return;
  const tabNames=['raus','show','acts'];
  const panels=Object.fromEntries(tabNames.map(key=>[
    key,overlay.querySelector('[data-price-content="'+key+'"]')
  ]));
  const tabs=Object.fromEntries(tabNames.map(key=>[
    key,overlay.querySelector('[data-price-tab="'+key+'"]')
  ]));
  const eyebrow=overlay.querySelector('.eyebrow');
  const title=overlay.querySelector('#price-title');
  const footnote=overlay.querySelector('.price-footnote');
  const action=overlay.querySelector('#price-request');
  if(!tabNames.every(key=>panels[key]&&tabs[key])||!eyebrow||!title||!footnote||!action)return;

  const validBlock=block=>{
    if(!block||typeof block!=='object')return false;
    if(block.type==='text'||block.type==='heading')return typeof block.text==='string';
    if(block.type==='item'||block.type==='plan')
      return typeof block.name==='string'&&typeof block.price==='string';
    return false;
  };
  const validData=data=>
    data&&typeof data==='object'&&
    ['eyebrow','title','footnote','cta_label'].every(k=>typeof data[k]==='string')&&
    tabNames.every(k=>data[k]&&typeof data[k].tab_label==='string'&&
      Array.isArray(data[k].blocks)&&data[k].blocks.length<=150&&
      data[k].blocks.every(validBlock));

  const buildBlock=block=>{
    if(block.type==='text'){
      const p=document.createElement('p');
      p.textContent=block.text;
      return p;
    }
    if(block.type==='heading'){
      const heading=document.createElement('div');
      heading.className='price-subtitle';
      heading.textContent=block.text;
      return heading;
    }
    const row=document.createElement('div');
    row.className=block.type==='plan'?'price-plan':'price-item';
    const label=document.createElement('span');
    const amount=document.createElement('strong');
    label.textContent=block.name;
    amount.textContent=block.price;
    row.append(label,amount);
    return row;
  };

  fetch('/price-data.json?v='+Date.now(),{cache:'no-store'})
    .then(response=>{if(!response.ok)throw Error('Price JSON unavailable');return response.json()})
    .then(data=>{
      if(!validData(data))throw Error('Invalid price CMS data; retaining original price');
      // Prepare all three sections before changing the visible original.
      const contents={};
      tabNames.forEach(k=>{
        const fragment=document.createDocumentFragment();
        data[k].blocks.forEach(block=>fragment.append(buildBlock(block)));
        contents[k]=fragment;
      });
      tabNames.forEach(k=>{
        panels[k].replaceChildren(contents[k]);
        tabs[k].textContent=data[k].tab_label;
      });
      eyebrow.textContent=data.eyebrow;
      title.textContent=data.title;
      footnote.textContent=data.footnote;
      action.textContent=data.cta_label;
    })
    .catch(error=>console.warn('Price CMS unavailable; showing original price list',error));
});

/* Format card opens its existing details button when the card body is clicked.
   Keep the original button listener responsible for opening the popup. */
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('#formats .formats > article.format').forEach(card=>{
    const button=card.querySelector('.format-more[data-format]');
    if(!button)return;
    card.addEventListener('click',event=>{
      if(event.target instanceof Element &&
         event.target.closest('button,a,input,textarea,select,[contenteditable="true"]'))return;
      button.click();
    });
  });
});

/* Match the small lowercase "в" in the Contacts and All Genres modal brand lines. */
document.addEventListener('DOMContentLoaded',()=>{
  const contactLabel=document.querySelector('#wc-contact-overlay .wc-contact-top');
  if(contactLabel&&contactLabel.textContent.trim()==='НОГИ В РУКИ / КОНТАКТЫ'){
    contactLabel.replaceChildren(
      document.createTextNode('НОГИ '),
      Object.assign(document.createElement('span'),{className:'site-brand-small-v',textContent:'в'}),
      document.createTextNode(' РУКИ / КОНТАКТЫ')
    );
  }
  const heading=document.querySelector('#all-genres-dialog .all-genres-dialog-header h2');
  if(heading&&!heading.querySelector('.genres-modal-brand')){
    const prefix=document.createElement('span');
    prefix.className='genres-modal-brand';
    prefix.append(
      document.createTextNode('НОГИ '),
      Object.assign(document.createElement('span'),{className:'site-brand-small-v',textContent:'в'}),
      document.createTextNode(' РУКИ / АРТИСТЫ')
    );
    heading.prepend(prefix);
  }
});

/* Request form content: presentation only; submission fields remain unchanged. */
document.addEventListener('DOMContentLoaded',()=>{
  const panel=document.querySelector('#request-overlay .request-panel');
  const title=panel?.querySelector('#request-title');
  const form=panel?.querySelector('#request-form');
  if(!title||!form)return;
  if(!panel.querySelector('.request-brand-kicker')){
    const kicker=document.createElement('div');
    kicker.className='request-brand-kicker';
    kicker.append('НОГИ ');
    const small=document.createElement('span');
    small.className='request-brand-small-v';
    small.textContent='в';
    kicker.append(small,' РУКИ / ЗАЯВКА');
    title.before(kicker);
  }
  const intro=title.nextElementSibling;
  if(intro?.tagName==='P')intro.textContent='Укажите детали мероприятия, чтобы мы могли подготовить предложение и рассчитать стоимость.';
  const select=form.querySelector('select[name="format"]');
  if(select&&!select.dataset.polished){
    const previous=select.value;
    const formats=['Раус / встреча гостей','Шоу','Отдельный номер'];
    const placeholder=new Option('Выберите формат','',true,true);
    placeholder.disabled=true;
    select.replaceChildren(placeholder,...formats.map(x=>new Option(x,x)));
    select.required=true;
    if(formats.includes(previous))select.value=previous;
    select.dataset.polished='true';
  }
});

/* Optional performer quantities: reuse existing "count" and "notes" bot fields. */
document.addEventListener('DOMContentLoaded',()=>{
  const form=document.querySelector('#request-overlay #request-form');
  if(!form||form.querySelector('.request-performers'))return;
  const format=form.querySelector('select[name="format"]');
  const notes=form.querySelector('textarea[name="notes"]');
  const count=form.querySelector('input[name="count"]');
  if(!format||!notes||!count)return;
  notes.placeholder='Дополнительные детали мероприятия';

  // Keep the old backend field, but calculate it from selected performers.
  count.type='hidden';
  const oldCountRow=count.closest('.request-field');
  if(oldCountRow)oldCountRow.style.display='none';

  const names=[
    'Ходулисты','Жонглёры','Мимы','Унициклисты','Микромаг','Акробаты',
    'Колесо Сира','Баланс на ноже','Эквилибр на тростях','Хулахупы',
    'Гимнастка в Зорб-шаре','Гимнастка в партерном кольце','Диаболо',
    'Эквилибр на катушках','Эквилибр на стульях','Контактное жонглирование',
    'Вольностоящая лестница','Шляпник'
  ];
  const field=document.createElement('details');
  field.className='request-performers request-field wide';
  const summary=document.createElement('summary');
  summary.append('ИНТЕРЕСУЮЩИЕ АРТИСТЫ ');
  const tally=document.createElement('span');
  tally.className='request-performers-count';
  summary.append(tally);
  const list=document.createElement('div');
  list.className='request-performers-list';
  const entries=names.map(name=>{
    const row=document.createElement('div');
    row.className='request-performer-row';
    const label=document.createElement('label');
    label.className='request-performer-option';
    const checkbox=document.createElement('input');
    checkbox.type='checkbox';
    checkbox.value=name;
    const caption=document.createElement('span');
    caption.textContent=name;
    label.append(checkbox,caption);
    const quantity=document.createElement('input');
    quantity.type='number';
    quantity.className='request-performer-quantity';
    quantity.value='1';
    quantity.min='1';
    quantity.max='99';
    quantity.step='1';
    quantity.inputMode='numeric';
    quantity.required=true;
    quantity.disabled=true;
    quantity.hidden=true;
    quantity.setAttribute('aria-label','Количество артистов: '+name);
    row.append(label,quantity);
    list.append(row);
    return {name,checkbox,quantity};
  });
  const chosen=()=>entries.filter(entry=>entry.checkbox.checked);
  const numberFor=entry=>{
    const value=Number(entry.quantity.value);
    return Number.isFinite(value)?Math.max(1,Math.min(99,Math.floor(value))):1;
  };
  const update=()=>{
    entries.forEach(entry=>{
      const enabled=entry.checkbox.checked;
      entry.quantity.disabled=!enabled;
      entry.quantity.hidden=!enabled;
    });
    const selected=chosen();
    const total=selected.reduce((sum,entry)=>sum+numberFor(entry),0);
    count.value=selected.length?String(total):'';
    tally.textContent=selected.length?
      '('+selected.length+' жанр., '+total+' арт.)':'(необязательно)';
  };
  list.addEventListener('change',update);
  list.addEventListener('input',update);
  form.addEventListener('reset',()=>setTimeout(()=>{
    entries.forEach(entry=>{entry.quantity.value='1';});
    update();
  },0));
  field.append(summary,list);
  format.closest('.request-field')?.insertAdjacentElement('afterend',field);

  // Use the original count -> payload.artists and notes -> payload.comment fields.
  form.addEventListener('formdata',event=>{
    const selected=chosen();
    const total=selected.reduce((sum,entry)=>sum+numberFor(entry),0);
    event.formData.set('count',selected.length?String(total):'');
    const extra=notes.value.trim();
    if(selected.length){
      const performers=selected.map(entry=>entry.name+' — '+numberFor(entry)).join('; ');
      event.formData.set('notes','Интересующие артисты: '+performers+
        (extra?'\nДополнительные детали: '+extra:''));
    }else{
      event.formData.set('notes',extra);
    }
  });
});

/* Atmosphere spotlight 2026: clickable photo cascade, CMS-safe and independent of the media library. */
document.addEventListener('DOMContentLoaded',()=>{
  const section=document.getElementById('gallery');
  const film=section?.querySelector('.gallery-film');
  const mediaButton=section?.querySelector('#open-media');
  if(!film||!mediaButton||document.getElementById('atmosphere-lightbox'))return;
  const arrow=document.createElement('span');
  arrow.className='atmosphere-media-arrow';
  arrow.setAttribute('aria-hidden','true');
  arrow.textContent='↗';
  mediaButton.replaceChildren(document.createTextNode('Смотреть все фото и видео'),arrow);

  const lightbox=document.createElement('div');
  lightbox.id='atmosphere-lightbox';
  lightbox.hidden=true;
  lightbox.setAttribute('role','dialog');
  lightbox.setAttribute('aria-modal','true');
  lightbox.setAttribute('aria-label','Просмотр фотографий мероприятий');
  lightbox.innerHTML='<button type="button" class="atmosphere-lightbox-close" aria-label="Закрыть фотографию">×</button><button type="button" class="atmosphere-lightbox-prev" aria-label="Предыдущая фотография">←</button><img class="atmosphere-full-image" alt=""><button type="button" class="atmosphere-lightbox-next" aria-label="Следующая фотография">→</button><span class="atmosphere-lightbox-count" aria-live="polite"></span>';
  document.body.append(lightbox);
  const closeButton=lightbox.querySelector('.atmosphere-lightbox-close');
  const display=lightbox.querySelector('img');
  const counter=lightbox.querySelector('.atmosphere-lightbox-count');
  let photos=[],index=0,previousFocus=null,startX=null;

  const refresh=()=>{
    film.removeAttribute('tabindex');
    photos=[...film.querySelectorAll('.shot')];
    photos.forEach((shot,i)=>{
      const img=shot.querySelector('img');
      shot.setAttribute('role','button');
      shot.setAttribute('tabindex','0');
      shot.setAttribute('aria-hidden','false');
      shot.setAttribute('aria-label','Открыть фото '+(i+1)+': '+(img?.alt||'Мероприятие'));
    });
  };
  const show=at=>{
    if(!photos.length)return;
    index=(at+photos.length)%photos.length;
    const image=photos[index].querySelector('img');
    if(!image)return;
    display.src=image.currentSrc||image.src;
    display.alt=image.alt||'Фотография мероприятия';
    counter.textContent=(index+1)+' / '+photos.length;
  };
  const open=at=>{
    refresh();
    if(!photos.length)return;
    previousFocus=document.activeElement;
    show(at);
    lightbox.hidden=false;
    document.body.classList.add('modal-open');
    closeButton.focus();
  };
  const close=()=>{
    lightbox.hidden=true;
    document.body.classList.remove('modal-open');
    previousFocus?.focus?.();
  };
  const move=step=>show(index+step);

  // Capture clicks before the legacy carousel's card listener, which otherwise only rotates cards.
  film.addEventListener('click',event=>{
    const shot=event.target.closest('.shot');
    if(!shot)return;
    event.preventDefault();
    event.stopPropagation();
    open([...film.querySelectorAll('.shot')].indexOf(shot));
  },true);
  film.addEventListener('keydown',event=>{
    const shot=event.target.closest('.shot');
    if(!shot)return;
    if(event.key==='Enter'||event.key===' '){
      event.preventDefault();
      event.stopPropagation();
      open([...film.querySelectorAll('.shot')].indexOf(shot));
    }else if(event.key==='ArrowRight'||event.key==='ArrowLeft'){
      event.preventDefault();
      event.stopPropagation();
      const cards=[...film.querySelectorAll('.shot')];
      const next=(cards.indexOf(shot)+(event.key==='ArrowRight'?1:-1)+cards.length)%cards.length;
      cards[next]?.focus();
    }
  },true);
  // Keep the original mobile floating carousel's swipe navigation enabled.
  closeButton.addEventListener('click',close);
  lightbox.querySelector('.atmosphere-lightbox-prev').addEventListener('click',()=>move(-1));
  lightbox.querySelector('.atmosphere-lightbox-next').addEventListener('click',()=>move(1));
  lightbox.addEventListener('click',event=>{if(event.target===lightbox)close()});
  lightbox.addEventListener('touchstart',event=>{startX=event.touches[0]?.clientX??null},{passive:true});
  lightbox.addEventListener('touchend',event=>{
    if(startX===null)return;
    const shift=event.changedTouches[0].clientX-startX;
    startX=null;
    if(Math.abs(shift)>45)move(shift<0?1:-1);
  },{passive:true});
  document.addEventListener('keydown',event=>{
    if(lightbox.hidden)return;
    if(event.key==='Escape'){event.stopImmediatePropagation();close()}
    else if(event.key==='ArrowLeft'){event.preventDefault();move(-1)}
    else if(event.key==='ArrowRight'){event.preventDefault();move(1)}
    else if(event.key==='Tab'){
      event.preventDefault();
      const actions=[closeButton,lightbox.querySelector('.atmosphere-lightbox-prev'),lightbox.querySelector('.atmosphere-lightbox-next')];
      const pos=actions.indexOf(document.activeElement);
      actions[(pos+(event.shiftKey?-1:1)+actions.length)%actions.length].focus();
    }
  },true);

  section.classList.add('atmosphere-cascade');
  refresh();
  document.addEventListener('cms-gallery-updated',refresh);
});

/* Main navigation: Genres and Gallery open their existing modals, not page anchors. */
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('header nav a[href="#genres"], header nav a[href="#gallery"]').forEach(link=>{
    link.addEventListener('click',event=>{
      const target=link.getAttribute('href')==='#genres'
        ?document.querySelector('#genres .genre-all-toggle')
        :document.getElementById('open-media');
      if(!target)return; // Keep the original anchor as fallback.
      event.preventDefault();
      const mobileMenu=link.closest('details.mobile-menu');
      if(mobileMenu)mobileMenu.open=false;
      target.click();
    });
  });
});

/* Landing-page CTAs open the existing application form directly. */
document.addEventListener('DOMContentLoaded',()=>{
  if(window.location.hash!=='#open-request')return;
  const opener=document.querySelector('[data-request-open]');
  if(!opener)return;
  requestAnimationFrame(()=>{
    opener.click();
    if(window.location.hash==='#open-request'){
      window.history.replaceState(window.history.state,'',window.location.pathname+window.location.search);
    }
  });
});

/* Three independent service pages, accessible directly from the existing Formats popup.
   This augments the homepage without replacing its established format cards or dialogs. */
document.addEventListener('DOMContentLoaded',()=>{
  const panel=document.querySelector('#format-modal .format-modal-panel');
  if(!panel||panel.querySelector('.format-page-links'))return;
  const nav=document.createElement('nav');
  nav.className='format-page-links';
  nav.setAttribute('aria-label','Подробные страницы форматов');
  const label=document.createElement('strong');
  label.textContent='Подробнее о наших форматах';
  nav.append(label);
  [
    ['Раус','/raus/'],
    ['Шоу','/show/'],
    ['Номера','/nomera/']
  ].forEach(([name,href])=>{
    const link=document.createElement('a');
    link.href=href;
    link.textContent=name;
    nav.append(link);
  });
  panel.append(nav);
});

/* Homepage: Formats header dropdown to the three independent service pages. */
document.addEventListener('DOMContentLoaded',()=>{
 const header=document.querySelector('header.top');
 if(!header)return;
 const entries=[['РАУС','/raus/'],['ШОУ','/show/'],['НОМЕРА','/nomera/']];
 const menus=[];
 for(const nav of header.querySelectorAll('nav.links, nav.mobile-menu-panel')){
   const old=nav.querySelector('a[href="#formats"]');
   if(!old)continue;
   const details=document.createElement('details');
   details.className='formats-nav-dropdown';
   const summary=document.createElement('summary');
   summary.textContent='Форматы';
   summary.setAttribute('aria-label','Форматы — раскрыть список');
   const panel=document.createElement('div');
   panel.className='formats-nav-dropdown-panel';
   panel.setAttribute('role','group');
   panel.setAttribute('aria-label','Страницы форматов');
   for(const [label,url] of entries){
     const link=document.createElement('a');
     link.textContent=label;link.href=url;
     if(nav.classList.contains('mobile-menu-panel')){
       link.addEventListener('click',()=>{
         const mobile=header.querySelector('.mobile-menu');
         if(mobile)mobile.open=false;
       });
     }
     panel.appendChild(link);
   }
   details.append(summary,panel);
   old.replaceWith(details);
   // Match the original main navigation links instead of using the smaller hardcoded font.
   if(nav.classList.contains('links')){
     const sync=()=>{
       const reference=nav.querySelector('a[href="/"],a[href="#home"],a:not(.formats-nav-dropdown-panel a)');
       if(!reference)return;
       const computed=getComputedStyle(reference);
       summary.style.font=computed.font;
       summary.style.fontSize=computed.fontSize;
       summary.style.fontWeight=computed.fontWeight;
       summary.style.letterSpacing=computed.letterSpacing;
       summary.style.lineHeight=computed.lineHeight;
       summary.style.textTransform=computed.textTransform;
     };
     sync();
     window.addEventListener('resize',sync,{passive:true});
   }
   menus.push(details);
 }
 if(!menus.length)return;
 document.addEventListener('pointerdown',event=>{
   for(const item of menus){
     if(item.open&&!item.contains(event.target))item.open=false;
   }
 },{passive:true});
 document.addEventListener('keydown',event=>{
   if(event.key==='Escape')for(const item of menus)item.open=false;
 });
});
