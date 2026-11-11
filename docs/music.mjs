export class MerryGoRoundMusic {
  constructor(){this.context=null;this.active=false;this.muted=false;this.step=0;this.timer=null;this.voices=new Set();}
  unlock(){
    if(!this.context){
      this.context=new (window.AudioContext||window.webkitAudioContext)();
      this.master=this.context.createGain();
      this.master.gain.value=0;
      this.master.connect(this.context.destination);
      this.wave=this.context.createPeriodicWave(new Float32Array([0,1,.22,.09,.04]),new Float32Array(5));
      this.timer=setInterval(()=>this.schedule(),40);
    }
    return this.context.resume();
  }
  setActive(active){
    if(this.active===active)return;
    this.active=active;
    if(!this.context)return;
    const t=this.context.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(active&&!this.muted?.42:0,t,.018);
    if(active){this.next=t+.025;this.schedule();}
    else{
      for(const v of this.voices){try{v.stop(t+.07);}catch{}}
      this.voices.clear();
    }
  }
  toggleMute(){
    this.muted=!this.muted;
    if(this.context)this.master.gain.setTargetAtTime(this.active&&!this.muted?.42:0,this.context.currentTime,.018);
    return this.muted;
  }
  note(midi,time,duration,volume,kind='bell'){
    const c=this.context,osc=c.createOscillator(),g=c.createGain();
    osc.frequency.value=440*2**((midi-69)/12);
    if(kind==='bell')osc.setPeriodicWave(this.wave);else osc.type='sine';
    g.gain.setValueAtTime(0,time);
    g.gain.linearRampToValueAtTime(volume,time+.008);
    g.gain.exponentialRampToValueAtTime(.0001,time+duration);
    osc.connect(g);g.connect(this.master);osc.start(time);osc.stop(time+duration+.02);
    this.voices.add(osc);
    osc.onended=()=>{this.voices.delete(osc);osc.disconnect();g.disconnect();};
  }
  schedule(){
    if(!this.active||!this.context||this.context.state!=='running')return;
    const tune=[76,79,83,81,79,76,74,76,79,78,74,71,72,76,79,78,76,72,71,74,78,79,78,74,76,79,83,86,83,79,81,79,76,74,71,74,72,76,79,83,81,78,79,76,72,71,74,78,76,79,83,81,79,76,74,78,81,79,78,74,72,76,79,78,76,72,71,74,78,79,78,74];
    const chords=[[48,64,67],[47,62,67],[45,60,64],[43,59,62],[48,64,67],[47,62,67],[45,60,64],[43,59,62]];
    const pulse=60/114/2;
    if(this.next<this.context.currentTime-.1)this.next=this.context.currentTime+.025;
    while(this.next<this.context.currentTime+.12){
      const i=this.step%tune.length,t=this.next;
      this.note(tune[i],t,.8,i%2===0?.18:.12);
      const c=chords[Math.floor(i/6)%chords.length];
      if(i%6===0)this.note(c[0],t,.55,.28,'bass');
      if(i%6===2||i%6===4){this.note(c[1],t,.35,.11,'bass');this.note(c[2],t,.35,.09,'bass');}
      if(i%12===0)this.note(tune[i]+12,t,1.2,.035);
      this.step++;this.next+=pulse;
    }
  }
  dispose(){clearInterval(this.timer);this.setActive(false);this.context?.close();}
}
