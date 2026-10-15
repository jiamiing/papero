export type Material = 'news'|'sky'|'ink'|'checker'|'pink'|'type';
export type Layer = {id:string;name:string;kind:'image'|'text'|'sticker'|'fill';src?:string;text?:string;material?:Material;x:number;y:number;scale:number;rotation:number;opacity:number;depth:number;visible:boolean};
export type Journal = {id:string;title:string;width:number;height:number;base:string;layers:Layer[];updated:number;depthMap?:string};
export type Tool = 'move'|'wand'|'lasso'|'ai';
export const uid=()=>crypto.randomUUID();
