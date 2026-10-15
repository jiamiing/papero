import {floodMask} from './masks';
import {outlinePath} from './selection';
import {cleanRegion} from './region';
let pixels:Uint8ClampedArray|undefined,width=0,height=0,imageId='';
self.onmessage=(event:MessageEvent)=>{const m=event.data;
 if(m.type==='image'){pixels=m.pixels;width=m.width;height=m.height;imageId=m.imageId;return;}
 if(m.type==='select'&&pixels&&m.imageId===imageId){const raw=floodMask(pixels,width,height,m.x,m.y,m.tolerance),mask=cleanRegion(raw,width,height,m.x,m.y);self.postMessage({type:'selection',requestId:m.requestId,imageId,width,height,path:outlinePath(mask,width,height),data:mask},[mask.buffer]);}
};
