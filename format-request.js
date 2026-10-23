/* Standalone format pages: the same request form and service endpoint as the homepage. */
if(!document.getElementById('request-overlay')){
  document.body.insertAdjacentHTML('beforeend',"<div aria-labelledby=\"request-title\" aria-modal=\"true\" class=\"request-overlay\" hidden=\"\" id=\"request-overlay\" role=\"dialog\">\n<div class=\"request-panel\" tabindex=\"-1\"><button aria-label=\"Закрыть форму\" class=\"request-close\" type=\"button\">×</button>\n<h2 id=\"request-title\">Расскажите о мероприятии</h2><p>Заполните то, что уже известно. Мы уточним остальные детали при общении.</p>\n<form id=\"request-form\"><div class=\"request-fields\">\n<label class=\"request-field wide\">Как к вам обращаться *<input autocomplete=\"name\" maxlength=\"120\" name=\"name\" placeholder=\"Ваше имя\" required=\"\"/></label>\n<div aria-hidden=\"true\" class=\"request-honeypot\"><label>Сайт<input autocomplete=\"off\" name=\"website\" tabindex=\"-1\"/></label></div>\n<label class=\"request-field\">Дата мероприятия<input name=\"date\" type=\"date\"/></label>\n<label class=\"request-field\">Время<input name=\"time\" placeholder=\"Например, 18:00\"/></label>\n<label class=\"request-field wide\">Место проведения<input name=\"place\" placeholder=\"Город, площадка или адрес\"/></label>\n<label class=\"request-field\">Формат<select name=\"format\"><option value=\"Пока выбираю\">Пока выбираю</option><option>Раус / встреча гостей</option><option>Шоу</option><option>Отдельный номер</option></select></label>\n<label class=\"request-field\">Количество артистов<input name=\"count\" placeholder=\"Например, 3\"/></label>\n<label class=\"request-field\">Продолжительность<input name=\"duration\" placeholder=\"Например, 2 часа\"/></label>\n<label class=\"request-field\">Телефон для связи *<input autocomplete=\"tel\" maxlength=\"80\" name=\"phone\" placeholder=\"+7 ...\" required=\"\" type=\"tel\"/></label>\n<label class=\"request-field wide\">Пожелания<textarea name=\"notes\" placeholder=\"Интересующие артисты и другие детали\"></textarea></label>\n</div><button class=\"request-send\" type=\"submit\">ОТПРАВИТЬ ЗАЯВКУ →</button><p aria-live=\"polite\" class=\"request-note\" id=\"request-status\" role=\"status\">Заявка поступит напрямую нашей команде. Мы свяжемся с вами по указанному телефону.</p><button class=\"request-copy\" type=\"button\">Скопировать текст заявки</button></form>\n</div></div>");
}
/* Match the homepage request popup's brand heading and introduction. */
(()=>{
 const panel=document.querySelector('#request-overlay .request-panel');
 const title=panel?.querySelector('#request-title');
 if(!title||panel.querySelector('.request-brand-kicker'))return;
 const kicker=document.createElement('div');
 kicker.className='request-brand-kicker';
 kicker.append('НОГИ ');
 const small=document.createElement('span');
 small.className='request-brand-small-v';
 small.textContent='в';
 kicker.append(small,' РУКИ / ЗАЯВКА');
 title.before(kicker);
 const intro=title.nextElementSibling;
 if(intro?.tagName==='P'){
   intro.textContent='Укажите детали мероприятия, чтобы мы могли подготовить предложение и рассчитать стоимость.';
 }
})();
(()=>{const overlay=document.getElementById('request-overlay'),panel=overlay.querySelector('.request-panel'),form=document.getElementById('request-form');let previous=null;
function open(e){if(e)e.preventDefault();previous=document.activeElement;overlay.hidden=false;document.body.style.overflow='hidden';panel.focus()}
function close(){overlay.hidden=true;document.body.style.overflow='';previous?.focus()}
document.querySelectorAll('a[href="/#open-request"],[data-request-open]').forEach(a=>a.addEventListener('click',e=>{
  const menu=a.closest('.mobile-menu');
  if(menu)menu.open=false;
  open(e);
}));
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

/* Optional performer quantities: reuse existing "count" and "notes" bot fields. */
(()=>{
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
})();

(()=>{
 const f=document.querySelector('#request-form select[name="format"]');
 if(!f)return;
 const url=location.pathname;
 const val=url.startsWith('/raus/')?'Раус / встреча гостей':
           url.startsWith('/show/')?'Шоу':
           url.startsWith('/nomera/')?'Отдельный номер':null;
 if(val)f.value=val;
})();
