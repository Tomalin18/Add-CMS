'use client';
import React,{useRef,useState} from 'react';
import {Button,Input,Label,ListBox,ListBoxItem,Popover,Select,SelectValue,TextField} from 'react-aria-components';
import {ChevronDown} from 'lucide-react';
export type PageDestination={value:string;label:string};
export type DestinationCopy={destination:string;otherDestination:string;fragment:string};
/** Unknown routes and external schemes stay intact; only an explicit choice replaces them. */
export function matchPageDestination(value:string,pages:readonly PageDestination[]){const index=value.indexOf('#');const path=index<0?value:value.slice(0,index);return pages.find(page=>page.value===path);}
export function DestinationField({value,onChange,pages=[],copy}:{value:string;onChange:(value:string)=>void;pages?:readonly PageDestination[];copy:DestinationCopy}){
 const root=useRef<HTMLDivElement>(null);const [custom,setCustom]=useState(()=>!matchPageDestination(value,pages));const page=matchPageDestination(value,pages);const other='__other_destination__';
 if(!pages.length)return <TextField aria-label={copy.destination} value={value} onChange={onChange}><Label>{copy.destination}</Label><Input/></TextField>;
 return <div ref={root} className="retrofit-destination">
  <Select aria-label={copy.destination} selectedKey={!custom&&page?page.value:other} onSelectionChange={key=>{if(key===other){setCustom(true);return;}const next=pages.find(item=>item.value===key);if(next){setCustom(false);onChange(next.value);}}}>
   <Label>{copy.destination}</Label><Button type="button"><SelectValue/><ChevronDown size={14}/></Button>
   <Popover isNonModal data-puck-rte-menu className="retrofit-control-popover" UNSTABLE_portalContainer={root.current||undefined}><ListBox>{pages.map(item=><ListBoxItem key={item.value} id={item.value} textValue={item.label}>{item.label}</ListBoxItem>)}<ListBoxItem id={other} textValue={copy.otherDestination}>{copy.otherDestination}</ListBoxItem></ListBox></Popover>
  </Select>
  {custom||!page?<TextField aria-label={copy.destination} value={value} onChange={onChange}><Input/></TextField>:<TextField aria-label={copy.fragment} value={value.includes('#')?value.slice(value.indexOf('#')+1):''} onChange={fragment=>onChange(page.value+(fragment?'#'+fragment:''))}><Label>{copy.fragment}</Label><Input/></TextField>}
 </div>;
}
