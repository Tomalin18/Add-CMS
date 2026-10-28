export function createPinnedLock(base,pkg,extra={}){
 const packages={'':pkg,...extra},seen=new Set();
 function resolve(name,from=''){let current=from;while(true){const candidate=(current?current+'/':'')+'node_modules/'+name;if(base.packages[candidate])return candidate;if(!current)break;const index=current.lastIndexOf('/node_modules/');current=index>=0?current.slice(0,index):'';}return null;}
 function visit(name,from='',optional=false){const key=resolve(name,from);if(!key){if(optional)return;throw Error('Missing pinned dependency '+name);}if(seen.has(key))return;seen.add(key);const record=structuredClone(base.packages[key]);packages[key]=record;for(const [n]of Object.entries(record.dependencies||{}))visit(n,key);for(const [n]of Object.entries(record.optionalDependencies||{}))visit(n,key,true);for(const [n]of Object.entries(record.peerDependencies||{}))visit(n,key,Boolean(record.peerDependenciesMeta?.[n]?.optional));}
 for(const name of Object.keys({...pkg.dependencies,...pkg.devDependencies,...pkg.peerDependencies}))if(name!=='@add-cms/core')visit(name);
 return{name:pkg.name,version:pkg.version,lockfileVersion:3,requires:true,packages};
}
