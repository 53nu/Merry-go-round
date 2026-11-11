export function eyeAspectRatio(points, indices, aspect=4/3) {
  const d=(a,b)=>Math.hypot((points[a].x-points[b].x)*aspect,points[a].y-points[b].y);
  const [a,b,c,d1,e,f]=indices;
  const width=d(a,d1);
  return width>0?(d(b,f)+d(c,e))/(2*width):1;
}

export class EyeState {
  constructor(){this.closed=false;this.candidateSince=null;this.openBaseline=.29;this.lastSeen=0;}
  update(landmarks, blendshapes, now, aspect=4/3) {
    if(!landmarks?.length){this.reset();return false;}
    this.lastSeen=now;
    const left=eyeAspectRatio(landmarks,[33,160,158,133,153,144],aspect);
    const right=eyeAspectRatio(landmarks,[362,385,387,263,373,380],aspect);
    const values=Object.fromEntries((blendshapes||[]).map(v=>[v.categoryName,v.score]));
    const blinkL=values.eyeBlinkLeft??0;
    const blinkR=values.eyeBlinkRight??0;
    if(Math.min(left,right)>.21&&Math.max(blinkL,blinkR)<.25){
      this.openBaseline=this.openBaseline*.97+((left+right)/2)*.03;
    }
    const closeThreshold=Math.max(.13,Math.min(.19,this.openBaseline*.57));
    const openThreshold=closeThreshold+.045;
    const closeSignal=(left<closeThreshold&&right<closeThreshold)||(blinkL>.6&&blinkR>.6);
    const openSignal=(left>openThreshold||right>openThreshold)||(blinkL<.32||blinkR<.32)&&!(left<closeThreshold&&right<closeThreshold);
    const change=this.closed?openSignal:closeSignal;
    if(!change){this.candidateSince=null;return this.closed;}
    if(this.candidateSince===null)this.candidateSince=now;
    if(now-this.candidateSince>=(this.closed?35:190)){
      this.closed=!this.closed;
      this.candidateSince=null;
    }
    return this.closed;
  }
  reset(){this.closed=false;this.candidateSince=null;this.lastSeen=0;}
}
