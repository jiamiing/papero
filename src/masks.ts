/** Seed-relative colour region growing. 4-connected to avoid leaking through corners. */
export function floodMask(rgba:Uint8ClampedArray,w:number,h:number,x:number,y:number,tolerance:number):Uint8Array {
 const mask=new Uint8Array(w*h), seen=new Uint8Array(w*h), queue=new Int32Array(w*h);
 const seed=Math.min(h-1,Math.max(0,Math.floor(y)))*w+Math.min(w-1,Math.max(0,Math.floor(x)));
 const r=rgba[seed*4],g=rgba[seed*4+1],b=rgba[seed*4+2]; let head=0,tail=1;queue[0]=seed;seen[seed]=1;
 while(head<tail){const p=queue[head++],i=p*4; if(rgba[i+3]===0||Math.hypot(rgba[i]-r,rgba[i+1]-g,rgba[i+2]-b)>tolerance)continue; mask[p]=255;
 const neighbors=[p-w,p+w,...(p%w>0?[p-1]:[]),...(p%w<w-1?[p+1]:[])];for(const n of neighbors)if(n>=0&&n<w*h&&!seen[n]){seen[n]=1;queue[tail++]=n;}}
 return mask;
}
export function bestMaskIndex(scores:ArrayLike<number>){let index=0;for(let i=1;i<scores.length;i++)if(scores[i]>scores[index])index=i;return index;}
export function maskBounds(mask:Uint8Array,w:number,h:number){let x=w,y=h,right=-1,bottom=-1;for(let p=0;p<mask.length;p++)if(mask[p]){x=Math.min(x,p%w);right=Math.max(right,p%w);y=Math.min(y,Math.floor(p/w));bottom=Math.max(bottom,Math.floor(p/w));}return right<0?null:{x,y,width:right-x+1,height:bottom-y+1};}
