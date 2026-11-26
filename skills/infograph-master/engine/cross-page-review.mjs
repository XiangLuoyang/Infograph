import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function buildContactSheet(pairs,out){
 if(!Array.isArray(pairs)||!pairs.length||pairs.length>20)throw Error('bounded capture pairs required');
 const rows=[],seen=new Set(),versions={before:null,after:null};let incomplete=0,bytes=0;
 for(const pair of pairs){
  const b=pair.before,a=pair.after;if(!b?.report||!a?.report||!b.dir||!a.dir)throw Error('invalid pair');
  const r=b.report,q=a.report;if(!r.sourceRef||!q.sourceRef||!r.viewport||JSON.stringify(r.viewport)!==JSON.stringify(q.viewport))throw Error('unmatched viewport');
  if((versions.before&&versions.before!==r.sourceRef)||(versions.after&&versions.after!==q.sourceRef))throw Error('mixed artifact versions');versions.before=r.sourceRef;versions.after=q.sourceRef;
  const ids=[...new Set([...r.states,...q.states].map(s=>s.id))];
  for(const id of ids){
   const k=JSON.stringify([r.viewport.width,r.viewport.height,id]);if(seen.has(k))throw Error('duplicate view/state');seen.add(k);
   const render=async side=>{const matches=side.report.states.filter(s=>s.id===id);const s=matches[0];if(matches.length!==1||s.status!=='observed'||!s.capture){incomplete++;return '<p>Not verified: '+esc(s?.status||'missing')+'</p>'}
    if(!/^[a-f0-9]{24}\.png$/.test(s.capture.filename)||!/^[a-f0-9]{64}$/.test(s.capture.sha256))throw Error('invalid capture reference');
    const png=await readFile(join(side.dir,s.capture.filename));bytes+=png.length;if(bytes>60*1024*1024)throw Error('capture byte budget exceeded');
    if(createHash('sha256').update(png).digest('hex')!==s.capture.sha256)throw Error('capture hash mismatch');
    return '<img alt="'+esc(id)+'" src="data:image/png;base64,'+png.toString('base64')+'">';};
   rows.push('<section><h2>'+esc(id)+' · '+r.viewport.width+'×'+r.viewport.height+'</h2><div class="pair"><article><h3>Before</h3>'+await render(b)+'</article><article><h3>After</h3>'+await render(a)+'</article></div></section>');
  }
 }
 const html='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cross-page review</title><style>body{font:14px system-ui;background:#f2f4f3;color:#26332e;margin:24px}section{background:white;padding:16px;margin:16px 0;border:1px solid #d7ded9}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}article{min-width:0}img{width:100%;height:auto;border:1px solid #ddd}h2{font-size:16px}@media(max-width:700px){.pair{grid-template-columns:1fr}}</style><h1>Cross-page visual review</h1><p>Matched viewport screenshots · not aesthetic approval · incomplete captures: '+incomplete+'</p><p>'+esc(versions.before)+' → '+esc(versions.after)+'</p>'+rows.join('')+'</html>';
 await writeFile(out,html,{flag:'wx'});return {pairs:rows.length,incomplete,output:out,scope:'matched viewport screenshots, not full page coverage or visual approval'};
}
