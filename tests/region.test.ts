import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cleanRegion,menuPosition,regionProposal} from '../src/region';
import {maskBounds} from '../src/masks';
const rectangle=(w:number,h:number,x:number,y:number,rw:number,rh:number)=>{const mask=new Uint8Array(w*h);for(let py=y;py<y+rh;py++)for(let px=x;px<x+rw;px++)mask[py*w+px]=255;return mask;};
test('cleanup fills small gaps and removes separate fragments, keeping the tapped area',()=>{
 const w=80,h=70,m=rectangle(w,h,15,10,45,45);m[30*w+32]=0;for(let y=2;y<5;y++)for(let x=2;x<5;x++)m[y*w+x]=255;
 const out=cleanRegion(m,w,h,20,20);assert.equal(out[30*w+32],255);assert.equal(out[3*w+3],0);assert.deepEqual(maskBounds(out,w,h),{x:15,y:10,width:45,height:45});
});
test('large meaningful openings remain open after cleanup',()=>{
 const w=80,h=70,m=rectangle(w,h,10,8,60,54);for(let y=24;y<44;y++)for(let x=28;x<48;x++)m[y*w+x]=0;
 const out=cleanRegion(m,w,h,15,15);assert.equal(out[33*w+38],0);assert.equal(out[10*w+12],255);
});
test('regions touching a photo edge are not eroded away',()=>{const m=rectangle(30,30,0,0,20,20),out=cleanRegion(m,30,30,5,5);assert.equal(out[0],255);assert.deepEqual(maskBounds(out,30,30),{x:0,y:0,width:20,height:20});});
test('complete seed-containing SAM proposal wins a near-confidence tie',()=>{const size=400,data=new Uint8Array(size*3);data[210]=255;const complete=rectangle(20,20,3,2,14,16);data.set(complete,size);data.fill(255,size*2);assert.equal(regionProposal(data,[.94,.90,.98],20,20,10,10),1);});
test('a high-confidence proposal missing the tap cannot steal the selection',()=>{const size=400,data=new Uint8Array(size*2);data.set(rectangle(20,20,0,0,4,4),0);data.set(rectangle(20,20,8,8,10,10),size);assert.equal(regionProposal(data,[.99,.75],20,20,12,12),1);});
test('context menu stays beside the canvas when there is space',()=>{const p=menuPosition({width:900,height:655},{left:220,top:60,width:390,height:477},{x:500,y:300},{width:224,height:200},false);assert.equal(p.left,622);assert.ok(p.top>=38&&p.top+200<=571);});
test('mobile text and material menus stay inside the stage above the tool row',()=>{for(const height of [156,220,290]){const p=menuPosition({width:358,height:555},{left:47,top:95,width:264,height:322},{x:305,y:410},{width:292,height},true);assert.ok(p.left>=10&&p.left+292<=348);assert.ok(p.top>=38&&p.top+height<=471);}});
