'use client';
import React,{useContext,useEffect,useRef} from 'react';
import {Button} from 'react-aria-components';
import {registerOverlayPortal} from '@puckeditor/core';
import {ChevronLeft,ChevronRight} from 'lucide-react';
import {EditorModeContext} from './EditorMode';
/** Access to every fixed image slot while editor autoplay is paused; public layout is untouched. */
export function MappedCarousel({index,count,onChange,copy}:{index:number;count:number;onChange:(index:number)=>void;copy:{previousImage:string;nextImage:string}}){
 const editing=useContext(EditorModeContext);const ref=useRef<HTMLDivElement>(null);useEffect(()=>registerOverlayPortal(ref.current,{disableDrag:false,disableDragOnFocus:false}),[editing]);if(!editing||count<2)return null;
 return <div className="retrofit-mapped-carousel" ref={ref}><Button type="button" aria-label={copy.previousImage} onPress={()=>onChange((index-1+count)%count)}><ChevronLeft size={17}/></Button><span>{index+1} / {count}</span><Button type="button" aria-label={copy.nextImage} onPress={()=>onChange((index+1)%count)}><ChevronRight size={17}/></Button></div>;
}
