import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const output=process.argv[2],fixture=process.argv.find(value=>value.startsWith('--fixture='))?.slice(10),payload=process.argv.find(value=>value.startsWith('--payload-fixture='));
if(!output||!fixture||!payload)throw Error('Provide a new output directory, --fixture=installed-fixture and --payload-fixture=installed-payload-fixture.');
execFileSync(process.execPath,[path.join(path.dirname(fileURLToPath(import.meta.url)),'build-skill.mjs'),fixture,output,payload,'--source-only'],{stdio:'inherit'});
