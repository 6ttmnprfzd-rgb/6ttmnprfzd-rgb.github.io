/* Genre-to-genre navigation shared by homepage popup and artist detail pages. */
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
    '.artist-genre-nav {box-sizing:border-box;display:block;width:100%;padding:19px clamp(17px,3vw,32px) 23px;background:#16161b;color:#fff;border-top:1px solid #373740;font-family:Arial,Helvetica,sans-serif}',
    '.artist-genre-nav * {box-sizing:border-box}',
    '.artist-genre-nav-top {display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 12px}',
    '.artist-genre-nav-heading {color:#f0f0f2;font-size:11px;line-height:1.3;font-weight:900;letter-spacing:.13em;text-transform:uppercase}',
    '.artist-genre-nav-count {font-size:11px;color:#aaaab0;font-weight:800;letter-spacing:.10em;white-space:nowrap}',
    '.artist-genre-nav-grid {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}',
    '.artist-genre-nav-item {font-family:inherit;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:8px;min-width:0;min-height:88px;padding:13px 15px;border:1px solid #44444d;border-radius:12px;background:#25252b;color:#fff!important;text-align:left;text-decoration:none!important;cursor:pointer!important;box-shadow:none!important;transform:none!important;transition:background .18s,border-color .18s}',
    '.artist-genre-nav-item:hover {background:#33333a;border-color:#92929b}',
    '.artist-genre-nav-item:focus-visible {outline:2px solid #ff3c62;outline-offset:3px}',
    '.artist-genre-nav-next {background:#30252d;border-color:#653846}',
    '.artist-genre-nav-next:hover {background:#452b37;border-color:#e73355}',
    '.artist-genre-nav-kicker {display:block;font-size:10px;font-weight:800;letter-spacing:.11em;text-transform:uppercase;color:#a8a8b0}',
    '.artist-genre-nav-next .artist-genre-nav-kicker {color:#ff6480}',
    '.artist-genre-nav-name {display:block;font-size:clamp(12px,1.7vw,16px);font-weight:850;line-height:1.22;overflow-wrap:anywhere;max-width:100%;text-transform:none;color:#fff}',
    '@media(max-width:650px){.artist-genre-nav {padding:16px 17px 20px}.artist-genre-nav-grid {gap:8px}.artist-genre-nav-item {padding:11px 12px;min-height:84px;border-radius:10px}.artist-genre-nav-name {font-size:12px}.artist-genre-nav-kicker {font-size:9px;letter-spacing:.07em}}',
    '@media(prefers-reduced-motion:reduce){.artist-genre-nav-item{transition:none}}'
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
    const top=el('div','artist-genre-nav-top');
    const heading=el('span','artist-genre-nav-heading','Смотреть другие жанры');
    const count=el('span','artist-genre-nav-count');
    top.append(heading,count);
    const grid=el('div','artist-genre-nav-grid');
    const make=(direction)=>{
      const isNext=direction===1;
      const item=el(kind==='homepage'?'button':'a','artist-genre-nav-item'+(isNext?' artist-genre-nav-next':''));
      if(item.tagName==='BUTTON')item.type='button';
      const kicker=el('span','artist-genre-nav-kicker',isNext?'Следующий →':'← Предыдущий');
      const name=el('strong','artist-genre-nav-name');
      item.append(kicker,name);
      if(kind==='homepage')item.addEventListener('click',()=>onShift(direction));
      grid.appendChild(item);
      return {item,name};
    };
    const previous=make(-1),next=make(1);
    nav.append(top,grid);
    return {
      nav,
      render(i){
        if(i<0||!genres.length)return;
        const prev=genres[(i-1+genres.length)%genres.length];
        const following=genres[(i+1)%genres.length];
        count.textContent=String(i+1).padStart(2,'0')+' / '+String(genres.length).padStart(2,'0');
        previous.name.textContent=prev[2];
        next.name.textContent=following[2];
        previous.item.setAttribute('aria-label','Предыдущий жанр: '+prev[2]);
        next.item.setAttribute('aria-label','Следующий жанр: '+following[2]);
        if(kind!=='homepage'){
          previous.item.href='/'+prev[1]+'/';
          next.item.href='/'+following[1]+'/';
        }
      }
    };
  }
  function initHomepage(dialog){
    const track=document.querySelector('#genres .genres-featured');
    if(!track)return;
    let activeKey=null;
    const panel=createPanel('homepage',direction=>{
      if(!dialog.open||!activeKey)return;
      const i=genres.findIndex(g=>g[0]===activeKey);
      if(i<0)return;
      const key=genres[(i+direction+genres.length)%genres.length][0];
      const target=track.querySelector('.genre[data-artist="'+key+'"]');
      if(!target)return;
      // The close event allows the existing media cleanup to finish before reopening.
      dialog.addEventListener('close',()=>{
        requestAnimationFrame(()=>{
          target.click();
          if(dialog.open)dialog.scrollTop=0;
        });
      },{once:true});
      dialog.close();
    });
    dialog.appendChild(panel.nav);
    function select(event){
      if(event.type==='keydown'&&event.key!=='Enter'&&event.key!==' ')return;
      const card=event.target.closest?.('#genres .genres-featured .genre[data-artist]');
      if(!card)return;
      const index=genres.findIndex(g=>g[0]===card.dataset.artist);
      if(index<0)return;
      activeKey=card.dataset.artist;
      panel.render(index);
    }
    document.addEventListener('click',select,true);
    document.addEventListener('keydown',select,true);
  }
  function initDetailPage(){
    const article=document.querySelector('article.artist-dialog');
    const slug=document.body.dataset.artistSlug;
    const i=genres.findIndex(g=>g[1]===slug);
    if(!article||i<0)return;
    const panel=createPanel('detail');
    panel.render(i);
    article.appendChild(panel.nav);
  }
  const setup=()=>{
    const dialog=document.getElementById('artist-dialog');
    if(dialog)initHomepage(dialog);
    else initDetailPage();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);
  else setup();
})();
