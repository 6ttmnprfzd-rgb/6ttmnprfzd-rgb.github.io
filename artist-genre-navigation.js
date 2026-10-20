/* Compact navigation between all 18 artist genres.
   Desktop: just under the photo. Mobile: immediately under the title. */
(()=>{
  'use strict';
  const genres=[
    ['stilts','hodulisty','Ходулисты'],
    ['juggling','zhonglery','Жонглёры'],
    ['mime','mimy','Мимы'],
    ['unicycle','unitsiklisty','Унициклисты'],
    ['magic','mikromag','Микромаг'],
    ['acrobat','akrobaty','Акробаты'],
    ['cyrwheel','koleso-sira','Колесо Сира'],
    ['knife','balans-na-nozhe','Баланс на ноже'],
    ['canes','ekvilibr-na-trostyah','Эквилибр на тростях'],
    ['hoops','hulahupy','Хулахупы'],
    ['zorb','gimnastka-v-zorb-share','Гимнастка в Зорб-шаре'],
    ['aerialring','gimnastka-v-parternom-koltse','Гимнастка в партерном кольце'],
    ['diabolo','diabolo','Диаболо'],
    ['rollers','ekvilibr-na-katushkah','Эквилибр на катушках'],
    ['chairs','ekvilibr-na-stulyah','Эквилибр на стульях'],
    ['contact','kontaktnoe-zhonglirovanie','Контактное жонглирование'],
    ['ladder','volnostoyashchaya-lestnitsa','Вольностоящая лестница'],
    ['hatter','shlyapnik','Шляпник']
  ];
  if(document.getElementById('artist-genre-nav-style'))return;
  const css=document.createElement('style');
  css.id='artist-genre-nav-style';
  css.textContent=[
    '.artist-genre-nav,.artist-genre-nav *{box-sizing:border-box}',
    '.artist-genre-nav{width:100%;color:#e9e9ec;font-family:Arial,Helvetica,sans-serif;border-top:1px solid #52525b;padding:9px 0 0}',
    '.artist-genre-nav-line{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:10px}',
    '.artist-genre-nav-item{display:flex;align-items:center;gap:6px;min-width:0;min-height:30px;padding:2px 0;border:0!important;background:transparent!important;color:#e4e4e9!important;text-align:left;text-decoration:none!important;border-radius:0!important;box-shadow:none!important;transform:none!important;transition:color .16s ease!important;cursor:pointer!important;font:600 12px/1.3 Arial,Helvetica,sans-serif!important}',
    '.artist-genre-nav-item:hover{color:#fff!important}',
    '.artist-genre-nav-item:focus-visible{outline:2px solid #fb4768;outline-offset:3px}',
    '.artist-genre-nav-next{justify-content:flex-end;text-align:right!important;color:#fff!important}',
    '.artist-genre-nav-name{min-width:0;overflow-wrap:anywhere;font:inherit!important;color:inherit!important}',
    '.artist-genre-nav-next .artist-genre-nav-name{color:#fff!important}',
    '.artist-genre-nav-arrow{flex:none;font-size:17px;line-height:1;color:#ff5375}',
    '.artist-genre-nav-count{color:#aaaab2;font:700 10px/1.2 Arial,Helvetica,sans-serif;letter-spacing:.06em;white-space:nowrap}',
    '.artist-genre-desktop-slot{display:block;width:100%;min-width:0;grid-column:2!important;grid-row:3!important;align-self:stretch!important;padding-top:21px!important}',
    '.artist-dialog.stilts-showcase.artist-no-video .artist-genre-desktop-slot{grid-column:1/-1!important;grid-row:3!important}',
    '.artist-dialog.stilts-showcase.artist-genre-no-photo:not(.artist-no-video) .artist-genre-desktop-slot{grid-column:2!important;grid-row:2!important;align-self:center!important;padding:0!important}',
    '.artist-genre-mobile-slot{display:none}',
    '@media(max-width:650px){',
    '  .artist-genre-desktop-slot{display:none!important}',
    '  .artist-dialog.stilts-showcase .artist-dialog-head{display:flex!important;flex-wrap:wrap!important;align-items:center!important}',
    '  .artist-dialog.stilts-showcase .artist-dialog-head h1,.artist-dialog.stilts-showcase .artist-dialog-head h2{min-width:0;flex:1 1 0!important}',
    '  .artist-dialog.stilts-showcase .artist-dialog-head .artist-close{flex:none!important}',
    '  .artist-genre-mobile-slot{display:block!important;flex:0 0 100%!important;order:5;width:100%;margin:11px 0 1px}',
    '  .artist-genre-nav{padding:10px 0 0}',
    '  .artist-genre-nav-line{gap:7px}',
    '  .artist-genre-nav-item{font-size:11px!important;line-height:1.22!important;min-height:36px}',
    '  .artist-genre-nav-arrow{font-size:16px}',
    '  .artist-genre-nav-count{font-size:9px}',
    '}',
    '@media(prefers-reduced-motion:reduce){.artist-genre-nav-item{transition:none!important}}'
  ].join('\n');
  document.head.appendChild(css);

  function el(tag,cls,label){
    const result=document.createElement(tag);
    if(cls)result.className=cls;
    if(label!==undefined)result.textContent=label;
    return result;
  }
  function createPanel(kind,onShift){
    const nav=el('nav','artist-genre-nav');
    nav.setAttribute('aria-label','Переход между цирковыми жанрами');
    const line=el('div','artist-genre-nav-line');
    const build=(direction)=>{
      const forward=direction===1;
      const item=el(kind==='homepage'?'button':'a','artist-genre-nav-item'+(forward?' artist-genre-nav-next':''));
      if(item.tagName==='BUTTON')item.type='button';
      const name=el('span','artist-genre-nav-name');
      const arrow=el('span','artist-genre-nav-arrow',forward?'→':'←');
      arrow.setAttribute('aria-hidden','true');
      if(forward)item.append(name,arrow);
      else item.append(arrow,name);
      if(kind==='homepage')item.addEventListener('click',()=>onShift(direction));
      return {item,name};
    };
    const previous=build(-1),next=build(1);
    const count=el('span','artist-genre-nav-count');
    line.append(previous.item,count,next.item);
    nav.appendChild(line);
    return {
      nav,
      render(i){
        if(i<0)return;
        const prev=genres[(i-1+genres.length)%genres.length];
        const following=genres[(i+1)%genres.length];
        previous.name.textContent=prev[2];
        next.name.textContent=following[2];
        count.textContent=String(i+1).padStart(2,'0')+' / '+genres.length;
        previous.item.setAttribute('aria-label','Предыдущий жанр: '+prev[2]);
        next.item.setAttribute('aria-label','Следующий жанр: '+following[2]);
        if(kind!=='homepage'){
          previous.item.href='/'+prev[1]+'/';
          next.item.href='/'+following[1]+'/';
        }
      }
    };
  }
  function mount(article,kind,onShift){
    const heading=article.querySelector('.artist-dialog-head');
    const counter=article.querySelector('.artist-photo-count');
    if(!heading||!counter)return null;
    const inner=article.querySelector('.artist-dialog-inner');
    if(!inner)return null;
    const desktop=createPanel(kind,onShift);
    const mobile=createPanel(kind,onShift);
    const desktopSlot=el('div','artist-genre-desktop-slot');
    const mobileSlot=el('div','artist-genre-mobile-slot');
    desktopSlot.appendChild(desktop.nav);
    mobileSlot.appendChild(mobile.nav);
    counter.after(desktopSlot);
    heading.appendChild(mobileSlot);
    const wrap=article.querySelector('.artist-photo-wrap');
    const sync=()=>article.classList.toggle('artist-genre-no-photo',!wrap||wrap.hidden);
    sync();
    if(wrap)new MutationObserver(sync).observe(wrap,{attributes:true,attributeFilter:['hidden']});
    return i=>{desktop.render(i);mobile.render(i)};
  }
  function initHomepage(dialog){
    const track=document.querySelector('#genres .genres-featured');
    if(!track)return;
    let activeKey=null;
    const shift=direction=>{
      if(!dialog.open||!activeKey)return;
      const i=genres.findIndex(g=>g[0]===activeKey);
      if(i<0)return;
      const key=genres[(i+direction+genres.length)%genres.length][0];
      const target=track.querySelector('.genre[data-artist="'+key+'"]');
      if(!target)return;
      dialog.addEventListener('close',()=>{
        requestAnimationFrame(()=>{
          target.click();
          if(dialog.open)dialog.scrollTop=0;
        });
      },{once:true});
      dialog.close();
    };
    const render=mount(dialog,'homepage',shift);
    if(!render)return;
    function select(event){
      if(event.type==='keydown'&&event.key!=='Enter'&&event.key!==' ')return;
      const card=event.target.closest?.('#genres .genres-featured .genre[data-artist]');
      if(!card)return;
      const index=genres.findIndex(g=>g[0]===card.dataset.artist);
      if(index<0)return;
      activeKey=card.dataset.artist;
      render(index);
    }
    document.addEventListener('click',select,true);
    document.addEventListener('keydown',select,true);
  }
  function initDetailPage(){
    const article=document.querySelector('article.artist-dialog');
    const slug=document.body.dataset.artistSlug||'';
    const index=genres.findIndex(g=>g[1]===slug);
    if(!article||index<0)return;
    const render=mount(article,'detail');
    if(render)render(index);
  }
  const setup=()=>{
    const dialog=document.getElementById('artist-dialog');
    if(dialog)initHomepage(dialog);
    else initDetailPage();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);
  else setup();
})();
