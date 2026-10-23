/* Editable copy for the four format pages.
   Static HTML stays intact as an SEO/accessibility fallback. */
(()=>{
  'use strict';
  const sectionId={
    '/raus/':'raus',
    '/show/':'show',
    '/nomera/':'nomera',
    '/novogodniy-korporativ/':'newyear'
  }[location.pathname];
  if(!sectionId)return;
  const root=document.querySelector('main');
  if(!root)return;

  const valid=text=>typeof text==='string' ? text.trim() : null;
  function set(el,text){
    const value=valid(text);
    if(el && value!==null)el.textContent=value;
  }
  function setFirstText(element,text){
    const value=valid(text);
    if(!element || value===null)return;
    let node=Array.from(element.childNodes).find(n=>n.nodeType===Node.TEXT_NODE);
    if(!node){node=document.createTextNode('');element.prepend(node);}
    node.textContent=value+' ';
  }
  const direct=(selector)=>root.querySelector(selector);
  const updateHeading=(section,data,selector)=>{
    set(section?.querySelector('.kicker'),data?.eyebrow);
    set(section?.querySelector(selector),data?.title);
  };
  function updatePairs(elements,items,callback){
    if(!Array.isArray(items))return;
    elements.forEach((node,index)=>{
      if(items[index] && typeof items[index]==='object')callback(node,items[index]);
    });
  }
  fetch('/format-pages-content.json',{cache:'no-store'})
    .then(response=>{
      if(!response.ok)throw new Error('Page text data unavailable');
      return response.json();
    })
    .then(contents=>{
      const content=contents?.[sectionId];
      if(!content || typeof content!=='object')return;

      const hero=direct('section.format-video-hero');
      if(hero && content.hero){
        set(hero.querySelector('.eyebrow'),content.hero.eyebrow);
        const title=hero.querySelector('#page-title');
        setFirstText(title,content.hero.title);
        set(title?.querySelector('span'),content.hero.accent);
        set(hero.querySelector('p.lead'),content.hero.description);
        setFirstText(hero.querySelector('a.cta'),content.hero.button?.replace(/\s*↗\s*$/,''));
      }

      const about=direct('section[aria-labelledby="about"]');
      if(about && content.about){
        updateHeading(about,content.about,'h2#about');
        set(about.querySelector('p.section-lead'),content.about.description);
        updatePairs(about.querySelectorAll('.cards article.card'),content.about.cards,(card,row)=>{
          set(card.querySelector('h3'),row.title);
          set(card.querySelector('p'),row.description);
        });
      }

      const genres=direct('section.format-genre-section');
      if(genres && content.genres)updateHeading(genres,content.genres,'h2#genres');

      const costumes=direct('section[aria-labelledby="new-year-costumes"]');
      if(costumes && content.costumes){
        updateHeading(costumes,content.costumes,'h2#new-year-costumes');
        set(costumes.querySelector('p.section-lead'),content.costumes.description);
        updatePairs(costumes.querySelectorAll('.costume-card'),content.costumes.cards,(card,row)=>{
          set(card.querySelector('figcaption strong'),row.title);
          set(card.querySelector('figcaption span'),row.description);
        });
        setFirstText(costumes.querySelector('p.gallery-next a'),content.costumes.gallery_button);
      }

      const price=direct('section[aria-labelledby="price"]');
      if(price && content.price){
        updateHeading(price,content.price,'h2#price');
        set(price.querySelector('p.price-note'),content.price.note);
        updatePairs(price.querySelectorAll('.price-point'),content.price.points,(point,row)=>{
          set(point.querySelector('.price-point-label'),row.label);
          const strong=point.querySelector('strong');
          setFirstText(strong,row.value);
          const small=strong?.querySelector('small');
          if(small){
            set(small,row.unit);
            small.hidden=!valid(row.unit);
          }
        });
      }

      const faq=direct('section.faq');
      if(faq && content.faq){
        updateHeading(faq,content.faq,'h2#faq');
        updatePairs(faq.querySelectorAll('details'),content.faq.items,(item,row)=>{
          set(item.querySelector('summary'),row.question);
          set(item.querySelector('p'),row.answer);
        });
      }

      const related=direct('section[aria-labelledby="similar"]');
      if(related && content.related){
        updateHeading(related,content.related,'h2#similar');
        updatePairs(related.querySelectorAll('nav.related a'),content.related.links,(link,row)=>{
          setFirstText(link,row.text);
        });
      }

      const finale=direct('section.format-end-cta');
      if(finale && content.final){
        set(finale.querySelector('.kicker'),content.final.eyebrow);
        set(finale.querySelector('h2'),content.final.title);
        set(finale.querySelector('.end-cta-description'),content.final.description);
        setFirstText(finale.querySelector('a.cta'),content.final.button?.replace(/\s*↗\s*$/,''));
      }
    })
    .catch(error=>console.warn('Static page text used:',error.message));
})();
