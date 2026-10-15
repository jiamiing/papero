import type {Journal,Layer} from './types';import {uid} from './types';
import {svgURL} from './assets';import {makeCanvas,loadImage} from './canvas';
export function initial():Journal{return{id:uid(),title:'我的第一个随手实验',width:900,height:1100,base:svgURL('<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1100"><path fill="#f3f3ef" d="M0 0h900v1100H0z"/></svg>'),layers:[],updated:Date.now()};}
export async function makeDemo():Promise<Journal>{const j=initial(),c=makeCanvas(900,1100),ctx=c.getContext('2d')!,photo=await loadImage(`${import.meta.env.BASE_URL}assets/demo-photo.jpg`);ctx.fillStyle='#fcfcf6';ctx.fillRect(0,0,900,1100);
 ctx.drawImage(photo,0,0,photo.width,photo.width*825/900,0,0,900,825);
 const base=c.toDataURL('image/png');
 const layer=(name:string,partial:Partial<Layer>):Layer=>({id:uid(),name,kind:'text',x:450,y:450,scale:1,rotation:0,opacity:1,depth:.3,visible:true,...partial});
 const block=makeCanvas(410,96),b=block.getContext('2d')!;b.fillStyle='#efff38';b.fillRect(0,0,410,96);
 return{...j,title:'今天有一点，不一样。',base,layers:[
 layer('荧光黄标题底',{kind:'image',src:block.toDataURL(),x:656,y:242,rotation:-5}),
 layer('NOT QUITE',{text:'NOT QUITE',font:'headline',color:'#171717',x:655,y:241,scale:.57,rotation:-5}),
 layer('ORDINARY.',{text:'ORDINARY.',font:'headline',color:'#171717',x:574,y:326,scale:.69,rotation:-5}),
 layer('主标题',{text:'日常之外，',font:'headline',color:'#171717',x:362,y:916,scale:.93}),
 layer('小字',{text:'A LITTLE OFF. A LITTLE MORE YOU.',font:'mono',color:'#171717',x:371,y:1014,scale:.35}),
 layer('注脚',{text:'001 / YOUR EVERYDAY REMIX',font:'mono',color:'#171717',x:422,y:1067,scale:.23})]};}
