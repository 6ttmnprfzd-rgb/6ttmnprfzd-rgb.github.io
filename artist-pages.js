(()=>{
  "use strict";
  const card=document.querySelector(".artist-dialog.stilts-showcase");
  if(!card)return;
  const key=document.body.dataset.artistSlug||"";
  const img=document.getElementById("artist-dialog-photo");
  const wrap=card.querySelector(".artist-photo-wrap");
  const counter=document.getElementById("artist-photo-count");
  const end=document.getElementById("stilts-gallery-end");
  const videoWrap=document.getElementById("artist-video-wrap");
  const video=videoWrap?.querySelector("video");
  const tooltip=document.getElementById("artist-info-dialog");
  const infoTrigger=card.querySelector(".artist-info-trigger");
  let photos=[];
  let position=0, startX=null;
  const sanitize=(path,kind)=>{
    if(typeof path!=="string")return null;
    path=path.trim().replace(/^\/+/,"");
    if(!/^[a-zA-Z0-9_.\/-]+$/.test(path)||path.includes(".."))return null;
    return path.startsWith(kind+"/")?"/"+path:null;
  };
  function renderPhoto(){
    if(!photos.length){
      wrap.hidden=true;
      counter.hidden=true;
      return;
    }
    wrap.hidden=false;
    counter.hidden=false;
    const final=position===photos.length;
    end.hidden=!final;
    img.hidden=final;
    if(!final){
      img.src=photos[position].url;
      img.alt=photos[position].alt;
    }
    counter.textContent=final?"Галерея":(position+1)+" / "+photos.length;
  }
  function changePhotos(list){
    const converted=(Array.isArray(list)?list:[]).map((item,i)=>{
      const url=sanitize(item&&item.image,"images");
      return url?{url,alt:(typeof item.alt==="string"&&item.alt)||card.querySelector("h1")?.textContent+" — фото "+(i+1)}:null;
    }).filter(Boolean);
    photos=converted;
    position=0;
    renderPhoto();
    card.classList.toggle("artist-no-media",!photos.length&&(!video||videoWrap.hidden));
  }
  const initial=document.getElementById("initial-artist-photos");
  try{changePhotos(JSON.parse(initial?.textContent||"[]"))}catch{changePhotos([])}
  function shift(delta){
    if(!photos.length)return;
    position=(position+delta+photos.length+1)%(photos.length+1);
    renderPhoto();
  }
  card.querySelector(".artist-photo-prev")?.addEventListener("click",()=>shift(-1));
  card.querySelector(".artist-photo-next")?.addEventListener("click",()=>shift(1));
  wrap?.addEventListener("touchstart",e=>{startX=e.changedTouches[0].clientX},{passive:true});
  wrap?.addEventListener("touchend",e=>{
    if(startX===null)return;
    const d=e.changedTouches[0].clientX-startX;
    if(Math.abs(d)>45)shift(d<0?1:-1);
    startX=null;
  },{passive:true});
  function tryPlay(){
    if(!video||videoWrap.hidden||document.hidden||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    const promise=video.play();
    if(promise&&typeof promise.catch==="function")promise.catch(()=>{});
  }
  function applyVideo(path){
    if(!video||!videoWrap)return;
    const src=sanitize(path,"videos")||sanitize(path,"images");
    videoWrap.hidden=!src;
    card.classList.toggle("artist-no-video",!src);
    const source=video.querySelector("source");
    if(src){
      if(source.getAttribute("src")!==src){
        source.setAttribute("src",src);
        source.type=/\.mov$/i.test(src)?"video/quicktime":"video/mp4";
        video.load();
      }
      tryPlay();
    }else{video.pause();video.removeAttribute("src");source.removeAttribute("src");video.load();}
    card.classList.toggle("artist-no-media",!photos.length&&!src);
  }
  applyVideo(document.body.dataset.video||"");
  window.addEventListener("pageshow",tryPlay);
  video?.addEventListener("loadeddata",tryPlay);
  document.addEventListener("pointerdown",()=>{if(video?.paused)tryPlay()},{once:true,passive:true});
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)tryPlay()});
  const closeInfo=()=>{if(tooltip?.open)tooltip.close();infoTrigger?.setAttribute("aria-expanded","false")};
  infoTrigger?.addEventListener("click",()=>{
    if(!tooltip)return;
    if(tooltip.open){closeInfo();return}
    tooltip.showModal();
    infoTrigger.setAttribute("aria-expanded","true");
  });
  tooltip?.querySelector(".stilts-info-native-close")?.addEventListener("click",closeInfo);
  tooltip?.addEventListener("click",e=>{if(e.target===tooltip)closeInfo()});
  tooltip?.addEventListener("close",()=>infoTrigger?.setAttribute("aria-expanded","false"));
  fetch("/artist-media.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw new Error("media unavailable");return r.json()}).then(data=>{
    const m=data&&data[key];
    if(!m)return;
    if(Array.isArray(m.photos))changePhotos(m.photos);
    if(typeof m.video==="string")applyVideo(m.video);
  }).catch(()=>{});
})();
/* Artist-page request form: reuse the original homepage popup and submission workflow. */
(()=>{
  const artistCta=document.querySelector('.artist-dialog .artist-cta');
  if(!artistCta||document.getElementById('request-overlay'))return;
  document.body.insertAdjacentHTML('beforeend',"<div aria-labelledby=\"request-title\" aria-modal=\"true\" class=\"request-overlay\" hidden=\"\" id=\"request-overlay\" role=\"dialog\">\n<div class=\"request-panel\" tabindex=\"-1\"><button aria-label=\"Закрыть форму\" class=\"request-close\" type=\"button\">×</button>\n<h2 id=\"request-title\">Расскажите о мероприятии</h2><p>Заполните то, что уже известно. Мы уточним остальные детали при общении.</p>\n<form id=\"request-form\"><div class=\"request-fields\">\n<label class=\"request-field wide\">Как к вам обращаться *<input autocomplete=\"name\" maxlength=\"120\" name=\"name\" placeholder=\"Ваше имя\" required=\"\"/></label>\n<div aria-hidden=\"true\" class=\"request-honeypot\"><label>Сайт<input autocomplete=\"off\" name=\"website\" tabindex=\"-1\"/></label></div>\n<label class=\"request-field\">Дата мероприятия<input name=\"date\" type=\"date\"/></label>\n<label class=\"request-field\">Время<input name=\"time\" placeholder=\"Например, 18:00\"/></label>\n<label class=\"request-field wide\">Место проведения<input name=\"place\" placeholder=\"Город, площадка или адрес\"/></label>\n<label class=\"request-field\">Формат<select name=\"format\"><option value=\"Пока выбираю\">Пока выбираю</option><option>Раус / встреча гостей</option><option>Шоу</option><option>Отдельный номер</option></select></label>\n<label class=\"request-field\">Количество артистов<input name=\"count\" placeholder=\"Например, 3\"/></label>\n<label class=\"request-field\">Продолжительность<input name=\"duration\" placeholder=\"Например, 2 часа\"/></label>\n<label class=\"request-field\">Телефон для связи *<input autocomplete=\"tel\" maxlength=\"80\" name=\"phone\" placeholder=\"+7 ...\" required=\"\" type=\"tel\"/></label>\n<label class=\"request-field wide\">Пожелания<textarea name=\"notes\" placeholder=\"Интересующие артисты и другие детали\"></textarea></label>\n</div><button class=\"request-send\" type=\"submit\">ОТПРАВИТЬ ЗАЯВКУ →</button><p aria-live=\"polite\" class=\"request-note\" id=\"request-status\" role=\"status\">Заявка поступит напрямую нашей команде. Мы свяжемся с вами по указанному телефону.</p><button class=\"request-copy\" type=\"button\">Скопировать текст заявки</button></form>\n</div></div>");
  artistCta.setAttribute('data-request-open','true');
  artistCta.setAttribute('href','#request');
  (()=>{const overlay=document.getElementById('request-overlay'),panel=overlay.querySelector('.request-panel'),form=document.getElementById('request-form');let previous=null;
function open(e){if(e)e.preventDefault();previous=document.activeElement;overlay.hidden=false;document.body.style.overflow='hidden';panel.focus()}
function close(){overlay.hidden=true;document.body.style.overflow='';previous?.focus()}
document.querySelectorAll('[data-request-open]').forEach(a=>a.addEventListener('click',open));
overlay.querySelector('.request-close').addEventListener('click',close);overlay.addEventListener('click',e=>{if(e.target===overlay)close()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden)close()});
function message(){const d=new FormData(form);return ['Заявка с сайта НОГИ в РУКИ','Имя: '+(d.get('name')||'не указано'),'Дата: '+(d.get('date')||'не указана'),'Время: '+(d.get('time')||'не указано'),'Место: '+(d.get('place')||'не указано'),'Формат: '+d.get('format'),'Количество артистов: '+(d.get('count')||'не указано'),'Продолжительность: '+(d.get('duration')||'не указана'),'Телефон: '+(d.get('phone')||'не указан'),'Пожелания: '+(d.get('notes')||'нет')].join('\n')}
const endpoint='https://script.google.com/macros/s/AKfycbxbTJftULMOkgRw8GXkmB3930r_yPJf-wKrNkYsBDwd0Yi5W1IsgJbeWl_Pdl1Jet-t/exec';
const sendButton=form.querySelector('.request-send'),status=form.querySelector('#request-status');
let sending=false;
form.addEventListener('submit',async e=>{
 e.preventDefault();if(sending||!form.reportValidity())return;
 const d=new FormData(form);
 if(d.get('website'))return;
 const payload={name:String(d.get('name')||'').trim(),phone:String(d.get('phone')||'').trim(),date:String(d.get('date')||''),time:String(d.get('time')||''),location:String(d.get('place')||''),format:String(d.get('format')||''),artists:String(d.get('count')||''),duration:String(d.get('duration')||''),comment:String(d.get('notes')||'')};
 if(!payload.name||!payload.phone)return;
 sending=true;sendButton.disabled=true;sendButton.textContent='ОТПРАВЛЯЕМ…';
 status.textContent='Передаём заявку, пожалуйста, подождите…';status.style.color='';
 try{
  // Google Apps Script does not expose a readable cross-origin response to the website.
  // text/plain avoids CORS preflight; no-cors allows a cross-origin POST request.
  await fetch(endpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});
  status.textContent='✓ Заявка передана на обработку! Мы свяжемся с вами после её получения.';
  status.style.color='#187347';form.reset();sendButton.textContent='ЗАЯВКА ПЕРЕДАНА ✓';
 }catch(error){
  status.textContent='Не удалось передать заявку. Пожалуйста, попробуйте ещё раз или позвоните: 8 (901) 906-06-56.';
  status.style.color='#b42332';sendButton.textContent='ПОВТОРИТЬ ОТПРАВКУ →';
 }finally{sending=false;sendButton.disabled=false;}
});
overlay.querySelector('.request-copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(message());overlay.querySelector('.request-copy').textContent='Текст скопирован ✓'}catch(e){alert('Не удалось скопировать текст заявки.')}});
})();
})();

/* Add previous/next genre links on standalone artist pages too. */
(()=>{
  if(document.querySelector('script[data-artist-genre-navigation]'))return;
  const s=document.createElement('script');
  s.src='/artist-genre-navigation.js?v=20261021d';
  s.dataset.artistGenreNavigation='true';
  document.head.appendChild(s);
})();


/* Route standalone artist gallery links to the homepage media library. */
document.addEventListener('DOMContentLoaded',()=>{
  const galleryLink=document.getElementById('stilts-gallery-link');
  if(!galleryLink)return;
  const slug=document.body.dataset.artistSlug;
  galleryLink.href=slug ? '/?from-artist='+encodeURIComponent(slug)+'#media-library' : '/#media-library';
});


/* Generic standalone genre CMS copy and prices (all 18); original HTML is fallback. */
document.addEventListener('DOMContentLoaded',()=>{
  const slug=document.body.dataset.artistSlug;
  if(!slug)return;
  fetch('/artist-content.json',{cache:'no-store'}).then(response=>{
    if(!response.ok)throw Error('Artist text unavailable');
    return response.json();
  }).then(data=>{
    const cms=data?.[slug];
    if(!cms||typeof cms!=='object')return;
    const set=(selector,value)=>{
      if(typeof value!=='string'||!value.trim())return;
      const node=document.querySelector(selector);
      if(node)node.textContent=value.trim();
    };
    set('#artist-dialog-title',cms.title);
    set('#artist-dialog-description',cms.description);
    set('.artist-dialog .artist-price',cms.price);
    const displayed=document.querySelector('.artist-dialog .artist-price')?.textContent?.trim()||'';
    document.body.classList.toggle('artist-cms-long-price',displayed.length>19);
    set('.artist-dialog .artist-price-note',cms.price_note);
    set('#price-explanation',cms.price_note);
    set('#artist-info-dialog .stilts-info-native-inner p',cms.price_note);
  }).catch(error=>console.warn('Artist text unavailable; keeping original copy',error));
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
