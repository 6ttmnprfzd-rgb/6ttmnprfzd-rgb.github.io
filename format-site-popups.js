/* Shared direct-opening graphite panels on format landing pages.
   No homepage redirect. Pricing and gallery stay in sync with Pages CMS. */
(()=>{
  'use strict';
  const supported=['price','contacts','gallery'];
  const cached=new Map();
  const safePath=(path,kind)=>{
    if(typeof path!=='string')return null;
    path=path.trim();
    return new RegExp('^'+kind+'/[A-Za-z0-9_.-]+$').test(path)?'/'+path:null;
  };
  const element=(tag,cls,txt)=>{
    const n=document.createElement(tag);
    if(cls)n.className=cls;
    if(txt!==undefined)n.textContent=txt;
    return n;
  };
  const request=(name)=>cached.has(name)?cached.get(name):(()=>{
    const job=fetch('/'+name+'.json',{cache:'no-store'}).then(response=>{
      if(!response.ok)throw Error('Cannot load '+name);
      return response.json();
    });
    cached.set(name,job);
    return job;
  })();
  const popup=(key,title,eyebrow)=>{
    const d=element('dialog','format-pop');
    d.dataset.popup=key;
    d.setAttribute('aria-label',title);
    const top=element('div','format-pop-top');
    const titleWrap=element('div');
    titleWrap.append(element('p','',eyebrow),element('h2','',title));
    const x=element('button','format-pop-x','×');
    x.type='button';x.setAttribute('aria-label','Закрыть');
    x.addEventListener('click',()=>d.close());
    top.append(titleWrap,x);
    const body=element('div','format-pop-body');
    d.append(top,body);
    d.addEventListener('click',e=>{if(e.target===d)d.close()});
    document.body.appendChild(d);
    return {d,body};
  };
  const popups={
    price:popup('price','СТОИМОСТЬ АРТИСТОВ','НОГИ В РУКИ / ПРАЙС'),
    contacts:popup('contacts','КОНТАКТЫ','НОГИ В РУКИ / КОНТАКТЫ'),
    gallery:popup('gallery','НАША ГАЛЕРЕЯ','НОГИ В РУКИ / ФОТО И ВИДЕО')
  };
  const media=element('dialog','format-pop-media');
  media.setAttribute('aria-label','Просмотр фото и видео');
  const mediaX=element('button','format-pop-x','×');mediaX.type='button';
  mediaX.setAttribute('aria-label','Закрыть');
  const mediaBody=element('div');media.append(mediaX,mediaBody);
  function closeMedia(){media.close()}
  mediaX.addEventListener('click',closeMedia);
  media.addEventListener('close',()=>{
    const player=mediaBody.querySelector('video');
    if(player){player.pause();player.removeAttribute('src');player.load()}
    mediaBody.replaceChildren();
  });
  document.body.appendChild(media);
  const viewImage=(src,alt)=>{
    const img=element('img');img.src=src;img.alt=alt||'Фотография с мероприятия';
    mediaBody.replaceChildren(img);media.showModal();
  };
  const viewVideo=(src)=>{
    const player=element('video');player.controls=true;player.playsInline=true;
    player.preload='metadata';player.src=src;
    mediaBody.replaceChildren(player);media.showModal();
    const playback=player.play();if(playback?.catch)playback.catch(()=>{});
  };
  let priceReady=false;
  async function drawPrice(){
    if(priceReady)return;
    const root=popups.price.body;root.replaceChildren(element('p','format-pop-loading','Загружаем прайс...'));
    try{
      const data=await request('price-data');
      const tabs=element('div','format-pop-tabs');
      tabs.setAttribute('role','tablist');
      const rows=element('div','format-pop-price-rows');
      const foot=element('p','format-pop-price-note',data.footnote||'Итоговая стоимость согласовывается индивидуально.');
      const cta=element('a','format-pop-cta',data.cta_label||'ОБСУДИТЬ МЕРОПРИЯТИЕ');
      cta.href='/#open-request';
      root.replaceChildren(tabs,rows,foot,cta);
      function activate(key){
        const section=data[key];
        if(!section||!Array.isArray(section.blocks))return;
        tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.priceTab===key)));
        rows.replaceChildren();
        for(const b of section.blocks){
          if(b.type==='heading')rows.appendChild(element('h3','format-pop-price-heading',b.text||''));
          else if(b.type==='text')rows.appendChild(element('p','',b.text||''));
          else if(b.type==='item'||b.type==='plan'){
            const row=element('div','format-pop-price-row');
            row.append(element('strong','',b.name||''),element('span','',b.price||''));
            rows.appendChild(row);
          }
        }
      }
      for(const key of ['raus','show','acts']){
        const t=element('button','',data[key]?.tab_label||key.toUpperCase());
        t.type='button';t.dataset.priceTab=key;t.setAttribute('role','tab');
        t.addEventListener('click',()=>activate(key));
        tabs.appendChild(t);
      }
      priceReady=true;
      const page=location.pathname;
      activate(page.startsWith('/show/')?'show':page.startsWith('/nomera/')?'acts':'raus');
    }catch(_){root.replaceChildren(element('p','format-pop-loading','Не удалось загрузить прайс. Попробуйте открыть его на главной странице.'))}
  }
  const contacts=popups.contacts.body;
  const main=element('h3','format-pop-contact-head','НА СВЯЗИ');
  main.appendChild(element('em','','.'));
  const intro=element('p','','Обсудим ваше мероприятие, состав артистов и формат работы.');
  const contactList=element('div','format-pop-contacts');
  const phoneLabel=element('p','format-pop-contact-caption','Телефон');
  const phone=element('a','','8 (901) 906-06-56');phone.href='tel:+79019060656';
  const mailLabel=element('p','format-pop-contact-caption','Почта');
  const email=element('a','','info@welcirc.ru');email.href='mailto:info@welcirc.ru';
  contactList.append(phoneLabel,phone,mailLabel,email);
  const contactCta=element('a','format-pop-cta','ОСТАВИТЬ ЗАЯВКУ ↗');contactCta.href='/#open-request';
  contacts.append(main,intro,contactList,contactCta);
  let galleryReady=false;
  async function drawGallery(){
    if(galleryReady)return;
    const root=popups.gallery.body;root.replaceChildren(element('p','format-pop-loading','Загружаем фото и видео...'));
    try{
      const [g,v]=await Promise.all([request('gallery-data'),request('videos-data')]);
      const photos=Array.isArray(g.photos)?g.photos.filter(x=>safePath(x?.image,'images')):[];
      const videos=Array.isArray(v.videos)?v.videos.filter(x=>safePath(x?.video,'videos')):[];
      const tabs=element('div','format-pop-tabs');tabs.setAttribute('role','tablist');
      const grid=element('div','format-pop-gallery-grid');
      const photoTab=element('button','','ФОТО'),videoTab=element('button','','ВИДЕО');
      photoTab.type='button';videoTab.type='button';
      photoTab.dataset.galleryTab='photo';videoTab.dataset.galleryTab='video';
      for(const b of [photoTab,videoTab]){b.setAttribute('role','tab');tabs.appendChild(b)}
      function activate(type){
        photoTab.setAttribute('aria-selected',String(type==='photo'));
        videoTab.setAttribute('aria-selected',String(type==='video'));
        grid.replaceChildren();
        if(type==='photo'){
          for(const entry of photos){
            const b=element('button','format-pop-gallery-tile');
            b.type='button';b.setAttribute('aria-label','Открыть фото: '+(entry.alt||'Мероприятие'));
            const img=element('img');img.loading='lazy';img.decoding='async';img.src=safePath(entry.image,'images');
            img.alt=entry.alt||'Цирковые артисты на мероприятии';
            b.appendChild(img);b.addEventListener('click',()=>viewImage(img.src,img.alt));grid.appendChild(b);
          }
        }else{
          for(const entry of videos){
            const b=element('button','format-pop-gallery-tile');
            b.type='button';b.setAttribute('aria-label','Смотреть видео: '+(entry.title||'Выступление'));
            const img=element('img');img.loading='lazy';img.decoding='async';img.alt=entry.title||'Выступление';
            const cover=safePath(entry.cover,'images')||safePath(entry.cover,'videos');
            if(cover)img.src=cover;
            b.append(img,element('span','format-pop-play','▶'));
            b.addEventListener('click',()=>viewVideo(safePath(entry.video,'videos')));
            grid.appendChild(b);
          }
        }
      }
      photoTab.addEventListener('click',()=>activate('photo'));
      videoTab.addEventListener('click',()=>activate('video'));
      root.replaceChildren(tabs,grid);
      galleryReady=true;activate('photo');
    }catch(_){root.replaceChildren(element('p','format-pop-loading','Не удалось загрузить галерею. Можно открыть её на главной странице.'))}
  }
  const open=(key)=>{
    if(!supported.includes(key))return false;
    const d=popups[key].d;
    if(!d.open){d.showModal();}
    if(key==='price')drawPrice();
    if(key==='gallery')drawGallery();
    return true;
  };
  document.querySelectorAll('a[href="/#price"],a[href="/#contacts"],a[href="/#gallery"]').forEach(a=>{
    const key=a.getAttribute('href').slice(2);
    a.addEventListener('click',e=>{
      if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
      e.preventDefault();
      const menu=a.closest('.mobile-menu');
      if(menu)menu.open=false;
      open(key);
    });
  });
})();
