'use client';
import React,{useCallback,useEffect,useRef} from 'react';
import {createUsePuck,useGetPuck} from '@puckeditor/core';
import type {Editor} from '@tiptap/core';
const usePuck=createUsePuck();
/** Resolve the selected mapped root from public data, not a private Puck store or hardcoded index. */
export function menuItemSelector(data:{content:{props:{id?:string}}[]},element:HTMLElement){const id=element.closest('[data-puck-component]')?.getAttribute('data-puck-component');if(!id)return;const index=data.content.findIndex(node=>node.props.id===id);return index<0?undefined:{index,zone:'root:default-zone'};}

/** Keep the current field's opaque public UI identity across Puck history snapshots.
 * Restore state with setUi, never by focusing DOM or by writing content separately. */
export function RichTextMenuBridge({editor,children}:{editor:Editor|null;children:React.ReactNode}){
 const getPuck=useGetPuck();const dispatch=usePuck(state=>state.dispatch);const historyIndex=usePuck(state=>state.history.index);
 const owner=useRef(getPuck().appState.ui.field.focus);
 const prepare=useCallback((selectComponent=false)=>{
  if(!editor||editor.isDestroyed||!owner.current)return;
  const state=getPuck(),focus=owner.current;const selector=selectComponent?menuItemSelector(state.appState.data,editor.view.dom):undefined;
  const current=state.appState.ui.itemSelector;const selected=!selector||current?.index===selector.index&&current?.zone===selector.zone;
  if(state.appState.ui.field.focus===focus&&selected)return;
  dispatch({type:'setUi',ui:previous=>({field:{...previous.field,focus},...(selector?{itemSelector:selector}:{})}),recordHistory:false});
 },[editor,getPuck,dispatch]);
 useEffect(()=>{prepare(Boolean(editor?.isFocused));},[editor,prepare]);
 useEffect(()=>{prepare(false);},[historyIndex,prepare]);
 return <div className="retrofit-menu-owner" onPointerDownCapture={()=>prepare(true)} onFocusCapture={()=>prepare(true)}>{children}</div>;
}
