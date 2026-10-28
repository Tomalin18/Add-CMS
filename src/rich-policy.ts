/** Bounded Payload/Lexical document validation. The target supplies routes, style tokens and media policy. */
export type RichDocument={root:any};
export type BoundedPolicyOptions={url:(value:unknown)=>string;styles:(state:any)=>Record<string,string>;image?:(node:any)=>unknown;video?:(node:any)=>unknown;block?:(node:any)=>unknown};
/** Only exact registered internal paths and explicitly selected network protocols are accepted. */
export function createURLPolicy(paths:readonly string[],protocols:readonly string[]=['https:']){
 const routes=new Set(paths);
 if(paths.some(path=>!path.startsWith('/')||path.startsWith('//')||/[?#\\\s]/.test(path)))throw Error('Invalid route registry');
 return(value:unknown):string=>{
  if(typeof value!=='string'||!value||value.length>2000||/[\u0000-\u0020\u007f\\]/u.test(value))throw Error('url');
  if(/^#[A-Za-z][\w-]*$/.test(value))return value;
  if(value.startsWith('/')){const [pathname,fragment,...extra]=value.split('#');if(!routes.has(pathname)||extra.length||fragment!==undefined&&!/^[A-Za-z][\w-]*$/.test(fragment))throw Error('url');return value;}
  const url=new URL(value);if(!protocols.includes(url.protocol)||!['https:','http:'].includes(url.protocol)||url.username||url.password)throw Error('url');return value;
 };
}
export function createBoundedRichValidator(options:BoundedPolicyOptions){
function validateRich(value: any, inline = false): RichDocument {
  if (!value || typeof value !== 'object' || Object.keys(value).some((key) => key !== 'root') || JSON.stringify(value).length > 200000) throw new Error('document');
  let count = 0;
  function walk(node: any, parent: string, depth: number, linked = false) {
    if (++count > 2000 || depth > 12 || !node || typeof node !== 'object' || Array.isArray(node) || !(node.type === 'link'||node.type==='upload'||node.type==='block' ? [1,2,3].includes(node.version) : node.version === 1)) throw new Error('node');
    const type = node.type;
    if(type==='upload'){if(inline||parent!=='root')throw Error('image-parent');const validate=node.fields?.kind==='video'?options.video:options.image;if(!validate)throw Error('unsupported-media');validate(node);return;}
    if(type==='block'){if(inline||parent!=='root')throw Error('youtube-parent');if(!options.block)throw Error('unsupported-block');options.block(node);return;}
    const common = ['type','version','children','direction','format','indent'];
    const keys: Record<string,string[]> = { root: [...common,'textFormat'], paragraph: [...common,'textFormat','textStyle'], text: ['type','version','text','detail','format','mode','style','$'], linebreak: ['type','version'], link: [...common,'fields','id'], list: [...common,'listType','start','tag'], listitem: [...common,'value','checked'] };
    if (!keys[type] || Object.keys(node).some((key) => !keys[type].includes(key))) throw new Error('node');
    if (inline && !['root','paragraph','text'].includes(type)) throw new Error('inline');
    if (type === 'text') {
      options.styles(node.$);
      if (typeof node.text !== 'string' || (inline && /[\r\n]/.test(node.text)) || !Number.isInteger(node.format) || node.format < 0 || node.format > 3 || (node.style && node.style !== '') || (node.mode && node.mode !== 'normal') || (node.detail && node.detail !== 0)) throw new Error('text');
      if (!['paragraph','link','listitem'].includes(parent)) throw new Error('parent');
      return;
    }
    if (type === 'linebreak') { if (!['paragraph','link','listitem'].includes(parent)) throw new Error('parent'); return; }
    if (!Array.isArray(node.children) || ![undefined,null,'ltr','rtl'].includes(node.direction) || ![undefined,'',0].includes(node.format) || !Number.isInteger(node.indent ?? 0) || (node.indent ?? 0) < 0 || (node.indent ?? 0) > 6 || node.textStyle || ((node.textFormat ?? 0) & ~3)) throw new Error('element');
    if (type === 'root' && (parent || node.children.some((n: any) => !['paragraph','list','upload','block'].includes(n?.type)) || (inline && (node.children.length !== 1 || node.children[0]?.type !== 'paragraph')))) throw new Error('root');
    if (type === 'paragraph' && (!['root','listitem'].includes(parent) || node.children.some((n: any) => !['text','linebreak','link'].includes(n?.type)))) throw new Error('paragraph');
    if (type === 'link') {
      if (linked || !['paragraph','listitem'].includes(parent) || node.children.some((n: any) => !['text','linebreak'].includes(n?.type))) throw new Error('link');
      if(node.id!==undefined&&(typeof node.id!=='string'||!/^([a-f0-9]{24})?$/i.test(node.id)))throw new Error('id');
      const fields=node.fields; if (!fields || Object.keys(fields).some((key) => !['url','newTab','linkType','doc'].includes(key)) || fields.doc != null || fields.linkType !== 'custom' || (fields.newTab!==undefined && typeof fields.newTab !== 'boolean')) throw new Error('link');
      options.url(fields.url);
    }
    if (type === 'list' && (!['root','listitem'].includes(parent) || !['bullet','number'].includes(node.listType) || node.tag !== (node.listType === 'bullet' ? 'ul':'ol') || !Number.isInteger(node.start) || node.start < 1 || node.start > 10000 || node.children.some((n: any) => n?.type !== 'listitem'))) throw new Error('list');
    if (type === 'listitem' && (parent !== 'list' || node.checked !== undefined || !Number.isInteger(node.value) || node.value < 1 || node.children.some((n: any) => !['text','linebreak','link','paragraph','list'].includes(n?.type)))) throw new Error('listitem');
    for (const child of node.children) walk(child,type,depth+1,linked || type==='link');
  }
  if (value.root?.type !== 'root') throw new Error('root'); walk(value.root,'',0); if(richPlain(value).length>(inline?500:10000))throw new Error('length'); return value;
}
return validateRich;
}
export function textNode(text: string): any { return {type:'text',text,format:0,style:'',mode:'normal',detail:0,version:1}; }
export function richFromParagraphs(paragraphs: string[]): RichDocument {
  return {root:{type:'root',version:1,direction:null,format:'',indent:0,children:paragraphs.map((text) => ({type:'paragraph',version:1,direction:null,format:'',indent:0,textFormat:0,textStyle:'',children:String(text).replace(/\r\n?/g,'\n').split('\n').flatMap((line,index) => [...(index?[{type:'linebreak',version:1}]:[]),textNode(line)])}))}};
}
export function richPlain(value: RichDocument): string {
  const nodeText=(node: any): string => ['upload','block'].includes(node.type)?'':node.type==='text'?node.text:node.type==='linebreak'?'\n':(node.children||[]).map(nodeText).join(node.type==='root'||node.type==='list'?'\n\n':'');
  return nodeText(value.root);
}
