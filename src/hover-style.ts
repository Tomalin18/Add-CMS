import {Extension,type Editor} from '@tiptap/core';
import {Plugin,PluginKey} from '@tiptap/pm/state';
import {Decoration,DecorationSet} from '@tiptap/pm/view';
import type {InlineStyleKey,TextRange} from './inline-selection';
type Preview={range:TextRange;key:InlineStyleKey;value:string;inherited?:string};
export const hoverStyleKey=new PluginKey<Preview|null>('retrofitHoverStyle');
/** View decorations never enter the document, HTML, autosave or undo history. */
export function hoverStylePlugin(styles:(state:any)=>Record<string,string>){
 return new Plugin<Preview|null>({
  key:hoverStyleKey,
  state:{init:()=>null,apply(tr,previous){const next=tr.getMeta(hoverStyleKey);if(next!==undefined)return next;return tr.docChanged||tr.selectionSet?null:previous;}},
  props:{decorations(state){
   const preview=hoverStyleKey.getState(state);if(!preview)return null;
   const {range,key,value}=preview;if(range.from>=range.to||range.from<1||range.to>state.doc.content.size)return null;
   const css={...styles({[key]:value})};if(preview.inherited)css[{font:'fontFamily',size:'fontSize',color:'color'}[key]]=preview.inherited;const style=Object.entries(css).map(([property,value])=>property.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())+':'+value).join(';');
   return DecorationSet.create(state.doc,[Decoration.inline(range.from,range.to,{style,'data-retrofit-style-preview':''})]);
  }}
 });
}
export function hoverStyleExtension(styles:(state:any)=>Record<string,string>){return Extension.create({name:'retrofitHoverStyle',addProseMirrorPlugins(){return[hoverStylePlugin(styles)];}});}
export function setInlinePreview(editor:Editor,range:TextRange,key:InlineStyleKey,value:string){if(editor.isDestroyed||!editor.isEditable||range.from>=range.to||range.from<1||range.to>editor.state.doc.content.size)return false;const property={font:'fontFamily',size:'fontSize',color:'color'}[key];const inherited=value==='inherit'?editor.view.dom.ownerDocument.defaultView?.getComputedStyle(editor.view.dom)[property as 'fontFamily'|'fontSize'|'color']:undefined;editor.view.dispatch(editor.state.tr.setMeta(hoverStyleKey,{range:{...range},key,value,...(inherited?{inherited}:{})}).setMeta('addToHistory',false));return true;}
export function clearInlinePreview(editor:Editor){if(!editor.isDestroyed&&hoverStyleKey.getState(editor.state))editor.view.dispatch(editor.state.tr.setMeta(hoverStyleKey,null).setMeta('addToHistory',false));}
