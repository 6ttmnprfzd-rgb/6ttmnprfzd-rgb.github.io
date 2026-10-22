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
    price:null,
    contacts:null,
    gallery:null
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
  // Original homepage price layout and graphite styling, with CMS-driven rows.
  const priceTemplate="<style>\n\n.price-link{border:0;cursor:pointer;font-family:inherit}.price-overlay[hidden]{display:none!important}.price-overlay{position:fixed;inset:0;z-index:1200;background:#111b;display:flex;align-items:center;justify-content:center;padding:18px;backdrop-filter:blur(6px)}.price-panel{width:min(100%,690px);max-height:90dvh;overflow:auto;background:#faf9f6;border-radius:18px;padding:clamp(22px,4vw,42px);position:relative;box-shadow:0 24px 80px #0005}.price-panel h2{font-size:clamp(29px,5vw,47px);letter-spacing:-.05em;line-height:1;margin:15px 40px 25px 0}.price-close{position:absolute;right:20px;top:20px;border:0;background:#f6e4e2;border-radius:50%;width:42px;height:42px;font-size:26px;cursor:pointer}.price-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;padding:5px;border-radius:12px;background:#eee9e6;margin-bottom:23px}.price-tab{border:0;background:transparent;padding:14px 5px;border-radius:9px;font-weight:900;cursor:pointer}.price-tab[aria-selected=true]{background:#111;color:#fff}.price-content[hidden]{display:none}.price-item{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:11px 0;border-bottom:1px solid #e4ded9;font-size:14px}.price-item strong{text-align:right;white-space:nowrap}.price-subtitle{font-size:12px;font-weight:900;letter-spacing:.07em;text-transform:uppercase;background:#f9e8e6;padding:12px;margin-top:18px}.price-plan{background:#f6eeee;padding:20px;border-radius:10px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;gap:10px}.price-plan strong{font-size:24px}.price-footnote{color:#666;font-size:12px;line-height:1.6;margin:22px 0}.price-cta{width:100%;padding:17px;border:0;border-radius:40px;background:#ed082c;color:white;font-weight:900;cursor:pointer}.price-content>p{line-height:1.6;color:#555}@media(max-width:500px){.price-overlay{padding:0;align-items:flex-end}.price-panel{border-radius:20px 20px 0 0;max-height:94dvh;padding:25px 20px 32px}.price-item{font-size:13px}.price-plan strong{font-size:20px}}\n\n.price-overlay{background:rgba(8,9,13,.72)!important;backdrop-filter:blur(13px)!important;-webkit-backdrop-filter:blur(13px)!important}\n.price-overlay .price-panel{color:#f5f4f3!important;background:linear-gradient(145deg,rgba(49,50,56,.96),rgba(22,23,28,.98) 60%,rgba(17,18,23,.99))!important;border:1px solid rgba(255,255,255,.16)!important;box-shadow:0 32px 100px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.12)!important;border-radius:22px!important;scrollbar-color:#666 #25262b}\n.price-overlay .price-panel .eyebrow{color:#ff5168!important;letter-spacing:.1em}\n.price-overlay .price-panel .eyebrow:after{background:rgba(255,255,255,.3)}\n.price-overlay .price-panel h2{color:#fff!important;font-size:clamp(29px,4.8vw,48px);letter-spacing:-.055em}\n.price-overlay .price-close{background:rgba(255,255,255,.1)!important;color:#fff!important;border:1px solid rgba(255,255,255,.18)!important}\n.price-overlay .price-close:hover{background:rgba(255,255,255,.2)!important}\n.price-overlay .price-tabs{background:rgba(255,255,255,.07)!important;border:1px solid rgba(255,255,255,.09)!important;border-radius:12px}\n.price-overlay .price-tab{color:#bfc0c5!important;transition:background .2s,color .2s}\n.price-overlay .price-tab[aria-selected=true]{background:#ed082c!important;color:#fff!important;box-shadow:0 4px 16px #ed082c44}\n.price-overlay .price-content>p{color:#c6c6ca!important}\n.price-overlay .price-item{border-bottom:1px solid rgba(255,255,255,.13)!important;color:#e7e6e8!important;padding:13px 0}\n.price-overlay .price-item strong{color:#fff!important;font-size:15px;font-weight:800;letter-spacing:-.015em}\n.price-overlay .price-subtitle{background:rgba(237,8,44,.12)!important;border-left:2px solid #ff3c5b!important;color:#ff7388!important;margin-top:24px;padding:14px 16px!important}\n.price-overlay .price-plan{background:rgba(255,255,255,.065)!important;border:1px solid rgba(255,255,255,.1)!important;color:#fff!important;border-radius:12px!important}\n.price-overlay .price-plan strong{color:#fff!important}\n.price-overlay .price-footnote{color:#a9aab1!important;border-top:1px solid rgba(255,255,255,.13);padding-top:20px}\n.price-overlay .price-cta{background:#ed082c!important;color:#fff!important;letter-spacing:.025em}\n.price-overlay .price-cta:hover{background:#c90025!important}\n</style>\n<div class=\"price-overlay\" hidden=\"\" id=\"price-overlay\" role=\"presentation\"><div aria-labelledby=\"price-title\" aria-modal=\"true\" class=\"price-panel\" role=\"dialog\" tabindex=\"-1\"><button aria-label=\"Закрыть прайс\" class=\"price-close\" type=\"button\">×</button><div class=\"eyebrow\">НОГИ в РУКИ / ПРАЙС</div><h2 id=\"price-title\">СТОИМОСТЬ АРТИСТОВ</h2><div aria-label=\"Формат выступления\" class=\"price-tabs\" role=\"tablist\"><button aria-selected=\"true\" class=\"price-tab\" data-price-tab=\"raus\" role=\"tab\">РАУС</button><button aria-selected=\"false\" class=\"price-tab\" data-price-tab=\"show\" role=\"tab\">ШОУ</button><button aria-selected=\"false\" class=\"price-tab\" data-price-tab=\"acts\" role=\"tab\">НОМЕРА</button></div><div class=\"price-content\" data-price-content=\"raus\"><p>Почасовая работа артистов среди гостей.</p><div class=\"price-item\"><span>Ходулист</span><strong>9 000 ₽/час</strong></div><div class=\"price-item\"><span>Жонглёр</span><strong>10 000 ₽/час</strong></div><div class=\"price-item\"><span>Унициклист</span><strong>11 000 ₽/час</strong></div><div class=\"price-item\"><span>Акробат</span><strong>10 000 ₽/час</strong></div><div class=\"price-item\"><span>Мим</span><strong>8 000 ₽/час</strong></div><div class=\"price-item\"><span>Лёгкая микромагия</span><strong>9 000 ₽/час</strong></div><div class=\"price-item\"><span>Хулахупы</span><strong>9 000 ₽/час</strong></div><div class=\"price-item\"><span>Диаболо</span><strong>10 000 ₽/час</strong></div><div class=\"price-subtitle\">Оригинальные жанры</div><div class=\"price-item\"><span>Колесо Сира</span><strong>20 000 ₽/час</strong></div><div class=\"price-item\"><span>Баланс на ноже</span><strong>22 000 ₽/час</strong></div><div class=\"price-item\"><span>Эквилибр в Зорб-шаре</span><strong>40 000 ₽/час</strong></div><div class=\"price-item\"><span>Эквилибр на катушках</span><strong>20 000 ₽/час</strong></div><div class=\"price-item\"><span>Контактное жонглирование</span><strong>20 000 ₽/час</strong></div><div class=\"price-item\"><span>Эквилибр на стульях</span><strong>22 000 ₽/час</strong></div><div class=\"price-item\"><span>Вольно стоящая лестница с жонглированием</span><strong>23 000 ₽/час</strong></div></div><div class=\"price-content\" data-price-content=\"show\" hidden=\"\"><p>Готовые цирковые программы продолжительностью ~ 40–45 минут.</p><div class=\"price-plan\"><span>5 артистов</span><strong>от 110 000 ₽</strong></div><div class=\"price-plan\"><span>7 артистов</span><strong>от 140 000 ₽</strong></div><p>Состав программы формируется индивидуально с учётом формата мероприятия, площадки и доступности артистов.</p></div><div class=\"price-content\" data-price-content=\"acts\" hidden=\"\"><div class=\"price-plan\"><span>Отдельный номер · 3–5 минут</span><strong>Индивидуально</strong></div><p>Стоимость зависит от жанра, количества артистов и технических условий.</p></div><p class=\"price-footnote\">Цены указаны для Москвы, дневного времени и непраздничного периода. Ночная работа, выезды и праздничные даты рассчитываются отдельно. Итоговая стоимость подтверждается при согласовании заявки.</p><button class=\"price-cta\" id=\"price-request\" type=\"button\">ОБСУДИТЬ МЕРОПРИЯТИЕ →</button></div></div>";
  document.body.insertAdjacentHTML('beforeend',priceTemplate);
  const priceOverlay=document.getElementById('price-overlay');
  const pricePanel=priceOverlay.querySelector('.price-panel');
  const priceTabs=[...priceOverlay.querySelectorAll('[data-price-tab]')];
  let pricePrevious=null,priceOldOverflow='';
  function selectPriceTab(name){
    priceTabs.forEach(t=>t.setAttribute('aria-selected',String(t.dataset.priceTab===name)));
    priceOverlay.querySelectorAll('[data-price-content]').forEach(el=>{el.hidden=el.dataset.priceContent!==name});
  }
  const closePrice=()=>{
    priceOverlay.hidden=true;
    document.documentElement.style.overflow=priceOldOverflow;
    if(pricePrevious&&pricePrevious.isConnected)pricePrevious.focus();
  };
  priceTabs.forEach(t=>t.addEventListener('click',()=>selectPriceTab(t.dataset.priceTab)));
  priceOverlay.querySelector('.price-close').addEventListener('click',closePrice);
  priceOverlay.addEventListener('click',e=>{if(e.target===priceOverlay)closePrice()});
  document.addEventListener('keydown',e=>{
    if(priceOverlay.hidden)return;
    if(e.key==='Escape')closePrice();
    if(e.key==='Tab'){
      const focusable=[...pricePanel.querySelectorAll('button:not([disabled])')];
      const first=focusable[0],last=focusable[focusable.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    }
  });
  priceOverlay.querySelector('#price-request').addEventListener('click',()=>{
    const chosen=priceTabs.find(t=>t.getAttribute('aria-selected')==='true')?.dataset.priceTab;
    closePrice();
    const sel=document.querySelector('#request-form select[name="format"]');
    if(sel){sel.value={raus:'Раус / встреча гостей',show:'Шоу',acts:'Отдельный номер'}[chosen]||sel.value}
    document.querySelector('[data-request-open],a[href="/#open-request"]')?.click();
  });
  let priceReady=false;
  async function drawPrice(){
    if(priceReady)return;
    try{
      const data=await request('price-data');
      for(const key of ['raus','show','acts']){
        const section=data[key];
        const pane=priceOverlay.querySelector('[data-price-content="'+key+'"]');
        if(!pane||!Array.isArray(section?.blocks))continue;
        pane.replaceChildren();
        for(const block of section.blocks){
          if(block.type==='heading')pane.appendChild(element('div','price-subtitle',block.text||''));
          else if(block.type==='text')pane.appendChild(element('p','',block.text||''));
          else if(block.type==='item'||block.type==='plan'){
            const row=element('div',block.type==='plan'?'price-plan':'price-item');
            row.append(element('span','',block.name||''),element('strong','',block.price||''));
            pane.appendChild(row);
          }
        }
        const tab=priceTabs.find(t=>t.dataset.priceTab===key);
        if(tab&&section.tab_label)tab.textContent=section.tab_label;
      }
      if(data.eyebrow)priceOverlay.querySelector('.eyebrow').textContent=data.eyebrow;
      if(data.title)priceOverlay.querySelector('h2').textContent=data.title;
      if(data.footnote)priceOverlay.querySelector('.price-footnote').textContent=data.footnote;
      if(data.cta_label)priceOverlay.querySelector('#price-request').textContent=data.cta_label;
      priceReady=true;
    }catch(error){console.warn('Could not refresh price from CMS',error)}
  }
  function openPrice(){
    pricePrevious=document.activeElement;
    priceOldOverflow=document.documentElement.style.overflow;
    selectPriceTab(location.pathname.startsWith('/show/')?'show':location.pathname.startsWith('/nomera/')?'acts':'raus');
    priceOverlay.hidden=false;
    document.documentElement.style.overflow='hidden';
    pricePanel.focus();
    drawPrice();
  }
  // The Contacts panel reuses the exact CSS and markup from the homepage.
  const contactTemplate = "<style>\n/* Contacts modal — contemporary dark editorial design */\n.wc-contact-overlay[hidden]{display:none!important}\n.wc-contact-overlay{position:fixed;inset:0;z-index:1800;background:rgba(9,9,12,.72);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:18px;cursor:default!important}\n.wc-contact-panel{position:relative;width:min(100%,630px);max-height:calc(100dvh - 36px);overflow-y:auto;overscroll-behavior:contain;background:#131316;color:#fff;border:1px solid #333338;border-radius:22px;padding:42px 38px 36px;box-shadow:0 30px 110px #0008;cursor:default!important}\n.wc-contact-top{font-size:11px;font-weight:900;letter-spacing:.15em;color:#ff3551;margin-bottom:22px;padding-right:52px}\n.wc-contact-title{font-size:clamp(42px,7vw,74px);font-weight:950;line-height:.95;letter-spacing:-.065em;margin:0 0 18px;color:#fff}\n.wc-contact-intro{font-size:15px;line-height:1.5;color:#aaaab0;margin:0 0 26px}\n.wc-contact-primary{border-top:1px solid #38383d;border-bottom:1px solid #38383d}\n.wc-contact-primary a{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:19px 0;color:#fff!important;text-decoration:none!important;font-size:clamp(18px,4vw,26px);font-weight:850;letter-spacing:-.035em;cursor:pointer!important}\n.wc-contact-primary a+a{border-top:1px solid #38383d}\n.wc-contact-primary small{display:block;color:#99999f;font-size:10px;font-weight:800;letter-spacing:.12em;margin-bottom:5px}\n.wc-arrow{width:21px;height:21px;flex:none;transition:transform .2s}\n.wc-contact-primary a:hover .wc-arrow,.wc-contact-social a:hover .wc-arrow{transform:translate(2px,-2px);color:#ff3551}\n.wc-contact-social-title{font-size:11px;font-weight:850;letter-spacing:.16em;color:#aaaab0;margin:26px 0 12px}\n.wc-contact-social{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}\n.wc-contact-social a{display:flex;flex-direction:column;justify-content:space-between;gap:20px;min-height:102px;background:#252529;border:1px solid #333338;border-radius:12px;padding:15px;color:#fff!important;text-decoration:none!important;font-size:15px;font-weight:800;transition:background .2s,border-color .2s,transform .2s;cursor:pointer!important}\n.wc-contact-social a:hover{background:#303036;border-color:#ff3551;transform:translateY(-2px)}\n.wc-contact-social .wc-social-top{display:flex;align-items:center;justify-content:space-between}\n.wc-brand-icon{width:23px;height:23px;flex:none}\n.wc-contact-social .wc-arrow{width:17px;height:17px;color:#a9a9af}\n.wc-contact-close{position:absolute;top:21px;right:21px;width:42px;height:42px;display:grid;place-items:center;border:1px solid #48484d;border-radius:50%;background:#242428;color:#fff;font-size:26px;line-height:1;cursor:pointer!important}\n.wc-contact-close:hover{background:#38383d}\n.wc-contact-overlay a:hover,.wc-contact-overlay button:hover{cursor:pointer!important}\n@media(max-width:560px){.wc-contact-overlay{padding:0;align-items:flex-end}.wc-contact-panel{border-radius:22px 22px 0 0;padding:32px 22px 29px;max-height:94dvh;width:100%}.wc-contact-title{font-size:clamp(42px,11vw,58px)}.wc-contact-primary a{font-size:clamp(18px,5.2vw,23px)}.wc-contact-close{top:18px;right:18px}.wc-contact-social a{min-height:91px;padding:13px;font-size:14px}}\n</style>\n<div class=\"wc-contact-overlay\" id=\"wc-contact-overlay\" hidden>\n  <div class=\"wc-contact-panel\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"wc-contact-title\" tabindex=\"-1\">\n    <button type=\"button\" class=\"wc-contact-close\" aria-label=\"Закрыть контакты\">×</button>\n    <div class=\"wc-contact-top\">НОГИ В РУКИ / КОНТАКТЫ</div>\n    <h2 class=\"wc-contact-title\" id=\"wc-contact-title\">НА СВЯЗИ<span style=\"color:#ff3551\">.</span></h2>\n    <p class=\"wc-contact-intro\">Для мероприятий, сотрудничества и новых идей.</p>\n    <div class=\"wc-contact-primary\">\n      <a href=\"tel:+79019060656\"><span><small>ПОЗВОНИТЬ</small>8 (901) 906-06-56</span><svg class=\"wc-arrow\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5 19 19 5M8 5h11v11\"/></svg></a>\n      <a href=\"mailto:info@welcirc.ru\"><span><small>НАПИСАТЬ НА ПОЧТУ</small>info@welcirc.ru</span><svg class=\"wc-arrow\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5 19 19 5M8 5h11v11\"/></svg></a>\n    </div>\n    <div class=\"wc-contact-social-title\">МЫ В СОЦСЕТЯХ</div>\n    <div class=\"wc-contact-social\">\n      <a href=\"https://t.me/welcirc\" target=\"_blank\" rel=\"noopener noreferrer\"><span class=\"wc-social-top\"><svg class=\"wc-brand-icon\" viewBox=\"0 0 24 24\" fill=\"currentColor\" stroke=\"none\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m21.5 3.8-3.2 15.7c-.2 1.1-.8 1.4-1.7.9l-4.8-3.6-2.3 2.2c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.3L6.1 13 1.3 11.5c-1-.3-1-1 .2-1.5L20 2.9c.9-.3 1.7.2 1.5.9Z\"/></svg><svg class=\"wc-arrow\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5 19 19 5M8 5h11v11\"/></svg></span><span>Telegram</span></a>\n      <a href=\"https://www.instagram.com/welcirc/\" target=\"_blank\" rel=\"noopener noreferrer\"><span class=\"wc-social-top\"><svg class=\"wc-brand-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"5\"/><circle cx=\"12\" cy=\"12\" r=\"4\"/><circle cx=\"17.5\" cy=\"6.5\" r=\"1\"/></svg><svg class=\"wc-arrow\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5 19 19 5M8 5h11v11\"/></svg></span><span>Instagram</span></a>\n      <a href=\"https://vk.ru/welcirc\" target=\"_blank\" rel=\"noopener noreferrer\"><span class=\"wc-social-top\"><svg class=\"wc-brand-icon\" viewBox=\"0 0 24 24\" fill=\"currentColor\" stroke=\"none\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 7c.3 5 3.5 9.5 7.3 10h1.5v-4c1.6.2 2.7 1.7 3.5 4H19c-.7-2.7-2.2-4.3-3.5-5 1.4-.8 2.8-2.6 3.7-5h-3.4c-.8 1.9-2 3.5-4 4V7H8.6v6.5C7.1 12.4 6.3 10.1 6 7H3Z\"/></svg><svg class=\"wc-arrow\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5 19 19 5M8 5h11v11\"/></svg></span><span>ВКонтакте</span></a>\n      <a href=\"https://www.youtube.com/@welcirc\" target=\"_blank\" rel=\"noopener noreferrer\"><span class=\"wc-social-top\"><svg class=\"wc-brand-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"2\" y=\"5\" width=\"20\" height=\"14\" rx=\"4\"/><path d=\"m10 9 5 3-5 3z\"/></svg><svg class=\"wc-arrow\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5 19 19 5M8 5h11v11\"/></svg></span><span>YouTube</span></a>\n    </div>\n  </div>\n</div>";
  document.body.insertAdjacentHTML('beforeend',contactTemplate);
  const contactOverlay=document.getElementById('wc-contact-overlay');
  const contactPanel=contactOverlay.querySelector('.wc-contact-panel');
  const contactClose=contactOverlay.querySelector('.wc-contact-close');
  let contactPrevious=null;
  let contactOldOverflow='';
  const openContacts=()=>{
    if(!contactOverlay.hidden)return;
    contactPrevious=document.activeElement;
    contactOldOverflow=document.documentElement.style.overflow;
    contactOverlay.hidden=false;
    document.documentElement.style.overflow='hidden';
    contactClose.focus();
  };
  const closeContacts=()=>{
    if(contactOverlay.hidden)return;
    contactOverlay.hidden=true;
    document.documentElement.style.overflow=contactOldOverflow;
    if(contactPrevious&&contactPrevious.isConnected)contactPrevious.focus();
  };
  contactClose.addEventListener('click',closeContacts);
  contactOverlay.addEventListener('click',e=>{if(e.target===contactOverlay)closeContacts()});
  document.addEventListener('keydown',e=>{
    if(contactOverlay.hidden)return;
    if(e.key==='Escape')closeContacts();
    if(e.key==='Tab'){
      const items=[...contactPanel.querySelectorAll('button,a[href]')];
      const first=items[0],last=items[items.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    }
  });
  // Exact homepage gallery heading, grid, graphite skin; CMS data on standalone pages.
  const galleryTemplate="<style>\n.media-overlay[hidden],.lightbox[hidden],.media-content[hidden]{display:none!important}.media-overlay{position:fixed;inset:0;background:#111b;z-index:1300;padding:clamp(10px,3vw,28px);display:flex;justify-content:center;align-items:center;backdrop-filter:blur(7px)}.media-panel{width:min(1150px,100%);max-height:94dvh;overflow:auto;overscroll-behavior:contain;background:#faf9f6;border-radius:20px;padding:clamp(20px,3vw,38px);outline:0}.media-head{display:flex;align-items:start;justify-content:space-between;gap:15px}.media-kicker{color:#ed082c;font-weight:800;font-size:11px;letter-spacing:.1em}.media-head h2{font-size:clamp(25px,4vw,46px);line-height:1.05;letter-spacing:-.045em;margin:12px 0 23px}.media-close,.lightbox-close{border:0;background:#f5e6e6;border-radius:50%;font-size:28px;width:43px;height:43px;cursor:pointer;flex-shrink:0}.media-tabs{display:flex;gap:8px;margin-bottom:24px}.media-tab{padding:13px 22px;border:1px solid #e6dedb;border-radius:40px;background:transparent;font-size:12px;font-weight:900;cursor:pointer}.media-tab[aria-selected=true]{background:#111;color:#fff;border-color:#111}.media-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px}.media-tile{padding:0;border:0;background:#eee;border-radius:12px;overflow:hidden;cursor:zoom-in;aspect-ratio:4/3}.media-tile img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .35s}.media-tile:hover img{transform:scale(1.04)}.media-empty{text-align:center;padding:65px 20px;background:#f2eeeb;border-radius:14px}.media-play{font-size:65px;color:#ed082c}.media-empty h3{font-size:clamp(20px,3vw,29px);margin:10px 0}.media-empty p{color:#777;max-width:440px;margin:0 auto;line-height:1.5}.lightbox{position:fixed;inset:0;background:#08080af2;z-index:1400;display:flex;align-items:center;justify-content:center;padding:70px 55px}.lightbox img{max-width:100%;max-height:100%;object-fit:contain;border-radius:4px}.lightbox-close{position:absolute;right:20px;top:20px}.lightbox-prev,.lightbox-next{position:absolute;top:50%;transform:translateY(-50%);border:0;background:#ffffffd9;color:#111;border-radius:50%;width:42px;height:42px;font-size:25px;cursor:pointer}.lightbox-prev{left:10px}.lightbox-next{right:10px}.lightbox-count{position:absolute;bottom:20px;color:white;font-size:13px}.modal-open{overflow:hidden}\n@media(max-width:650px){#price{padding:30px 0 45px!important}.price-feature{grid-template-columns:1fr;padding:24px 22px;gap:13px}.pf-meta,.pf-title,.pf-sub,.pf-action{grid-column:1;grid-row:auto}.pf-title{font-size:43px}.pf-sub{font-size:14px}.pf-action{text-align:center;margin-top:8px;padding:16px}.media-overlay{padding:0;align-items:flex-end}.media-panel{border-radius:19px 19px 0 0;max-height:96dvh;padding:23px 16px 30px}.media-head h2{font-size:27px}.media-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.media-tile{aspect-ratio:3/4}.media-tab{flex:1;padding:13px 8px}.lightbox{padding:65px 10px}.lightbox-prev,.lightbox-next{top:auto;bottom:15px;transform:none}.lightbox-count{bottom:28px}}\n\n.video-library{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,230px),1fr));gap:16px;padding:12px 0}.video-card{overflow:hidden;border-radius:14px;background:#f4f0ed}.video-cover{position:relative;display:block;width:100%;aspect-ratio:9/16;max-height:360px;border:0;padding:0;overflow:hidden;background:#151515;cursor:pointer}.video-cover img{width:100%;height:100%;object-fit:cover;display:block}.video-cover-play{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:grid;place-items:center;width:64px;height:64px;border-radius:50%;background:#ed082c;color:white;font-size:25px;padding-left:4px;box-shadow:0 8px 30px #0006}.video-cover-duration{position:absolute;right:12px;bottom:12px;background:#000b;color:white;border-radius:5px;padding:5px 8px;font-size:12px}.video-card-info{display:flex;flex-direction:column;gap:5px;padding:14px}.video-card-info strong{font-size:14px}.video-card-info span,.video-library-note{font-size:13px;color:#666}.video-player-overlay[hidden]{display:none!important}.video-player-overlay{position:fixed;inset:0;z-index:99999;background:#0b0b0bf0;display:flex;align-items:center;justify-content:center;padding:65px 15px 20px}.video-player-dialog{position:relative;width:min(100%,460px);max-height:calc(100dvh - 85px);display:flex;justify-content:center}.video-player-dialog video{display:block;max-width:100%;max-height:calc(100dvh - 85px);border-radius:12px;background:black}.video-player-close{position:fixed;right:20px;top:20px;z-index:1;width:42px;height:42px;border:0;border-radius:50%;font-size:27px;background:white;color:black;cursor:pointer}@media(max-width:650px){.video-library{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.video-cover{max-height:300px}.video-cover-play{width:52px;height:52px;font-size:20px}.video-card-info{padding:10px}.video-card-info strong{font-size:12px}.video-card-info span{font-size:11px}}\n\n/* Gallery: four columns on desktop, two on mobile.\n   Apply to the entire photo gallery, including CMS-loaded items. */\n#media-overlay [data-media-content=\"photos\"] .media-grid,\n#media-overlay .media-grid[data-media-content=\"photos\"],\n#media-overlay [data-media-content=\"photos\"].media-grid {\n  display: grid !important;\n  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;\n  grid-auto-flow: row !important;\n  gap: 12px !important;\n  align-items: stretch !important;\n}\n#media-overlay [data-media-content=\"photos\"] .media-grid > *,\n#media-overlay .media-grid[data-media-content=\"photos\"] > *,\n#media-overlay [data-media-content=\"photos\"].media-grid > * {\n  grid-column: auto !important;\n  grid-row: auto !important;\n  width: 100% !important;\n  min-width: 0 !important;\n  max-width: none !important;\n  height: auto !important;\n  aspect-ratio: 4 / 3 !important;\n  overflow: hidden !important;\n  margin: 0 !important;\n}\n#media-overlay [data-media-content=\"photos\"] .media-grid > * img,\n#media-overlay .media-grid[data-media-content=\"photos\"] > * img,\n#media-overlay [data-media-content=\"photos\"].media-grid > * img {\n  display: block !important;\n  width: 100% !important;\n  height: 100% !important;\n  object-fit: cover !important;\n}\n@media (max-width: 650px) {\n  #media-overlay [data-media-content=\"photos\"] .media-grid,\n  #media-overlay .media-grid[data-media-content=\"photos\"],\n  #media-overlay [data-media-content=\"photos\"].media-grid {\n    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;\n    gap: 8px !important;\n  }\n  #media-overlay [data-media-content=\"photos\"] .media-grid > *,\n  #media-overlay .media-grid[data-media-content=\"photos\"] > *,\n  #media-overlay [data-media-content=\"photos\"].media-grid > * {\n    aspect-ratio: 3 / 4 !important;\n  }\n}\n\n\n/* Media library graphite glass, step 1: panel and navigation. */\n/* The background site should remain subtly visible, not become a black slab. */\n#media-overlay:not([hidden]) {\n  background:rgba(13,12,15,.43)!important;\n  -webkit-backdrop-filter:blur(3px)!important;\n  backdrop-filter:blur(3px)!important;\n}\n#media-overlay .media-panel {\n  box-sizing:border-box;\n  background:rgba(20,20,25,.82)!important;\n  color:#fff!important;\n  border:1px solid rgba(255,255,255,.2)!important;\n  box-shadow:0 28px 85px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.10)!important;\n  -webkit-backdrop-filter:blur(12px) saturate(115%)!important;\n  backdrop-filter:blur(12px) saturate(115%)!important;\n}\n#media-overlay .media-head h2 {color:#fff!important}\n#media-overlay .media-kicker {color:#ff6078!important}\n#media-overlay .media-close {\n  background:rgba(255,255,255,.09)!important;\n  color:#fff!important;\n  border:1px solid rgba(255,255,255,.25)!important;\n  box-shadow:none!important;\n}\n#media-overlay .media-close:hover {background:rgba(255,255,255,.17)!important}\n#media-overlay .media-tabs .media-tab {\n  color:#e7e7ea!important;\n  background:rgba(255,255,255,.04)!important;\n  border:1px solid rgba(255,255,255,.21)!important;\n}\n#media-overlay .media-tabs .media-tab[aria-selected=\"true\"] {\n  color:#fff!important;\n  background:rgba(255,255,255,.17)!important;\n  border-color:rgba(255,255,255,.57)!important;\n}\n#media-overlay .media-tab:focus-visible,\n#media-overlay .media-close:focus-visible {\n  outline:2px solid #ff6078!important;\n  outline-offset:3px!important;\n}\n\n\n/* Media library graphite glass, step 2: video cards and captions. */\n#media-overlay .video-library .video-card {\n  background:rgba(255,255,255,.075)!important;\n  border:1px solid rgba(255,255,255,.12)!important;\n  border-radius:14px!important;\n  color:#fff!important;\n  box-shadow:none!important;\n}\n#media-overlay .video-library .video-card-info {\n  background:transparent!important;\n  color:#fff!important;\n}\n#media-overlay .video-library .video-card-info strong {\n  color:#f7f7f9!important;\n}\n#media-overlay .video-library .video-card-info span,\n#media-overlay .video-library-note {\n  color:#bcbcc5!important;\n}\n#media-overlay .video-library .video-cover {\n  background:#131319!important;\n}\n#media-overlay .media-grid .media-tile {\n  background:#25252a!important;\n}\n\n\n</style>\n<div class=\"media-overlay\" hidden id=\"media-overlay\"><div class=\"media-panel\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"media-title\" tabindex=\"-1\"><header class=\"media-head\"><div><div class=\"media-kicker\">НОГИ в РУКИ / МЕДИАТЕКА</div><h2 id=\"media-title\">АТМОСФЕРА НАШИХ МЕРОПРИЯТИЙ</h2></div><button class=\"media-close\" type=\"button\" aria-label=\"Закрыть галерею\">×</button></header><div class=\"media-tabs\" role=\"tablist\"><button class=\"media-tab\" data-media-tab=\"photos\" aria-selected=\"true\" type=\"button\">ФОТОГРАФИИ</button><button class=\"media-tab\" data-media-tab=\"videos\" aria-selected=\"false\" type=\"button\">ВИДЕО</button></div><div class=\"media-content\" data-media-content=\"photos\"><div class=\"media-grid\"></div></div><div class=\"media-content\" data-media-content=\"videos\" hidden><div class=\"video-library\"></div></div></div></div>";
  document.body.insertAdjacentHTML('beforeend',galleryTemplate);
  const galleryOverlay=document.getElementById('media-overlay');
  const galleryPanel=galleryOverlay.querySelector('.media-panel');
  const photoGrid=galleryOverlay.querySelector('[data-media-content="photos"] .media-grid');
  const videoGrid=galleryOverlay.querySelector('[data-media-content="videos"] .video-library');
  const galleryTabs=[...galleryOverlay.querySelectorAll('[data-media-tab]')];
  let galleryPrevious=null,galleryOldOverflow='',galleryReady=false;
  const selectGalleryTab=(key)=>{
    galleryTabs.forEach(t=>t.setAttribute('aria-selected',String(t.dataset.mediaTab===key)));
    galleryOverlay.querySelectorAll('[data-media-content]').forEach(el=>{el.hidden=el.dataset.mediaContent!==key});
  };
  const closeGallery=()=>{
    galleryOverlay.hidden=true;
    document.documentElement.style.overflow=galleryOldOverflow;
    if(galleryPrevious&&galleryPrevious.isConnected)galleryPrevious.focus();
  };
  galleryTabs.forEach(t=>t.addEventListener('click',()=>selectGalleryTab(t.dataset.mediaTab)));
  galleryOverlay.querySelector('.media-close').addEventListener('click',closeGallery);
  galleryOverlay.addEventListener('click',e=>{if(e.target===galleryOverlay)closeGallery()});
  document.addEventListener('keydown',e=>{
    if(galleryOverlay.hidden)return;
    if(e.key==='Escape')closeGallery();
    if(e.key==='Tab'){
      const controls=[...galleryPanel.querySelectorAll('button:not([disabled])')].filter(el=>el.getClientRects().length);
      if(controls.length){
        const first=controls[0],last=controls[controls.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
      }
    }
  });
  async function drawGallery(){
    if(galleryReady)return;
    try{
      const [g,v]=await Promise.all([request('gallery-data'),request('videos-data')]);
      const photos=Array.isArray(g.photos)?g.photos.filter(x=>safePath(x?.image,'images')):[];
      const videos=Array.isArray(v.videos)?v.videos.filter(x=>safePath(x?.video,'videos')):[];
      photoGrid.replaceChildren();
      videoGrid.replaceChildren();
      photos.forEach(entry=>{
        const b=element('button','media-tile');
        b.type='button';b.setAttribute('aria-label','Открыть фотографию: '+(entry.alt||'Мероприятие'));
        const img=element('img');img.loading='lazy';img.decoding='async';img.src=safePath(entry.image,'images');
        img.alt=entry.alt||'Цирковые артисты на мероприятии';
        b.appendChild(img);b.addEventListener('click',()=>viewImage(img.src,img.alt));photoGrid.appendChild(b);
      });
      videos.forEach(entry=>{
        const card=element('div','video-card');
        const b=element('button','video-cover');
        b.type='button';b.setAttribute('aria-label','Смотреть видео: '+(entry.title||'Выступление'));
        const cover=element('img');
        cover.loading='lazy';cover.decoding='async';cover.alt=entry.title||'Выступление';
        const src=safePath(entry.cover,'images')||safePath(entry.cover,'videos');
        if(src)cover.src=src;
        b.append(cover,element('span','video-cover-play','▶'));
        b.addEventListener('click',()=>viewVideo(safePath(entry.video,'videos')));
        const desc=element('div','video-card-info');
        desc.appendChild(element('strong','',entry.title||'Выступление'));
        card.append(b,desc);videoGrid.appendChild(card);
      });
      galleryReady=true;
    }catch(error){console.warn('Could not load media library from CMS',error)}
  }
  const openGallery=()=>{
    galleryPrevious=document.activeElement;
    galleryOldOverflow=document.documentElement.style.overflow;
    galleryOverlay.hidden=false;
    document.documentElement.style.overflow='hidden';
    selectGalleryTab('photos');
    galleryPanel.focus();
    drawGallery();
  };
  const open=(key)=>{
    if(!supported.includes(key))return false;
    if(key==='contacts'){openContacts();return true;}
    if(key==='price'){openPrice();return true;}
    if(key==='gallery'){openGallery();return true;}
    const d=popups[key].d;
    if(!d.open){d.showModal();}
    if(key==='price')drawPrice();

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
