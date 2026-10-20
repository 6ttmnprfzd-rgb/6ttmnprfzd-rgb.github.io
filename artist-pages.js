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