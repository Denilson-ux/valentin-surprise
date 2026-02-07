/* Romantic Valentine Surprise — JS */
const canvas = document.getElementById('hearts');
const ctx = canvas.getContext('2d');

const teamoCanvas = document.getElementById('teamo');
const teamoCtx = teamoCanvas.getContext('2d');

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
let teamoParticles = [];
let last = performance.now();
let muted = true;

function resize(){
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  W = canvas.width = Math.floor(window.innerWidth * dpr);
  H = canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);

  // TE AMO canvas (only in hero section)
  const hero = document.querySelector('.hero');
  if(hero){
    const rect = hero.getBoundingClientRect();
    teamoCanvas.width = Math.floor(rect.width * dpr);
    teamoCanvas.height = Math.floor(rect.height * dpr);
    teamoCanvas.style.width = rect.width + 'px';
    teamoCanvas.style.height = rect.height + 'px';
    teamoCtx.setTransform(dpr,0,0,dpr,0,0);
    initTeAmo();
  }
}
window.addEventListener('resize', resize);
resize();

function rand(min,max){return Math.random()*(max-min)+min}

function heartPath(x,y,size){
  ctx.beginPath();
  const topCurveHeight = size * 0.3;
  ctx.moveTo(x, y + topCurveHeight);
  ctx.bezierCurveTo(x, y, x - size/2, y, x - size/2, y + topCurveHeight);
  ctx.bezierCurveTo(x - size/2, y + (size + topCurveHeight)/2, x, y + (size + topCurveHeight)/1.1, x, y + size);
  ctx.bezierCurveTo(x, y + (size + topCurveHeight)/1.1, x + size/2, y + (size + topCurveHeight)/2, x + size/2, y + topCurveHeight);
  ctx.bezierCurveTo(x + size/2, y, x, y, x, y + topCurveHeight);
  ctx.closePath();
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

// TE AMO particle system
function initTeAmo(){
  teamoParticles = [];
  const hero = document.querySelector('.hero');
  if(!hero) return;
  
  const rect = hero.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;

  // Create heart shape outline
  const heartPoints = [];
  const steps = 200;
  for(let i=0; i<steps; i++){
    const t = (i / steps) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
    heartPoints.push({x: cx + x * 8, y: cy + y * 8});
  }

  // Create "TE AMO" text particles
  const textScale = 2.2;
  const text = 'TE AMO';
  const spacing = 55 * textScale;
  const startX = cx - (text.length * spacing) / 2 + spacing/2;
  
  // Letter patterns (simplified pixel art)
  const letters = {
    'T': [[1,0],[1,1],[1,2],[1,3],[1,4],[0,0],[2,0]],
    'E': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[2,0],[1,2],[2,2],[1,4],[2,4]],
    'A': [[0,1],[0,2],[0,3],[0,4],[1,0],[2,0],[1,2],[2,2],[2,1],[2,3],[2,4]],
    'M': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,1],[2,2],[3,1],[4,0],[4,1],[4,2],[4,3],[4,4]],
    'O': [[1,0],[2,0],[0,1],[0,2],[0,3],[3,1],[3,2],[3,3],[1,4],[2,4]],
    ' ': []
  };

  for(let i=0; i<text.length; i++){
    const letter = letters[text[i]];
    if(!letter) continue;
    const lx = startX + i * spacing;
    for(let p of letter){
      for(let dx=0; dx<4; dx++){
        for(let dy=0; dy<4; dy++){
          teamoParticles.push({
            x: lx + p[0] * 9 * textScale + dx * 2,
            y: cy + p[1] * 9 * textScale + dy * 2,
            tx: lx + p[0] * 9 * textScale + dx * 2,
            ty: cy + p[1] * 9 * textScale + dy * 2,
            vx: rand(-2, 2),
            vy: rand(-2, 2),
            size: rand(2, 3.5),
            hue: rand(340, 360),
            alpha: rand(0.7, 1),
            phase: rand(0, Math.PI * 2)
          });
        }
      }
    }
  }

  // Add heart outline particles
  for(let pt of heartPoints){
    if(Math.random() < 0.3){
      teamoParticles.push({
        x: pt.x,
        y: pt.y,
        tx: pt.x,
        ty: pt.y,
        vx: rand(-1, 1),
        vy: rand(-1, 1),
        size: rand(2, 4),
        hue: rand(340, 10),
        alpha: rand(0.5, 0.9),
        phase: rand(0, Math.PI * 2)
      });
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
    heartPath(0,0,h.size);
    ctx.fill();

    ctx.restore();

    if(h.age >= h.life || h.y < -40){
      hearts.splice(i,1);
    }
  }

  // TE AMO particles
  if(teamoParticles.length > 0){
    const hero = document.querySelector('.hero');
    if(hero){
      const rect = hero.getBoundingClientRect();
      teamoCtx.clearRect(0, 0, rect.width, rect.height);

      for(let p of teamoParticles){
        p.phase += dt * 2;
        const wobble = Math.sin(p.phase) * 1.5;
        
        // Attract to target
        const dx = p.tx - p.x;
        const dy = p.ty - p.y;
        p.vx += dx * 0.02;
        p.vy += dy * 0.02;
        p.vx *= 0.95;
        p.vy *= 0.95;
        
        p.x += p.vx * dt * 30;
        p.y += p.vy * dt * 30;

        const finalX = p.x + wobble;
        const finalY = p.y + wobble;

        teamoCtx.beginPath();
        teamoCtx.arc(finalX, finalY, p.size, 0, Math.PI * 2);
        teamoCtx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.alpha})`;
        teamoCtx.shadowBlur = 8;
        teamoCtx.shadowColor = `hsla(${p.hue}, 100%, 60%, 0.8)`;
        teamoCtx.fill();
      }
    }
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

btnOpen.addEventListener('click', openModal);
btnSurprise.addEventListener('click', () => {
  toastMsg('✨ Sorpresa: cada latido mío te dice “te amo”.');
  spawnHeart(window.innerWidth*0.5, window.innerHeight*0.55, true);
});

modal.addEventListener('click', (e) => {
  if(e.target.matches('[data-close]')) closeModal();
});

document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape') closeModal();
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
  if(modal.classList.contains('is-open')) return;
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
