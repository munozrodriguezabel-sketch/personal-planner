/* Vistas, modales y render */
function vHoy(){
  const t=today(),n=new Date(),h=n.getHours();
  const gr=h<6?'Buenas noches':h<13?'Buenos días':h<21?'Buenas tardes':'Buenas noches';
  const ts=occ(t),hs=habitsOn(t),dn=ts.filter(x=>isDone(x,t)).length+hs.filter(x=>hDone(x,t)).length,tot=ts.length+hs.length;
  const pct=tot?Math.round(dn/tot*100):0;
  const pr=ts.filter(x=>x.star).slice(0,3),pe=ts.filter(x=>!isDone(x,t));
  let up=[];for(let i=1;i<=7&&up.length<6;i++){const d=addD(t,i);occ(d).forEach(x=>up.push([x,d]))}
  const fd=d=>pd(d).toLocaleDateString('es-ES',{weekday:'short',day:'numeric',month:'short'});
  return `<h2>${gr}</h2><p class="sub">${n.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
  <div class="card hero"><div class="ring" style="--p:${pct}"><span>${pct}%</span></div><div><b>Progreso del día</b><p class="sub" style="margin:4px 0 0">${dn} de ${tot} completadas · ${ts.filter(x=>isDone(x,t)).length}/${ts.length} tareas · ${hs.filter(x=>hDone(x,t)).length}/${hs.length} hábitos</p></div></div>
  <div class="grid"><div><div class="card"><h3>Mis prioridades <small>★ máx. 3</small></h3>${pr.map(x=>taskRow(x,t)).join('')||'<p class="empty">Marca con ★ hasta tres tareas de hoy.</p>'}</div>
  <div class="card"><h3>Pendientes (${pe.length})</h3>${pe.map(x=>taskRow(x,t)).join('')||'<p class="empty">Nada pendiente hoy.</p>'}</div></div>
  <div><div class="card"><h3>Hábitos de hoy</h3>${hs.map(x=>habitRow(x,t)).join('')||'<p class="empty">Aún no tienes hábitos para hoy.</p>'}</div>
  <div class="card"><h3>Próximos 7 días</h3>${up.map(([x,d])=>`<div class="row"><span class="dot" style="background:${CC[x.cat]||CC.Otros}"></span><div class="t" data-a="edit" data-id="${x.id}" data-d="${d}"><b>${esc(x.title)}</b><small>${fd(d)}${x.time?' · '+esc(x.time):''}</small></div></div>`).join('')||'<p class="empty">Sin tareas próximas.</p>'}</div>${vHoyX()}</div></div>`;
}
function vTareas(){
  const ts=occ(S.date);
  return `<h2>Tareas</h2><p class="sub">Cada repetición se completa de forma independiente.</p>
  <div class="bar"><button class="btn g" data-a="dd" data-n="-1">‹</button><input type="date" id="dsel" value="${S.date}"><button class="btn g" data-a="dd" data-n="1">›</button><button class="btn g" data-a="dd" data-n="0">Hoy</button><button class="btn" data-a="new" style="margin-left:auto">+ Nueva tarea</button></div>
  <div class="card">${ts.map(x=>taskRow(x,S.date)).join('')||'<p class="empty">No hay tareas este día.</p>'}</div>`;
}
function vCal(){
  const [y,m]=S.cm.split('-').map(Number),first=new Date(y,m-1,1),off=dow(first),dim=new Date(y,m,0).getDate();
  let c=DN.map(d=>`<b>${d}</b>`).join('');
  for(let i=0;i<off;i++)c+='<div></div>';
  for(let d=1;d<=dim;d++){const s=y+'-'+p2(m)+'-'+p2(d),k=occ(s).length;
    c+=`<div class="cd ${s===S.date?'sel':''} ${s===today()?'td':''}" data-a="pick" data-d="${s}">${d}${k?'<i></i>':''}</div>`}
  const ts=occ(S.date);
  return `<h2>Calendario</h2><p class="sub">Las tareas recurrentes aparecen en sus días.</p>
  <div class="card"><div class="bar"><button class="btn g" data-a="mm" data-n="-1">‹</button><b style="flex:1;text-align:center;text-transform:capitalize">${first.toLocaleDateString('es-ES',{month:'long',year:'numeric'})}</b><button class="btn g" data-a="mm" data-n="1">›</button></div><div class="cal">${c}</div></div>
  <div class="card"><h3>${pd(S.date).toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})}<button class="btn" data-a="new">+</button></h3>${ts.map(x=>taskRow(x,S.date)).join('')||'<p class="empty">Sin tareas este día.</p>'}</div>`;
}
function vHab(){
  const t=today(),hs=Object.values(S.habits);
  const strip=h=>{let s='';for(let i=6;i>=0;i--){const d=addD(t,-i),on=habitsOn(d).some(x=>x.id===h.id);s+=`<span class="${hDone(h,d)?'on':on?'':'na'}" title="${d}"></span>`}return s};
  const cnt=h=>{let a=0,b=0;for(let i=0;i<7;i++){const d=addD(t,-i);if(habitsOn(d).some(x=>x.id===h.id)){b++;if(hDone(h,d))a++}}return a+'/'+b};
  return `<h2>Hábitos</h2><p class="sub">Sin penalizaciones: solo ves lo que has conseguido.</p>
  <div class="bar"><button class="btn" data-a="hnew" style="margin-left:auto">+ Nuevo hábito</button></div>
  <div class="card">${hs.map(h=>`<div class="row ${hDone(h,t)?'d':''}"><button class="ck ${hDone(h,t)?'on':''}" data-a="hk" data-id="${h.id}" data-d="${t}" ${habitsOn(t).includes(h)?'':'disabled style="opacity:.3"'}>${hDone(h,t)?'✓':''}</button><div class="t" data-a="hedit" data-id="${h.id}"><b>${esc(h.name)}</b><small>${h.days&&h.days.length?h.days.map(i=>DN[i]).join(' '):'Todos los días'} · últimos 7 días: ${cnt(h)}</small></div><div class="wk">${strip(h)}</div></div>`).join('')||'<p class="empty">Crea tu primer hábito.</p>'}</div>`;
}

function chips(sel){return `<div class="chips" id="dch">${DN.map((d,i)=>`<button type="button" class="chip ${sel.includes(i)?'on':''}" data-a="ch" data-i="${i}" title="${DL[i]}">${d}</button>`).join('')}</div>`}
function modal(){
  const m=S.modal;if(!m)return '';
  if(m.k==='task'){const t=m.t;return `<div class="ov" data-a="close"><div class="md" data-stop><h2>${t.id?'Editar tarea':'Nueva tarea'}</h2>
  <label>Título</label><input id="f-title" value="${esc(t.title)}"><label>Descripción</label><textarea id="f-desc" rows="2">${esc(t.desc)}</textarea>
  <div class="two"><div><label>Fecha (inicio)</label><input type="date" id="f-date" value="${t.date}"></div><div><label>Hora (opcional)</label><input type="time" id="f-time" value="${esc(t.time)}"></div>
  <div><label>Categoría</label><select id="f-cat">${CATS.map(c=>`<option ${c===t.cat?'selected':''}>${c}</option>`).join('')}</select></div>
  <div><label>Prioridad</label><select id="f-pri">${['alta','media','baja'].map(c=>`<option value="${c}" ${c===t.pri?'selected':''}>${c[0].toUpperCase()+c.slice(1)}</option>`).join('')}</select></div></div>
  <label>Repetir los días (sin selección = no se repite)</label>${chips(t.days)}
  <div class="chips" style="margin-top:8px"><button type="button" class="chip" data-a="pre" data-v="0,1,2,3,4">Laborables</button><button type="button" class="chip" data-a="pre" data-v="5,6">Fin de semana</button><button type="button" class="chip" data-a="pre" data-v="0,1,2,3,4,5,6">Todos</button><button type="button" class="chip" data-a="pre" data-v="">Ninguno</button></div>
  <label>Fecha de fin (opcional)</label><input type="date" id="f-end" value="${esc(t.end)}">
  <div class="bar" style="margin-top:18px"><button class="btn" data-a="save">Guardar</button><button class="btn g" data-a="close">Cancelar</button>
  ${t.id&&t.days.length&&m.d?`<button class="btn g" data-a="skip">Omitir este día</button>`:''}${t.id?`<button class="btn r" data-a="delt">${t.days.length?'Eliminar serie':'Eliminar'}</button>`:''}</div></div></div>`}
  if(m.k==='rut')return mRut(m);if(m.k==='book')return mBook(m);if(m.k==='wv')return mWv(m);
  const h=m.h;return `<div class="ov" data-a="close"><div class="md" data-stop><h2>${h.id?'Editar hábito':'Nuevo hábito'}</h2>
  <label>Nombre</label><input id="h-name" value="${esc(h.name)}"><label>Días (sin selección = todos)</label>${chips(h.days)}
  <div class="bar" style="margin-top:18px"><button class="btn" data-a="hsave">Guardar</button><button class="btn g" data-a="close">Cancelar</button>${h.id?'<button class="btn r" data-a="hdel">Eliminar</button>':''}</div></div></div>`;
}
function render(){
  const v={hoy:vHoy,tareas:vTareas,cal:vCal,habitos:vHab,gym:vGym,lec:vLec}[S.view]();
  const ae=document.activeElement&&document.activeElement.id;
  $('#app').innerHTML=`<nav><h1>PERSONAL PLANNER</h1>${NAV.map(([k,i,l])=>`<button class="${S.view===k?'on':''}" data-a="nav" data-v="${k}"><i>${i}</i>${l}</button>`).join('')}<div class="sync">● ${esc(S.status)}<br><a data-a="exp">Exportar</a> · <a data-a="imp">Importar</a></div></nav><main>${v}</main><button class="fab" data-a="${({habitos:'hnew',gym:'rnew',lec:'bnew'})[S.view]||'new'}">+</button>${modal()}`;
  if(ae&&$('#'+ae)&&!S.modal)$('#'+ae).focus();
}
