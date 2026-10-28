import assert from 'node:assert/strict';
import {mkdtempSync,cpSync,writeFileSync,readFileSync,mkdirSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(process.argv[2]||''),temporary=mkdtempSync(path.join(os.tmpdir(),'add-cms-package-check-'));let count=0;
function run(script,args=[]){return spawnSync(process.execPath,[path.join(root,'scripts',script),...args],{encoding:'utf8'});}
let result=run('verify-artifact.mjs',[root]);assert.equal(result.status,0,result.stderr);count++;const gate=JSON.parse(readFileSync(path.join(root,'RELEASE-GATE.json'),'utf8'));result=run('verify-artifact.mjs',[root,'--release']);assert.equal(result.status===0,gate.distributable);count++;
const tampered=path.join(temporary,'tampered');cpSync(root,tampered,{recursive:true});writeFileSync(path.join(tampered,'unlisted.txt'),'isolated tamper fixture');result=run('verify-artifact.mjs',[tampered]);assert.notEqual(result.status,0);assert.ok(result.stderr.includes('Unlisted file'));count++;
const existing=path.join(temporary,'existing');mkdirSync(existing);writeFileSync(path.join(existing,'keep.txt'),'unchanged');result=run('install-runtime.mjs',[existing,'--internal-evaluation']);assert.notEqual(result.status,0);assert.equal(readFileSync(path.join(existing,'keep.txt'),'utf8'),'unchanged');count++;
const runtime=path.join(temporary,'runtime');result=run('install-runtime.mjs',[runtime,'--internal-evaluation']);assert.equal(result.status,0,result.stderr);assert.equal(readFileSync(path.join(runtime,'src/PuckShell.tsx'),'utf8'),readFileSync(path.join(root,'assets/runtime/src/PuckShell.tsx'),'utf8'));count++;
console.log('CMS_SKILL_PACKAGE_CHECK_RESULT '+JSON.stringify({assertions:count,hashesChecked:true,releaseGateEnforced:true,unlistedFilesRejected:true,existingFilesPreserved:true,actualRuntimeSourceCopied:true,productionConfigurationChanged:false,temporaryEvaluation:temporary}));
