/* Prerender editable homepage copy into HTML, leaving layout and handlers intact. */
const fs=require('node:fs');
const data=JSON.parse(fs.readFileSync('home-page-content.json','utf8'));
let html=fs.readFileSync('index.html','utf8');
const original=html;
const escape=s=>{
  if(typeof s!=='string')throw Error('A homepage CMS text field is missing');
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
};
const lines=s=>escape(s).replace(/\r?\n/g,'<br/>');
function one(s,re,value,label){
  if(!re.test(s))throw Error('Homepage selector changed: '+label);
  return s.replace(re,(_,before,old,after)=>before+value+after);
}
function section(start,end,cb){
  const at=html.indexOf(start);
  const stop=html.indexOf(end,at+start.length);
  if(at===-1 || stop===-1)throw Error('Homepage section structure changed: '+start);
  html=html.slice(0,at)+cb(html.slice(at,stop))+html.slice(stop);
}
section('<section class="hero hero-video-layout" id="home">','<section class="section" id="formats">',s=>{
  const d=data.hero;
  s=one(s,/(<h1>)([\s\S]*?)(<\/h1>)/,lines(d.title)+'<br/><span>'+lines(d.accent)+'</span>','hero title');
  s=one(s,/(<div class="hero-copy">[\s\S]*?<p>)([\s\S]*?)(<\/p>)/,escape(d.description),'hero description');
  s=one(s,/(<a class="btn" data-request-open="true" href="#request">)([\s\S]*?)(<\/a>)/,escape(d.button),'hero button');
  s=one(s,/(<div class="hero-tag">)([\s\S]*?)(<\/div>)/,lines(d.tag),'hero tag');
  return s;
});
section('<section class="section" id="formats">','<section class="section" id="genres"',s=>{
  const d=data.formats;
  s=one(s,/(<div class="section-heading"><h2>)([\s\S]*?)(<\/h2>)/,lines(d.title),'formats title');
  if(!Array.isArray(d.cards)||d.cards.length!==3)throw Error('Homepage must have three format cards');
  let n=0;
  s=s.replace(/<article class="format">[\s\S]*?<\/article>/g,article=>{
    const row=d.cards[n++];if(!row)throw Error('More than three format cards');
    article=one(article,/(<div class="format-image-title"><span>)([\s\S]*?)(<\/span>)/,escape(row.title),'format name');
    article=one(article,/(<\/div><strong>)([\s\S]*?)(<\/strong><p>)/,escape(row.subtitle),'format subtitle');
    article=one(article,/(<\/strong><p>)([\s\S]*?)(<\/p>)/,escape(row.description),'format description');
    article=one(article,/(<button[^>]+class="format-more"[^>]*>)([\s\S]*?)(<\/button>)/,escape(row.button),'format button');
    article=one(article,/(<div class="duration">Продолжительность <b>)([\s\S]*?)(<\/b>)/,escape(row.duration),'format duration');
    return article;
  });
  if(n!==3)throw Error('The homepage format card markup changed');
  return s;
});
section('<section class="section" id="genres"','<section class="section" id="gallery">',s=>{
  const d=data.genres;
  s=one(s,/(<div class="section-heading"><h2>)([\s\S]*?)(<\/h2>)/,lines(d.title),'genre heading');
  s=one(s,/(<button[^>]+class="genre-all-toggle"[^>]*>)([\s\S]*?)(<svg)/,escape(d.button)+' ','genre button');
  s=one(s,/(<span class="genre-swipe-hint"><svg[\s\S]*?<\/svg>)([\s\S]*?)(<\/span>)/,' '+escape(d.hint),'genre hint');
  // Link the original image cards, not a second list. Existing click handlers open dialogs.
  const genreSlugs={"stilts":"hodulisty","juggling":"zhonglery","mime":"mimy","unicycle":"unitsiklisty","magic":"mikromag","acrobat":"akrobaty","cyrwheel":"koleso-sira","knife":"balans-na-nozhe","canes":"ekvilibr-na-trostyah","hoops":"hulahupy","zorb":"gimnastka-v-zorb-share","aerialring":"gimnastka-v-parternom-koltse","diabolo":"diabolo","rollers":"ekvilibr-na-katushkah","chairs":"ekvilibr-na-stulyah","contact":"kontaktnoe-zhonglirovanie","ladder":"volnostoyashchaya-lestnitsa","hatter":"shlyapnik"};
  s=s.replace(/<details class="genre-landing-links">[\s\S]*?<\/details>/g,'');
  let linked=0;
  s=s.replace(/(<article\b[^>]*\bdata-artist="([^"]+)"[^>]*>)([\s\S]*?)(<\/article>)/g,(all,open,key,body,close)=>{
    const slug=genreSlugs[key];
    if(!slug)throw Error('Unknown genre in homepage carousel: '+key);
    if(/class="genre-seo-card-link"/.test(body)){linked++;return all;}
    const heading=/(<h3[^>]*>)([\s\S]*?)(<\/h3>)/;
    if(!heading.test(body))throw Error('Genre heading missing: '+key);
    linked++;
    body=body.replace(heading,(_whole,a,title,c)=>a+'<a class="genre-seo-card-link" href="/'+slug+'/">'+title+'</a>'+c);
    return open+body+close;
  });
  if(linked!==16)throw Error('Expected 16 original genre cards; found '+linked);
  return s;
});
section('<section class="section" id="gallery">','<section class="section" id="price"',s=>{
  const d=data.gallery;
  s=one(s,/(<div class="section-heading"><h2>)([\s\S]*?)(<\/h2>)/,lines(d.title),'gallery title');
  s=one(s,/(<div class="section-heading"><h2>[\s\S]*?<\/h2><p>)([\s\S]*?)(<\/p>)/,escape(d.description),'gallery description');
  s=one(s,/(<button class="media-open" id="open-media" type="button">)([\s\S]*?)(<span)/,escape(d.button)+' ','gallery button');
  s=one(s,/(<div class="media-entry">[\s\S]*?<p>)([\s\S]*?)(<\/p>)/,escape(d.caption),'gallery caption');
  return s;
});
section('<section class="section" id="price"','<section class="section contact contact-finale" id="contacts">',s=>{
  const d=data.price;
  s=one(s,/(<span class="pf-meta">)([\s\S]*?)(<\/span>)/,escape(d.eyebrow),'price eyebrow');
  s=one(s,/(<span class="pf-title">)([\s\S]*?)(<\/span>)/,escape(d.title),'price title');
  s=one(s,/(<span class="pf-sub">)([\s\S]*?)(<\/span>)/,escape(d.subtitle),'price subtitle');
  s=one(s,/(<span class="pf-action">)([\s\S]*?)(<span aria-hidden="true">)/,escape(d.button)+' ','price button');
  return s;
});
section('<section class="section contact contact-finale" id="contacts">','</main>',s=>{
  const d=data.contacts;
  s=one(s,/(<div class="contact-finale-copy">[\s\S]*?<h2>)([\s\S]*?)(<\/h2>)/,lines(d.title),'contact title');
  s=one(s,/(<div class="contact-finale-copy">[\s\S]*?<p>)([\s\S]*?)(<\/p>)/,escape(d.description),'contact description');
  s=one(s,/(<a class="btn" data-request-open="true" href="#request">)([\s\S]*?)(<\/a>)/,escape(d.button),'contact button');
  return s;
});
if(data.seo){
  html=one(html,/(<title>)([\s\S]*?)(<\/title>)/,escape(data.seo.title),'SEO title');
  html=one(html,/(<meta content=")([^"]*)(" name="description"\/>)/,escape(data.seo.description),'SEO description');
}
/* One canonical Organization record helps search engines connect the site to our verified brand. */
const org={
  '@context':'https://schema.org',
  '@type':'Organization',
  '@id':'https://welcirc.pro/#organization',
  name:'НОГИ в РУКИ',
  url:'https://welcirc.pro/',
  logo:'https://welcirc.pro/nogi-logo-header.png',
  description:'Цирковая команда: артисты для встречи гостей, цирковые шоу и отдельные номера на мероприятиях в Москве и Московской области.',
  telephone:'+79019060656',
  email:'info@welcirc.ru',
  areaServed:['Москва','Московская область'],
  sameAs:[
    'https://www.instagram.com/welcirc/',
    'https://vk.ru/welcirc',
    'https://www.youtube.com/@welcirc'
  ]
};
const orgMarker='https://welcirc.pro/#organization';
if(!html.includes(orgMarker)){
  const canonical='<link href="https://welcirc.pro/" rel="canonical"/>';
  if(!html.includes(canonical))throw Error('Homepage canonical anchor missing');
  html=html.replace(canonical,canonical+'\n<script type="application/ld+json">'+JSON.stringify(org)+'</script>');
}
if(!html.includes('rel="canonical"')&&!html.includes('rel="canonical"'))throw Error('Canonical missing');
if(!html.includes('id="genres"')||!html.includes('id="contacts"'))throw Error('Homepage content structure missing');
if(html!==original){
  fs.writeFileSync('index.html',html,'utf8');
  console.log('Updated static homepage content and SEO metadata');
}else{
  console.log('Homepage static HTML already matches CMS content');
}

