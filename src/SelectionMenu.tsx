'use client';
import React,{useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import type {Editor} from '@tiptap/core';
import {registerOverlayPortal} from '@puckeditor/core';
import {autoUpdate,computePosition,flip,inline,offset,shift,type Platform,type VirtualElement} from '@floating-ui/dom';
/** Coordinates and portal always belong to the editor document, including nested host iframes. */
export function selectionReference(editor:Editor){
 const document=editor.view.dom.ownerDocument;
 const range=()=>{const selection=editor.state.selection;const start=editor.view.domAtPos(selection.from);const end=editor.view.domAtPos(selection.to);const domRange=document.createRange();domRange.setStart(start.node,start.offset);domRange.setEnd(end.node,end.offset);return domRange;};
 return{contextElement:editor.view.dom,getBoundingClientRect:()=>{const selected:any=editor.state.selection;if(selected.node){const dom=editor.view.nodeDOM(selected.from) as Element;return dom.getBoundingClientRect();}return range().getBoundingClientRect();},getClientRects:()=>{const selected:any=editor.state.selection;if(selected.node)return[(editor.view.nodeDOM(selected.from) as Element).getBoundingClientRect()];return Array.from(range().getClientRects());}};
}
export function positionSelectionMenu(reference:VirtualElement,floating:HTMLElement,platform?:Platform){return computePosition(reference,floating,{strategy:'fixed',placement:'top-start',middleware:[inline({padding:4}),offset(8),flip({padding:8}),shift({padding:8})],...(platform?{platform}: {})});}
/** Freeze only the selection's layout while a tool owns focus; retain scroll-container movement. */
export function stableSelectionReference(editor:Editor){
 const original=selectionReference(editor),document=editor.view.dom.ownerDocument;
 let pinned:{rects:DOMRect[];bounds:DOMRect;origin:DOMRect}|null=null;
 const translated=(rect:DOMRect)=>{const now=editor.view.dom.getBoundingClientRect(),origin=pinned!.origin;return new document.defaultView!.DOMRect(rect.x+now.x-origin.x,rect.y+now.y-origin.y,rect.width,rect.height);};
 const reference={contextElement:original.contextElement,getBoundingClientRect:()=>pinned?translated(pinned.bounds):original.getBoundingClientRect(),getClientRects:()=>pinned?pinned.rects.map(translated):original.getClientRects()};
 return{reference,pin:()=>{if(!pinned)pinned={rects:Array.from(original.getClientRects()),bounds:original.getBoundingClientRect(),origin:editor.view.dom.getBoundingClientRect()};},release:()=>{pinned=null;}};
}
export function SelectionMenu({editor,children}:{editor:Editor|null;children:React.ReactNode}){
 const element=useRef<HTMLDivElement>(null);const [position,setPosition]=useState<{x:number;y:number}>();
 useLayoutEffect(()=>{if(!editor||editor.isDestroyed||!element.current)return;const floating=element.current;const document=editor.view.dom.ownerDocument;const stable=stableSelectionReference(editor);const {reference,pin}=stable;
  const unpin=(event:FocusEvent|PointerEvent)=>{if(event.type==='focusout'&&floating.contains((event as FocusEvent).relatedTarget as Node|null))return;if(event.type==='pointerleave'&&floating.contains(document.activeElement))return;stable.release();update();};
  const outside=(event:PointerEvent)=>{if(!floating.contains(event.target as Node)){stable.release();update();}};
  const unregister=registerOverlayPortal(floating,{disableDrag:false,disableDragOnFocus:false});let live=true;
  const update=()=>{if(editor.isDestroyed||!reference.contextElement.isConnected)return;void positionSelectionMenu(reference,floating).then(result=>{if(live)setPosition({x:result.x,y:result.y});}).catch(()=>{});};
  floating.addEventListener('pointerenter',pin);floating.addEventListener('focusin',pin);floating.addEventListener('pointerleave',unpin);floating.addEventListener('focusout',unpin);document.addEventListener('pointerdown',outside,true);
  const stop=autoUpdate(reference,floating,update,{ancestorScroll:true,ancestorResize:true,elementResize:typeof ResizeObserver!=='undefined',layoutShift:typeof IntersectionObserver!=='undefined'});editor.on('selectionUpdate',update);editor.on('transaction',update);document.addEventListener('selectionchange',update);
  return()=>{live=false;floating.removeEventListener('pointerenter',pin);floating.removeEventListener('focusin',pin);floating.removeEventListener('pointerleave',unpin);floating.removeEventListener('focusout',unpin);document.removeEventListener('pointerdown',outside,true);unregister?.();stop();editor.off('selectionUpdate',update);editor.off('transaction',update);document.removeEventListener('selectionchange',update);};
 },[editor]);
 if(!editor||editor.isDestroyed)return null;
 return createPortal(<div ref={element} className="retrofit-selection-menu" data-retrofit-selection-menu data-puck-rte-menu onClick={event=>event.stopPropagation()} style={{position:'fixed',left:position?.x??0,top:position?.y??0,visibility:position?'visible':'hidden'}}>{children}</div>,editor.view.dom.ownerDocument.body);
}
