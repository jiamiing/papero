import {test} from 'node:test';import assert from 'node:assert/strict';
import {currentSelection,imagePoint,outlinePath,selectionSize} from '../src/selection';
test('a newer tap wins when an older worker result arrives late',()=>{const current={requestId:12,imageId:'photo-a'};assert.equal(currentSelection({requestId:11,imageId:'photo-a'},current),false);assert.equal(currentSelection({requestId:12,imageId:'photo-a'},current),true);});
test('a result for a replaced photo is discarded even if request numbers match',()=>assert.equal(currentSelection({requestId:12,imageId:'old-photo'},{requestId:12,imageId:'new-photo'}),false));
test('touch positions account for page position and display scaling',()=>{assert.deepEqual(imagePoint(250,500,{left:100,top:200,width:300,height:600},900,1800),{x:450,y:900});assert.deepEqual(imagePoint(0,9999,{left:100,top:200,width:300,height:600},900,1800),{x:0,y:1799});});
test('selection processing stays bounded while preserving image proportions',()=>{assert.deepEqual(selectionSize(1600,1200),{width:900,height:675});assert.deepEqual(selectionSize(320,480),{width:320,height:480});});
test('the region boundary is one continuous loop without internal pixel edges',()=>{assert.equal(outlinePath(new Uint8Array([255,255]),2,1),'M0 0L2 0L2 1L0 1Z');assert.equal(outlinePath(new Uint8Array([255,0]),2,1),'M0 0L1 0L1 1L0 1Z');});
