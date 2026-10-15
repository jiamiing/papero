import {useLayoutEffect,useRef,useState} from 'react';
import {Check,X,ArrowUpRight} from 'lucide-react';
import type {Material} from './types';
import {menuPosition} from './region';
type Props={stage:HTMLElement|null;canvas:HTMLCanvasElement|null;point:{x:number;y:number};color:string;text:string;material:Material;onColor:(color:string)=>void;onText:(text:string)=>void;onMaterial:(kind:Material)=>void;onCharm:(index:number)=>void;onClose:()=>void};
const colors=[['荧光黄','#efff38'],['亮桃红','#ff4e9c'],['钴蓝','#3151ff'],['亮青','#9ceaff'],['酸绿','#a3ff4f'],['浅紫','#bca7ff'],['纸白','#fbfbf4'],['墨黑','#181818']];
const names=['液态银星','冰蓝果冻','桃红毛绒花','钴蓝软星','酸绿透明环','别针与珠链','牛仔心形','铬金属曲线'];
export default function SelectionMenu(p:Props){
 const [tab,setTab]=useState('颜色'),[text,setText]=useState(p.text),[position,setPosition]=useState({left:10,top:40,width:224}),ref=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{const stage=p.stage,canvas=p.canvas,menu=ref.current;if(!stage||!canvas||!menu)return;
  const place=()=>{const s=stage.getBoundingClientRect(),c=canvas.getBoundingClientRect(),mobile=window.innerWidth<=720,width=mobile?Math.min(292,s.width-24):224;menu.style.width=`${width}px`;const m=menu.getBoundingClientRect(),x=c.left-s.left+p.point.x*c.width,y=c.top-s.top+p.point.y*c.height;setPosition({...menuPosition(s,{left:c.left-s.left,top:c.top-s.top,width:c.width,height:c.height},{x,y},m,mobile),width});};
  const ro=new ResizeObserver(place);ro.observe(stage);ro.observe(canvas);ro.observe(menu);place();return()=>ro.disconnect();
 },[p.stage,p.canvas,p.point.x,p.point.y,tab]);
 return <div ref={ref} className="selection-menu" style={position} role="region" aria-label="选区编辑" onPointerDown={e=>e.stopPropagation()}>
  <div className="selection-menu-head"><span><Check size={12}/>这一片，选好了</span><button aria-label="收起选区编辑" onClick={p.onClose}><X size={14}/></button></div>
  <div className="selection-menu-tabs" role="tablist" aria-label="选区编辑方式">{['颜色','文字','素材'].map(t=><button key={t} role="tab" aria-selected={tab===t} onClick={()=>setTab(t)}>{t}</button>)}</div>
  <div className="selection-menu-content" role="tabpanel" aria-label={`${tab}选区`}>
   {tab==='颜色'&&<><div className="context-palette">{colors.map(([name,color])=><button key={name} style={{background:color,color:color==='#181818'?'white':'#171717'}} aria-label={`选区${name}`} aria-pressed={p.color===color} onClick={()=>p.onColor(color)}>{p.color===color&&<Check size={14}/>}</button>)}</div><label className="context-custom">自己的颜色<input aria-label="选区自定义颜色" type="color" value={p.color} onChange={e=>p.onColor(e.target.value)}/></label></>}
   {tab==='文字'&&<><textarea aria-label="选区文字" maxLength={80} value={text} onChange={e=>setText(e.target.value)} placeholder="写点什么，变成画面的一部分"/><button className="context-apply" disabled={!text.trim()} onClick={()=>p.onText(text)}>用文字填满<ArrowUpRight size={14}/></button></>}
   {tab==='素材'&&<><div className="context-finishes">{([{id:'halftone',name:'网点'},{id:'duotone',name:'双色'},{id:'checker',name:'棋盘'},{id:'news',name:'杂志'}] as const).map(f=><button key={f.id} aria-pressed={p.material===f.id} onClick={()=>p.onMaterial(f.id)}><i className={`finish-sample ${f.id}`} style={{'--swatch':p.color} as React.CSSProperties}/>{f.name}</button>)}</div><div className="context-charms">{names.map((name,i)=><button key={name} aria-label={`填充${name}`} onClick={()=>p.onCharm(i)}><span style={{backgroundImage:`url(${import.meta.env.BASE_URL}assets/y2k-materials.webp)`,backgroundPosition:`${i%4/3*100}% ${Math.floor(i/4)*100}%`}}/></button>)}</div><p>点一个，直接填进这一片。</p></>}
  </div>
 </div>;
}
