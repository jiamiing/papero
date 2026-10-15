import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const source=readFileSync(new URL('../public/sw.js',import.meta.url),'utf8');
function setup(){const handlers:Record<string,(event:any)=>void>={},deleted:string[]=[];runInNewContext(source,{URL,self:{registration:{scope:'https://jiamiing.github.io/papero/'},addEventListener:(name:string,handler:any)=>{handlers[name]=handler;},clients:{claim(){}},skipWaiting(){}},caches:{keys:async()=>['portfolio-cache','another-app-v3','papero-journal-shell-v1','papero-journal-shell-v2'],delete:async(key:string)=>{deleted.push(key);return true;}}});return{handlers,deleted};}
test('activation preserves every other project cache',async()=>{const {handlers,deleted}=setup();let task:Promise<unknown>|undefined;handlers.activate({waitUntil:(p:Promise<unknown>)=>{task=p;}});await task;assert.deepEqual(deleted,['papero-journal-shell-v1']);});
test('fetch interception stays inside the Papero directory',()=>{const {handlers}=setup();for(const url of ['https://jiamiing.github.io/','https://jiamiing.github.io/portfolio/main.js','https://example.com/papero/main.js'])handlers.fetch({request:{url,method:'GET'},respondWith:()=>assert.fail('another project was intercepted')});});
