'use client';
import React,{useCallback,useEffect,useRef,useState} from 'react';
import {createUsePuck,useGetPuck} from '@puckeditor/core';
import {contentHistoryIndex,navigateContentHistory} from './content-history';
import type {Editor} from '@tiptap/core';
import {setInlinePreview,clearInlinePreview} from './hover-style';
import {ResourceDestination} from './MappedResource';
import {DestinationField,type DestinationCopy,type PageDestination} from './DestinationField';
import {Button,ColorArea,ColorField,ColorPicker,ColorSlider,ColorSwatch,ColorSwatchPicker,ColorSwatchPickerItem,ColorThumb,ComboBox,Dialog,DialogTrigger,Group,I18nProvider,Input,Label,ListBox,ListBoxItem,Popover,Select,SelectValue,SliderTrack,TextField,parseColor} from 'react-aria-components';
import {ChevronDown,Link,RotateCcw,Undo2,Redo2} from 'lucide-react';
import {applyInlineStyle,applyInlineLink,selectionStyles,textRange,MIXED_STYLE,type InlineStyleKey,type TextRange} from './inline-selection';
export type InlineControlConfig={
 locale?:string;
 pages?:readonly PageDestination[];destinationCopy?:DestinationCopy;
 fonts:{value:string;label:string}[];sizes:readonly number[];palette:readonly string[];
 normalize:(key:string,value:unknown)=>string|undefined;parseSize:(value:string)=>string|undefined;safeURL:(value:unknown)=>string;
 copy:{font:string;size:string;sizeChoices:string;color:string;mixed:string;inherited:string;px:string;resetFont:string;resetSize:string;resetColor:string;hue:string;area:string;hex:string;palette:string;close:string;link:string;url:string;apply:string;removeLink:string;invalidLink:string;undo:string;redo:string};
};
const usePuck=createUsePuck();
function FocusPreview({active,preview,clear,owner,kind,value,children}:{active:boolean;preview:(key:InlineStyleKey,value:string,owner:string)=>void;clear:(owner?:string)=>void;owner:string;kind:InlineStyleKey;value:string;children:React.ReactNode}){useEffect(()=>{if(!active)return;preview(kind,value,owner);return()=>clear(owner);},[active,preview,clear,owner,kind,value]);return <>{children}</>;}

function useRange(editor:Editor){
 const range=useRef<TextRange|null>(textRange(editor));const [tick,setTick]=useState(0);
 useEffect(()=>{const update=({transaction}:any)=>{if(range.current&&transaction.docChanged){range.current={from:transaction.mapping.map(range.current.from,1),to:transaction.mapping.map(range.current.to,-1)};}
  const selected=textRange(editor);if(selected)range.current=selected;else if((editor.state.selection as any).node||editor.isFocused)range.current=null;setTick(value=>value+1);};
  editor.on('transaction',update);return()=>{editor.off('transaction',update);};
 },[editor]);
 const capture=()=>{if(editor.isDestroyed)return;const selected=textRange(editor);if(selected)range.current=selected;};
 const values=range.current?selectionStyles(editor,range.current):{font:undefined,size:undefined,color:undefined};
 return{range,capture,values,tick,enabled:!editor.isDestroyed&&editor.isEditable&&Boolean(range.current)};
}
export function InlineControls({editor,config,inline,plain=false,textOnly=false,readOnly=false}:{editor:Editor;config:InlineControlConfig;inline:boolean;plain?:boolean;textOnly?:boolean;readOnly?:boolean}){
 const history=usePuck(state=>state.history);const data=usePuck(state=>state.appState.data);const getPuck=useGetPuck();
 const hasPast=contentHistoryIndex({history,appState:{data}},-1)!==null;const hasFuture=contentHistoryIndex({history,appState:{data}},1)!==null;
 const selection=useRange(editor);const container=useRef<HTMLDivElement>(null);const [portal,setPortal]=useState<Element>();const copy=config.copy;
 const [size,setSize]=useState('');const [typing,setTyping]=useState(false);const [linkOpen,setLinkOpen]=useState(false);const [url,setURL]=useState('');const [newTab,setNewTab]=useState(false);const [linkError,setLinkError]=useState('');
 useEffect(()=>{setPortal(container.current||undefined);},[]);
 const blocked=readOnly||!selection.enabled;
 const previewOwner=useRef<string|null>(null);const [colorCandidate,setColorCandidate]=useState<string|null>(null);const colorKeyboard=useRef(false);
 const clear=useCallback((owner?:string)=>{if(owner&&previewOwner.current!==owner)return;previewOwner.current=null;clearInlinePreview(editor);},[editor]);
 const preview=useCallback((key:InlineStyleKey,value:string,owner:string)=>{if(editor.isDestroyed||!selection.range.current||readOnly)return;try{const normalized=config.normalize(key,value);if(normalized){previewOwner.current=owner;setInlinePreview(editor,selection.range.current,key,normalized);}}catch{clear();}},[editor,selection.range,readOnly,config.normalize,clear]);
 useEffect(()=>{const reset=()=>{clear();setColorCandidate(null);};editor.on('selectionUpdate',reset);editor.on('blur',reset);return()=>{editor.off('selectionUpdate',reset);editor.off('blur',reset);clear();};},[editor,clear]);
 const apply=(key:InlineStyleKey,value:string|undefined)=>{clear();setColorCandidate(null);if(selection.range.current&&!blocked)applyInlineStyle(editor,selection.range.current,key,value,config.normalize);};
 const currentSize=selection.values.size;
 let computedSize='';if(!editor.isDestroyed&&selection.range.current){try{const node=editor.view.domAtPos(selection.range.current.from).node;const element=node.nodeType===1?node as Element:node.parentElement;if(element){const value=parseFloat(getComputedStyle(element.closest('[data-retrofit-style-preview]')?.parentElement||element).fontSize);if(Number.isFinite(value))computedSize=String(Math.round(value));}}catch{/* The native preview transition can detach a view before its toolbar unmounts. */}}
 const numericSize=currentSize&&/^\d+$/.test(currentSize)?currentSize:currentSize===MIXED_STYLE?'':computedSize;
 useEffect(()=>{if(!typing)setSize(numericSize);},[numericSize,typing]);
 const commitSize=(value:string)=>{const parsed=config.parseSize(value);if(parsed){apply('size',parsed);setSize(parsed);}else setSize(numericSize);setTyping(false);};
 let hex=selection.values.color?.startsWith('#')?selection.values.color:'#1f2937';
 if(!editor.isDestroyed&&!selection.values.color?.startsWith('#')&&selection.range.current){try{const dom=editor.view.domAtPos(selection.range.current.from).node;const element=dom.nodeType===1?dom as Element:dom.parentElement;if(element)hex=parseColor(getComputedStyle(element.closest('[data-retrofit-style-preview]')?.parentElement||element).color).toString('hex').toLowerCase();}catch{}}
 const beginLink=()=>{selection.capture();const attrs=editor.getAttributes('link');setURL(attrs.href||'');setNewTab(attrs.target==='_blank');setLinkError('');};
 const link=(value:string|null)=>{try{if(selection.range.current&&applyInlineLink(editor,selection.range.current,value,config.safeURL,newTab)){setLinkOpen(false);setLinkError('');}}catch{setLinkError(copy.invalidLink);}};
 return <I18nProvider locale={config.locale}><div className="retrofit-inline-controls" ref={container} onPointerDownCapture={selection.capture} onPointerLeave={()=>clear()} onKeyDownCapture={event=>{if(event.key==='Escape'){clear();setColorCandidate(null);}}} onKeyDown={event=>{if(event.key==='Escape'&&!event.defaultPrevented&&event.target===event.currentTarget){editor.view.dom.focus({preventScroll:true});}}}>
  <Button type="button" isDisabled={!hasPast||readOnly} aria-label={copy.undo} onPress={()=>navigateContentHistory(getPuck(),-1)}><Undo2 size={14}/></Button><Button type="button" isDisabled={!hasFuture||readOnly} aria-label={copy.redo} onPress={()=>navigateContentHistory(getPuck(),1)}><Redo2 size={14}/></Button>
  {inline&&<ResourceDestination target={editor.view.dom} label={copy.link}/>}
  {!plain&&<><Select aria-label={copy.font} isDisabled={blocked} selectedKey={selection.values.font===MIXED_STYLE?null:selection.values.font||'inherit'} placeholder={copy.mixed} onSelectionChange={key=>{if(key!==null)apply('font',key==='inherit'?undefined:String(key));}}>
   <Button type="button" aria-label={copy.font}><span>{copy.font}</span><SelectValue/><ChevronDown size={13}/></Button>
   <Popover isNonModal data-puck-rte-menu className="retrofit-control-popover" UNSTABLE_portalContainer={portal}><ListBox>{config.fonts.map(font=><ListBoxItem key={font.value} id={font.value} textValue={font.label} onHoverStart={()=>preview('font',font.value,'font:'+font.value)} onHoverEnd={()=>clear('font:'+font.value)}>{({isFocused})=><FocusPreview active={isFocused} kind="font" value={font.value} owner={'font:'+font.value} preview={preview} clear={clear}>{font.label}</FocusPreview>}</ListBoxItem>)}</ListBox></Popover>
  </Select>
  <Button type="button" isDisabled={blocked} aria-label={copy.resetFont} onPress={()=>apply('font',undefined)}><RotateCcw size={13}/></Button>
  <ComboBox aria-label={copy.size} allowsCustomValue menuTrigger="focus" defaultFilter={()=>true} isDisabled={blocked} inputValue={size} selectedKey={config.sizes.some(value=>String(value)===size)?size:null} onInputChange={setSize} onSelectionChange={key=>{if(key!==null)commitSize(String(key));}}>
   <Group><Input inputMode="numeric" aria-label={copy.size} placeholder={currentSize===MIXED_STYLE?copy.mixed:copy.inherited} onFocus={()=>{selection.capture();setTyping(true);}} onBlur={()=>{clear();setSize(numericSize);setTyping(false);}} onKeyDown={event=>{if(event.key==='Enter'&&!event.currentTarget.getAttribute('aria-activedescendant')){event.preventDefault();event.stopPropagation();commitSize(size);}if(event.key==='Escape'){setSize(numericSize);setTyping(false);}}}/><span>{copy.px}</span><Button type="button" aria-label={copy.sizeChoices}><ChevronDown size={13}/></Button></Group>
   <Popover isNonModal data-puck-rte-menu className="retrofit-control-popover" UNSTABLE_portalContainer={portal}><ListBox aria-label={copy.sizeChoices}>{config.sizes.map(value=><ListBoxItem key={value} id={String(value)} textValue={String(value)} onHoverStart={()=>preview('size',String(value),'size:'+value)} onHoverEnd={()=>clear('size:'+value)}>{({isFocused})=><FocusPreview active={isFocused} kind="size" value={String(value)} owner={'size:'+value} preview={preview} clear={clear}>{value}</FocusPreview>}</ListBoxItem>)}</ListBox></Popover>
  </ComboBox>
  <Button type="button" isDisabled={blocked} aria-label={copy.resetSize} onPress={()=>{apply('size',undefined);setTyping(false);}}><RotateCcw size={13}/></Button>
  <ColorPicker value={colorCandidate||hex} onChange={color=>{const next=color.toString('hex').toLowerCase();if(colorKeyboard.current){setColorCandidate(next);preview('color',next,'color:keyboard');}else apply('color',next);}}>
   <DialogTrigger onOpenChange={open=>{if(!open){clear();setColorCandidate(null);}}}><Button type="button" isDisabled={blocked} aria-label={copy.color}><span>{copy.color}</span><ColorSwatch/></Button>
    <Popover isNonModal data-puck-rte-menu className="retrofit-color-popover retrofit-control-popover" UNSTABLE_portalContainer={portal}><Dialog aria-label={copy.color}><div onPointerDownCapture={()=>{colorKeyboard.current=false;}} onKeyDownCapture={event=>{if(!['Tab','Escape','Enter','Shift','Control','Meta','Alt'].includes(event.key))colorKeyboard.current=true;if(event.key==='Enter'){colorKeyboard.current=false;if(colorCandidate){event.preventDefault();event.stopPropagation();apply('color',colorCandidate);}}if(event.key==='Escape'){clear();setColorCandidate(null);}}}>
     <div onPointerMove={event=>{if(event.buttons)return;const rect=event.currentTarget.getBoundingClientRect();if(!rect.width||!rect.height)return;const color=parseColor(colorCandidate||hex).toFormat('hsb').withChannelValue('saturation',Math.min(100,Math.max(0,(event.clientX-rect.left)/rect.width*100))).withChannelValue('brightness',Math.min(100,Math.max(0,100-(event.clientY-rect.top)/rect.height*100)));preview('color',color.toString('hex').toLowerCase(),'color:area');}} onPointerLeave={()=>clear('color:area')}><ColorArea colorSpace="hsb" xChannel="saturation" yChannel="brightness" aria-label={copy.area}><ColorThumb/></ColorArea></div>
     <div onPointerMove={event=>{if(event.buttons)return;const track=event.currentTarget.querySelector('.react-aria-SliderTrack');if(!track)return;const rect=track.getBoundingClientRect();if(!rect.width)return;const color=parseColor(colorCandidate||hex).toFormat('hsb').withChannelValue('hue',Math.min(360,Math.max(0,(event.clientX-rect.left)/rect.width*360)));preview('color',color.toString('hex').toLowerCase(),'color:hue');}} onPointerLeave={()=>clear('color:hue')}><ColorSlider colorSpace="hsb" channel="hue"><Label>{copy.hue}</Label><SliderTrack><ColorThumb/></SliderTrack></ColorSlider></div>
     <ColorField aria-label={copy.hex}><Label>{copy.hex}</Label><Input/></ColorField>
     <ColorSwatchPicker aria-label={copy.palette}>{config.palette.map(color=><ColorSwatchPickerItem key={color} color={color} onHoverStart={()=>preview('color',color,'color:'+color)} onHoverEnd={()=>clear('color:'+color)}>{({isFocused})=><FocusPreview active={isFocused} kind="color" value={color} owner={'color:'+color} preview={preview} clear={clear}><ColorSwatch/></FocusPreview>}</ColorSwatchPickerItem>)}</ColorSwatchPicker>
     <Button type="button" slot="close">{copy.close}</Button>
    </div></Dialog></Popover>
   </DialogTrigger>
  </ColorPicker>
  <Button type="button" isDisabled={blocked} aria-label={copy.resetColor} onPress={()=>apply('color',undefined)}><RotateCcw size={13}/></Button>
  {!inline&&!textOnly&&<DialogTrigger isOpen={linkOpen} onOpenChange={open=>{if(open)beginLink();setLinkOpen(open);}}>
   <Button type="button" isDisabled={blocked} aria-label={copy.link}><Link size={15}/></Button>
   <Popover isNonModal data-puck-rte-menu className="retrofit-control-popover retrofit-link-popover" UNSTABLE_portalContainer={portal}><Dialog aria-label={copy.link}>
    <DestinationField value={url} onChange={setURL} pages={config.pages} copy={config.destinationCopy||{destination:copy.url,otherDestination:copy.url,fragment:copy.url}}/>
    {linkError&&<p role="alert">{linkError}</p>}
    <div className="retrofit-control-actions"><Button type="button" onPress={()=>link(url)}>{copy.apply}</Button><Button type="button" onPress={()=>link(null)}>{copy.removeLink}</Button><Button type="button" slot="close">{copy.close}</Button></div>
   </Dialog></Popover>
  </DialogTrigger>}
 </>}</div></I18nProvider>;
}
