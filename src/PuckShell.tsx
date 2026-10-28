'use client';
import {hoverStyleExtension} from './hover-style';
import {isSnapshotSettled} from './form-bridge';
import {videoExtension,youtubeExtension,type VideoConfig} from './VideoControls';
import {EditorModeContext} from './EditorMode';
import {PlainTextTools} from './PlainTextTools';
import {TargetBindings,ResourceTargets} from './TargetBindings';
import React,{useCallback,useMemo,useRef,useState,useEffect} from 'react';
import {Puck,RichTextMenu,useGetPuck,createUsePuck,type Config,type Data} from '@puckeditor/core';
import {BodyControls,bodyInteraction,type BodyCopy} from './BodyControls';
import NodeRange from '@tiptap/extension-node-range';
import {Extension,type Editor} from '@tiptap/core';
import {SelectionMenu} from './SelectionMenu';
import {ContentHistoryBridge} from './ContentHistoryBridge';
import {contentHistoryExtension,type ContentHistoryState} from './content-history';
import {RichTextMenuBridge} from './RichTextMenuBridge';
import {ImageControls,imageExtension,type ImageConfig} from './ImageControls';
import {InlineControls,type InlineControlConfig} from './InlineControls';
import Document from '@tiptap/extension-document';
import {compatibilityExtensions} from './state-extension';
import type {EditorManifest} from './manifest';
// Menu presentation updates must not recreate Puck field definitions or the active editor.
const InlineControlContext=React.createContext<InlineControlConfig|undefined>(undefined);
function StableInlineControls(props:Omit<React.ComponentProps<typeof InlineControls>,'config'>){
 const config=React.useContext(InlineControlContext);
 return config?<InlineControls {...props} config={config}/>:null;
}
const usePuck=createUsePuck();
const canvasOverrides={componentOverlay:()=>null,actionBar:({children}:{children:React.ReactNode})=><>{children}</>};
function PreviewMode({control,onMode}:{control:React.RefObject<((editing:boolean)=>void)|null>;onMode:(editing:boolean)=>void}){
 const mode=usePuck(state=>state.appState.ui.previewMode);const dispatch=usePuck(state=>state.dispatch);
 useEffect(()=>{control.current=editing=>dispatch({type:'setUi',ui:{previewMode:editing?'edit':'interactive'}});return()=>{control.current=null;};},[control,dispatch]);
 useEffect(()=>onMode(mode==='edit'),[mode,onMode]);return null;
}
/** Apply native-form acknowledgements through public data actions, never by remounting the canvas. */
function ManagedValues({values,enabled}:{values:Record<string,string>;enabled:boolean}){
 const getPuck=useGetPuck();const previous=useRef(values);
 useEffect(()=>{
  if(!enabled||previous.current===values)return;previous.current=values;
  const state=getPuck(),data=state.appState.data,node=data.content[0];if(!node)return;
  if(Object.keys(values).every(key=>node.props[key]===values[key]))return;
  state.dispatch({type:'replace',destinationIndex:0,destinationZone:'root:default-zone',data:{...node,props:{...node.props,...values}},recordHistory:true});
 },[enabled,values,getPuck]);return null;
}
function SnapshotBridge({control,onChange,active,equivalent,manifest}:{equivalent?:SnapshotEquivalent;manifest:EditorManifest;control:React.RefObject<(()=>Promise<void>)|null>;onChange:(data:Data)=>void;active:React.RefObject<{id:string;editor:Editor}|null>}){
 const getPuck=useGetPuck();const handler=useRef(onChange);handler.current=onChange;const same=useRef(equivalent);same.current=equivalent;const fields=useRef(manifest.fields);fields.current=manifest.fields;
 useEffect(()=>{let live=true;control.current=async()=>{
  // Puck 0.23 richtext debounces 50ms (maxWait 200ms). Wait for its public state
  // to actually match the edited Tiptap document, rather than guessing a delay.
  const deadline=Date.now()+5000;
  while(live){
   const changed=active.current;const data=getPuck().appState.data;
   const field=changed&&fields.current.find(field=>field.id===changed.id);
   if(!changed||changed.editor.isDestroyed||isSnapshotSettled(data.content[0]?.props[changed.id],changed.editor.getHTML(),field&&same.current?(stored,edited)=>same.current!(stored,edited,field.inline):undefined)){handler.current(data);return;}
   if(Date.now()>=deadline)throw Error('Pending editor update');
   await new Promise(resolve=>setTimeout(resolve,10));
  }
  throw Error('Editor closed');
 };return()=>{live=false;control.current=null;};},[getPuck,control,active]);return null;
}
export type SnapshotEquivalent=(stored:string,edited:string,inline:boolean)=>boolean;
export type DraftBootstrap={values:Record<string,string>;revision:string;documentId:number|string;key:string};
export type DraftAdapter={save:(revision:string,values:Record<string,string>)=>Promise<DraftBootstrap>};
export type EditorCopy={edit:string;preview:string;save:string;saving:string;saved:string;failed:string;settings:string;bold:string;italic:string;bullet:string;ordered:string};
export function PuckShell({manifest,initial,adapter,renderPage,styles,copy,settingsURL,managed,onValuesChange,controls,images,videos,bodyCopy,plainCopy,externalPreview=false,snapshot,snapshotEquivalent,className}:{className?:string;manifest:EditorManifest;initial:DraftBootstrap;adapter:DraftAdapter;renderPage:(values:Record<string,React.ReactNode>)=>React.ReactNode;styles:(s:any)=>Record<string,string>;copy:EditorCopy;settingsURL:string;managed?:boolean;onValuesChange?:(values:Record<string,string>)=>void;controls?:InlineControlConfig;images?:ImageConfig;videos?:VideoConfig;bodyCopy?:BodyCopy;plainCopy?:{apply:string;cancel:string;changed:string;link?:string};externalPreview?:boolean;snapshot?:React.RefObject<(()=>Promise<void>)|null>;snapshotEquivalent?:SnapshotEquivalent}){
 const resourceTargets=useRef(new Map());
 const makeData=(values:Record<string,string>):Data=>({root:{props:{}},content:[{type:'MappedPage',props:{id:manifest.key,...values}}]});
 const [bodyEditors,setBodyEditors]=useState<Editor[]>([]);const dragging=useRef<Editor|null>(null);const add=useCallback((editor:Editor)=>setBodyEditors(current=>current.includes(editor)?current:[...current,editor]),[]);const remove=useCallback((editor:Editor)=>setBodyEditors(current=>current.filter(value=>value!==editor)),[]);const bodyRegistry=useMemo(()=>({add,remove,dragging}),[add,remove]);
 const activeText=useRef<{id:string;editor:Editor}|null>(null);
 const historyState=useRef<(()=>ContentHistoryState)|null>(null);
 const modeControl=useRef<((editing:boolean)=>void)|null>(null);
 const [editing,setEditing]=useState(true);const [status,setStatus]=useState('');const [live,setLive]=useState(()=>makeData(initial.values));
 const latest=useRef(initial.values),revision=useRef(initial.revision),saved=useRef(JSON.stringify(initial.values)),timer=useRef<ReturnType<typeof setTimeout>>(undefined),running=useRef(false),pending=useRef(false),blocked=useRef(false);
 const config:Config=useMemo(()=>({root:{render:({children})=><>{children}</>},components:{MappedPage:{
  label:manifest.label,permissions:{drag:false,delete:false,duplicate:false,insert:false},
  fields:Object.fromEntries(manifest.fields.map(field=>[field.id,field.nativeText?{type:field.inline?'text':'textarea',contentEditable:!field.control,label:field.label}:{type:'richtext',label:field.label,contentEditable:true,
   options:{...(field.textOnly?{link:false,bulletList:false,orderedList:false,listItem:false}:{}),...(field.plain?{bold:false,italic:false,link:false,bulletList:false,orderedList:false,listItem:false}:{}),heading:false,blockquote:false,code:false,codeBlock:false,horizontalRule:false,strike:false,underline:false,textAlign:false,
    ...(field.inline?{document:false,listItem:false,bulletList:false,orderedList:false,listKeymap:false,hardBreak:false,link:false}:{link:field.textOnly?false:{autolink:false,linkOnPaste:false,openOnClick:false,HTMLAttributes:{target:null,rel:null}}})},
   tiptap:{extensions:[Extension.create({name:'retrofitSnapshot',onUpdate(){activeText.current={id:field.id,editor:this.editor};},onDestroy(){if(activeText.current?.editor===this.editor)activeText.current=null;}}),contentHistoryExtension(()=>historyState.current?.()??null),...(!field.plain?[...compatibilityExtensions(styles),hoverStyleExtension(styles)]:[]),...(bodyCopy?[bodyInteraction(bodyRegistry,!field.inline&&!field.plain)]:[]),...(!field.inline&&!field.plain&&images?[imageExtension(images.url),...(videos?[videoExtension(videos),youtubeExtension(videos)]:[]),...(bodyCopy?[NodeRange.configure({depth:0,key:null})]:[])]:[]),...(field.inline?[Document.extend({content:'paragraph'})]:[])]},
   renderInlineMenu:({editor,readOnly})=> <SelectionMenu editor={editor}><RichTextMenuBridge key={field.id} editor={editor}><RichTextMenu>{!field.plain&&<RichTextMenu.Group><RichTextMenu.Bold/><RichTextMenu.Italic/></RichTextMenu.Group>}{!field.inline&&!field.plain&&!field.textOnly&&<RichTextMenu.Group><RichTextMenu.BulletList/><RichTextMenu.OrderedList/></RichTextMenu.Group>}{editor&&<StableInlineControls editor={editor} inline={field.inline} plain={field.plain} textOnly={field.textOnly} readOnly={readOnly}/>}{editor&&images&&!field.inline&&!field.plain&&<ImageControls editor={editor} config={images} readOnly={readOnly}/>}</RichTextMenu></RichTextMenuBridge></SelectionMenu>
  }])),
  render:(props:any)=><TargetBindings.Provider value={manifest.fields}>{renderPage(Object.fromEntries(manifest.fields.map(f=>[f.id,f.control?props[f.id]:<span style={{display:'contents'}} data-cms-field-id={f.id}>{props[f.id]}</span>])))}</TargetBindings.Provider>
 }}}),[manifest,renderPage,styles,images,videos,bodyCopy,bodyRegistry]);
 async function flush(){
  clearTimeout(timer.current);if(running.current||blocked.current)return;running.current=true;
  try{while(pending.current){pending.current=false;const values={...latest.current};setStatus(copy.saving);const result=await adapter.save(revision.current,values);revision.current=result.revision;saved.current=JSON.stringify(values);setStatus(copy.saved);}}
  catch(error){pending.current=true;blocked.current=true;setStatus((error as Error).message||copy.failed);}
  finally{running.current=false;}
 }
 const change=(data:Data)=>{
  const node=data.content?.[0];if(data.content.length!==1||node?.type!=='MappedPage'||node.props.id!==manifest.key)return;
  const values=Object.fromEntries(manifest.fields.map(f=>[f.id,node.props[f.id]]));if(Object.values(values).some(v=>typeof v!=='string'))return;
  setLive(data);latest.current=values;
  if(JSON.stringify(values)===saved.current)return;
  if(onValuesChange)onValuesChange(values);
  if(managed){saved.current=JSON.stringify(values);return;}
  pending.current=true;clearTimeout(timer.current);if(!blocked.current)timer.current=setTimeout(()=>void flush(),900);
 };
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 useEffect(()=>{
  if(!editing)return;
  const guard=(event:MouseEvent)=>{const anchor=(event.target as Element)?.closest?.('a');if(anchor&&!anchor.closest('[data-retrofit-navigation]'))event.preventDefault();};
  document.addEventListener('click',guard,true);return()=>document.removeEventListener('click',guard,true);
 },[editing]);
 const nativeTextCopy=plainCopy||(controls?{apply:controls.copy.apply,cancel:controls.copy.close,changed:copy.failed,link:controls.copy.link}:undefined);
 const dictionary={'field-richtext-bold':copy.bold,'field-richtext-italic':copy.italic,'field-richtext-list-bullet':copy.bullet,'field-richtext-list-ordered':copy.ordered};
 return <InlineControlContext.Provider value={controls}><EditorModeContext.Provider value={editing}><ResourceTargets.Provider value={resourceTargets.current}><div className={["retrofit-editor",className].filter(Boolean).join(" ")}>
  {(!externalPreview||!managed||status)&&<div className="retrofit-bar" data-retrofit-navigation>
   {!externalPreview&&<><button type="button" aria-pressed={editing} onClick={()=>modeControl.current?.(true)}>{copy.edit}</button>
   <button type="button" aria-pressed={!editing} onClick={()=>modeControl.current?.(false)}>{copy.preview}</button></>}
   {!managed&&<button type="button" disabled={blocked.current} onClick={()=>void flush()}>{copy.save}</button>}
   <span role="status">{status}</span>{!managed&&<a href={settingsURL} target="_blank" rel="noopener noreferrer">{copy.settings}</a>}
  </div>}
  <div className="retrofit-surface"><Puck overrides={canvasOverrides} config={config} data={live} onChange={change} permissions={{drag:false,delete:false,duplicate:false,insert:false,edit:true}} iframe={{enabled:false}} dnd={{disableAutoScroll:true,disableOutlineDrag:true}} dictionary={dictionary}><ManagedValues values={initial.values} enabled={Boolean(managed)}/><ContentHistoryBridge state={historyState}/>{snapshot&&<SnapshotBridge control={snapshot} onChange={change} active={activeText} equivalent={snapshotEquivalent} manifest={manifest}/>}<PreviewMode control={modeControl} onMode={setEditing}/>{nativeTextCopy&&<PlainTextTools manifest={manifest} editing={editing} copy={nativeTextCopy}/>}<>{images&&bodyCopy?<BodyControls editors={bodyEditors} registry={bodyRegistry} images={images} videos={videos} copy={bodyCopy} editing={editing}><Puck.Preview/></BodyControls>:<Puck.Preview/>}</></Puck></div>
 </div></ResourceTargets.Provider></EditorModeContext.Provider></InlineControlContext.Provider>;
}
