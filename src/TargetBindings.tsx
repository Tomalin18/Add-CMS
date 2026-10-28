'use client';
import {createContext} from 'react';
import type {FieldBinding} from './manifest';
import type {DestinationCopy,PageDestination} from './DestinationField';
export type ResourceDefinition={field:FieldBinding;pages?:readonly PageDestination[];validate?:(value:string)=>boolean;copy:DestinationCopy&{apply:string;cancel:string;changed:string;invalidURL:string}};
export const ResourceTargets=createContext<Map<HTMLElement,ResourceDefinition>|null>(null);
/** Selection takes priority over an enclosing anchor's click, including cross-node drags. */
export function selectedResourceText(target:Element,selection:Pick<Selection,'isCollapsed'|'anchorNode'|'focusNode'>|null){return Boolean(selection&&!selection.isCollapsed&&((selection.anchorNode&&target.contains(selection.anchorNode))||(selection.focusNode&&target.contains(selection.focusNode))));}
export function resourcePatch(node:any,patch:Record<string,string>,before:Record<string,string>){if(!node||Object.keys(before).some(id=>String(node.props[id]??'')!==before[id]))throw Error('changed');return {...node,props:{...node.props,...patch}};}
export const TargetBindings=createContext<FieldBinding[]>([]);
/** Preserve existing inline marks; new label text is assigned as text, never interpreted as markup. */
export function labelText(value:string,plain:boolean,document:Document){if(plain)return value;const node=document.createElement('div');node.innerHTML=value;return node.textContent||'';}
export function replaceLabel(value:string,text:string,plain:boolean,document:Document){
 if(plain)return text;const node=document.createElement('div');node.innerHTML=value;const original=node.textContent||'';if(original===text)return value;
 const old=Array.from(original),next=Array.from(text);let prefix=0,suffix=0;while(prefix<old.length&&prefix<next.length&&old[prefix]===next[prefix])prefix++;while(suffix<old.length-prefix&&suffix<next.length-prefix&&old[old.length-1-suffix]===next[next.length-1-suffix])suffix++;
 const from=old.slice(0,prefix).join('').length,to=old.slice(0,old.length-suffix).join('').length,insert=next.slice(prefix,next.length-suffix).join('');const walker=document.createTreeWalker(node,4);const nodes:Text[]=[];let child;while((child=walker.nextNode()))nodes.push(child as Text);let offset=0,inserted=false;
 for(const child of nodes){const current=child.textContent||'',end=offset+current.length;if(end>=from&&offset<=to){const before=current.slice(0,Math.max(0,from-offset)),after=current.slice(Math.max(0,to-offset));child.textContent=before+(!inserted?insert:'')+after;inserted=true;}offset=end;}
 if(!inserted)(node.querySelector('p')||node).append(document.createTextNode(insert));return node.innerHTML;
}
