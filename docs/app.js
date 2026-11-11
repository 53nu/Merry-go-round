import { FilesetResolver, FaceLandmarker } from './vendor/vision_bundle.mjs';
import { EyeState } from './eye-state.mjs';
import { MerryGoRoundMusic } from './music.mjs';

const video=document.querySelector('#camera');
const panel=document.querySelector('#camera-panel');
const start=document.querySelector('#start');
const stop=document.querySelector('#stop');
const sound=document.querySelector('#sound');
const canvas=document.querySelector('#mesh');
const ctx=canvas.getContext('2d');
const status=document.querySelector('#status');
const errorLabel=document.querySelector('#camera-error');
const eyes=new EyeState();
const music=new MerryGoRoundMusic();
const scene=window.merryGoRoundState??={active:false,tracking:false};
let landmarker,modelPromise,stream,running=false,starting=false,lastVideoTime=-1,lastInference=0,lastResult=0,loop=0,epoch=0;

async function loadModel(){
  const vision=await FilesetResolver.forVisionTasks(new URL('./vendor/wasm',import.meta.url).href);
  const options={baseOptions:{modelAssetPath:new URL('./vendor/face_landmarker.task',import.meta.url).href,delegate:'GPU'},runningMode:'VIDEO',numFaces:1,outputFaceBlendshapes:true,minFaceDetectionConfidence:.55,minFacePresenceConfidence:.55,minTrackingConfidence:.55};
  try{return await FaceLandmarker.createFromOptions(vision,options);}
  catch(error){options.baseOptions.delegate='CPU';return FaceLandmarker.createFromOptions(vision,options);}
}

function setActive(active){
  active=Boolean(active&&running&&!document.hidden);
  if(scene.active===active)return;
  scene.active=active;
  panel.classList.toggle('active',active);
  music.setActive(active);
  status.textContent=active?'눈 감음. 회전목마가 움직입니다.':'눈 뜸. 회전목마가 멈췄습니다.';
}

function drawConnections(points,connections,color,width){
  const ratio=video.videoWidth/video.videoHeight;
  const w=ratio>=4/3?480:360*ratio,h=w/ratio;
  const ox=(480-w)/2,oy=(360-h)/2;
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();
  for(const {start:a,end:b} of connections){
    ctx.moveTo(ox+points[a].x*w,oy+points[a].y*h);
    ctx.lineTo(ox+points[b].x*w,oy+points[b].y*h);
  }
  ctx.stroke();
}

function processResult(result,now){
  const points=result.faceLandmarks?.[0];
  scene.tracking=Boolean(points);
  panel.classList.toggle('tracking',scene.tracking);
  ctx.clearRect(0,0,480,360);
  if(points){
    lastResult=now;
    setActive(eyes.update(points,result.faceBlendshapes?.[0]?.categories,now,video.videoWidth/video.videoHeight));
    drawConnections(points,FaceLandmarker.FACE_LANDMARKS_TESSELATION,'rgba(175,209,195,.22)',.65);
    drawConnections(points,FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,'rgba(191,220,205,.42)',1);
    const eyeColor=scene.active?'rgba(255,216,145,.96)':'rgba(185,228,210,.9)';
    drawConnections(points,FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,eyeColor,1.8);
    drawConnections(points,FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,eyeColor,1.8);
    drawConnections(points,FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,'rgba(245,213,158,.7)',1.1);
    drawConnections(points,FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,'rgba(245,213,158,.7)',1.1);
  }else{eyes.reset();setActive(false);}
}

function track(now){
  if(!running)return;
  if(document.hidden){eyes.reset();setActive(false);loop=requestAnimationFrame(track);return;}
  if(now-lastResult>250)setActive(false);
  if(video.readyState>=2&&video.currentTime!==lastVideoTime&&now-lastInference>=60){
    lastVideoTime=video.currentTime;lastInference=now;
    try{processResult(landmarker.detectForVideo(video,now),now);}
    catch(error){fail('얼굴 추적을 다시 시작해 주세요');return;}
  }
  loop=requestAnimationFrame(track);
}

function stopCamera(){
  epoch++;running=false;starting=false;cancelAnimationFrame(loop);setActive(false);eyes.reset();
  scene.tracking=false;
  stream?.getTracks().forEach(t=>t.stop());stream=null;
  video.pause();video.srcObject=null;ctx.clearRect(0,0,480,360);
  panel.classList.remove('streaming','tracking','active','starting');
  start.hidden=false;start.disabled=false;start.classList.remove('loading');
  start.setAttribute('aria-label','카메라와 음악 시작');
  start.title='카메라와 음악 시작';
}

function fail(message){
  stopCamera();start.classList.add('error');start.title=message;
  start.setAttribute('aria-label',message+'. 다시 시도');
  errorLabel.textContent=message;status.textContent=message;
}

start.addEventListener('click',async()=>{
  if(starting||running)return;
  starting=true;const requestEpoch=++epoch;
  panel.classList.add('starting');
  const timeout=setTimeout(()=>{if(starting&&epoch===requestEpoch)fail('카메라 권한을 확인해 주세요');},45000);
  errorLabel.textContent='';start.classList.remove('error');start.classList.add('loading');start.disabled=true;
  try{
    if(!navigator.mediaDevices?.getUserMedia)throw Object.assign(new Error(),{name:'InsecureContext'});
    music.unlock().catch(()=>{});
    modelPromise??=loadModel().catch(error=>{modelPromise=null;throw error;});
    const cameraPromise=navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480},frameRate:{ideal:24,max:30}},audio:false});
    cameraPromise.then(s=>{if(epoch!==requestEpoch)s.getTracks().forEach(t=>t.stop());},()=>{});
    const results=await Promise.allSettled([cameraPromise,modelPromise]);
    const acquired=results[0].status==='fulfilled'?results[0].value:null;
    if(epoch!==requestEpoch){acquired?.getTracks().forEach(t=>t.stop());return;}
    if(results.some(r=>r.status==='rejected')){acquired?.getTracks().forEach(t=>t.stop());throw results.find(r=>r.status==='rejected').reason;}
    stream=acquired;landmarker=results[1].value;
    video.srcObject=stream;await video.play();
    if(epoch!==requestEpoch){acquired.getTracks().forEach(t=>t.stop());return;}
    stream.getVideoTracks()[0].addEventListener('ended',()=>{if(running)fail('카메라 연결을 다시 확인해 주세요');});
    starting=false;panel.classList.remove('starting');running=true;lastVideoTime=-1;lastInference=0;lastResult=performance.now();
    start.hidden=true;start.disabled=false;start.classList.remove('loading');panel.classList.add('streaming');
    status.textContent='카메라가 켜졌습니다. 양쪽 눈을 감으면 회전목마가 움직입니다.';
    loop=requestAnimationFrame(track);
  }catch(error){
    if(epoch!==requestEpoch)return;
    const messages={NotAllowedError:'카메라 권한을 허용해 주세요',NotFoundError:'카메라를 찾을 수 없어요',NotReadableError:'카메라가 사용 중이에요',InsecureContext:'HTTPS에서 열어 주세요'};
    fail(messages[error.name]||'카메라를 다시 시작해 주세요');
  }finally{clearTimeout(timeout);}
});
stop.addEventListener('click',()=>{stopCamera();errorLabel.textContent='';});
sound.addEventListener('click',()=>{
  music.unlock().catch(()=>{});
  const muted=music.toggleMute();sound.setAttribute('aria-pressed',String(muted));
  sound.setAttribute('aria-label',muted?'음악 켜기':'음악 끄기');sound.title=muted?'음악 켜기':'음악 끄기';
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){eyes.reset();setActive(false);}});
window.addEventListener('pagehide',()=>{stopCamera();music.dispose();landmarker?.close();});
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
