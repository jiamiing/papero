import type {Layer} from './types';
/** Photo recoloring sits above the base but below typography and pasted objects. */
export function replaceRegionLayer(layers:Layer[],layer:Layer,existingId:string|null){
 if(existingId&&layers.some(l=>l.id===existingId))return layers.map(l=>l.id===existingId?layer:l);
 const firstOverlay=layers.findIndex(l=>l.kind!=='fill'),index=firstOverlay<0?layers.length:firstOverlay;
 return [...layers.slice(0,index),layer,...layers.slice(index)];
}
