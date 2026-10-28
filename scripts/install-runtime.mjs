import {cpSync,existsSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {verify} from './verify-artifact.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),target=process.argv[2];if(!target)throw Error('Provide a new destination directory.');const destination=path.resolve(target),evaluation=process.argv.includes('--internal-evaluation');
verify(root,{release:!evaluation});if(evaluation&&!destination.startsWith(path.resolve(os.tmpdir())+path.sep)&&!destination.startsWith('/tmp/'))throw Error('Internal evaluation is limited to a new temporary directory.');if(existsSync(destination))throw Error('Destination exists; no files overwritten.');
mkdirSync(destination,{recursive:true});cpSync(path.join(root,'assets/runtime'),destination,{recursive:true});console.log(JSON.stringify({copied:destination,overwritten:false,dependenciesInstalled:false,hostConfigurationChanged:false,internalEvaluation:evaluation}));
