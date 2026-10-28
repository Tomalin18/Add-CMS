import {cpSync,existsSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {verify} from './verify-artifact.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),destination=path.resolve(process.argv[2]||'');if(!process.argv[2]||existsSync(destination)||(!destination.startsWith(path.resolve(os.tmpdir())+path.sep)&&!destination.startsWith('/tmp/')))throw Error('Choose a new temporary evaluation directory.');verify(root);
mkdirSync(destination,{recursive:true});cpSync(path.join(root,'assets/fixture'),destination,{recursive:true});cpSync(path.join(root,'assets/runtime'),path.join(destination,'runtime'),{recursive:true});console.log(JSON.stringify({fixture:destination,realSiteDataIncluded:false,productionAuthClaimed:false}));
