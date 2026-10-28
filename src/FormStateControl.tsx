'use client';
import React,{useEffect,useRef} from 'react';
import {registerOverlayPortal} from '@puckeditor/core';
import {AutoField} from '@puckeditor/core';
export function FormStateControl({value,onChange,label,options}:{value:string;onChange:(value:string)=>void;label:string;options:{label:string;value:string}[]}){const ref=useRef<HTMLDivElement>(null);useEffect(()=>registerOverlayPortal(ref.current,{disableDrag:true}),[]);return <div ref={ref} className="retrofit-form-state"><AutoField field={{type:'select',options,label}} value={value} onChange={onChange}/></div>;}
