/* ===== GIMNASIO + LECTURA ===== */
const putq=(col,id,o)=>{S[col][id]=o;Store.set(col,id,o).catch(()=>toast('Error al guardar'))};
const num=v=>{const n=parseFloat(String(v).replace(',','.'));return isNaN(n)?0:n};
const fmtD=s=>pd(s).toLocaleDateString('es-ES',{day:'numeric',month:'short'});
const clone=o=>JSON.parse(JSON.stringify(o));
const finW=()=>Object.values(S.workouts).filter(w=>w.fin).sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id));
const wkStart=()=>addD(today(),-dow(pd(today())));
const pagesSince=d=>Object.values(S.reads).filter(r=>r.date>=d).reduce((a,r)=>a+r.pages,0);
const NEWEX=()=>({n:'',s:3,r:10,w:0,rest:90,notes:''});
const stL={pendiente:'Pendiente',leyendo:'Leyendo',terminado:'Terminado',pausa:'En pausa'};
const hue=s=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))%360,7);
const pct=b=>b.pages?Math.min(100,Math.round(b.cur/b.pages*100)):0;
const rem=b=>Math.max(0,b.pages-b.cur);

function vHoyX(){
  const a=S.workouts[S.act],l=finW()[0],rd=Object.values(S.books).filter(b=>b.status==='leyendo');
  const pt=Object.values(S.reads).filter(x=>x.date===today()).reduce((s,x)=>s+x.pages,0);
  return `<div class="card"><h3>Gimnasio</h3>`+(a&&!a.fin?`<div class="row"><div class="t" data-a="nav" data-v="gym"><b>Entrenamiento en curso</b><small>${esc(a.rname)} · continuar</small></div></div>`:l?`<div class="row"><div class="t" data-a="nav" data-v="gym"><b>Último: ${esc(l.rname)}</b><small>${fmtD(l.date)}</small></div></div>`:'<p class="empty">Aún no has registrado entrenamientos.</p>')
  +`</div><div class="card"><h3>Lectura <small>hoy: ${pt} págs.</small></h3>`+(rd.map(b=>`<div class="row"><div class="t" data-a="nav" data-v="lec"><b>${esc(b.title)}</b><small>${pct(b)}% · quedan ${rem(b)} págs.</small></div></div>`).join('')||'<p class="empty">No estás leyendo ningún libro.</p>')+'</div>';
}

function vGym(){
  const a=S.workouts[S.act];if(a&&!a.fin)return vAct(a);
  let b='';
  if(S.gt==='rut'){
    b=Object.values(S.routines).map(r=>{const l=finW().find(w=>w.rid===r.id);
      return `<div class="row"><div class="t" data-a="redit" data-id="${r.id}"><b>${esc(r.name)}</b><small>${r.ex.length} ejercicios${l?' · último: '+fmtD(l.date):''}</small></div><button class="btn" data-a="wstart" data-id="${r.id}">Empezar</button></div>`}).join('')||'<p class="empty">Crea tu primera rutina con “+ Rutina”.</p>';
    b=`<div class="card">${b}</div>`;
  }else if(S.gt==='his'){
    b=`<div class="card">${finW().map(w=>`<div class="row"><div class="t" data-a="wview" data-id="${w.id}"><b>${esc(w.rname)}</b><small>${fmtD(w.date)} · ${w.ex.length} ejercicios · ${w.ex.reduce((a,e)=>a+e.sets.filter(s=>s.ok).length,0)} series hechas</small></div></div>`).join('')||'<p class="empty">Aún no hay entrenamientos guardados.</p>'}</div>`;
  }else b=vEvo();
  return `<h2>Gimnasio</h2><p class="sub">Tus entrenamientos se guardan solos y no cambian al editar rutinas.</p><div class="bar">${[['rut','Rutinas'],['his','Historial'],['evo','Evolución']].map(([k,l])=>`<button class="chip ${S.gt===k?'on':''}" data-a="gt" data-v="${k}">${l}</button>`).join('')}<button class="btn" data-a="rnew" style="margin-left:auto">+ Rutina</button></div>${b}`;
}
function vAct(a){
  return `<h2>${esc(a.rname)}</h2><p class="sub">${fmtD(a.date)} · guardado automático</p>`+a.ex.map((e,i)=>`<div class="card"><h3>${esc(e.n)}<small>${esc(e.note)}</small></h3>`+e.sets.map((s,j)=>`<div class="row ${s.ok?'d':''}" style="padding:8px 10px"><b style="width:22px;color:var(--mu)">${j+1}</b><input data-wk="${i},${j},w" inputmode="decimal" value="${s.w||''}" placeholder="kg" style="text-align:center"><span>×</span><input data-wk="${i},${j},r" inputmode="numeric" value="${s.r||''}" placeholder="rep" style="text-align:center"><button class="ck ${s.ok?'on':''}" data-a="sok" data-i="${i}" data-j="${j}" style="width:38px;height:38px">${s.ok?'✓':''}</button></div>`).join('')+`<button class="btn g" data-a="sadd" data-i="${i}">+ Serie</button></div>`).join('')+`<div class="bar"><button class="btn" data-a="wfin">Terminar entrenamiento</button><button class="btn r" data-a="wdisc">Descartar</button></div>`;
}
function vEvo(){
  const ws=finW().slice().reverse(),names=[...new Set(ws.flatMap(w=>w.ex.map(e=>e.n)))];
  if(!names.length)return '<div class="card"><p class="empty">Termina un entrenamiento para ver la evolución de cada ejercicio.</p></div>';
  if(!names.includes(S.ge))S.ge=names[0];
  const pts=ws.map(w=>{const e=w.ex.find(x=>x.n===S.ge);if(!e)return null;const ss=e.sets.filter(s=>s.ok&&s.w);
    return ss.length?{d:w.date,m:Math.max(...ss.map(s=>s.w)),t:ss.map(s=>s.w+'×'+s.r).join(' · ')}:null}).filter(Boolean);
  let svg='';
  if(pts.length>1){const mx=Math.max(...pts.map(p=>p.m)),mn=Math.min(...pts.map(p=>p.m)),W=600,H=170,pa=24;
    const X=i=>pa+i*(W-2*pa)/(pts.length-1),Y=v=>mx===mn?H/2:H-pa-(v-mn)/(mx-mn)*(H-2*pa);
    svg=`<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto"><polyline fill="none" style="stroke:var(--ac);stroke-width:3" points="${pts.map((p,i)=>X(i)+','+Y(p.m)).join(' ')}"/>${pts.map((p,i)=>`<circle cx="${X(i)}" cy="${Y(p.m)}" r="5" style="fill:var(--ac2)"/><text x="${X(i)}" y="${Y(p.m)-10}" text-anchor="middle" font-size="13" style="fill:var(--tx)">${p.m}</text>`).join('')}</svg>`}
  return `<div class="card"><h3>Peso máximo por sesión (kg)</h3><select id="gesel" style="margin-bottom:12px">${names.map(n=>`<option ${n===S.ge?'selected':''}>${esc(n)}</option>`).join('')}</select>${svg||'<p class="empty">Necesitas al menos 2 sesiones con series completadas para ver la gráfica.</p>'}</div>
  <div class="card"><h3>Sesiones</h3>${pts.slice().reverse().map(p=>`<div class="row"><div class="t"><b>${fmtD(p.d)} · máx. ${p.m} kg</b><small>${esc(p.t)}</small></div></div>`).join('')||'<p class="empty">Sin series completadas.</p>'}</div>`;
}
function mRut(m){const r=m.r;
  return `<div class="ov" data-a="close"><div class="md" data-stop><h2>${r.id?'Editar rutina':'Nueva rutina'}</h2><label>Nombre</label><input id="r-name" value="${esc(r.name)}">`+r.ex.map((e,i)=>`<div class="card exr" style="margin:12px 0 0;padding:12px"><input data-f="n" placeholder="Ejercicio" value="${esc(e.n)}"><div class="two"><div><label>Series</label><input data-f="s" inputmode="numeric" value="${e.s}"></div><div><label>Reps objetivo</label><input data-f="r" inputmode="numeric" value="${e.r}"></div><div><label>Peso habitual (kg)</label><input data-f="w" inputmode="decimal" value="${e.w}"></div><div><label>Descanso (s)</label><input data-f="rest" inputmode="numeric" value="${e.rest}"></div></div><label>Notas</label><input data-f="notes" value="${esc(e.notes)}"><button class="btn r" style="margin-top:10px" data-a="rxdel" data-i="${i}">Quitar ejercicio</button></div>`).join('')
  +`<div class="bar" style="margin-top:14px"><button class="btn g" data-a="rxadd">+ Ejercicio</button></div><div class="bar"><button class="btn" data-a="rsave">Guardar</button><button class="btn g" data-a="close">Cancelar</button>${r.id?'<button class="btn r" data-a="rdel">Eliminar rutina</button>':''}</div></div></div>`;
}
function readR(){const r=S.modal.r;r.name=$('#r-name').value;
  r.ex=[...document.querySelectorAll('.exr')].map(c=>{const g=f=>c.querySelector('[data-f='+f+']').value;return{n:g('n').trim(),s:Math.max(1,parseInt(g('s'))||3),r:parseInt(g('r'))||0,w:num(g('w')),rest:parseInt(g('rest'))||0,notes:g('notes')}})}
function mWv(m){const w=S.workouts[m.id];if(!w)return '';
  return `<div class="ov" data-a="close"><div class="md" data-stop><h2>${esc(w.rname)}</h2><p class="sub">${fmtD(w.date)}</p>${w.ex.map(e=>`<div class="row" style="display:block"><b>${esc(e.n)}</b><br><small style="color:var(--mu)">${e.sets.map((s,j)=>(j+1)+') '+s.w+' kg × '+s.r+(s.ok?' ✓':' ✗')).join(' · ')}</small></div>`).join('')}<div class="bar" style="margin-top:14px"><button class="btn g" data-a="close">Cerrar</button><button class="btn r" data-a="wdel" data-id="${w.id}">Eliminar</button></div></div></div>`}

function vLec(){
  const bs=Object.values(S.books),wk=pagesSince(wkStart()),mo=pagesSince(today().slice(0,8)+'01'),f=S.lf;
  const sh=bs.filter(b=>f==='todos'||b.status===f);
  const rd=Object.values(S.reads).sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id)).slice(0,12);
  const st=(n,l)=>`<div class="card" style="margin:0;text-align:center"><div style="font-size:26px;font-weight:700">${n}</div><small style="color:var(--mu)">${l}</small></div>`;
  return `<h2>Lectura</h2><p class="sub">Tu biblioteca personal.</p>
  <div class="grid" style="margin-bottom:14px">${st(bs.filter(b=>b.status==='terminado').length,'Terminados')}${st(bs.filter(b=>b.status==='leyendo').length,'En curso')}${st(wk,'Págs. esta semana')}${st(mo,'Págs. este mes')}</div>
  <div class="bar">${['todos',...Object.keys(stL)].map(k=>`<button class="chip ${f===k?'on':''}" data-a="lf" data-v="${k}">${k==='todos'?'Todos':stL[k]}</button>`).join('')}<button class="btn" data-a="bnew" style="margin-left:auto">+ Libro</button></div>
  <div class="grid">${sh.map(b=>`<div class="card" data-a="bopen" data-id="${b.id}" style="cursor:pointer;display:flex;gap:14px;margin:0"><div class="cv" style="background:linear-gradient(135deg,hsl(${hue(b.title)} 55% 38%),hsl(${(hue(b.title)+45)%360} 60% 20%))">${esc(b.title.slice(0,1).toUpperCase())}</div><div style="flex:1;min-width:0"><b>${esc(b.title)}</b><br><small style="color:var(--mu)">${esc(b.author)||'Autor desconocido'}</small><div class="pb"><i style="width:${pct(b)}%"></i></div><small style="color:var(--mu)">${pct(b)}% · quedan ${rem(b)} págs. · ${stL[b.status]}</small></div></div>`).join('')||'<p class="empty">No hay libros en esta vista.</p>'}</div>
  <div class="card" style="margin-top:14px"><h3>Historial de lectura</h3>${rd.map(r=>{const b=S.books[r.bid];return `<div class="row"><div class="t"><b>${esc(b?b.title:'Libro eliminado')}</b><small>${fmtD(r.date)} · págs. ${r.from}–${r.to} (${r.pages})${r.note?' · '+esc(r.note):''}</small></div></div>`}).join('')||'<p class="empty">Aún no has registrado lecturas.</p>'}</div>`;
}
function mBook(m){const b=m.b,rs=Object.values(S.reads).filter(r=>r.bid===b.id).sort((a,c)=>c.date.localeCompare(a.date)||c.id.localeCompare(a.id)).slice(0,8);
  return `<div class="ov" data-a="close"><div class="md" data-stop><h2>${b.id?'Libro':'Nuevo libro'}</h2><label>Título</label><input id="b-t" value="${esc(b.title)}"><label>Autor</label><input id="b-a" value="${esc(b.author)}"><div class="two"><div><label>Páginas totales</label><input id="b-p" inputmode="numeric" value="${b.pages||''}"></div><div><label>Página actual</label><input id="b-c" inputmode="numeric" value="${b.cur||0}"></div></div><label>Estado</label><select id="b-s">${Object.entries(stL).map(([k,v])=>`<option value="${k}" ${k===b.status?'selected':''}>${v}</option>`).join('')}</select>`
  +(b.id?`<div class="card" style="margin:16px 0 0;padding:14px"><h3>Registrar lectura</h3><div class="two"><div><label>Fecha</label><input type="date" id="l-d" value="${today()}"></div><div><label>Hasta la página</label><input id="l-p" inputmode="numeric" placeholder="${b.cur}"></div></div><label>Notas (opcional)</label><input id="l-n"><button class="btn" style="margin:10px 0" data-a="blog">Añadir lectura</button>${rs.map(r=>`<div class="empty">${fmtD(r.date)} · págs. ${r.from}–${r.to} (${r.pages})${r.note?' · '+esc(r.note):''}</div>`).join('')}</div>`:'')
  +`<div class="bar" style="margin-top:16px"><button class="btn" data-a="bsave">Guardar</button><button class="btn g" data-a="close">Cancelar</button>${b.id?'<button class="btn r" data-a="bdel">Eliminar libro</button>':''}</div></div></div>`}
function syncW(){const w=S.workouts[S.act];if(!w)return null;const c=clone(w);
  document.querySelectorAll('[data-wk]').forEach(t=>{const[i,j,f]=t.dataset.wk.split(',');if(c.ex[i]&&c.ex[i].sets[j])c.ex[i].sets[j][f]=num(t.value)});return c}

Object.assign(A,{
  gt:e=>{S.gt=e.dataset.v;render()},lf:e=>{S.lf=e.dataset.v;render()},
  rnew:()=>{S.view='gym';S.modal={k:'rut',r:{name:'',ex:[NEWEX()]}};render()},
  redit:e=>{S.modal={k:'rut',r:clone(S.routines[e.dataset.id])};render()},
  rxadd:()=>{readR();S.modal.r.ex.push(NEWEX());render()},
  rxdel:e=>{readR();S.modal.r.ex.splice(+e.dataset.i,1);render()},
  rsave:()=>{readR();const r=S.modal.r;if(!r.name.trim())return toast('Escribe el nombre de la rutina');
    r.ex=r.ex.filter(x=>x.n);if(!r.ex.length)return toast('Añade al menos un ejercicio con nombre');
    r.name=r.name.trim();r.id=r.id||uid();S.modal=null;put('routines',r.id,r)},
  rdel:()=>{const id=S.modal.r.id;S.modal=null;del('routines',id)},
  wstart:e=>{const r=S.routines[e.dataset.id],hist=finW();
    const w={id:uid(),date:today(),rid:r.id,rname:r.name,fin:false,ex:r.ex.map(x=>{const p=hist.map(h=>h.ex.find(y=>y.n===x.n)).find(Boolean);
      return{n:x.n,note:x.notes||'',sets:Array.from({length:x.s},(_,j)=>{const ps=p&&p.sets[j];return{w:ps&&ps.w?ps.w:x.w,r:ps&&ps.r?ps.r:x.r,ok:false}})}})};
    S.act=w.id;put('workouts',w.id,w)},
  sok:e=>{const c=syncW(),s=c.ex[+e.dataset.i].sets[+e.dataset.j];s.ok=!s.ok;put('workouts',c.id,c)},
  sadd:e=>{const c=syncW(),ss=c.ex[+e.dataset.i].sets,l=ss[ss.length-1]||{w:0,r:0};ss.push({w:l.w,r:l.r,ok:false});put('workouts',c.id,c)},
  wfin:()=>{const c=syncW();c.fin=true;S.act=null;put('workouts',c.id,c);toast('Entrenamiento guardado')},
  wdisc:e=>{if(!S.dc){S.dc=1;e.textContent='Pulsa de nuevo para descartar';return}S.dc=0;const id=S.act;S.act=null;del('workouts',id)},
  wview:e=>{S.modal={k:'wv',id:e.dataset.id};render()},
  wdel:e=>{S.modal=null;del('workouts',e.dataset.id)},
  bnew:()=>{S.view='lec';S.modal={k:'book',b:{title:'',author:'',pages:0,cur:0,status:'pendiente'}};render()},
  bopen:e=>{S.modal={k:'book',b:clone(S.books[e.dataset.id])};render()},
  bsave:()=>{const b=S.modal.b,title=$('#b-t').value.trim();if(!title)return toast('Escribe el título');
    const pages=parseInt($('#b-p').value)||0;let cur=parseInt($('#b-c').value)||0,status=$('#b-s').value;
    if(pages&&cur>pages)return toast('La página actual supera el total');
    if(status==='terminado'&&pages)cur=pages;
    const o={...b,id:b.id||uid(),title,author:$('#b-a').value.trim(),pages,cur,status};S.modal=null;put('books',o.id,o)},
  blog:()=>{const b=S.books[S.modal.b.id],p=parseInt($('#l-p').value),d=$('#l-d').value||today();
    if(!p||p<=b.cur)return toast('Indica una página mayor que la actual ('+b.cur+')');
    if(b.pages&&p>b.pages)return toast('Supera el total de páginas');
    const r={id:uid(),bid:b.id,date:d,from:b.cur+1,to:p,pages:p-b.cur,note:$('#l-n').value.trim()};
    putq('reads',r.id,r);
    const nb={...b,cur:p,status:b.pages&&p>=b.pages?'terminado':(b.status==='terminado'?'terminado':'leyendo')};
    S.modal.b=nb;put('books',nb.id,nb)},
  bdel:()=>{const id=S.modal.b.id;S.modal=null;Object.values(S.reads).filter(r=>r.bid===id).forEach(r=>{delete S.reads[r.id];Store.del('reads',r.id)});del('books',id)}
});
