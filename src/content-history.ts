import {Extension} from '@tiptap/core';
import {Plugin} from '@tiptap/pm/state';
/** Use Puck's existing snapshots. UI-only/identical-content entries are kept, not erased. */
export type ContentHistoryState={appState:{data:unknown};history:{index:number;histories:{state:{data:unknown}}[];setHistoryIndex:(index:number)=>void}};
export function contentHistoryIndex(state:ContentHistoryState,direction:-1|1):number|null{
 const current=JSON.stringify(state.appState.data);
 for(let index=state.history.index+direction;index>=0&&index<state.history.histories.length;index+=direction){
  if(JSON.stringify(state.history.histories[index].state.data)!==current)return index;
 }
 return null;
}
export function navigateContentHistory(state:ContentHistoryState,direction:-1|1){
 const index=contentHistoryIndex(state,direction);if(index===null)return false;
 state.history.setHistoryIndex(index);return true;
}
/** Public ProseMirror key hook prevents Puck's document listener handling the same key twice. */
export function contentHistoryExtension(getState:()=>ContentHistoryState|null){return Extension.create({
 name:'retrofitContentHistory',priority:1000,
 addProseMirrorPlugins(){return[new Plugin({props:{handleKeyDown(_view,event){
  const key=event.key.toLowerCase();if(event.defaultPrevented||event.isComposing||event.altKey||!(event.ctrlKey||event.metaKey)||!['z','y'].includes(key))return false;
  const state=getState();if(!state)return false;
  event.preventDefault();event.stopPropagation();navigateContentHistory(state,key==='y'||event.shiftKey?1:-1);return true;
 }}})];}
});}
