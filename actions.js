/* Acciones de interfaz: tareas y hábitos */
const readDays=()=>[...document.querySelectorAll('#dch .chip.on')].map(b=>+b.dataset.i);
const A={
  nav:e=>{S.view=e.dataset.v;render()},
  tk:e=>setDone('t_'+e.dataset.id+'_'+e.dataset.d,!S.done['t_'+e.dataset.id+'_'+e.dataset.d]),
  hk:e=>setDone('h_'+e.dataset.id+'_'+e.dataset.d,!S.done['h_'+e.dataset.id+'_'+e.dataset.d]),
  star:e=>{const t=S.tasks[e.dataset.id];put('tasks',t.id,{...t,star:!t.star})},
  dd:e=>{const n=+e.dataset.n;S.date=n?addD(S.date,n):today();render()},
  mm:e=>{const[y,m]=S.cm.split('-').map(Number),d=new Date(y,m-1+ +e.dataset.n,1);S.cm=iso(d).slice(0,7);render()},
  pick:e=>{S.date=e.dataset.d;render()},
  new:()=>{S.modal={k:'task',t:{title:'',desc:'',date:S.date,time:'',cat:'Personal',pri:'media',days:[],end:'',skip:[],star:false}};render()},
  edit:e=>{S.modal={k:'task',d:e.dataset.d,t:{days:[],skip:[],...S.tasks[e.dataset.id]}};render()},
  close:()=>{S.modal=null;render()},
  ch:e=>e.classList.toggle('on'),
  pre:e=>{const v=e.dataset.v?e.dataset.v.split(',').map(Number):[];document.querySelectorAll('#dch .chip').forEach(b=>b.classList.toggle('on',v.includes(+b.dataset.i)))},
  save:()=>{const t=S.modal.t,title=$('#f-title').value.trim();if(!title)return toast('Escribe un título');
    const days=readDays(),date=$('#f-date').value||today(),end=$('#f-end').value;
    if(end&&end<date)return toast('La fecha de fin es anterior al inicio');
    const o={...t,id:t.id||uid(),title,desc:$('#f-desc').value,date,time:$('#f-time').value,cat:$('#f-cat').value,pri:$('#f-pri').value,days,end,skip:t.skip||[]};
    S.modal=null;put('tasks',o.id,o)},
  skip:()=>{const t=S.modal.t,d=S.modal.d;S.modal=null;put('tasks',t.id,{...t,skip:[...(t.skip||[]),d]})},
  delt:()=>{const id=S.modal.t.id;S.modal=null;del('tasks',id)},
  hnew:()=>{S.modal={k:'hab',h:{name:'',days:[]}};render()},
  hedit:e=>{S.modal={k:'hab',h:{days:[],...S.habits[e.dataset.id]}};render()},
  hsave:()=>{const h=S.modal.h,name=$('#h-name').value.trim();if(!name)return toast('Escribe un nombre');
    const o={...h,id:h.id||uid(),name,days:readDays()};S.modal=null;put('habits',o.id,o)},
  hdel:()=>{const id=S.modal.h.id;S.modal=null;del('habits',id)}
};
