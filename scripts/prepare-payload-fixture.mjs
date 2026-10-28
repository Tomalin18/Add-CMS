import {readFileSync,writeFileSync,cpSync,existsSync,readdirSync,renameSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createPinnedLock} from './pinned-lock.mjs';
const skill=path.resolve(process.argv[2]||''),target=path.resolve(process.argv[3]||'');if(!process.argv[2]||!process.argv[3])throw Error('Provide the verified extracted skill and a new temporary fixture directory.');
const packaged=existsSync(path.join(skill,'assets/fixture'));
if(packaged){
 execFileSync(process.execPath,[path.join(skill,'scripts/install-fixture.mjs'),target],{stdio:'inherit'});
 cpSync(path.join(skill,'assets/integration'),path.join(target,'integration'),{recursive:true});
}else{
 execFileSync(process.execPath,[path.join(skill,'scripts/prepare-portable-fixture.mjs'),target],{stdio:'inherit'});
 cpSync(path.join(skill,'templates'),path.join(target,'integration'),{recursive:true});
 const untemplate=directory=>{for(const entry of readdirSync(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);if(entry.isDirectory())untemplate(file);else if(entry.name.endsWith('.template'))renameSync(file,file.slice(0,-9));}};untemplate(path.join(target,'integration'));
 cpSync(path.join(skill,'data/mock/coordinator.json'),path.join(target,'integration/tests/coordinator.json'));
}
const pkg=JSON.parse(readFileSync(path.join(target,'package.json'),'utf8'));pkg.name='add-cms-payload-fixture';pkg.dependencies={...pkg.dependencies,next:'16.4.3',payload:'3.92.0','@payloadcms/db-sqlite':'3.92.0','@payloadcms/ui':'3.92.0'};
pkg.dependencies['async-mutex']='0.5.0';pkg.overrides={dompurify:'3.4.17'};const source=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),base=JSON.parse(readFileSync(path.join(source,'locks/payload.json'),'utf8')),runtime=JSON.parse(readFileSync(path.join(target,'runtime/package.json'),'utf8'));const lock=createPinnedLock(base,pkg,{'node_modules/@add-cms/core':{resolved:'runtime',link:true},runtime:{version:runtime.version,dependencies:runtime.dependencies,peerDependencies:runtime.peerDependencies}});
writeFileSync(path.join(target,'package.json'),JSON.stringify(pkg,null,2)+'\n');writeFileSync(path.join(target,'package-lock.json'),JSON.stringify(lock,null,2)+'\n');console.log('CMS_PAYLOAD_FIXTURE_PREPARED '+JSON.stringify({target,fromActualExtractedArchive:packaged,payload:'3.92.0',sqlite:'3.92.0',lockedHostToolEntries:Object.keys(lock.packages).length,liveRepoDependenciesChanged:false}));
