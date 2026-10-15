import {maskBounds} from './masks';

/** Close hairline cracks in linear time; clipping at image borders preserves edge regions. */
function morph(mask:Uint8Array,w:number,h:number,r:number,grow:boolean){
 const horizontal=new Uint8Array(mask.length),out=new Uint8Array(mask.length);
 for(let y=0;y<h;y++){let sum=0;for(let x=0;x<w+r;x++){if(x<w&&mask[y*w+x])sum++;if(x>2*r&&mask[y*w+x-2*r-1])sum--;const p=x-r;if(p>=0&&p<w){const count=Math.min(w-1,p+r)-Math.max(0,p-r)+1;horizontal[y*w+p]=(grow?sum>0:sum===count)?255:0;}}}
 for(let x=0;x<w;x++){let sum=0;for(let y=0;y<h+r;y++){if(y<h&&horizontal[y*w+x])sum++;if(y>2*r&&horizontal[(y-2*r-1)*w+x])sum--;const p=y-r;if(p>=0&&p<h){const count=Math.min(h-1,p+r)-Math.max(0,p-r)+1;out[p*w+x]=(grow?sum>0:sum===count)?255:0;}}}
 return out;
}

/** Keep the tapped component, remove stray islands and fill only small enclosed gaps. */
export function cleanRegion(input:Uint8Array,w:number,h:number,x:number,y:number){
 const radius=Math.max(1,Math.round(Math.max(w,h)/400));
 const mask=morph(morph(input,w,h,radius,true),w,h,radius,false);
 const seen=new Uint8Array(mask.length),queue=new Int32Array(mask.length);
 const seed=Math.max(0,Math.min(h-1,Math.floor(y)))*w+Math.max(0,Math.min(w-1,Math.floor(x)));
 let kept:number[]=[],largest:number[]=[];
 function walk(start:number,value:boolean){let head=0,tail=1;queue[0]=start;seen[start]=1;let border=false;const points:number[]=[];while(head<tail){const p=queue[head++],px=p%w,py=Math.floor(p/w);points.push(p);if(px===0||py===0||px===w-1||py===h-1)border=true;for(const n of [py>0?p-w:-1,py<h-1?p+w:-1,px>0?p-1:-1,px<w-1?p+1:-1])if(n>=0&&!seen[n]&&!!mask[n]===value){seen[n]=1;queue[tail++]=n;}}return{points,border};}
 for(let p=0;p<mask.length;p++)if(mask[p]&&!seen[p]){const {points}=walk(p,true);if(points.length>largest.length)largest=points;if(points.includes(seed))kept=points;}
 if(!kept.length)kept=largest;
 mask.fill(0);for(const p of kept)mask[p]=255;
 seen.fill(0);const holeLimit=Math.max(48,kept.length*.025);
 for(let p=0;p<mask.length;p++)if(!mask[p]&&!seen[p]){const {points,border}=walk(p,false);if(!border&&points.length<=holeLimit)for(const q of points)mask[q]=255;}
 return mask;
}

/** Prefer a complete, seed-containing proposal when SAM gives similar confidence. */
export function regionProposal(data:ArrayLike<number|bigint>,scores:ArrayLike<number>,w:number,h:number,x:number,y:number){
 const size=w*h,seed=Math.max(0,Math.min(h-1,Math.floor(y)))*w+Math.max(0,Math.min(w-1,Math.floor(x)));
 const proposals=Array.from({length:scores.length},(_,index)=>{let area=0;for(let p=0;p<size;p++)if(data[index*size+p])area++;return{index,area,score:Number(scores[index]),contains:!!data[index*size+seed]};});
 let valid=proposals.filter(p=>p.contains&&p.area>=size*.002&&p.area<size*.97);if(!valid.length)valid=proposals.filter(p=>p.contains);if(!valid.length)valid=proposals;
 const best=Math.max(...valid.map(p=>p.score));return valid.filter(p=>p.score>=best-.065).sort((a,b)=>b.area-a.area)[0]?.index||0;
}

export function regionCenter(mask:Uint8Array,w:number,h:number){const b=maskBounds(mask,w,h);return b?{x:b.x+b.width/2,y:b.y+b.height/2}:null;}

/** Keep the contextual editor inside the stage, including narrow mobile viewports. */
export function menuPosition(stage:{width:number;height:number},canvas:{left:number;top:number;width:number;height:number},point:{x:number;y:number},menu:{width:number;height:number},mobile:boolean){
 const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(Math.max(min,max),n));
 let x=mobile?(stage.width-menu.width)/2:canvas.left+canvas.width+12;
 if(!mobile&&x+menu.width>stage.width-10){if(x+menu.width<=stage.width+16)x=stage.width-menu.width-10;else x=canvas.left-menu.width-12;}
 if(x<10)x=point.x-menu.width/2;
 const y=mobile?canvas.top+canvas.height+12:point.y-menu.height/2;
 return{left:clamp(x,10,stage.width-menu.width-10),top:clamp(y,38,stage.height-menu.height-84)};
}
