/* Homepage copy from Pages CMS. Keep existing HTML and interactions as fallbacks. */
(()=>{
 'use strict';
 function start(){
  const root=document.querySelector('#home');
  if(!root)return;
  function text(el,value){
    if(el && typeof value==='string')el.textContent=value;
  }
  // Treat line breaks entered in CMS as visible breaks without inserting HTML from users.
  function multi(el,value){
    if(!el || typeof value!=='string')return;
    const parts=value.split(/\r?\n/),nodes=[];
    parts.forEach((part,i)=>{
      if(i)nodes.push(document.createElement('br'));
      nodes.push(document.createTextNode(part));
    });
    el.replaceChildren(...nodes);
  }
  function firstText(el,value){
    if(!el || typeof value!=='string')return;
    const child=[...el.childNodes].find(n=>n.nodeType===Node.TEXT_NODE);
    if(child)child.textContent=value+' ';
    else el.prepend(document.createTextNode(value+' '));
  }
  function heroHeading(h1,title,accent){
    if(!h1)return;
    const span=h1.querySelector(':scope > span');
    if(!span)return;
    if(typeof title==='string'){
      while(h1.firstChild && h1.firstChild!==span)h1.firstChild.remove();
      const parts=title.split(/\r?\n/);
      parts.forEach((part,i)=>{
        if(i)h1.insertBefore(document.createElement('br'),span);
        h1.insertBefore(document.createTextNode(part),span);
      });
    }
    multi(span,accent);
  }
  function apply(data){
    if(!data || typeof data!=='object')return;
    const hero=document.querySelector('#home .hero-copy');
    if(hero && data.hero){
      heroHeading(hero.querySelector('h1'),data.hero.title,data.hero.accent);
      text(hero.querySelector('p'),data.hero.description);
      text(hero.querySelector('a[data-request-open]'),data.hero.button);
      multi(document.querySelector('#home .hero-tag'),data.hero.tag);
    }
    const formats=document.querySelector('#formats');
    if(formats && data.formats){
      multi(formats.querySelector('.section-heading h2'),data.formats.title);
      if(Array.isArray(data.formats.cards)){
        [...formats.querySelectorAll('.formats > article.format')].forEach((card,i)=>{
          const row=data.formats.cards[i];
          if(!row)return;
          text(card.querySelector('.format-image-title span'),row.title);
          text(card.querySelector('strong'),row.subtitle);
          text(card.querySelector('p'),row.description);
          text(card.querySelector('button.format-more'),row.button);
          text(card.querySelector('.duration b'),row.duration);
        });
      }
    }
    const genres=document.querySelector('#genres');
    if(genres && data.genres){
      multi(genres.querySelector('.section-heading h2'),data.genres.title);
      firstText(genres.querySelector('.genre-all-toggle'),data.genres.button);
      const hint=genres.querySelector('.genre-swipe-hint');
      const hintText=hint && [...hint.childNodes].find(n=>n.nodeType===Node.TEXT_NODE);
      if(hintText && typeof data.genres.hint==='string')hintText.textContent=' '+data.genres.hint;
    }
    const gallery=document.querySelector('#gallery');
    if(gallery && data.gallery){
      multi(gallery.querySelector('.section-heading h2'),data.gallery.title);
      text(gallery.querySelector('.section-heading p'),data.gallery.description);
      firstText(gallery.querySelector('button.media-open'),data.gallery.button);
      text(gallery.querySelector('.media-entry p'),data.gallery.caption);
    }
    const price=document.querySelector('#price .price-feature');
    if(price && data.price){
      text(price.querySelector('.pf-meta'),data.price.eyebrow);
      text(price.querySelector('.pf-title'),data.price.title);
      text(price.querySelector('.pf-sub'),data.price.subtitle);
      firstText(price.querySelector('.pf-action'),data.price.button);
    }
    const contact=document.querySelector('#contacts .contact-finale-copy');
    if(contact && data.contacts){
      multi(contact.querySelector('h2'),data.contacts.title);
      text(contact.querySelector('p'),data.contacts.description);
      text(contact.querySelector('a[data-request-open]'),data.contacts.button);
    }
    if(data.seo){
      if(typeof data.seo.title==='string' && data.seo.title)document.title=data.seo.title;
      const desc=document.querySelector('meta[name="description"]');
      if(desc && typeof data.seo.description==='string')desc.content=data.seo.description;
    }
  }
  fetch('/home-page-content.json',{cache:'no-store'})
    .then(r=>{if(!r.ok)throw new Error('Homepage CMS text unavailable');return r.json()})
    .then(apply)
    .catch(()=>{/* Original content remains visible and functional. */});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
})();
