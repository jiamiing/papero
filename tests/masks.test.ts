import {test} from 'node:test';import assert from 'node:assert/strict';import {floodMask,bestMaskIndex,maskBounds} from '../src/masks';
function pixels(values:number[]){return new Uint8ClampedArray(values.flatMap(v=>[v,v,v,255]));}
test('a closed dark boundary contains a seeded selection',()=>{const mask=floodMask(pixels([0,0,0,0,255,0,0,0,0]),3,3,1,1,20);assert.deepEqual([...mask],[0,0,0,0,255,0,0,0,0]);});
test('four-connectivity prevents diagonal leaks',()=>{const mask=floodMask(pixels([255,0,0,255]),2,2,0,0,10);assert.deepEqual([...mask],[255,0,0,0]);});
test('row ends do not wrap into the next row',()=>{const mask=floodMask(pixels([0,255,255,0]),2,2,1,0,10);assert.deepEqual([...mask],[0,255,0,0]);});
test('transparent pixels block the flood and bounds remain tight',()=>{const p=pixels([120,120,120]);p[7]=0;const m=floodMask(p,3,1,0,0,10);assert.deepEqual([...m],[255,0,0]);assert.deepEqual(maskBounds(m,3,1),{x:0,y:0,width:1,height:1});assert.equal(maskBounds(new Uint8Array(4),2,2),null);});
test('SAM picks its most confident proposal',()=>assert.equal(bestMaskIndex([.31,.97,.74]),1));
