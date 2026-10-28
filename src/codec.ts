import {Window} from 'happy-dom';
import {createRichCodecWithDocument,type RichPolicy} from './codec-core';
export type {RichPolicy} from './codec-core';
export function createRichCodec(policy:RichPolicy){return createRichCodecWithDocument(policy,()=>{const win=new Window({settings:{disableJavaScriptEvaluation:true,disableJavaScriptFileLoading:true,disableCSSFileLoading:true,disableIframePageLoading:true}});return{document:win.document,close:()=>{void win.happyDOM.abort();}};});}
