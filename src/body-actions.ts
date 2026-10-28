import type {Editor} from '@tiptap/core';
import type {Node as PMNode} from '@tiptap/pm/model';
import {Selection} from '@tiptap/pm/state';
export type BodyTarget={editor:Editor;doc:PMNode;pos:number};
export function bodyTarget(editor:Editor,element?:Node|null):BodyTarget|null{
 if(editor.isDestroyed||!editor.isEditable)return null;
 let pos:number|undefined;
 if(element){if(!editor.view.dom.contains(element))return null;editor.state.doc.forEach((_node,at)=>{const dom=editor.view.nodeDOM(at);if(dom&&(dom===element||dom.contains(element)))pos=at;});}
 else{const {$from,from}=editor.state.selection;pos=$from.depth?$from.before(1):from;}
 return pos!==undefined&&editor.state.doc.nodeAt(pos)?{editor,doc:editor.state.doc,pos}:null;
}
export function targetNode(target:BodyTarget|null){return target&&!target.editor.isDestroyed&&target.editor.isEditable&&target.editor.state.doc.eq(target.doc)?target.doc.nodeAt(target.pos):null;}
export function selectBodyTarget(target:BodyTarget){return Boolean(targetNode(target))&&target.editor.commands.setNodeSelection(target.pos);}
export function insertBodyParagraph(target:BodyTarget){const node=targetNode(target);return Boolean(node)&&target.editor.commands.insertContentAt(target.pos+node!.nodeSize,{type:'paragraph'});}
export function canMoveBody(target:BodyTarget|null,direction:-1|1){if(!targetNode(target))return false;return direction<0?target!.pos>0:target!.pos+targetNode(target)!.nodeSize<target!.doc.content.size;}
/** Keyboard alternative uses the same ProseMirror document transaction, never a second writer. */
export function moveBody(target:BodyTarget,direction:-1|1){
 if(!canMoveBody(target,direction))return false;
 const node=targetNode(target)!;let before=0;target.doc.forEach((child,pos)=>{if(pos<target.pos)before=pos;});
 const after=target.pos+node.nodeSize;const next=target.doc.nodeAt(after);const destination=direction<0?before:after+next!.nodeSize;
 return target.editor.commands.command(({tr})=>{tr.delete(target.pos,after);const moved=tr.mapping.map(destination);tr.insert(moved,node);tr.setSelection(Selection.near(tr.doc.resolve(moved),1));return true;});
}
