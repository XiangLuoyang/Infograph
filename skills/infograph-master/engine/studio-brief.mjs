export function validateBrief(d){
 const errors=[];
 for(const k of ['title','claim','note','unit'])if(typeof d[k]!=='string'||!d[k].trim()||d[k].length>(k==='unit'?24:1000))errors.push(k+': required or too long');
 if(typeof d.subtitle!=='string'||d.subtitle.length>1000)errors.push('subtitle: invalid');
 if(!Array.isArray(d.rows)||d.rows.length<1||d.rows.length>20)errors.push('rows: expected 1–20');
 else {const seen=new Set();for(const row of d.rows){if(!row||typeof row.label!=='string'||!row.label.trim()||row.label.length>18||seen.has(row.label)||!Number.isFinite(row.value)||row.value<0||row.value>1e12)errors.push('row: invalid or duplicate');else seen.add(row.label)}}
 return {valid:errors.length===0,errors,semantic:'not-run'};
}
export function parseRows(text){const rows=JSON.parse(text);if(!Array.isArray(rows))throw Error('expected JSON array');return rows}
