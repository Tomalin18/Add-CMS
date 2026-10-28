'use client';
import {useEffect,type RefObject} from 'react';
import {useGetPuck} from '@puckeditor/core';
import type {ContentHistoryState} from './content-history';
/** Only exposes the public current Puck state to registered editor keyboard commands. */
export function ContentHistoryBridge({state}:{state:RefObject<(()=>ContentHistoryState)|null>}){
 const getPuck=useGetPuck();
 useEffect(()=>{state.current=getPuck;return()=>{state.current=null;};},[getPuck,state]);return null;
}
