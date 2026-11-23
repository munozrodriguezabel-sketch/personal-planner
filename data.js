/* Operaciones de datos (todo pasa por Store) y lógica de recurrencia */
function toast(m,ok){const e=document.createElement('div');e.className='toast';if(ok)e.style.cssText='background:var(--ok);color:#0d0d11';e.textContent=m;document.body.append(e);setTimeout(()=>e.remove(),2800)}
function put(col,id,obj){S[col][id]=obj;render();Store.set(col,id,obj).catch(()=>toast('Error al guardar'))}
function del(col,id){delete S[col][id];render();Store.del(col,id).catch(()=>toast('Error al eliminar'))}
function setDone(key,on){if(on)S.done[key]=1;else delete S.done[key];render();(on?Store.set('done',key,{k:key}):Store.del('done',key)).catch(()=>toast('Error al guardar'))}

function occ(date){
  const d=pd(date),w=dow(d);
  return Object.values(S.tasks).filter(t=>t.days&&t.days.length?(t.days.includes(w)&&date>=t.date&&(!t.end||date<=t.end)&&!(t.skip||[]).includes(date)):t.date===date)
   .sort((a,b)=>(a.time||'99').localeCompare(b.time||'99'));
}
const isDone=(t,date)=>!!S.done['t_'+t.id+'_'+date];
const habitsOn=date=>Object.values(S.habits).filter(h=>!h.days||!h.days.length||h.days.includes(dow(pd(date))));
const hDone=(h,date)=>!!S.done['h_'+h.id+'_'+date];

function taskRow(t,date){
  const dn=isDone(t,date),rep=t.days&&t.days.length;
  return `<div class="row ${dn?'d':''}"><button class="ck ${dn?'on':''}" data-a="tk" data-id="${t.id}" data-d="${date}">${dn?'✓':''}</button>
  <div class="t" data-a="edit" data-id="${t.id}" data-d="${date}"><b>${esc(t.title)}</b><small>${t.time?esc(t.time)+' · ':''}${esc(t.cat)}${rep?' · ↻':''}</small></div>
  <span class="dot" style="background:${PRI[t.pri]||PRI.media}" title="Prioridad ${esc(t.pri)}"></span>
  <button class="st ${t.star?'on':''}" data-a="star" data-id="${t.id}" title="Prioridad del día">★</button></div>`;
}
function habitRow(h,date){const dn=hDone(h,date);
  return `<div class="row ${dn?'d':''}"><button class="ck ${dn?'on':''}" data-a="hk" data-id="${h.id}" data-d="${date}">${dn?'✓':''}</button><div class="t" data-a="hedit" data-id="${h.id}"><b>${esc(h.name)}</b></div></div>`}

