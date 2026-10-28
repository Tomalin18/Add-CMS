export type MappedImage={id:string;slot:string;path:string;rowId?:string;legacyUrl:string;media:number|null;alt:string;width?:number;height?:number};
export function projectMappedImages(seeds:MappedImage[],fields:Record<string,any>,assets:Map<number,{width:number;height:number}> = new Map()){
 return seeds.flatMap(seed=>{const parts=seed.path.split('.');const index=parts.findIndex(part=>/^\d+$/.test(part));const array=index>=0?fields[parts.slice(0,index).join('.')]:undefined;if(array?.rows&&Number(parts[index])>=array.rows.length)return[];
 const read=(key:string,fallback:any)=>fields[seed.path+'.'+key]?.value??fallback;const raw=read('media',seed.media);const media=raw&&typeof raw==='object'?raw.id:raw;const asset=assets.get(Number(media));return[{...seed,media:media?Number(media):null,alt:read('alt',seed.alt),legacyUrl:read('legacyUrl',seed.legacyUrl),rowId:array?.rows?.[Number(parts[index])]?.id??seed.rowId,width:asset?.width??(media===seed.media?seed.width:undefined),height:asset?.height??(media===seed.media?seed.height:undefined)}];});
}
/** Only registered slots and the current native row identity can change a reference. */
export function mappedImagePatch(images:MappedImage[],id:string,rowId:string|undefined,asset:{id:number;alt:string}|null,fields:Record<string,any>){
 const image=images.find(image=>image.id===id);if(!image||image.rowId!==rowId)throw Error('image-binding');
 const patch:Record<string,any>={[image.path+'.media']:{...fields[image.path+'.media'],value:asset?.id??null,valid:true,isModified:true}};
 if(asset)patch[image.path+'.alt']={...fields[image.path+'.alt'],value:asset.alt,valid:true,isModified:true};return patch;
}

export function mappedImageAltPatch(images:MappedImage[],id:string,rowId:string|undefined,alt:unknown,baseline:unknown,fields:Record<string,any>){const image=images.find(image=>image.id===id);if(!image||image.rowId!==rowId||image.alt!==baseline||typeof alt!=='string'||alt.length>500||/[\u0000]/.test(alt))throw Error('image-alt');return{[image.path+'.alt']:{...fields[image.path+'.alt'],value:alt,valid:true,isModified:true}};}
