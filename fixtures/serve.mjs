import {createServer} from 'node:http';
import {readFileSync,readdirSync} from 'node:fs';
import path from 'node:path';
const directory=path.resolve('.fixture-build'),enabled=process.env.CMS_INTERNAL_FIXTURE==='1';
const privateFiles=new Map(readdirSync(path.join(directory,'private-assets')).map(name=>['/private-assets/'+name,path.join(directory,'private-assets',name)]));
const server=createServer((request,response)=>{
 const target=new URL(request.url,'http://127.0.0.1').pathname;
 let file=target==='/'?path.join(directory,'public.html'):target==='/public.css'?path.join(directory,'public.css'):enabled&&target==='/integration-fixture'?path.join(directory,'editor.html'):enabled?privateFiles.get(target):null;
 if(!file){response.writeHead(404,{'Cache-Control':'no-store'});response.end('Not found');return;}
 const extension=path.extname(file);response.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.woff2':'font/woff2','.woff':'font/woff','.svg':'image/svg+xml'})[extension]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});response.end(readFileSync(file));
});
server.listen(Number(process.env.PORT||0),'127.0.0.1',()=>console.log('CMS_FIXTURE_LISTEN '+server.address().port));
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>process.exit(0)));
