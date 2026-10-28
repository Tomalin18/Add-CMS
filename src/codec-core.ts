export type RichPolicy={validate:(value:any,inline?:boolean)=>any;url:(value:unknown)=>string;styles:(state:any)=>Record<string,string>;embed?:{encode:(node:any)=>Record<string,string>;decode:(attrs:Record<string,string>)=>any};media?:{encode:(node:any)=>Record<string,string>;decode:(attrs:Record<string,string>)=>any}};
const esc=(s:any)=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const base=(type:string,children:any[])=>({type,version:1,children,direction:null,format:'',indent:0});
export function createRichCodecWithDocument(policy:RichPolicy,createDocument:()=>{document:any;close?:()=>void}){
 function encode(value:any,inline=false):string{
  policy.validate(value,inline);
  const render=(n:any):string=>{
   if(n.direction!=null||n.indent)throw Error('unsupported-layout');
   if(n.type==='text'){
    let out=esc(n.text).replace(/\r\n?/g,'\n').replaceAll('\n','<br>');
    if(n.format&1)out='<strong>'+out+'</strong>';if(n.format&2)out='<em>'+out+'</em>';
    if(n.$&&Object.keys(n.$).length){const css=Object.entries(policy.styles(n.$)).map(([k,v])=>k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())+':'+v).join(';');out='<span'+Object.entries(n.$).map(([k,v])=>' data-cms-'+k+'="'+esc(v)+'"').join('')+' style="'+esc(css)+'">'+out+'</span>';}
    return out;
   }
   if(n.type==='upload'){if(!policy.media||inline)throw Error('image');const attrs=policy.media.encode(n);const tag=attrs['data-cms-kind']==='video'?'video':'img';return '<'+tag+Object.entries(attrs).map(([key,value])=>' '+key+'="'+esc(value)+'"').join('')+(tag==='video'?' controls preload="metadata"></video>':'>'); }
   if(n.type==='block'){if(!policy.embed||inline)throw Error('embed');return '<div data-youtube-video=""><iframe'+Object.entries(policy.embed.encode(n)).map(([key,value])=>' '+key+'="'+esc(value)+'"').join('')+'></iframe></div>';}
   const content=(n.children||[]).map(render).join('');
   if(n.type==='root')return content;if(n.type==='paragraph')return '<p'+(n.textFormat?' data-cms-text-format="'+n.textFormat+'"':'')+'>'+content+'</p>';if(n.type==='linebreak')return '<br>';
   if(n.type==='link')return '<a href="'+esc(policy.url(n.fields.url))+'"'+(n.fields.newTab?' target="_blank" rel="noopener noreferrer"':'')+(n.id?' data-cms-link-id="'+n.id+'"':'')+'>'+content+'</a>';
   if(n.type==='list')return n.listType==='number'?'<ol start="'+n.start+'">'+content+'</ol>':'<ul>'+content+'</ul>';
   if(n.type==='listitem')return '<li value="'+n.value+'">'+content+'</li>';
   throw Error('unsupported-node');
  };return render(value.root);
 }
 function decode(html:string,inline=false):any{
  if(typeof html!=='string'||html.length>200000)throw Error('size');
  const scope=createDocument();const document=scope.document;
  const template=document.createElement('template');template.innerHTML=html;let count=0;
  const parse=(node:any,marks=0,state:any=undefined,depth=0):any[]=>{
   if(++count>2000||depth>12)throw Error('depth');
   if(node.nodeType===3)return node.textContent?[{type:'text',version:1,text:node.textContent,format:marks,style:'',mode:'normal',detail:0,...(state?{$:state}:{})}]:[];
   if(node.nodeType!==1)throw Error('node');
   const tag=node.localName;const attrs=Object.fromEntries([...node.attributes].map((a:any)=>[a.name,a.value]));
   const allowed:any={p:['data-cms-text-format'],strong:[],b:[],em:[],i:[],br:[],span:['data-cms-font','data-cms-size','data-cms-color','style'],a:['href','target','rel','data-cms-link-id'],ul:[],ol:['start'],li:['value'],div:['data-youtube-video'],iframe:['src','title','data-cms-node-id','sandbox','allow','referrerpolicy','loading','allowfullscreen'],video:['src','aria-label','data-cms-media-id','data-cms-node-id','data-cms-kind','controls','preload'],img:['src','alt','width','height','data-cms-media-id','data-cms-node-id']};
   if(!allowed[tag]||Object.keys(attrs).some(k=>!allowed[tag].includes(k)))throw Error('html');
   if(tag==='div'){if(inline||!policy.embed||attrs['data-youtube-video']!==''||node.children.length!==1||node.childNodes.length!==1||node.children[0].localName!=='iframe')throw Error('embed');return parse(node.children[0],marks,state,depth+1);}
   if(tag==='iframe'){if(inline||!policy.embed||node.parentElement?.localName!=='div'||!node.parentElement.hasAttribute('data-youtube-video')||node.childNodes.length)throw Error('embed');return[policy.embed.decode(attrs as Record<string,string>)];}
   if(tag==='video'){if(inline||!policy.media||node.childNodes.length||attrs.controls!==''||attrs.preload!=='metadata'||attrs['data-cms-kind']!=='video')throw Error('video');return[policy.media.decode(Object.fromEntries(Object.entries(attrs).filter(([key])=>!['controls','preload'].includes(key))) as Record<string,string>)];}
   if(tag==='img'){if(!policy.media||inline)throw Error('image');return[policy.media.decode(attrs as Record<string,string>)];}
   let next=state;
   if(tag==='span'){
    next={...state};for(const key of ['font','size','color'])if(attrs['data-cms-'+key]!==undefined)next[key]=attrs['data-cms-'+key];
    const style=policy.styles(next);const expected=document.createElement('span');Object.assign(expected.style,style);
    const actual=document.createElement('span');actual.setAttribute('style',attrs.style||'');
    if(actual.style.cssText!==expected.style.cssText)throw Error('style');if(!Object.keys(next).length)next=undefined;
   }
   const children=()=>[...node.childNodes].flatMap((child:any)=>parse(child,tag==='b'||tag==='strong'?marks|1:tag==='i'||tag==='em'?marks|2:marks,next,depth+1));
   if(['span','strong','b','em','i'].includes(tag))return children();
   if(tag==='br')return[{type:'linebreak',version:1}];
   if(tag==='p')return[{...base('paragraph',children()),textFormat:Number(attrs['data-cms-text-format']||0),textStyle:''}];
   if(tag==='a'){
    const target=attrs.target;if(target!==undefined&&!['_blank','_self'].includes(target))throw Error('target');
    if(attrs.rel&&!attrs.rel.split(/\s+/).every((v:string)=>['noopener','noreferrer','nofollow'].includes(v)))throw Error('rel');
    return[{...base('link',children()),version:3,...(attrs['data-cms-link-id']?{id:attrs['data-cms-link-id']}:{}),fields:{url:policy.url(attrs.href),linkType:'custom',newTab:target==='_blank'}}];
   }
   if(tag==='ul'||tag==='ol')return[{...base('list',children()),listType:tag==='ol'?'number':'bullet',tag,start:Number(attrs.start||1)}];
   if(tag==='li'){const list=children();return[{...base('listitem',list.length===1&&list[0].type==='paragraph'?list[0].children:list),value:Number(attrs.value||1)}];}
   throw Error('html');
  };
  try{const value={root:base('root',[...template.content.childNodes].flatMap((n:any)=>parse(n)))};policy.validate(value,inline);return value;}
  finally{scope.close?.();}
 }
 return{encode,decode};
}
