export type FieldBinding={id:string;path:string;inline:boolean;plain?:boolean;view?:string;nativeText?:boolean;textOnly?:boolean;control?:'url'|'file';file?:boolean;label:string};
export type EditorManifest={key:string;publicPath:string;label:string;fields:FieldBinding[]};
const part=/^[A-Za-z][A-Za-z0-9]*$/;
export function validateManifest(manifest:EditorManifest){
 if(!/^[a-z][a-z0-9-]{1,80}$/.test(manifest.key)||!/^\/(?!\/)[\w/-]*$/.test(manifest.publicPath)||(manifest.fields.length<1||manifest.fields.length>2048))throw Error('manifest');
 const seen=new Set<string>();
 for(const field of manifest.fields){if(!part.test(field.id)||seen.has(field.id)||!field.path.split('.').every((p,index)=>(part.test(p)||(index>0&&/^(0|[1-9]\d{0,2})$/.test(p)))&&!['constructor','prototype','__proto__'].includes(p)))throw Error('field');seen.add(field.id);}
 return manifest;
}
export function readPath(value:any,path:string){return path.split('.').reduce((v,key)=>v?.[key],value);}
export function fieldPatch(manifest:EditorManifest,values:Record<string,unknown>){
 validateManifest(manifest);if(!values||Array.isArray(values)||Object.keys(values).some(k=>!manifest.fields.some(f=>f.id===k)))throw Error('fields');
 const patch:any={formattingInput:true,_status:'draft'};
 for(const field of manifest.fields){if(!Object.hasOwn(values,field.id))continue;let parent=patch;const parts=field.path.split('.');for(const p of parts.slice(0,-1))parent=parent[p]??={};parent[parts.at(-1)!]=bindingValue(field,values[field.id]);}
 return patch;
}

export function bindingDocument(field:FieldBinding,value:any){if(field.file)value=value==null?'':String(typeof value==='object'?value.id:value);if(!field.plain)return value??{root:{type:'root',version:1,direction:null,format:'',indent:0,children:[{type:'paragraph',version:1,direction:null,format:'',indent:0,textFormat:0,textStyle:'',children:[]}]}};if(typeof value!=='string')throw Error('plain');return{root:{type:'root',version:1,direction:null,format:'',indent:0,children:[{type:'paragraph',version:1,direction:null,format:'',indent:0,textFormat:0,textStyle:'',children:[{type:'text',text:value,format:0,style:'',mode:'normal',detail:0,version:1}]}]}};}
export function bindingValue(field:FieldBinding,value:any){if(field.file){const text=bindingValue({...field,file:false},value);if(text==='')return null;if(typeof text!=='string'||!/^([1-9]\d*)$/.test(text)||!Number.isSafeInteger(Number(text)))throw Error('file');return Number(text);}if(!field.plain)return value??{root:{type:'root',version:1,direction:null,format:'',indent:0,children:[{type:'paragraph',version:1,direction:null,format:'',indent:0,textFormat:0,textStyle:'',children:[]}]}};const paragraphs=value?.root?.children;if(!Array.isArray(paragraphs)||(field.inline&&paragraphs.length!==1))throw Error('plain');return paragraphs.map((paragraph:any)=>{if(paragraph.type!=='paragraph'||paragraph.children.some((node:any)=>!['text','linebreak'].includes(node.type)||node.format||Object.keys(node.$||{}).length))throw Error('plain');return paragraph.children.map((node:any)=>node.type==='linebreak'?'\n':node.text).join('');}).join('\n\n');}


export function applyBindings(base:any,manifest:EditorManifest,values:Record<string,unknown>){const result=structuredClone(base);for(const field of manifest.fields){if(!Object.hasOwn(values,field.id))throw Error('fields');let parent=result;const parts=field.path.split('.');for(const key of parts.slice(0,-1))parent=parent[key]??={};parent[parts.at(-1)!]=bindingValue(field,values[field.id]);}return result;}
