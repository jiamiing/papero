import {SamModel,SamProcessor,AutoProcessor,RawImage,pipeline,env} from '@huggingface/transformers';
import {cleanRegion,regionProposal} from './region';
import {outlinePath} from './selection';
env.allowLocalModels=false;
if(env.backends.onnx.wasm)env.backends.onnx.wasm.numThreads=1;
type Job={type:'prepare'|'segment'|'depth';src:string;requestId:number;imageId:string;x?:number;y?:number};
let sam:SamModel|undefined,processor:SamProcessor|undefined,estimator:any;
let cachedImageId='',image:RawImage|undefined,embeddings:any;
let pending:Job|undefined,running=false,active:Job|undefined;
const emit=(job:Job,data:Record<string,unknown>,transfer:Transferable[]=[])=>self.postMessage({...data,requestId:job.requestId,imageId:job.imageId},transfer);
const progress=(p:any)=>{if(active&&p.status==='progress')emit(active,{type:'progress',text:`首次准备本地模型 ${Math.round(p.progress||0)}%`});};
async function prepare(job:Job){
 if(!sam){emit(job,{type:'progress',text:'首次准备本地模型，照片留在本机'});sam=await SamModel.from_pretrained('Xenova/slimsam-77-uniform',{device:'wasm',dtype:'q8',progress_callback:progress}) as SamModel;}
 processor??=await AutoProcessor.from_pretrained('Xenova/slimsam-77-uniform') as SamProcessor;
 if(cachedImageId!==job.imageId){
  emit(job,{type:'progress',text:'正在读懂这张照片…'});
  image=await RawImage.read(job.src);embeddings=undefined;
  const inputs=await processor(image);embeddings=await sam.get_image_embeddings(inputs);cachedImageId=job.imageId;
 }
 emit(job,{type:'ready'});
}
async function drain(){
 if(running)return;running=true;
 while(pending){const job=pending;pending=undefined;active=job;
  try{
   if(job.type==='depth'){
    emit(job,{type:'progress',text:'在本机估计照片深度…'});
    estimator??=await pipeline('depth-estimation','onnx-community/depth-anything-v2-small',{device:'wasm',dtype:'q8',progress_callback:progress});
    const {depth}=await estimator(job.src),data=new Uint8Array(depth.data);emit(job,{type:'depth',data,width:depth.width,height:depth.height,channels:depth.channels},[data.buffer]);
   }else{
    await prepare(job);
    if(job.type==='segment'){
     // A queued newer tap wins before expensive decoding; the app also guards returned IDs.
     const queued=(()=>pending as Job|undefined)();if(queued&&queued.imageId===job.imageId&&queued.type==='segment')continue;
     const x=job.x!,y=job.y!,inputs=await processor!(image!,{input_points:[[[x,y]]]});
     const result=await sam!({...inputs,...embeddings});
     const masks=await processor!.post_process_masks(result.pred_masks,inputs.original_sizes,inputs.reshaped_input_sizes);
     const w=image!.width,h=image!.height,size=w*h,index=regionProposal(masks[0].data,result.iou_scores.data as Float32Array,w,h,x,y),raw=new Uint8Array(size);
     for(let i=0;i<size;i++)raw[i]=masks[0].data[index*size+i]?255:0;
     const data=cleanRegion(raw,w,h,x,y);emit(job,{type:'mask',data,width:w,height:h,path:outlinePath(data,w,h)},[data.buffer]);
    }
   }
  }catch(err){emit(job,{type:'error',task:job.type,text:err instanceof Error?err.message:String(err)});}
 }
 active=undefined;running=false;
}
self.onmessage=(e:MessageEvent<Job>)=>{pending=e.data;void drain();};
