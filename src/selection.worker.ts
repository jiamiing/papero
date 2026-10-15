import {floodMask} from './masks';
import {outlinePath} from './selection';
let pixels:Uint8ClampedArray|undefined,width=0,height=0,imageId='';
self.onmessage=(event:MessageEvent)=>{const m=event.data;
 if(m.type==='image'){pixels=m.pixels;width=m.width;height=m.height;imageId=m.imageId;return;}
 if(m.type==='select'&&pixels&&m.imageId===imageId){const started=performance.now();const mask=floodMask(pixels,width,height,m.x,m.y,m.tolerance);self.postMessage({type:'selection',requestId:m.requestId,imageId,width,height,path:outlinePath(mask,width,height),data:mask,elapsed:performance.now()-started},[mask.buffer]);}
};
