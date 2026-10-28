import {bindingDocument,bindingValue,readPath,validateManifest,type EditorManifest} from './manifest';
export type CanvasSession={version:1;pageRevision:string;settingsRevision:string;values:Record<string,any>;baseValues:Record<string,any>;changes:Record<string,any>;requestValues?:Record<string,any>};
const canonicalValue=(value:any):any=>Array.isArray(value)?value.map(canonicalValue):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonicalValue(value[key])])):value;
/** JSON property order is transport detail, not a content change. Array order and actual node values remain significant. */
export const sameCanvasValue=(a:any,b:any)=>JSON.stringify(canonicalValue(a))===JSON.stringify(canonicalValue(b));
function normalizeValues(values:Record<string,any>,manifest?:EditorManifest){return Object.fromEntries(Object.entries(values).map(([key,value])=>{const field=manifest?.fields.find(field=>field.id===key);return[key,field?.plain?bindingDocument(field,bindingValue(field,value)):value];}));}
export function sessionValues(manifest:EditorManifest,doc:any){return Object.fromEntries(manifest.fields.map(field=>[field.id,bindingDocument(field,readPath(doc,field.path))]));}
export function readCanvasSession(raw:string,manifest:EditorManifest,validate:(value:any,inline:boolean)=>unknown):CanvasSession{
 if(typeof raw!=='string'||raw.length>450000)throw Error('session');const data=JSON.parse(raw);if(data.version!==1||!/^[a-f0-9]{64}$/.test(data.pageRevision)||!/^[a-f0-9]{64}$/.test(data.settingsRevision)||Object.keys(data).some(key=>!['version','pageRevision','settingsRevision','values','baseValues','changes','requestValues'].includes(key)))throw Error('session');
 for(const name of ['values','baseValues','changes',...(data.requestValues?['requestValues']:[])]){const values=data[name];if(!values||typeof values!=='object'||Array.isArray(values)||Object.keys(values).some(key=>!manifest.fields.some(field=>field.id===key)))throw Error('session');if(name!=='changes'&&Object.keys(values).length!==manifest.fields.length)throw Error('session');for(const field of manifest.fields)if(Object.hasOwn(values,field.id)){validate(values[field.id],field.inline);if(field.plain)values[field.id]=bindingDocument(field,bindingValue(field,values[field.id]));}}
 // Older clients can submit codec-only no-ops. Remove only a validated entry that
 // agrees with BOTH its value and baseline; mismatched/forged change maps still fail.
 for(const [key,value] of Object.entries(data.changes))if(sameCanvasValue(value,data.values[key])&&sameCanvasValue(value,data.baseValues[key]))delete data.changes[key];
 return data;
}
export function updateCanvasChanges(session:CanvasSession,values:Record<string,any>,manifest?:EditorManifest):CanvasSession{const normalized=normalizeValues(values,manifest),baseValues=normalizeValues(session.baseValues,manifest);return{...session,values:normalized,baseValues,changes:Object.fromEntries(Object.entries(normalized).filter(([key,value])=>!sameCanvasValue(value,baseValues[key])))};}
export function combinedManifest(page:EditorManifest,shared:EditorManifest):EditorManifest{return validateManifest({...page,fields:[...page.fields,...shared.fields.map(field=>({...field,id:'shared'+field.id[0].toUpperCase()+field.id.slice(1)}))]});}
export const sharedCanvasID=(id:string)=>'shared'+id[0].toUpperCase()+id.slice(1);

/** A native save acknowledgement may arrive while the user keeps typing. Rebase only metadata and accepted values. */
export function acknowledgeCanvas(current:CanvasSession,ack:CanvasSession,manifest?:EditorManifest):CanvasSession{
 const values={...ack.values};const baseValues={...ack.baseValues};
 for(const key of Object.keys(values)){
  if(!Object.hasOwn(ack.changes,key))baseValues[key]=ack.values[key];
  if(!sameCanvasValue(normalizeValues({[key]:current.values[key]},manifest)[key],normalizeValues({[key]:(ack.requestValues||ack.values)[key]},manifest)[key]))values[key]=current.values[key];
 }
 return updateCanvasChanges({...ack,baseValues,requestValues:undefined},values,manifest);
}
