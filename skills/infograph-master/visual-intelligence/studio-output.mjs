export const studios=Object.freeze(['color','typography','composition','material','motion','representation']);
export function studioOutput(studio,payload,{status='generated',limitations=[]}={}){
 if(!studios.includes(studio)||!payload||typeof payload!=='object'||Array.isArray(payload))throw Error('invalid studio payload');
 if(!['generated','blocked','unsupported','invalid-data','choose'].includes(status)||!Array.isArray(limitations)||limitations.some(x=>typeof x!=='string'))throw Error('invalid output metadata');
 return {version:'1.0',kind:'infograph-studio-output',studio,status,payload,limitations,evidence:[],validation:{browser:'not-run',semantic:'not-run',audience:'not-run'}};
}
