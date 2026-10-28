import type {CSSProperties} from 'react';
export type EditorTheme={surface?:string;text?:string;border?:string;focus?:string;hover?:string;selected?:string};
/** Set on the authenticated editor document (including iframe) so body portals share the same theme. */
export function editorThemeVariables(theme:EditorTheme):CSSProperties {
 const allowed=['surface','text','border','focus','hover','selected'];
 return Object.fromEntries(Object.entries(theme).map(([key,value])=>{
  if(!allowed.includes(key)||typeof value!=='string'||!/^#[0-9a-f]{6}$/i.test(value))throw Error('Invalid editor theme token');
  return ['--retrofit-ui-'+key,value];
 })) as CSSProperties;
}
