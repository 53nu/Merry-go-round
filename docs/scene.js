window.merryGoRoundState??={active:false,tracking:false};

new p5(p=>{
  const state=window.merryGoRoundState;
  const C={gold:'#bb9257',lightGold:'#dfc294',pink:'#985567',rose:'#b77884',ivory:'#e9d7bd',cream:'#d8c5a9',deep:'#562d43',dark:'#2c2332',wood:'#73505b'};
  let architecture,horse,bulbs,angle=-.32,phase=0,glow=0,stars=[],dust=[],last=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const at=(x,y,z,fn)=>{p.push();p.translate(x,y,z);fn();p.pop();};
  const ball=(x,y,z,rx,ry,rz,color)=>at(x,y,z,()=>{p.fill(color);p.ellipsoid(rx,ry,rz,12,8);});
  function rod(a,b,r,color,detail=8){
    const d=p5.Vector.sub(p.createVector(...b),p.createVector(...a));
    p.push();p.translate((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);
    if(d.mag()>0){const axis=p.createVector(0,1,0).cross(d);if(axis.mag()>.001)p.rotate(Math.acos(p.constrain(d.y/d.mag(),-1,1)),axis);else if(d.y<0)p.rotateX(p.PI);}
    p.fill(color);p.cylinder(r,d.mag(),detail,1);p.pop();
  }
  function ring(r,y,t,color){at(0,y,0,()=>{p.fill(color);p.rotateX(p.HALF_PI);p.torus(r,t,80,6);});}
  function drum(r,y,h,color,detail=80){at(0,y,0,()=>{p.fill(color);p.cylinder(r,h,detail,1);});}
  function lineCurve(points,r,color){for(let i=1;i<points.length;i++)rod(points[i-1],points[i],r,color,6);}
  function makeHorse(){
    p.noStroke();
    ball(0,0,0,32,15,11,C.ivory);
    ball(-21,0,0,16,16,12,C.ivory);
    ball(21,-3,0,14,18,11,C.ivory);
    rod([19,-6,0],[31,-39,0],10.5,C.ivory,12);
    ball(31,-31,0,11,20,9,C.ivory);
    at(40,-44,0,()=>{p.rotateZ(-.34);p.fill(C.ivory);p.ellipsoid(16,9,8,12,8);});
    ball(49,-41,0,8,6,7,C.cream);
    at(30,-57,4,()=>{p.rotateZ(-.23);p.fill(C.ivory);p.cone(4,17,8,1);});
    at(35,-56,-4,()=>{p.rotateZ(.2);p.fill(C.ivory);p.cone(3,16,8,1);});
    ball(39,-47,7.1,1.5,1.7,.9,'#302432');
    ball(39,-47,-7.1,1.5,1.7,.9,'#302432');
    for(let i=0;i<9;i++)ball(22-i*.65,-45+i*4.1,0,4.2,5.8,9.2,C.gold);
    lineCurve([[-28,-6,0],[-39,-4,0],[-43,7,0],[-44,22,0],[-39,29,0]],5.5,C.gold);
    lineCurve([[-30,-6,0],[-41,-5,-2],[-48,7,-2],[-48,20,-2]],2.5,C.lightGold);
    const legs=[[[20,8,7],[29,26,8],[43,27,8],[47,35,8]],[[12,8,-7],[3,25,-7],[14,36,-7],[24,36,-7]],[[-21,9,7],[-28,29,7],[-20,40,7],[-10,40,7]],[[-26,8,-7],[-38,21,-7],[-43,37,-7],[-38,39,-7]]];
    for(const leg of legs){lineCurve(leg,3.3,C.ivory);const q=leg.at(-1);ball(...q,5,3.2,4,C.gold);}
    at(-1,-13,0,()=>{p.fill(C.deep);p.ellipsoid(17,5,12,14,6);});
    at(-2,-16,0,()=>{p.fill(C.gold);p.ellipsoid(13,2.2,10,14,6);});
    rod([-13,-15,-11],[-13,3,-11],1.1,C.gold);
    rod([-13,-15,11],[-13,3,11],1.1,C.gold);
    at(4,-.3,0,()=>{p.fill(C.pink);p.scale(1,1.1,1);p.box(18,22,23);});
    rod([30,-48,8],[43,-39,8],1,C.deep);
    rod([30,-48,-8],[43,-39,-8],1,C.deep);
    lineCurve([[42,-39,8],[28,-15,14],[13,-18,12]],.8,C.gold);
    lineCurve([[42,-39,-8],[28,-15,-14],[13,-18,-12]],.8,C.gold);
    for(const side of [-1,1]){
      at(3,7,side*12,()=>{p.fill(C.lightGold);p.rotateZ(p.PI/4);p.box(7,7,1);});
      rod([-1,-11,side*13],[2,20,side*14],.9,C.gold);
      at(2,20,side*14,()=>{p.fill(C.gold);p.torus(3,1,8,5);});
    }
  }
  function roof(){
    const profile=[[0,-268],[25,-245],[65,-222],[112,-198],[160,-176],[210,-158],[216,-154]];
    const sectors=24;
    for(let i=0;i<sectors;i++){
      p.fill(i%2===0?C.pink:C.ivory);
      p.beginShape(p.TRIANGLES);
      for(let j=1;j<profile.length;j++){
        const [r0,y0]=profile[j-1],[r1,y1]=profile[j];
        for(let k=0;k<4;k++){
          const a=(i+k/4)*p.TWO_PI/sectors,b=(i+(k+1)/4)*p.TWO_PI/sectors;
          for(const [r,y,t] of [[r0,y0,a],[r1,y1,a],[r1,y1,b],[r0,y0,a],[r1,y1,b],[r0,y0,b]]){p.normal(Math.cos(t)*.53,-.848,Math.sin(t)*.53);p.vertex(r*Math.cos(t),y,r*Math.sin(t));}
        }
      }
      p.endShape();
      const a=i*p.TWO_PI/sectors;
      for(let j=1;j<profile.length;j++){
        const [r0,y0]=profile[j-1],[r1,y1]=profile[j];
        rod([r0*Math.cos(a),y0-.8,r0*Math.sin(a)],[r1*Math.cos(a),y1-.8,r1*Math.sin(a)],.8,C.lightGold,5);
      }
    }
    drum(216,-146,17,C.deep);
    ring(216,-155,3.2,C.gold);ring(216,-137,2.7,C.gold);
    for(let i=0;i<24;i++){
      const a=(i+.5)*p.TWO_PI/24;
      p.push();p.rotateY(-a);p.translate(216,-139,0);p.rotateY(p.HALF_PI);
      p.fill(i%2===0?C.pink:C.rose);
      p.beginShape();
      for(let j=0;j<=16;j++){const t=p.PI*j/16;p.vertex(-26*Math.cos(t),Math.sin(t)*15,0);}
      p.endShape(p.CLOSE);
      for(let j=0;j<12;j++){
        const a0=p.PI*j/12,a1=p.PI*(j+1)/12;
        rod([-26*Math.cos(a0),Math.sin(a0)*15,.5],[-26*Math.cos(a1),Math.sin(a1)*15,.5],.8,C.lightGold,5);
      }
      ball(0,16,0,2.8,3.7,2.8,C.gold);
      p.pop();
    }
    at(0,-276,0,()=>{p.fill(C.gold);p.sphere(7,12,8);});
    rod([0,-277,0],[0,-301,0],1.5,C.gold);
    p.fill(C.pink);p.beginShape();p.vertex(1,-301,0);p.vertex(33,-294,0);p.vertex(1,-284,0);p.endShape(p.CLOSE);
    at(0,-159,0,()=>{p.fill(C.gold);p.sphere(15,16,10);});
  }
  function makeArchitecture(){
    p.noStroke();
    drum(227,177,15,C.deep);ring(225,184,2.3,C.gold);
    drum(224,162,19,C.pink);ring(225,154,3.8,C.gold);ring(225,171,2.5,C.gold);
    drum(214,147,10,C.cream);ring(211,141,2,C.gold);ring(190,141,1,C.gold);ring(80,141,.9,C.gold);
    for(let i=0;i<48;i++){
      const a=i*p.TWO_PI/48;
      at(225*Math.cos(a),163,225*Math.sin(a),()=>{p.rotateY(-a);p.fill(C.lightGold);p.scale(1,1.6,1);p.sphere(1.8,6,4);});
    }
    drum(45,131,21,C.deep,16);ring(45,120,3,C.gold);
    drum(29,-8,262,C.cream,12);ring(29,105,3,C.gold);ring(29,-122,3,C.gold);
    for(let i=0;i<12;i++){
      const a=i*p.TWO_PI/12;
      rod([30*Math.cos(a),-124,30*Math.sin(a)],[30*Math.cos(a),109,30*Math.sin(a)],1.2,C.gold,6);
      p.push();p.rotateY(-a);p.translate(30,-15,0);p.rotateY(p.HALF_PI);p.fill(i%2===0?C.rose:C.deep);p.box(10,174,1);p.pop();
      for(const y of [-109,82])ball(32*Math.cos(a),y,32*Math.sin(a),2.7,5.5,2.7,C.gold);
    }
    for(let i=0;i<8;i++){
      const a=i*p.TWO_PI/8,r=164;
      const x=r*Math.cos(a),z=r*Math.sin(a);
      rod([x,-137,z],[x,137,z],2.3,C.gold,10);
      for(const y of [-125,126])ball(x,y,z,4,4,4,C.lightGold);
      const helix=[];
      for(let k=0;k<=55;k++){const t=k/55;helix.push([x+2.9*Math.cos(t*p.TWO_PI*8),-130+t*261,z+2.9*Math.sin(t*p.TWO_PI*8)]);}
      lineCurve(helix,.65,C.lightGold);
    }
    for(let i=0;i<8;i++){
      const a=i*p.TWO_PI/8;
      rod([0,-150,0],[210*Math.cos(a),-150,210*Math.sin(a)],2.7,C.gold);
    }
    roof();
  }
  function makeBulbs(){
    p.noStroke();p.fill(255);
    for(const [r,y,count,size] of [[217,-154,96,2.05],[218,-136,72,1.55],[224,154,96,1.7],[224,173,72,1.45],[29,106,20,1.4]]){
      for(let i=0;i<count;i++){const a=i*p.TWO_PI/count;at(r*Math.cos(a),y,r*Math.sin(a),()=>p.sphere(size,5,4));}
    }
    const profile=[[22,-246],[61,-224],[109,-199],[158,-178],[210,-159]];
    for(let i=0;i<12;i++){
      const a=i*p.TWO_PI/12;
      for(let j=1;j<profile.length;j++){
        const [r0,y0]=profile[j-1],[r1,y1]=profile[j];
        for(let k=0;k<3;k++){const t=k/3,r=r0+(r1-r0)*t,y=y0+(y1-y0)*t-1;at(r*Math.cos(a),y,r*Math.sin(a),()=>p.sphere(1.45,5,4));}
      }
    }
  }
  p.setup=()=>{
    const canvas=p.createCanvas(window.innerWidth,window.innerHeight,p.WEBGL);canvas.parent('stage');canvas.elt.setAttribute('aria-hidden','true');
    p.pixelDensity(Math.min(window.devicePixelRatio,1.6));p.setAttributes('antialias',true);p.noStroke();
    architecture=p.buildGeometry(makeArchitecture);
    horse=p.buildGeometry(makeHorse);
    bulbs=p.buildGeometry(makeBulbs);
    p.randomSeed(726);
    stars=Array.from({length:78},()=>({x:p.random(-1,1),y:p.random(-1,1),r:p.random(.45,1.3),a:p.random(.15,.55)}));
    dust=Array.from({length:34},()=>({a:p.random(p.TWO_PI),r:p.random(240,355),y:p.random(-290,175),v:p.random(.3,1),size:p.random(1,2.8)}));
    last=performance.now();
  };
  function backdrop(){
    p.push();p.resetMatrix();p.noLights();p.ortho(-p.width/2,p.width/2,-p.height/2,p.height/2,-2000,2000);
    p.noStroke();
    for(const star of stars){p.fill(199,175,159,star.a*100);p.circle(star.x*p.width*.48,star.y*p.height*.47,star.r);}
    p.pop();
  }
  function ground(s){
    p.push();p.translate(0,194,0);p.rotateX(p.HALF_PI);p.noLights();p.noStroke();
    for(let i=16;i>0;i--){p.fill(1,1,8,3.3);p.ellipse(0,0,465+i*10,415+i*10);}
    if(glow>.01){for(let i=10;i>0;i--){p.fill(238,165,78,glow*1.2);p.ellipse(0,0,440+i*15,440+i*15);}}
    p.noFill();p.stroke(198,166,128,12+glow*12);p.strokeWeight(.6);p.circle(0,0,545);p.circle(0,0,559);
    for(let i=0;i<48;i++){const a=i*p.TWO_PI/48;p.stroke(198,166,128,i%4===0?38:15);p.line(276*Math.cos(a),276*Math.sin(a),(i%4===0?282:279)*Math.cos(a),(i%4===0?282:279)*Math.sin(a));}
    p.pop();
  }
  p.draw=()=>{
    const now=performance.now(),dt=Math.min((now-last)/1000,.05);last=now;
    if(state.active){angle+=dt*(reduced?.105:.24);phase+=dt*1.05;}
    glow+=(Number(state.active)-glow)*(1-Math.exp(-dt*(state.active?5:19)));
    if(glow<.001)glow=0;
    document.documentElement.style.setProperty('--glow',glow.toFixed(3));
    p.clear();backdrop();
    const s=Math.min(p.width*.79/500,p.height*.76/540,1.6);
    p.ortho(-p.width/2,p.width/2,-p.height/2,p.height/2,1,3000);
    p.camera(0,-240,1000,0,-25,0,0,1,0);
    p.push();p.translate(0,26*s,0);p.scale(s);ground(s);
    p.ambientLight(94+glow*48,85+glow*30,110+glow*3);
    p.directionalLight(169+glow*45,154+glow*31,172+glow*4,-.5,.65,-.6);
    p.directionalLight(73,66,103,.7,-.15,.5);
    if(glow>.01){p.pointLight(255*glow,193*glow,105*glow,0,-130,180);p.pointLight(213*glow,133*glow,80*glow,-180,-220,40);}
    p.push();p.rotateY(angle);p.noStroke();p.fill(255);p.shininess(35);p.model(architecture);
    for(let i=0;i<8;i++){
      const a=i*p.TWO_PI/8;
      p.push();p.rotateY(-a);p.translate(164,35+Math.sin(phase+i*p.PI/2)*15,0);p.rotateY(p.HALF_PI);p.scale(1.02);p.fill(255);p.model(horse);p.pop();
    }
    p.push();p.noLights();p.emissiveMaterial(30+glow*225,36+glow*190,31+glow*137);p.model(bulbs);p.pop();
    if(glow>.01){
      p.push();p.blendMode(p.ADD);p.noLights();p.emissiveMaterial(255,176,88,glow*18);p.model(bulbs);p.pop();
    }
    p.pop();
    if(glow>.01){
      p.noLights();p.noStroke();
      for(const d of dust){
        const a=d.a+phase*.04*d.v;
        p.push();p.translate(Math.cos(a)*d.r,d.y-Math.sin(phase*.4+d.a)*10,Math.sin(a)*d.r);p.emissiveMaterial(255,214,150,glow*(40+Math.sin(phase+d.a)*20));p.sphere(d.size,5,4);p.pop();
      }
    }
    p.pop();
  };
  p.windowResized=()=>p.resizeCanvas(window.innerWidth,window.innerHeight);
});
