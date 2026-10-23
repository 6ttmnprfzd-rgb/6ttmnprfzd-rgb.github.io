/* Sync the CMS text into static SEO HTML. Text-only, preserves all HTML structure and links. */
const fs=require('node:fs');
const pages={
  raus:'raus/index.html',
  show:'show/index.html',
  nomera:'nomera/index.html',
  newyear:'novogodniy-korporativ/index.html'
};
const data=JSON.parse(fs.readFileSync('format-pages-content.json','utf8'));
const esc=value=>{
  if(typeof value!=='string')throw Error('Required CMS text missing: '+String(value));
  return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
};
function put(s,re,value,label){
  if(!re.test(s))throw Error('Expected text field missing: '+label);
  return s.replace(re,(_,a,b,c)=>a+esc(value)+c);
}
function section(html,start,end,transform){
  const pos=html.indexOf(start);
  if(pos<0)throw Error('Section not found: '+start);
  const stop=html.indexOf(end,pos+start.length);
  if(stop<0)throw Error('Section end missing: '+end);
  return html.slice(0,pos)+transform(html.slice(pos,stop))+html.slice(stop);
}
function list3(s,regex,rows,render,label){
  if(!Array.isArray(rows)||rows.length!==3)throw Error(label+' must have three items');
  let index=0;
  s=s.replace(regex,(...args)=>{
    if(index>=3)throw Error('Extra row in '+label);
    return render(args,rows[index++]);
  });
  if(index!==3)throw Error(label+' row count '+index+' instead of 3');
  return s;
}
function transform(html,page){
  const t=(s,re,v,label)=>put(s,re,v,label);
  html=section(html,'<section class="format-video-hero"','<section class="content" aria-labelledby="about">',s=>{
    const d=page.hero;
    s=t(s,/(<span class="eyebrow">)([\s\S]*?)(<\/span>)/,d.eyebrow,'hero eyebrow');
    const h=/(<h1 id="page-title">)[\s\S]*?(<span>)[\s\S]*?(<\/span><\/h1>)/;
    if(!h.test(s))throw Error('Hero heading structure changed');
    s=s.replace(h,(_,a,b,c)=>a+esc(d.title)+' '+b+esc(d.accent)+c);
    s=t(s,/(<p class="lead">)([\s\S]*?)(<\/p>)/,d.description,'hero copy');
    return t(s,/(<a class="cta" href="\/#open-request">)([\s\S]*?)(<span aria-hidden="true">)/,d.button.replace(/\s*↗\s*$/,'')+' ','hero button');
  });
  html=section(html,'<section class="content" aria-labelledby="about">','<section class="content format-genre-section"',s=>{
    const d=page.about;
    s=t(s,/(<p class="kicker">)([\s\S]*?)(<\/p>)/,d.eyebrow,'about eyebrow');
    s=t(s,/(<h2 id="about">)([\s\S]*?)(<\/h2>)/,d.title,'about heading');
    s=t(s,/(<p class="section-lead">)([\s\S]*?)(<\/p>)/,d.description,'about description');
    return list3(s,/(<article class="card"><h3>)([\s\S]*?)(<\/h3><p>)([\s\S]*?)(<\/p><\/article>)/g,d.cards,([_,a,b,c,d,e],row)=>a+esc(row.title)+c+esc(row.description)+e,'about cards');
  });
  html=section(html,'<section class="content format-genre-section"','<section class="content" aria-labelledby="',s=>{
    s=t(s,/(<p class="kicker">)([\s\S]*?)(<\/p>)/,page.genres.eyebrow,'genre eyebrow');
    return t(s,/(<h2 id="genres">)([\s\S]*?)(<\/h2>)/,page.genres.title,'genre heading');
  });
  if(page.costumes)html=section(html,'<section class="content" aria-labelledby="new-year-costumes">','<section class="content" aria-labelledby="price">',s=>{
    const d=page.costumes;
    s=t(s,/(<p class="kicker">)([\s\S]*?)(<\/p>)/,d.eyebrow,'costume eyebrow');
    s=t(s,/(<h2 id="new-year-costumes">)([\s\S]*?)(<\/h2>)/,d.title,'costume heading');
    s=t(s,/(<p class="section-lead">)([\s\S]*?)(<\/p>)/,d.description,'costume description');
    s=list3(s,/(<figcaption><strong>)([\s\S]*?)(<\/strong><span>)([\s\S]*?)(<\/span><\/figcaption>)/g,d.cards,([_,a,b,c,d,e],row)=>a+esc(row.title)+c+esc(row.description)+e,'costume cards');
    return t(s,/(<p class="gallery-next"><a href="\/#gallery">)([\s\S]*?)(<svg)/,d.gallery_button+' ','gallery link');
  });
  html=section(html,'<section class="content" aria-labelledby="price">','<section class="content faq"',s=>{
    const d=page.price;
    s=t(s,/(<p class="kicker">)([\s\S]*?)(<\/p>)/,d.eyebrow,'price eyebrow');
    s=t(s,/(<h2 id="price">)([\s\S]*?)(<\/h2>)/,d.title,'price heading');
    s=t(s,/(<p class="price-note">)([\s\S]*?)(<\/p>)/,d.note,'price note');
    return list3(s,/(<div class="price-point"><span class="price-point-label">)([\s\S]*?)(<\/span><strong>)([\s\S]*?)(<\/strong><\/div>)/g,d.points,([_,a,b,c,d,e],row)=>a+esc(row.label)+c+esc(row.value)+(row.unit?' <small>'+esc(row.unit)+'</small>':'')+e,'price rows');
  });
  html=section(html,'<section class="content faq"','<section class="content" aria-labelledby="similar">',s=>{
    const d=page.faq;
    s=t(s,/(<p class="kicker">)([\s\S]*?)(<\/p>)/,d.eyebrow,'faq eyebrow');
    s=t(s,/(<h2 id="faq">)([\s\S]*?)(<\/h2>)/,d.title,'faq title');
    return list3(s,/(<details><summary>)([\s\S]*?)(<\/summary><p>)([\s\S]*?)(<\/p><\/details>)/g,d.items,([_,a,b,c,d,e],row)=>a+esc(row.question)+c+esc(row.answer)+e,'faq');
  });
  html=section(html,'<section class="content" aria-labelledby="similar">','<section class="end-cta format-end-cta"',s=>{
    const d=page.related;
    s=t(s,/(<p class="kicker">)([\s\S]*?)(<\/p>)/,d.eyebrow,'related eyebrow');
    s=t(s,/(<h2 id="similar">)([\s\S]*?)(<\/h2>)/,d.title,'related heading');
    if(!Array.isArray(d.links)||d.links.length!==4)throw Error('Related link labels must have four entries');
    let n=0;
    s=s.replace(/(<a href="[^"]+">)([\s\S]*?)(<svg[\s\S]*?<\/svg><\/a>)/g,(_,a,b,c)=>{
      if(n>=4)throw Error('Too many related links');
      return a+esc(d.links[n++].text)+' '+c;
    });
    if(n!==4)throw Error('Expected four related links');
    return s;
  });
  return section(html,'<section class="end-cta format-end-cta"','</main>',s=>{
    const d=page.final;
    s=t(s,/(<p class="kicker">)([\s\S]*?)(<\/p>)/,d.eyebrow,'final eyebrow');
    s=t(s,/(<h2>)([\s\S]*?)(<\/h2>)/,d.title,'final heading');
    s=t(s,/(<p class="end-cta-description">)([\s\S]*?)(<\/p>)/,d.description,'final copy');
    return t(s,/(<a class="cta" href="\/#open-request">)([\s\S]*?)(<svg)/,d.button.replace(/\s*↗\s*$/,'')+' ','final button');
  });
}
let changed=0;
for(const [name,filename] of Object.entries(pages)){
  const input=fs.readFileSync(filename,'utf8');
  if(!data[name])throw Error('CMS page data missing: '+name);
  const output=transform(input,data[name]);
  if(!output.includes('rel="canonical"')||!output.includes('<meta name="description"'))throw Error('SEO tags missing: '+name);
  if(input!==output){fs.writeFileSync(filename,output,'utf8');changed++;}
  console.log(name,input===output?'already current':'SEO HTML updated');
}
console.log('Total changed pages:',changed);
