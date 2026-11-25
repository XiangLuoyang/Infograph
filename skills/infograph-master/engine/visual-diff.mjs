export function diffRGBA(a,b,{channelTolerance=8,maxChangedFraction=.001}={}){
 if(!Number.isFinite(channelTolerance)||channelTolerance<0||channelTolerance>255||!Number.isFinite(maxChangedFraction)||maxChangedFraction<0||maxChangedFraction>1)throw Error('invalid diff policy');
 for(const x of [a,b])if(!Number.isSafeInteger(x.width)||!Number.isSafeInteger(x.height)||x.width<1||x.height<1||x.data.length!==x.width*x.height*4)throw Error('invalid image');
 if(a.width!==b.width||a.height!==b.height)return {status:'dimension-mismatch',baseline:[a.width,a.height],candidate:[b.width,b.height]};
 const {width,height}=a,total=width*height;let changed=0,left=width,right=-1,top=height,bottom=-1;
 const mask=new Uint8Array(total*4);
 for(let i=0;i<total;i++){
 const j=i*4,aa=a.data[j+3]/255,ba=b.data[j+3]/255;
 const delta=Math.max(...[0,1,2].map(k=>Math.abs((a.data[j+k]*aa+255*(1-aa))-(b.data[j+k]*ba+255*(1-ba)))),Math.abs(a.data[j+3]-b.data[j+3]));
 if(delta>channelTolerance){changed++;const x=i%width,y=Math.floor(i/width);left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);mask.set([220,40,60,255],j)}
 }
 const fraction=changed/total;
 return {status:fraction<=maxChangedFraction?'within-tolerance':'review-required',width,height,changed,total,fraction,bounds:changed?{left,top,right,bottom}:null,policy:{channelTolerance,maxChangedFraction},mask};
}
