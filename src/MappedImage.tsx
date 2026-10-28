'use client';
import React,{useContext,useEffect,useRef,useState} from 'react';
import {EditorModeContext} from './EditorMode';
import {AutoField,registerOverlayPortal} from '@puckeditor/core';
import {Button,Popover,Dialog} from 'react-aria-components';
import * as ContextMenu from '@radix-ui/react-context-menu';
import type {MappedImage as ImageBinding} from './mapped-images';
import type {ImageAsset} from './ImageControls';
export function MappedImage({image,children,pick,change,copy,layout,metadata,settled}:{image:ImageBinding;layout?:{absolute?:boolean;active?:boolean;intrinsic?:boolean;controlCorner?:'bottom'};children:React.ReactNode;pick:(image:ImageBinding)=>Promise<ImageAsset|null>;change:(image:ImageBinding,asset:ImageAsset|null)=>void;copy:{replaceImage:string;unlinkImage:string;imageUnavailable:string;imageAlt?:string;apply?:string;cancel?:string;contentChanged?:string};metadata?:(image:ImageBinding,alt:string,baseline:string)=>void;settled?:(asset:ImageAsset,applied:boolean)=>void}){
 const latest=useRef({image,editing:false});
 const altAfterContext=useRef(false);const editing=useContext(EditorModeContext);const root=useRef<HTMLSpanElement>(null),anchor=useRef<HTMLButtonElement>(null),portal=useRef<HTMLDivElement>(null);
 useEffect(()=>registerOverlayPortal(root.current,{disableDrag:false,disableDragOnFocus:false}),[editing]);
 latest.current={image,editing};
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [open,setOpen]=useState(false);const [altOpen,setAltOpen]=useState(false);const [alt,setAlt]=useState('');const baseline=useRef('');const identity=useRef<ImageBinding|null>(null);
 useEffect(()=>registerOverlayPortal(portal.current,{disableDrag:false,disableDragOnFocus:false}),[open]);
 useEffect(()=>{if(!editing){setOpen(false);setAltOpen(false);}},[editing]);
 const show=()=>{identity.current=image;baseline.current=image.alt;setAlt(image.alt);setAltOpen(false);setError('');setOpen(true);};
 const showAlt=()=>{show();setAltOpen(true);};
 const applyAlt=()=>{if(image.id!==identity.current?.id||image.rowId!==identity.current?.rowId||image.alt!==baseline.current||alt.length>500||alt.includes('\0')){setError(copy.contentChanged||copy.imageUnavailable);return;}metadata?.(image,alt,baseline.current);setOpen(false);};
 const choose=async()=>{if(busy)return;let asset:ImageAsset|null=null;let applied=false;setOpen(false);setBusy(true);try{asset=await pick(image);if(asset){const current=latest.current;if(!current.editing||current.image.id!==image.id||current.image.rowId!==image.rowId||current.image.media!==image.media||current.image.alt!==image.alt)throw Error('changed');change(image,asset);applied=true;}setError('');}catch{setError(copy.imageUnavailable);}finally{if(asset)settled?.(asset,applied);setBusy(false);}};
 if(!editing)return <>{children}</>;
 return <span ref={root} style={layout?.absolute?{position:'absolute',inset:0,pointerEvents:layout.active===false?'none':undefined}:layout?.intrinsic?{height:'auto'}:undefined} className="retrofit-mapped-image" data-cms-image-slot={image.slot}>
  <ContextMenu.Root><ContextMenu.Trigger asChild disabled={layout?.active===false}><Button ref={anchor} type="button" className="retrofit-image-target" isDisabled={busy||layout?.active===false} aria-label={copy.replaceImage+': '+image.alt} aria-expanded={open} aria-haspopup="dialog" onPress={show}>{children}</Button></ContextMenu.Trigger><ContextMenu.Portal><ContextMenu.Content className="retrofit-target-menu" onCloseAutoFocus={event=>{if(altAfterContext.current){event.preventDefault();altAfterContext.current=false;showAlt();}}} onClick={event=>event.stopPropagation()}><ContextMenu.Item onSelect={()=>void choose()}>{copy.replaceImage}</ContextMenu.Item>{metadata&&<ContextMenu.Item onSelect={()=>{altAfterContext.current=true;}}>{copy.imageAlt}</ContextMenu.Item>}{image.media&&<ContextMenu.Item onSelect={()=>change(image,null)}>{copy.unlinkImage}</ContextMenu.Item>}</ContextMenu.Content></ContextMenu.Portal></ContextMenu.Root>
  <Popover ref={portal} className="retrofit-target-popup retrofit-media-tools" triggerRef={anchor} isOpen={open} onOpenChange={setOpen} placement="top start" shouldFlip isNonModal UNSTABLE_portalContainer={root.current?.ownerDocument.body}><Dialog aria-label={copy.replaceImage} onClick={event=>event.stopPropagation()}><div className="retrofit-media-tools__actions"><Button type="button" onPress={()=>void choose()}>{copy.replaceImage}</Button>{metadata&&<Button type="button" onPress={()=>setAltOpen(value=>!value)}>{copy.imageAlt}</Button>}{image.media&&<Button type="button" onPress={()=>{change(image,null);setOpen(false);}}>{copy.unlinkImage}</Button>}</div>{altOpen&&<div data-cms-image-alt><AutoField field={{type:'text',label:copy.imageAlt}} value={alt} onChange={setAlt}/><div className="retrofit-control-actions"><Button type="button" onPress={()=>setOpen(false)}>{copy.cancel}</Button><Button type="button" onPress={applyAlt}>{copy.apply}</Button></div></div>}{error&&<p role="alert">{error}</p>}</Dialog></Popover>
  {error&&!open&&<span role="alert">{error}</span>}
 </span>;
}
