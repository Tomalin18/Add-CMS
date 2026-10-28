import type {Editor} from '@tiptap/core';
import {TextSelection} from '@tiptap/pm/state';
export type InlineStyleKey='font'|'size'|'color';
export type TextRange={from:number;to:number};
export const MIXED_STYLE='__mixed__';
export function textRange(editor:Editor):TextRange|null{const selection=editor.state.selection;if(!(selection instanceof TextSelection))return null;const {from,to,empty}=selection;return !empty&&from>=1&&to<=editor.state.doc.content.size?{from,to}:null;}
export function selectionStyles(editor:Editor,range:TextRange){
 const values:Record<InlineStyleKey,(string|undefined)[]>={font:[],size:[],color:[]};
 editor.state.doc.nodesBetween(range.from,range.to,(node,pos)=>{if(!node.isText||pos>=range.to||pos+node.nodeSize<=range.from)return;const attrs=node.marks.find(mark=>mark.type.name==='retrofitState')?.attrs||{};for(const key of ['font','size','color'] as const)values[key].push(attrs[key]==null||attrs[key]==='inherit'?undefined:attrs[key]);});
 return Object.fromEntries(Object.entries(values).map(([key,items])=>[key,items.every(value=>value===items[0])?items[0]:MIXED_STYLE])) as Record<InlineStyleKey,string|undefined>;
}
/** Tiptap owns partial text splitting and attribute merging. Never focus/scroll the editor from a picker. */
export function applyInlineStyle(editor:Editor,range:TextRange,key:InlineStyleKey,value:unknown,normalize:(key:string,value:unknown)=>string|undefined){
 if(editor.isDestroyed||!editor.isEditable||range.from>=range.to||range.to>editor.state.doc.content.size)return false;
 if(!editor.state.doc.resolve(range.from).parent.inlineContent||!editor.state.doc.resolve(range.to).parent.inlineContent)return false;
 const normalized=normalize(key,value);return editor.chain().setTextSelection(range).setMark('retrofitState',{[key]:normalized==='inherit'?null:normalized??null}).run();
}
export function applyInlineLink(editor:Editor,range:TextRange,url:string|null,safeURL:(url:unknown)=>string,newTab=false){
 if(editor.isDestroyed||!editor.isEditable||!editor.schema.marks.link||range.from>=range.to||range.to>editor.state.doc.content.size)return false;
 if(!editor.state.doc.resolve(range.from).parent.inlineContent||!editor.state.doc.resolve(range.to).parent.inlineContent)return false;
 const chain=editor.chain().setTextSelection(range);
 return url===null?chain.unsetLink().run():chain.setLink({href:safeURL(url),target:newTab?'_blank':null,rel:newTab?'noopener noreferrer':null}).run();
}
