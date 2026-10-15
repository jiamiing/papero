import {Capacitor} from '@capacitor/core';
export async function exportFile(blob:Blob,name:string){if(Capacitor.isNativePlatform()){
 const {Filesystem,Directory}=await import('@capacitor/filesystem');const {Share}=await import('@capacitor/share');
 const data=await new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve((r.result as string).split(',')[1]);r.onerror=()=>reject(r.error);r.readAsDataURL(blob);});
 const result=await Filesystem.writeFile({path:name,data,directory:Directory.Cache});await Share.share({title:'Papero',files:[result.uri]});
 }else{const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}}
