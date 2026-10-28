import {bindingValue,type EditorManifest} from './manifest';
export function acceptsBridgeMessage(event:{origin:string;source:unknown;data:any},origin:string,source:unknown,channel:string){return Boolean(source&&event.origin===origin&&event.source===source&&/^[a-f0-9-]{36}$/.test(channel)&&event.data?.channel===channel);}
export function formFieldPatch(manifest:EditorManifest,values:Record<string,unknown>,fields:Record<string,any>,validate:(value:any,inline:boolean)=>unknown){
 if(!values||Object.keys(values).length!==manifest.fields.length||manifest.fields.some(field=>!Object.hasOwn(values,field.id)))throw Error('fields');
 for(const field of manifest.fields)validate(values[field.id],field.inline);
 return{visualEditor:{...fields.visualEditor,disableFormData:true,valid:true,errorMessage:undefined},...Object.fromEntries(manifest.fields.map(field=>[field.path,{...fields[field.path],value:bindingValue(field,values[field.id]),valid:true,isModified:fields[field.path]?.isModified===true||JSON.stringify(fields[field.path]?.value)!==JSON.stringify(bindingValue(field,values[field.id]))}])),formattingInput:{...fields.formattingInput,value:true,valid:true}};
}

/** Equivalent serialization is settled; genuinely newer text must still reach Puck before saving. */
export function isSnapshotSettled(stored:unknown,edited:string,equivalent?:(stored:string,edited:string)=>boolean){return stored===edited||(typeof stored==='string'&&Boolean(equivalent?.(stored,edited)));}
