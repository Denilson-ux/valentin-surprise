/* Romantic Valentine Surprise — JS */
const canvas = document.getElementById('hearts');
const ctx = canvas.getContext('2d');

const surpriseModal = document.getElementById('surprise-modal');
const surpriseCanvas = document.getElementById('surprise-hearts');
const surpriseCtx = surpriseCanvas ? surpriseCanvas.getContext('2d') : null;

const modal = document.getElementById('modal');
const btnOpen = document.getElementById('btn-open');
const btnSurprise = document.getElementById('btn-surprise');
const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const toast = document.getElementById('toast');

const bgm = document.getElementById('bgm');
const btnMute = document.getElementById('btn-mute');
const muteText = document.getElementById('mute-text');

let W = 0, H = 0;
let hearts = [];
let surpriseHearts = [];
let surpriseAnimating = false;
let last = performance.now();
let muted = true;

function resize(){
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  W = canvas.width = Math.floor(window.innerWidth * dpr);
  H = canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
window.addEventListener('resize', resize);
resize();

function rand(min,max){return Math.random()*(max-min)+min}

function heartPath(context, x, y, size){
  context.beginPath();
  const topCurveHeight = size * 0.3;
  context.moveTo(x, y + topCurveHeight);
  context.bezierCurveTo(x, y, x - size/2, y, x - size/2, y + topCurveHeight);
  context.bezierCurveTo(x - size/2, y + (size + topCurveHeight)/2, x, y + (size + topCurveHeight)/1.1, x, y + size);
  context.bezierCurveTo(x, y + (size + topCurveHeight)/1.1, x + size/2, y + (size + topCurveHeight)/2, x + size/2, y + topCurveHeight);
  context.bezierCurveTo(x + size/2, y, x, y, x, y + topCurveHeight);
  context.closePath();
}

function spawnHeart(x, y, burst=false){
  const count = burst ? Math.floor(rand(10, 18)) : 1;
  for(let i=0;i<count;i++){
    hearts.push({
      x: x + rand(-10,10),
      y: y + rand(-10,10),
      vx: rand(-0.5,0.5) + (burst?rand(-1.2,1.2):0),
      vy: rand(-2.6,-1.0) + (burst?rand(-1.3,-0.2):0),
      size: rand(10, 22) + (burst?rand(0,10):0),
      rot: rand(-0.6,0.6),
      vr: rand(-0.02,0.02),
      life: rand(1.2, 2.2),
      age: 0,
      hue: Math.random() < 0.85 ? 350 : 0,
      alpha: rand(0.65, 0.95)
    });
  }
}

function spawnSurpriseHeart(w, h){
  surpriseHearts.push({
    x: rand(0, w),
    y: h + 20,
    vx: rand(-0.8, 0.8),
    vy: rand(-3, -1.5),
    size: rand(15, 35),
    rot: rand(-0.5, 0.5),
    vr: rand(-0.03, 0.03),
    life: rand(3, 5),
    age: 0,
    hue: rand(330, 10),
    alpha: rand(0.7, 1)
  });
}

function initSurpriseCanvas(){
  if(!surpriseCanvas) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = window.innerWidth;
  const h = window.innerHeight;
  
  surpriseCanvas.width = Math.floor(w * dpr);
  surpriseCanvas.height = Math.floor(h * dpr);
  surpriseCanvas.style.width = w + 'px';
  surpriseCanvas.style.height = h + 'px';
  surpriseCtx.setTransform(dpr,0,0,dpr,0,0);
  
  surpriseHearts = [];
  surpriseAnimating = true;
}

function animateSurpriseHearts(dt){
  if(!surpriseAnimating || !surpriseCtx) return;
  
  const w = surpriseCanvas.width / (Math.min(2, window.devicePixelRatio || 1));
  const h = surpriseCanvas.height / (Math.min(2, window.devicePixelRatio || 1));
  
  surpriseCtx.clearRect(0, 0, w, h);
  
  // Spawn new hearts
  if(Math.random() < 0.15){
    spawnSurpriseHeart(w, h);
  }
  
  for(let i = surpriseHearts.length - 1; i >= 0; i--){
    const h = surpriseHearts[i];
    h.age += dt;
    h.x += h.vx * 60 * dt;
    h.y += h.vy * 60 * dt;
    h.vy -= 0.015 * 60 * dt;
    h.rot += h.vr * 60 * dt;
    
    const t = h.age / h.life;
    const fade = 1 - Math.pow(t, 2);
    
    surpriseCtx.save();
    surpriseCtx.translate(h.x, h.y);
    surpriseCtx.rotate(h.rot);
    
    const grad = surpriseCtx.createRadialGradient(0,0,2, 0,0, h.size*1.3);
    grad.addColorStop(0, `hsla(${h.hue}, 100%, 70%, ${h.alpha * fade})`);
    grad.addColorStop(1, `hsla(${h.hue}, 100%, 50%, 0)`);
    
    surpriseCtx.fillStyle = grad;
    heartPath(surpriseCtx, 0, 0, h.size);
    surpriseCtx.fill();
    
    surpriseCtx.restore();
    
    if(h.age >= h.life || h.y < -50){
      surpriseHearts.splice(i, 1);
    }
  }
}

function tick(now){
  const dt = Math.min(0.033, (now-last)/1000);
  last = now;

  // Background hearts
  ctx.clearRect(0,0,window.innerWidth, window.innerHeight);

  if(Math.random() < 0.08){
    spawnHeart(rand(10, window.innerWidth-10), window.innerHeight + 12);
  }

  for(let i=hearts.length-1;i>=0;i--){
    const h = hearts[i];
    h.age += dt;
    h.x += h.vx * 60 * dt;
    h.y += h.vy * 60 * dt;
    h.vy -= 0.02 * 60 * dt;
    h.rot += h.vr * 60 * dt;

    const t = h.age / h.life;
    const fade = 1 - Math.pow(t, 1.8);

    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.rotate(h.rot);

    const grad = ctx.createRadialGradient(0,0,2, 0,0, h.size*1.2);
    grad.addColorStop(0, `hsla(${h.hue}, 95%, 65%, ${h.alpha*fade})`);
    grad.addColorStop(1, `hsla(${h.hue}, 95%, 45%, 0)`);

    ctx.fillStyle = grad;
    heartPath(ctx, 0,0,h.size);
    ctx.fill();

    ctx.restore();

    if(h.age >= h.life || h.y < -40){
      hearts.splice(i,1);
    }
  }
  
  // Surprise hearts animation
  if(surpriseAnimating){
    animateSurpriseHearts(dt);
  }

  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// Interactions
function openModal(){
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden','false');
  spawnHeart(window.innerWidth*0.5, window.innerHeight*0.55, true);
}
function closeModal(){
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden','true');
}

function openSurpriseModal(){
  surpriseModal.classList.add('is-open');
  surpriseModal.setAttribute('aria-hidden','false');
  initSurpriseCanvas();
  spawnHeart(window.innerWidth*0.5, window.innerHeight*0.5, true);
}

function closeSurpriseModal(){
  surpriseModal.classList.remove('is-open');
  surpriseModal.setAttribute('aria-hidden','true');
  surpriseAnimating = false;
  surpriseHearts = [];
}

btnOpen.addEventListener('click', openModal);
btnSurprise.addEventListener('click', openSurpriseModal);

document.getElementById('surprise-close').addEventListener('click', closeSurpriseModal);
document.getElementById('surprise-close-btn').addEventListener('click', closeSurpriseModal);

modal.addEventListener('click', (e) => {
  if(e.target.matches('[data-close]')) closeModal();
});

document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape'){
    closeModal();
    closeSurpriseModal();
  }
});

document.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal));

function toastMsg(msg){
  toast.textContent = msg;
  toast.classList.add('is-on');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('is-on'), 2600);
}

btnYes.addEventListener('click', () => {
  toastMsg('¡Sabía que sí, mi princesita! ❤️');
  spawnHeart(window.innerWidth*0.5, window.innerHeight*0.55, true);
  setTimeout(closeModal, 800);
});

function moveNoButton(){
  const rect = btnNo.getBoundingClientRect();
  const pad = 14;
  const maxX = window.innerWidth - rect.width - pad;
  const maxY = window.innerHeight - rect.height - pad;
  const x = Math.max(pad, Math.min(maxX, rand(pad, maxX)));
  const y = Math.max(pad, Math.min(maxY, rand(pad, maxY)));
  btnNo.style.position = 'fixed';
  btnNo.style.left = x + 'px';
  btnNo.style.top = y + 'px';
}
btnNo.addEventListener('mouseenter', moveNoButton);
btnNo.addEventListener('touchstart', (e) => { e.preventDefault(); moveNoButton(); }, {passive:false});
btnNo.addEventListener('click', () => {
  toastMsg('Eso fue un “sí” disfrazado 😌');
  moveNoButton();
});

window.addEventListener('pointerdown', (e) => {
  if(modal.classList.contains('is-open') || surpriseModal.classList.contains('is-open')) return;
  spawnHeart(e.clientX, e.clientY, true);
});

async function toggleMusic(){
  muted = !muted;
  if(!muted){
    try{
      await bgm.play();
      muteText.textContent = 'Música: ON';
      toastMsg('🎶 Música activada (si agregaste el mp3).');
    }catch(err){
      muted = true;
      muteText.textContent = 'Música: OFF';
      toastMsg('No se pudo reproducir. Agrega el mp3 en /audio.');
    }
  }else{
    bgm.pause();
    muteText.textContent = 'Música: OFF';
  }
}
btnMute.addEventListener('click', toggleMusic);

setTimeout(() => {
  spawnHeart(window.innerWidth*0.62, window.innerHeight*0.35, true);
}, 650);
