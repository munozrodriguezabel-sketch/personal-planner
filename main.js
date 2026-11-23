/* Eventos globales, exportar/importar y arranque */
document.addEventListener('click',ev=>{
  if(ev.target.closest('[data-stop]')&&!ev.target.closest('[data-a]'))return;
  const e=ev.target.closest('[data-a]');if(!e)return;
  if(e.classList.contains('ov')&&ev.target!==e)return;
  const f=A[e.dataset.a];if(f)f(e)});

document.addEventListener('change',ev=>{
  const t=ev.target;
  if(t.id==='dsel'&&t.value){S.date=t.value;render()}
  if(t.dataset&&t.dataset.wk){const c=syncW();if(c)putq('workouts',c.id,c)}
  if(t.id==='gesel'){S.ge=t.value;render()}
  if(t.id==='impf'&&t.files[0]){
    t.files[0].text().then(x=>Store.importAll(JSON.parse(x))).then(n=>toast(n+' registros importados',true)).catch(()=>toast('Archivo no válido'));
    t.value='';
  }
});

Object.assign(A,{
  exp:()=>{const b=new Blob([JSON.stringify(Store.exportAll(),null,1)],{type:'application/json'}),a=document.createElement('a');
    a.href=URL.createObjectURL(b);a.download='personal-planner-'+today()+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)},
  imp:()=>$('#impf').click()
});

(async()=>{
  render();
  try{
    await Store.init();S.status=Store.label;
    COLS.forEach(c=>Store.subscribe(c,o=>{
      const m=c==='done'?Object.fromEntries(Object.keys(o).map(k=>[k,1])):o;S[c]=m;
      if(c==='workouts'&&!S.act){const w=Object.values(m).find(x=>!x.fin);if(w)S.act=w.id}
      if(!S.modal&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))render()}));
    render();
  }catch(e){S.status='Error al abrir el almacenamiento';render()}
})();
