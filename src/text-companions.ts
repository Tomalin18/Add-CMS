import {richFromParagraphs, richPlain} from './rich-policy';
/** Preserve native plain fields while adding explicit, validated rich companions. */
export function createTextCompanions(options:{keys:readonly string[];inline:(key:string)=>boolean;validate:(document:any,inline:boolean)=>any}){
 const keys=new Set(options.keys);
 const checked=(key:string,value:any)=>{if(!keys.has(key))throw Error('Unknown rich field');return options.validate(value,options.inline(key));};
 const plainDocument=(key:string,text:unknown)=>checked(key,richFromParagraphs([typeof text==='string'?text:'']));
 const hydrate=(content:Record<string,any>,rich:Record<string,any>={})=>{
  if(!rich||typeof rich!=='object'||Array.isArray(rich)||Object.keys(rich).some(key=>!keys.has(key)))throw Error('Unknown rich field');
  return Object.fromEntries(options.keys.map(key=>[key,rich[key]==null?plainDocument(key,content[key]):checked(key,rich[key])]));
 };
 const reconcile=(contentPatch:Record<string,any>={},richPatch:Record<string,any>={},storedContent:Record<string,any>={},storedRich:Record<string,any>={})=>{
  const before=hydrate(storedContent,storedRich), next=hydrate({...storedContent,...contentPatch},{...before,...richPatch});
  const content={...storedContent,...contentPatch};
  for(const key of options.keys){
   const plainChanged=Object.hasOwn(contentPatch,key)&&contentPatch[key]!==storedContent[key];
   const richChanged=JSON.stringify(next[key])!==JSON.stringify(before[key]);
   if(plainChanged&&richChanged&&contentPatch[key]!==richPlain(next[key]))throw Error('Conflicting plain and rich changes');
   if(plainChanged&&!richChanged)next[key]=plainDocument(key,contentPatch[key]);
   content[key]=richPlain(next[key]);
  }
  return {content,rich:next};
 };
 return {hydrate,reconcile};
}
