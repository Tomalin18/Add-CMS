'use client';
import {chooseVideo,removeVideo,YoutubeDialog,type VideoConfig} from './VideoControls';
import React,{useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Extension,type Editor} from '@tiptap/core';
import {Plugin} from '@tiptap/pm/state';
import DragHandle from '@tiptap/extension-drag-handle-react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {useGetPuck} from '@puckeditor/core';
import {GripVertical,MoreVertical} from 'lucide-react';
import {bodyTarget,targetNode,selectBodyTarget,insertBodyParagraph,canMoveBody,moveBody,type BodyTarget} from './body-actions';
import {chooseRichImage,removeRichImage,type ImageConfig} from './ImageControls';
export type BodyCopy={bodyMenu:string;dragHandle:string;moveUp:string;moveDown:string;insertParagraph:string;contentChanged:string};
export type BodyRegistry={add:(editor:Editor)=>void;remove:(editor:Editor)=>void;dragging:{current:Editor|null}};
/** Only the mapped body editor participates; cross-field and file drops never become hidden uploads. */
export function bodyInteraction(registry:BodyRegistry,controls=true){return Extension.create({
 name:'retrofitBodyInteraction',priority:1000,
 onCreate(){if(controls)registry.add(this.editor);},
 onDestroy(){if(registry.dragging.current===this.editor)registry.dragging.current=null;if(controls)registry.remove(this.editor);},
 addProseMirrorPlugins(){const editor=this.editor;return[new Plugin({props:{handleDOMEvents:{
  dragstart(){registry.dragging.current=editor;return false;},
  dragend(){if(registry.dragging.current===editor)registry.dragging.current=null;return false;},
  // Reject before Tiptap's paste-rule drop listener schedules cross-editor source deletion.
  drop(view,event){
   const source=registry.dragging.current;
   const at=source===editor?view.posAtCoords({left:event.clientX,top:event.clientY}):null;
   if(event.dataTransfer?.files.length||(source&&source!==editor)||(at&&view.state.doc.resolve(at.pos).depth>1)){
    event.preventDefault();return true;
   }
   return false;
  }
 }}})];}
});}
function BodyMenuHost({editor,children}:{editor:Editor;children:React.ReactNode}){
 const [host]=useState(()=>{const node=document.createElement('div');node.className='retrofit-body-menu-host';return node;});
 useEffect(()=>{if(!editor.isDestroyed)editor.view.dom.parentElement?.append(host);return()=>host.remove();},[editor,host]);return createPortal(children,host);
}
const nested={rules:[{id:'root-body-only',evaluate:({depth}:any)=>depth===1?0:1000}]};
export function BodyControls({editors,registry,images,videos,copy,editing,children}:{editors:Editor[];registry:BodyRegistry;images:ImageConfig;videos?:VideoConfig;copy:BodyCopy;editing:boolean;children:React.ReactNode}){
 const getPuck=useGetPuck();const owners=useRef(new WeakMap<Editor,string>());const [target,setTarget]=useState<BodyTarget|null>(null);const current=useRef<BodyTarget|null>(null);current.current=target;const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [contextOpen,setContextOpen]=useState(false);const [youtube,setYoutube]=useState<{target:BodyTarget;replace:boolean}|null>(null);
 useEffect(()=>{if(!editing){setContextOpen(false);setTarget(null);setYoutube(null);registry.dragging.current=null;}},[editing,registry]);
 useEffect(()=>{const bindings=editors.map(editor=>{const capture=()=>{const owner=getPuck().appState.ui.field.focus;if(owner)owners.current.set(editor,owner);};editor.on('focus',capture);return()=>editor.off('focus',capture);});return()=>{bindings.forEach(unbind=>unbind());};},[editors,getPuck]);
 const activate=(editor:Editor)=>{if(editor.isDestroyed)return;editor.view.dom.focus({preventScroll:true});const state=getPuck();const owner=owners.current.get(editor)||state.appState.ui.field.focus;if(owner){owners.current.set(editor,owner);if(state.appState.ui.field.focus!==owner)state.dispatch({type:'setUi',ui:previous=>({field:{...previous.field,focus:owner}})});}};
 const capture=(next:BodyTarget|null)=>{current.current=next;setTarget(next);if(next)activate(next.editor);};
 const run=async(action:'paragraph'|'image'|'replace'|'remove'|'up'|'down'|'video'|'replace-video'|'remove-video'|'youtube'|'replace-youtube')=>{const selected=current.current;if(!selected||!targetNode(selected)){setError(copy.contentChanged);return;}activate(selected.editor);if(videos&&(action==='youtube'||action==='replace-youtube')){setYoutube({target:selected,replace:action==='replace-youtube'});return;}setBusy(true);try{let ok=false;if(action==='paragraph')ok=insertBodyParagraph(selected);else if(action==='up'||action==='down')ok=moveBody(selected,action==='up'?-1:1);else if(videos&&['video','replace-video','remove-video'].includes(action))ok=action==='remove-video'?removeVideo(selected):await chooseVideo(selected,videos,action==='replace-video');else if(selectBodyTarget(selected))ok=action==='remove'?removeRichImage(selected.editor):await chooseRichImage(selected.editor,images,action==='replace');if(ok)setError('');}catch{setError(images.copy.imageUnavailable);}finally{setBusy(false);}};
 const items=(Item:any)=><><Item disabled={busy||!targetNode(target)} onSelect={()=>void run('paragraph')}>{copy.insertParagraph}</Item><Item disabled={busy||!images.pick||!targetNode(target)} onSelect={()=>void run('image')}>{images.copy.insertImage}</Item>{targetNode(target)?.type.name==='image'&&<><Item disabled={busy||!images.pick} onSelect={()=>void run('replace')}>{images.copy.replaceImage}</Item><Item disabled={busy} onSelect={()=>void run('remove')}>{images.copy.removeImage}</Item></>}{videos&&<><Item disabled={busy||!videos.pick||!targetNode(target)} onSelect={()=>void run('video')}>{videos.copy.insertVideo}</Item><Item disabled={busy||!targetNode(target)} onSelect={()=>void run('youtube')}>{videos.copy.insertYoutube}</Item>{targetNode(target)?.type.name==='video'&&<><Item disabled={busy||!videos.pick} onSelect={()=>void run('replace-video')}>{videos.copy.replaceVideo}</Item><Item disabled={busy} onSelect={()=>void run('remove-video')}>{videos.copy.removeVideo}</Item></>}{targetNode(target)?.type.name==='youtube'&&<><Item disabled={busy} onSelect={()=>void run('replace-youtube')}>{videos.copy.replaceYoutube}</Item><Item disabled={busy} onSelect={()=>void run('remove-video')}>{videos.copy.removeYoutube}</Item></>}</>}<Item disabled={busy||!canMoveBody(target,-1)} onSelect={()=>void run('up')}>{copy.moveUp}</Item><Item disabled={busy||!canMoveBody(target,1)} onSelect={()=>void run('down')}>{copy.moveDown}</Item></>;
 const closeFocus=(event:Event)=>{event.preventDefault();const editor=current.current?.editor;if(editor&&!editor.isDestroyed)activate(editor);};
 return <ContextMenu.Root modal={false} open={editing&&contextOpen} onOpenChange={open=>setContextOpen(open&&Boolean(targetNode(current.current)))}><ContextMenu.Trigger asChild disabled={!editing}><div className="retrofit-body-context" onPointerDownCapture={event=>{if(event.pointerType==='mouse')return;const editor=editors.find(value=>!value.isDestroyed&&value.view.dom.contains(event.target as Node));const next=editor?bodyTarget(editor,event.target as Node):null;current.current=next;setTarget(next);if(!next)setContextOpen(false);}} onContextMenuCapture={event=>{const editor=editors.find(value=>!value.isDestroyed&&value.view.dom.contains(event.target as Node));const next=editor?bodyTarget(editor,event.target as Node):null;if(!next){setContextOpen(false);capture(null);return;}capture(next);}}>{children}</div></ContextMenu.Trigger><ContextMenu.Portal><ContextMenu.Content className="retrofit-body-menu" onCloseAutoFocus={closeFocus}>{items(ContextMenu.Item)}</ContextMenu.Content></ContextMenu.Portal>{editing&&editors.filter(editor=>!editor.isDestroyed&&editor.isEditable).map(editor=><React.Fragment key={editor.instanceId}><DragHandle editor={editor} nested={nested} className="retrofit-drag-handle" onElementDragStart={()=>{activate(editor);registry.dragging.current=editor;}} onElementDragEnd={()=>{registry.dragging.current=null;}}><button type="button" aria-label={copy.dragHandle} tabIndex={-1}><GripVertical size={16}/></button></DragHandle><BodyMenuHost editor={editor}><DropdownMenu.Root modal={false} onOpenChange={open=>{if(open)capture(bodyTarget(editor));}}><DropdownMenu.Trigger asChild><button type="button" className="retrofit-body-menu-button" aria-label={copy.bodyMenu}><MoreVertical size={16}/></button></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content className="retrofit-body-menu" onCloseAutoFocus={closeFocus}>{items(DropdownMenu.Item)}</DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root></BodyMenuHost></React.Fragment>)}{youtube&&videos&&<YoutubeDialog target={youtube.target} replace={youtube.replace} config={videos} onClose={()=>{setYoutube(null);activate(youtube.target.editor);}}/>}{error&&<p role="alert">{error}</p>}</ContextMenu.Root>;
}
