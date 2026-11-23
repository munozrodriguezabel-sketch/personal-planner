/* Utilidades, constantes y estado global de la aplicación */
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const CATS=['Estudios','Hockey','Gimnasio','Personal','Lectura','Organización','Otros'];
const CC={Estudios:'#8b7cf6',Hockey:'#60a5fa',Gimnasio:'#f87171',Personal:'#f472b6',Lectura:'#fbbf24',Organización:'#2dd4bf',Otros:'#8b8b9e'};
const PRI={alta:'#f87171',media:'#fbbf24',baja:'#60a5fa'};
const DN=['L','M','X','J','V','S','D'],DL=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const p2=n=>String(n).padStart(2,'0');
const iso=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
const pd=s=>{const[y,m,d]=s.split('-');return new Date(y,m-1,d)};
const dow=d=>(d.getDay()+6)%7;
const addD=(s,n)=>{const d=pd(s);d.setDate(d.getDate()+n);return iso(d)};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const today=()=>iso(new Date());
const S={tasks:{},habits:{},done:{},routines:{},workouts:{},books:{},reads:{},gt:'rut',ge:'',lf:'todos',act:null,dc:0,view:'hoy',date:today(),cm:today().slice(0,7),modal:null,status:'Conectando…'};
const NAV=[['hoy','◎','Hoy'],['tareas','✓','Tareas'],['cal','▦','Calendario'],['habitos','↻','Hábitos'],['gym','◆','Gimnasio'],['lec','▤','Lectura']];

