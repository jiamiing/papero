/** Work at a bounded resolution so selection latency stays independent of upload size. */
export function selectionSize(width:number,height:number,max=900){const ratio=Math.min(1,max/Math.max(width,height));return{width:Math.max(1,Math.round(width*ratio)),height:Math.max(1,Math.round(height*ratio))};}
export function imagePoint(clientX:number,clientY:number,rect:{left:number;top:number;width:number;height:number},width:number,height:number){return{x:Math.max(0,Math.min(width-1,(clientX-rect.left)/rect.width*width)),y:Math.max(0,Math.min(height-1,(clientY-rect.top)/rect.height*height))};}
export function currentSelection(result:{requestId:number;imageId:string},current:{requestId:number;imageId:string}){return result.requestId===current.requestId&&result.imageId===current.imageId;}
/** Trace joined contours, so dashes flow around an area instead of restarting at every pixel. */
export function outlinePath(mask:Uint8Array,w:number,h:number){
 const stride=w+1,edges=new Map<number,number[]>();
 const add=(a:number,b:number)=>{const list=edges.get(a)||[];list.push(b);edges.set(a,list);};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const p=y*w+x,a=y*stride+x;if(!mask[p])continue;if(y===0||!mask[p-w])add(a,a+1);if(x===w-1||!mask[p+1])add(a+1,a+stride+1);if(y===h-1||!mask[p+w])add(a+stride+1,a+stride);if(x===0||!mask[p-1])add(a+stride,a);}
 let path='';
 while(edges.size){const start=edges.keys().next().value!;let p=start;const points:number[]=[];do{points.push(p);const next=edges.get(p);if(!next?.length)break;const q=next.pop()!;if(!next.length)edges.delete(p);p=q;}while(p!==start);
  const corners=points.filter((v,i)=>{const prev=points[(i+points.length-1)%points.length],next=points[(i+1)%points.length];return v-prev!==next-v;});
  if(corners.length>2)path+=corners.map((v,i)=>`${i?'L':'M'}${v%stride} ${Math.floor(v/stride)}`).join('')+'Z';
 }
 return path;
}
