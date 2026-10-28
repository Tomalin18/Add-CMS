'use client';
import React,{useContext,useEffect,useRef,useState} from 'react';
import {AutoField,registerOverlayPortal,useGetPuck} from '@puckeditor/core';
import {Button,Dialog,Popover} from 'react-aria-components';
import {ResourceTargets,resourcePatch} from './TargetBindings';
import {DestinationField} from './DestinationField';
import type {EditorManifest,FieldBinding} from './manifest';
/** Native typed strings keep their storage semantics; selection still exposes an explicit content editor. */
export function PlainTextTools({manifest,editing,copy}:{manifest:EditorManifest;editing:boolean;copy:{apply:string;cancel:string;changed:string;link?:string}}){
 const registry=useContext(ResourceTargets);const [destination,setDestination]=useState('');const destinationBaseline=useRef('');
 const getPuck=useGetPuck(),anchor=useRef<HTMLElement>(null),portal=useRef<HTMLDivElement>(null);const baseline=useRef('');const [field,setField]=useState<FieldBinding>();const [open,setOpen]=useState(false),[value,setValue]=useState(''),[error,setError]=useState('');
 useEffect(()=>registerOverlayPortal(portal.current,{disableDrag:false,disableDragOnFocus:false}),[open]);
 useEffect(()=>{if(!editing){setOpen(false);return;}const document=window.document;
  const selected=()=>{const selection=document.getSelection();const node=selection?.anchorNode;const element=node?.nodeType===1?node as Element:node?.parentElement;if(!element||portal.current?.contains(element))return;
   const target=element.closest('[contenteditable]') as HTMLElement|null;const id=target?.closest('[data-cms-field-id]')?.getAttribute('data-cms-field-id');const candidate=manifest.fields.find(field=>field.id===id&&field.nativeText&&!field.control);if(!candidate||selection?.isCollapsed){if(!portal.current?.contains(document.activeElement))setOpen(false);return;}
   const end=selection?.focusNode;const endElement=end?.nodeType===1?end as Element:end?.parentElement;if(!target?.contains(endElement||null))return;
   if(anchor.current===target&&open)return;anchor.current=target;const current=String(getPuck().appState.data.content[0]?.props[candidate.id]??'');baseline.current=current;setValue(current);const resourceRoot=target?.closest<HTMLElement>('[data-cms-resource-id]');const resource=resourceRoot&&registry?.get(resourceRoot);destinationBaseline.current=resource?String(getPuck().appState.data.content[0]?.props[resource.field.id]??''):'';setDestination(destinationBaseline.current);setField(candidate);setError('');setOpen(true);
  };document.addEventListener('selectionchange',selected);document.addEventListener('mouseup',selected,true);document.addEventListener('keyup',selected,true);return()=>{document.removeEventListener('selectionchange',selected);document.removeEventListener('mouseup',selected,true);document.removeEventListener('keyup',selected,true);};
 },[editing,manifest,getPuck,open,registry]);
 const root=anchor.current?.closest<HTMLElement>('[data-cms-resource-id]');const resource=root?registry?.get(root):undefined;
 const apply=()=>{if(!field)return;const state=getPuck();if(resource?.validate&&!resource.validate(destination)){setError(resource.copy.invalidURL);return;}try{const patch={[field.id]:value,...(resource?{[resource.field.id]:destination}:{})};const before={[field.id]:baseline.current,...(resource?{[resource.field.id]:destinationBaseline.current}:{})};const node=resourcePatch(state.appState.data.content[0],patch,before);state.dispatch({type:'replace',destinationIndex:0,destinationZone:'root:default-zone',data:node});setOpen(false);}catch{setError(copy.changed);}};
 if(!editing||!field)return null;
 return <Popover ref={portal} className="retrofit-target-popup retrofit-plain-tools" data-cms-plain-tools={field.id} triggerRef={anchor} isOpen={open} onOpenChange={setOpen} placement="top start" shouldFlip isNonModal UNSTABLE_portalContainer={anchor.current?.ownerDocument.body}><Dialog aria-label={field.label}><AutoField field={{type:field.inline?'text':'textarea',label:field.label}} value={value} onChange={setValue}/>{copy.link&&resource&&!resource.field.file&&<details><summary>{copy.link}</summary><DestinationField value={destination} onChange={setDestination} pages={resource.pages} copy={resource.copy}/></details>}{error&&<p role="alert">{error}</p>}<div className="retrofit-control-actions"><Button type="button" onPress={()=>setOpen(false)}>{copy.cancel}</Button><Button type="button" onPress={apply}>{copy.apply}</Button></div></Dialog></Popover>;
}
