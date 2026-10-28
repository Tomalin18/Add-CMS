import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFileSync} from 'node:fs';
import net from 'node:net';
const pkg=JSON.parse(readFileSync('package.json','utf8'));assert.ok(['add-cms-portability-fixture','add-cms-payload-fixture'].includes(pkg.name));let checks=0;
const safe=Object.fromEntries(['PATH','HOME','TMPDIR','TEMP','TMP','LANG','USER','SHELL'].filter(key=>process.env[key]).map(key=>[key,process.env[key]]));
for(const enabled of [false,true]){
 const socket=net.createServer();await new Promise(r=>socket.listen(0,'127.0.0.1',r));const port=socket.address().port;await new Promise(r=>socket.close(r));
 const child=spawn(process.execPath,['fixture/serve.mjs'],{cwd:process.cwd(),env:{...safe,PORT:String(port),...(enabled?{CMS_INTERNAL_FIXTURE:'1'}:{})},stdio:['ignore','pipe','pipe']});let logs='';for(const output of [child.stdout,child.stderr])output.on('data',chunk=>logs=(logs+chunk).slice(-8000));const request=url=>fetch('http://127.0.0.1:'+port+url,{signal:AbortSignal.timeout(10000)});
 try{
  let response;for(let i=0;i<100;i++){if(child.exitCode!==null)throw Error(logs);try{response=await request('/');break;}catch{}await new Promise(r=>setTimeout(r,50));}
  assert.equal(response?.status,200);checks++;const html=await response.text();assert.ok(html.includes('</html>')&&!html.includes('retrofit-editor'));checks++;
  const resources=[...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1]);assert.deepEqual(resources,['/public.css']);checks++;
  for(const url of resources){const body=await(await request(url)).text();assert.ok(!/retrofit-|ProseMirror|data-puck|react-aria/.test(body));checks++;}
  assert.equal((await request('/private-assets/editor.js')).status,enabled?200:404);checks++;assert.equal((await request('/private-assets/editor.css')).status,enabled?200:404);checks++;
  const editor=await request('/integration-fixture'),body=await editor.text();assert.equal(editor.status,enabled?200:404);checks++;if(enabled){assert.ok(body.includes('id="fixture-editor"')&&body.includes('/private-assets/editor.css'));checks++;const css=await(await request('/private-assets/editor.css')).text();assert.ok(css.includes('retrofit-inline-controls'));checks++;}
 }catch(error){console.error(logs);throw error;}finally{child.kill('SIGTERM');await new Promise(resolve=>{if(child.exitCode!==null)resolve();else{child.once('exit',resolve);setTimeout(()=>{child.kill('SIGKILL');resolve();},5000).unref();}});}
}
console.log('CMS_PORTABLE_HTTP_RESULT '+JSON.stringify({assertions:checks,publicReactPrerender:true,fixtureRouteDisabledByDefault:true,privateEditorAssetsDisabledByDefault:true,publicEditorJSAndCSSAbsent:true,productionAuthenticationClaimed:false,browserOperated:false}));
