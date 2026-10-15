export type Material = 'news'|'sky'|'ink'|'checker'|'pink'|'type'|'solid'|'halftone'|'duotone';
export type TextStyle = 'headline'|'serif'|'mono';
export type Layer = {id:string;name:string;kind:'image'|'text'|'sticker'|'fill';src?:string;text?:string;material?:Material;color?:string;font?:TextStyle;x:number;y:number;scale:number;rotation:number;opacity:number;depth:number;visible:boolean};
export type Journal = {id:string;title:string;width:number;height:number;base:string;layers:Layer[];updated:number;depthMap?:string};
export type Tool = 'select'|'move'|'lasso';
export const uid=()=>crypto.randomUUID();
