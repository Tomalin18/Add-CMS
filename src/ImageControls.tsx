'use client';
import React,{useEffect,useState} from 'react';
import type {Editor} from '@tiptap/core';
import Image from '@tiptap/extension-image';
import {Button} from 'react-aria-components';
import {ImagePlus,ImageUp,Trash2} from 'lucide-react';
export type ImageAsset={id:number;alt:string;width:number;height:number};
export type ImageConfig={url:(id:number)=>string;pick?:(current?:ImageAsset)=>Promise<ImageAsset|null>;settled?:(asset:ImageAsset,applied:boolean)=>void;copy:{insertImage:string;replaceImage:string;removeImage:string;imageUnavailable:string}};
export function assertImageAsset(value:any):ImageAsset{if(!value||Object.keys(value).some(k=>!['id','alt','width','height'].includes(k))||!Number.isSafeInteger(value.id)||value.id<1||typeof value.alt!=='string'||value.alt.length>500||!Number.isInteger(value.width)||!Number.isInteger(value.height)||value.width<1||value.height<1||value.width>20000||value.height>20000)throw Error('image');return value;}
export function imageExtension(url:(id:number)=>string){return Image.extend({
 addAttributes(){return{...this.parent?.(),cmsMediaId:{default:null,parseHTML:el=>el.getAttribute('data-cms-media-id'),renderHTML:()=>({})},cmsNodeId:{default:null,parseHTML:el=>el.getAttribute('data-cms-node-id'),renderHTML:()=>({})}};},
 parseHTML(){return[{tag:'img[data-cms-media-id][data-cms-node-id]',getAttrs:el=>/^[1-9]\d*$/.test(el.getAttribute('data-cms-media-id')||'')&&/^[a-f0-9]{24}$/.test(el.getAttribute('data-cms-node-id')||'')?null:false}];},
 renderHTML({node}){const a=node.attrs;return['img',{src:url(Number(a.cmsMediaId)),alt:a.alt||'',width:a.width,height:a.height,'data-cms-media-id':String(a.cmsMediaId),'data-cms-node-id':a.cmsNodeId}];}
}).configure({inline:false,allowBase64:false,resize:false});}
export function imageSelection(editor:Editor){const selection:any=editor.state.selection;return selection.node?.type.name==='image'?{node:selection.node,pos:selection.from}:null;}
export async function chooseRichImage(editor:Editor,config:ImageConfig,replace=false){
 if(editor.isDestroyed||!editor.isEditable||!config.pick)return false;
 const doc=editor.state.doc;const selection=editor.state.selection;const selected=imageSelection(editor);const current=selected?{id:Number(selected.node.attrs.cmsMediaId),alt:selected.node.attrs.alt||'',width:Number(selected.node.attrs.width),height:Number(selected.node.attrs.height)}:undefined;
 if(replace&&!selected)return false;let applied=false;const asset=await config.pick(current);try{if(!asset)return false;assertImageAsset(asset);
 if(editor.isDestroyed||!editor.state.doc.eq(doc))throw Error(config.copy.imageUnavailable);
 const nodeId=replace?selected!.node.attrs.cmsNodeId:Array.from(crypto.getRandomValues(new Uint8Array(12)),value=>value.toString(16).padStart(2,'0')).join('');
 const attrs={src:config.url(asset.id),alt:asset.alt,width:asset.width,height:asset.height,cmsMediaId:String(asset.id),cmsNodeId:nodeId};
 if(replace)return applied=editor.chain().setNodeSelection(selected!.pos).updateAttributes('image',attrs).run();
 const at=selected?selected.pos+selected.node.nodeSize:selection.$from.depth?selection.$from.after(1):selection.to;
 return applied=editor.commands.insertContentAt(at,[{type:'image',attrs},{type:'paragraph'}]);
 }finally{if(asset)config.settled?.(asset,applied);}
}
export function removeRichImage(editor:Editor){if(editor.isDestroyed||!editor.isEditable)return false;const selected=imageSelection(editor);return Boolean(selected)&&editor.commands.deleteRange({from:selected!.pos,to:selected!.pos+selected!.node.nodeSize});}
export function ImageControls({editor,config,readOnly=false}:{editor:Editor;config:ImageConfig;readOnly?:boolean}){
 const [,refresh]=useState(0);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 useEffect(()=>{const update=()=>refresh(value=>value+1);editor.on('transaction',update);return()=>{editor.off('transaction',update);};},[editor]);
 const selected=!editor.isDestroyed?imageSelection(editor):null;const blocked=readOnly||busy||editor.isDestroyed||!config.pick;
 const choose=async(replace:boolean)=>{setBusy(true);try{await chooseRichImage(editor,config,replace);setError('');}catch{setError(config.copy.imageUnavailable);}finally{setBusy(false);}};
 return <div className="retrofit-image-controls"><Button type="button" isDisabled={blocked} aria-label={config.copy.insertImage} onPress={()=>void choose(false)}><ImagePlus size={15}/></Button>{selected&&<><Button type="button" isDisabled={blocked} aria-label={config.copy.replaceImage} onPress={()=>void choose(true)}><ImageUp size={15}/></Button><Button type="button" isDisabled={blocked} aria-label={config.copy.removeImage} onPress={()=>removeRichImage(editor)}><Trash2 size={15}/></Button></>}{error&&<span role="alert">{error}</span>}</div>;
}
