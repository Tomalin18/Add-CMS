import {Mark,Extension} from '@tiptap/core';
/** Compatibility metadata only; Puck/Tiptap own selection, editing and menus. */
export function compatibilityExtensions(styles:(state:any)=>Record<string,string>){
 const state=Mark.create({name:'retrofitState',inclusive:true,
  addAttributes(){return Object.fromEntries(['font','size','color'].map(key=>[key,{default:null,parseHTML:(el:HTMLElement)=>el.getAttribute('data-cms-'+key),renderHTML:()=>({})}]));},
  parseHTML(){return[{tag:'span[data-cms-font]'},{tag:'span[data-cms-size]'},{tag:'span[data-cms-color]'}];},
  renderHTML({mark}){
   const values=Object.fromEntries(Object.entries(mark.attrs).filter(([,v])=>v!==null));
   const css=styles(values);return['span',{...Object.fromEntries(Object.entries(values).map(([k,v])=>['data-cms-'+k,v])),style:Object.entries(css).map(([k,v])=>k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())+':'+v).join(';')},0];
  }});
 const metadata=Extension.create({name:'retrofitMetadata',addGlobalAttributes(){return[
  {types:['paragraph'],attributes:{cmsTextFormat:{default:null,parseHTML:(el:HTMLElement)=>el.getAttribute('data-cms-text-format'),renderHTML:(attrs:any)=>attrs.cmsTextFormat?{'data-cms-text-format':attrs.cmsTextFormat}:{}}}},
  {types:['link'],attributes:{cmsLinkId:{default:null,parseHTML:(el:HTMLElement)=>el.getAttribute('data-cms-link-id'),renderHTML:(attrs:any)=>attrs.cmsLinkId?{'data-cms-link-id':attrs.cmsLinkId}:{}}}},
  {types:['listItem'],attributes:{cmsValue:{default:null,parseHTML:(el:HTMLElement)=>el.getAttribute('value'),renderHTML:(attrs:any)=>attrs.cmsValue?{value:attrs.cmsValue}:{}}}}
 ];}});
 return[state,metadata];
}
