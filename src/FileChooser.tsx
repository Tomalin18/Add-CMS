'use client';
import React,{useCallback,useEffect,useRef} from 'react';
import {Button,FileTrigger} from 'react-aria-components';
export type FileKind='image'|'file'|'video';
/** Persistent native inputs stay in the initiating document, outside transient menus. */
export function useFileChooser(types:Record<FileKind,readonly string[]>,labels:Record<FileKind,string>){
 const image=useRef<HTMLInputElement>(null),file=useRef<HTMLInputElement>(null),video=useRef<HTMLInputElement>(null);
 const inputs={image,file,video};
 const pending=useRef<{kind:FileKind;resolve:(file:File|null)=>void;reject:(error:unknown)=>void}|null>(null);
 const finish=useCallback((kind:FileKind,files:FileList|null)=>{const active=pending.current;if(!active||active.kind!==kind)return;pending.current=null;active.resolve(files?.length===1?files.item(0):null);},[]);
 useEffect(()=>{const cleanups=(Object.keys(inputs) as FileKind[]).map(kind=>{const input=inputs[kind].current;const cancel=()=>finish(kind,null);input?.addEventListener('cancel',cancel);return()=>input?.removeEventListener('cancel',cancel);});return()=>{cleanups.forEach(cleanup=>cleanup());const active=pending.current;pending.current=null;active?.resolve(null);};},[finish]);
 const choose=useCallback((kind:FileKind)=>new Promise<File|null>((resolve,reject)=>{const input=inputs[kind].current;if(!input||pending.current){resolve(null);return;}pending.current={kind,resolve,reject};input.value='';try{input.click();}catch(error){pending.current=null;reject(error);}}),[]);
 const controls=<span hidden data-cms-file-inputs>{(Object.keys(inputs) as FileKind[]).map(kind=><FileTrigger key={kind} ref={inputs[kind]} acceptedFileTypes={types[kind]} onSelect={files=>finish(kind,files)}><Button type="button" aria-label={labels[kind]}>{labels[kind]}</Button></FileTrigger>)}</span>;
 return{choose,controls};
}
