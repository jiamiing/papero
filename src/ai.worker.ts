import {SamModel,SamProcessor,AutoProcessor,RawImage,pipeline,env} from '@huggingface/transformers';
import {bestMaskIndex} from './masks';
env.allowLocalModels=false;
// One thread avoids cross-origin-isolation requirements on static hosting and WebViews.
if(env.backends.onnx.wasm)env.backends.onnx.wasm.numThreads=1;
let sam:Awaited<ReturnType<typeof SamModel.from_pretrained>>|undefined;
let processor:SamProcessor|undefined;
let estimator:any;
const progress=(p:any)=>{if(p.status==='progress')self.postMessage({type:'progress',text:`下载模型 ${Math.round(p.progress||0)}%`});};
self.onmessage=async(e:MessageEvent)=>{const {type,src,x,y}=e.data;try{
 if(type==='segment'){
 self.postMessage({type:'progress',text:sam?'本地识别区域…':'首次加载分割模型，照片留在本机…'});
 sam??=await SamModel.from_pretrained('Xenova/slimsam-77-uniform',{device:'wasm',dtype:'q8',progress_callback:progress});
 processor??=await AutoProcessor.from_pretrained('Xenova/slimsam-77-uniform') as SamProcessor;
 const image=await RawImage.read(src);const inputs=await processor(image,{input_points:[[[x,y]]]});const result=await sam(inputs);
 const masks=await processor.post_process_masks(result.pred_masks,inputs.original_sizes,inputs.reshaped_input_sizes);
 const index=bestMaskIndex(result.iou_scores.data as Float32Array),size=image.width*image.height;
 const data=new Uint8Array(size);for(let i=0;i<size;i++)data[i]=masks[0].data[index*size+i]?255:0;
 self.postMessage({type:'mask',data,width:image.width,height:image.height},[data.buffer]);
 }else if(type==='depth'){
 self.postMessage({type:'progress',text:'首次加载深度模型，照片留在本机…'});
 estimator??=await pipeline('depth-estimation','onnx-community/depth-anything-v2-small',{device:'wasm',dtype:'q8',progress_callback:progress});
 const {depth}=await estimator(src);const data=new Uint8Array(depth.data);self.postMessage({type:'depth',data,width:depth.width,height:depth.height,channels:depth.channels},[data.buffer]);
 }
 }catch(err){self.postMessage({type:'error',text:`模型未能运行：${err instanceof Error?err.message:String(err)}。可以使用魔棒或圈选。`});}};
