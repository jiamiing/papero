import {SamModel,SamProcessor,AutoProcessor,RawImage,pipeline,env} from '@huggingface/transformers';
import {bestMaskIndex} from './masks';
import {outlinePath} from './selection';
env.allowLocalModels=false;
if(env.backends.onnx.wasm)env.backends.onnx.wasm.numThreads=1;
let sam:SamModel|undefined;
let processor:SamProcessor|undefined;
let estimator:any;
let cachedSource='',image:RawImage|undefined,embeddings:any;
self.onmessage=async(e:MessageEvent)=>{const {type,src,x,y,requestId,imageId}=e.data;
 const emit=(data:Record<string,unknown>,transfer:Transferable[]=[])=>self.postMessage({...data,requestId,imageId},transfer);
 const progress=(p:any)=>{if(p.status==='progress')emit({type:'progress',text:`准备本地识别 ${Math.round(p.progress||0)}%`});};
 try{if(type==='segment'){
 emit({type:'progress',text:sam?'正在细化轮廓…':'首次使用需要下载模型，照片留在本机'});
 sam??=await SamModel.from_pretrained('Xenova/slimsam-77-uniform',{device:'wasm',dtype:'q8',progress_callback:progress}) as SamModel;
 processor??=await AutoProcessor.from_pretrained('Xenova/slimsam-77-uniform') as SamProcessor;
 if(cachedSource!==src){image=await RawImage.read(src);embeddings=undefined;cachedSource=src;}
 const inputs=await processor(image!,{input_points:[[[x,y]]]});
 embeddings??=await sam.get_image_embeddings(inputs);
 const result=await sam({...inputs,...embeddings});
 const masks=await processor.post_process_masks(result.pred_masks,inputs.original_sizes,inputs.reshaped_input_sizes);
 const index=bestMaskIndex(result.iou_scores.data as Float32Array),size=image!.width*image!.height,data=new Uint8Array(size);
 for(let i=0;i<size;i++)data[i]=masks[0].data[index*size+i]?255:0;
 emit({type:'mask',data,width:image!.width,height:image!.height,path:outlinePath(data,image!.width,image!.height)},[data.buffer]);
 }else if(type==='depth'){
 emit({type:'progress',text:'在本机估计照片深度…'});
 estimator??=await pipeline('depth-estimation','onnx-community/depth-anything-v2-small',{device:'wasm',dtype:'q8',progress_callback:progress});
 const {depth}=await estimator(src),data=new Uint8Array(depth.data);emit({type:'depth',data,width:depth.width,height:depth.height,channels:depth.channels},[data.buffer]);
 }}catch(err){emit({type:'error',text:`识别暂时不可用：${err instanceof Error?err.message:String(err)}。当前选区仍可继续编辑。`});}};
