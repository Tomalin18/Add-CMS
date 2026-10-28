'use client';
import React,{useContext,useEffect,useRef,useState} from 'react';
import {AutoField,registerOverlayPortal,useGetPuck} from '@puckeditor/core';
import {Button,ModalOverlay,Modal,Dialog,Heading} from 'react-aria-components';
import {Pencil} from 'lucide-react';
import {EditorModeContext} from './EditorMode';
export type PropertyField={id:string;label:string;multiline?:boolean;validate?:(value:string)=>boolean};
/** Official Puck inputs and React Aria modal; changes remain staged until Apply and enter the same Puck/native-form flow. */
function PropertiesEditor({fields,label,copy}:{fields:PropertyField[];label:string;copy:{apply:string;cancel:string;changed:string;invalid?:string}}){
 const editing=useContext(EditorModeContext);const getPuck=useGetPuck();const ref=useRef<HTMLSpanElement>(null);const [open,setOpen]=useState(false);const [values,setValues]=useState<Record<string,string>>({});const baseline=useRef<Record<string,string>>({});const [error,setError]=useState('');
 useEffect(()=>registerOverlayPortal(ref.current,{disableDrag:false,disableDragOnFocus:false}),[editing]);
 const show=()=>{const node=getPuck().appState.data.content[0];const initial=Object.fromEntries(fields.map(field=>[field.id,String(node?.props[field.id]??'')]));baseline.current=initial;setValues(initial);setError('');setOpen(true);};
 const apply=()=>{if(fields.some(field=>field.validate&&!field.validate(values[field.id]))){setError(copy.invalid||copy.changed);return;}const state=getPuck();const node=state.appState.data.content[0];if(!node||node.type!=='MappedPage'||fields.some(field=>String(node.props[field.id]??'')!==baseline.current[field.id])){setError(copy.changed);return;}state.dispatch({type:'replace',destinationIndex:0,destinationZone:'root:default-zone',data:{...node,props:{...node.props,...values}}});setOpen(false);};
 if(!editing||!fields.length)return null;
 return <span ref={ref} data-cms-properties={fields.map(field=>field.id).join(',')}><Button type="button" className="retrofit-property-trigger" aria-label={label} onPress={show}><Pencil size={15}/></Button><ModalOverlay className="retrofit-property-overlay" isOpen={open} onOpenChange={setOpen} isDismissable><Modal className="retrofit-property-modal"><Dialog aria-label={label}><Heading slot="title">{label}</Heading>{fields.map(field=><div key={field.id} data-cms-property-field={field.id}><AutoField field={{type:field.multiline?'textarea':'text',label:field.label}} value={values[field.id]||''} onChange={value=>setValues(previous=>({...previous,[field.id]:value}))}/></div>)}{error&&<p role="alert">{error}</p>}<div className="retrofit-control-actions"><Button type="button" onPress={()=>setOpen(false)}>{copy.cancel}</Button><Button type="button" onPress={apply}>{copy.apply}</Button></div></Dialog></Modal></ModalOverlay></span>;
}

export function MappedProperties(props:Parameters<typeof PropertiesEditor>[0]){const editing=useContext(EditorModeContext);return editing&&props.fields.length?<PropertiesEditor {...props}/>:null;}
