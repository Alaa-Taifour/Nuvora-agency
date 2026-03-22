/* ============================================================
   NUVORA AGENCY — FULL STACK JS
   Three.js + GSAP + Custom WebGL + Magnetic + Scramble
   ============================================================ */

(function() {
'use strict';

// ─── PRELOADER ───────────────────────────────────────────────
const preloader = document.getElementById('preloader');
const preloaderCount = document.querySelector('.preloader-count');
let progress = 0;
const interval = setInterval(() => {
  progress += Math.random() * 12;
  if (progress >= 100) { progress = 100; clearInterval(interval); }
  if (preloaderCount) preloaderCount.textContent = Math.floor(progress) + '%';
  if (progress >= 100) {
    setTimeout(() => {
      if (preloader) preloader.classList.add('hidden');
      initAnimations();
    }, 300);
  }
}, 80);

// ─── CURSOR ──────────────────────────────────────────────────
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');
let mx = -100, my = -100, rx = -100, ry = -100;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
if (cursorDot) {
  document.addEventListener('mousemove', e => {
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top = e.clientY + 'px';
  });
}
function lerpCursor() {
  if (!cursorRing) return;
  rx += (mx - rx) * 0.1;
  ry += (my - ry) * 0.1;
  cursorRing.style.left = rx + 'px';
  cursorRing.style.top = ry + 'px';
  requestAnimationFrame(lerpCursor);
}
lerpCursor();

const hoverEls = document.querySelectorAll('a, button, .service-card, .portfolio-card, .cta-choice, .skill-pill, .social-btn, .contact-item');
hoverEls.forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// ─── MAGNETIC BUTTONS ─────────────────────────────────────────
document.querySelectorAll('.btn-primary, .btn-outline, .btn-submit, .nav-btn').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.3;
    const dy = (e.clientY - cy) * 0.3;
    btn.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

// ─── NAV SCROLL ───────────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ─── HAMBURGER ────────────────────────────────────────────────
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.style.display === 'flex';
    navLinks.style.cssText = isOpen ? '' : `
      display: flex; flex-direction: column;
      position: fixed; top: 70px; left: 0; right: 0;
      background: rgba(13,27,42,0.98);
      backdrop-filter: blur(20px);
      padding: 2rem 2.5rem;
      gap: 2rem;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      z-index: 99;
    `;
  });
}

// ─── SCROLL REVEAL ────────────────────────────────────────────
const revealEls = document.querySelectorAll('.section-eyebrow, .section-headline, .section-sub, .service-card, .stat-item, .founder-visual, .founder-info');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
    }
  });
}, { threshold: 0.1 });
revealEls.forEach(el => revealObserver.observe(el));

// ─── COUNTER ANIMATION ────────────────────────────────────────
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
  let start = 0;
  const duration = 2000;
  const startTime = performance.now();
  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (target - start) * eased;
    el.textContent = prefix + current.toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = prefix + target.toFixed(decimals) + suffix;
  }
  requestAnimationFrame(update);
}

const counterEls = document.querySelectorAll('.stat-num-large');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.counted) {
      entry.target.dataset.counted = true;
      animateCounter(entry.target);
    }
  });
}, { threshold: 0.5 });
counterEls.forEach(el => counterObserver.observe(el));

// ─── TEXT SCRAMBLE ────────────────────────────────────────────
function scrambleText(el, newText) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%';
  let iter = 0;
  const interval = setInterval(() => {
    el.textContent = newText.split('').map((char, i) => {
      if (char === ' ') return ' ';
      if (i < iter) return newText[i];
      return chars[Math.floor(Math.random() * chars.length)];
    }).join('');
    iter += 0.5;
    if (iter >= newText.length) clearInterval(interval);
  }, 30);
}

// Apply scramble to nav logo on hover
const navLogo = document.querySelector('.nav-logo');
if (navLogo) {
  navLogo.addEventListener('mouseenter', () => {
    scrambleText(navLogo, 'NUVORA');
  });
}

// ─── PORTFOLIO DRAG SCROLL ─────────────────────────────────────
const portfolioWrap = document.querySelector('.portfolio-scroll-wrap');
if (portfolioWrap) {
  let isDown = false, startX, scrollLeft;
  portfolioWrap.addEventListener('mousedown', e => {
    isDown = true;
    startX = e.pageX - portfolioWrap.offsetLeft;
    scrollLeft = portfolioWrap.scrollLeft;
  });
  portfolioWrap.addEventListener('mouseleave', () => isDown = false);
  portfolioWrap.addEventListener('mouseup', () => isDown = false);
  portfolioWrap.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - portfolioWrap.offsetLeft;
    const walk = (x - startX) * 2;
    portfolioWrap.scrollLeft = scrollLeft - walk;
  });
}

// ─── FORM CTA SELECTION ───────────────────────────────────────
document.querySelectorAll('.cta-choice').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cta-choice').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ─── FORM SUBMIT ──────────────────────────────────────────────
const submitBtn = document.querySelector('.btn-submit');
if (submitBtn) {
  submitBtn.addEventListener('click', () => {
    const inner = submitBtn.querySelector('.btn-submit-inner');
    if (!inner) return;
    inner.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg> Sending...';
    setTimeout(() => {
      inner.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Message Sent!';
      submitBtn.style.background = 'rgba(0,212,255,0.1)';
      submitBtn.style.border = '1px solid var(--cyan)';
      submitBtn.style.color = 'var(--cyan)';
    }, 2000);
  });
}

// ─── THREE.JS MAIN SCENE ─────────────────────────────────────
function initThreeBackground() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas || !window.THREE) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 6;

  // Galaxy particle system
  const pCount = 8000;
  const pPos = new Float32Array(pCount * 3);
  const pCol = new Float32Array(pCount * 3);
  const pSizes = new Float32Array(pCount);

  for (let i = 0; i < pCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 4 + Math.random() * 18;
    pPos[i*3]   = radius * Math.sin(phi) * Math.cos(theta);
    pPos[i*3+1] = radius * Math.sin(phi) * Math.sin(theta) * 0.4;
    pPos[i*3+2] = radius * Math.cos(phi);
    const t = Math.random();
    if (t < 0.4) { pCol[i*3]=0.47; pCol[i*3+1]=0.18; pCol[i*3+2]=0.74; }
    else if (t < 0.7) { pCol[i*3]=0.0; pCol[i*3+1]=0.83; pCol[i*3+2]=1.0; }
    else { pCol[i*3]=0.9; pCol[i*3+1]=0.9; pCol[i*3+2]=1.0; }
    pSizes[i] = Math.random() * 2 + 0.5;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
  pGeo.setAttribute('size', new THREE.BufferAttribute(pSizes, 1));

  const pMat = new THREE.PointsMaterial({
    size: 0.035, vertexColors: true,
    transparent: true, opacity: 0.75,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // Floating geometric shapes
  const shapes = [];
  const wireMatV = new THREE.MeshBasicMaterial({ color: 0x7B2FBE, wireframe: true, transparent: true, opacity: 0.35 });
  const wireMatC = new THREE.MeshBasicMaterial({ color: 0x00D4FF, wireframe: true, transparent: true, opacity: 0.3 });
  const solidMatV = new THREE.MeshBasicMaterial({ color: 0x7B2FBE, transparent: true, opacity: 0.06 });
  const solidMatC = new THREE.MeshBasicMaterial({ color: 0x00D4FF, transparent: true, opacity: 0.05 });

  const geoms = [
    new THREE.OctahedronGeometry(0.5, 0),
    new THREE.TetrahedronGeometry(0.5, 0),
    new THREE.IcosahedronGeometry(0.45, 0),
    new THREE.OctahedronGeometry(0.3, 0),
    new THREE.TetrahedronGeometry(0.35, 0),
    new THREE.IcosahedronGeometry(0.3, 0),
  ];

  for (let i = 0; i < 10; i++) {
    const geo = geoms[i % geoms.length];
    const wire = i % 2 === 0 ? wireMatV : wireMatC;
    const solid = i % 2 === 0 ? solidMatV : solidMatC;

    const group = new THREE.Group();
    group.add(new THREE.Mesh(geo, solid));
    group.add(new THREE.Mesh(geo, wire));

    group.position.set(
      (Math.random() - 0.5) * 14,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 6 - 1
    );
    group.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    group.userData = {
      rx: (Math.random() - 0.5) * 0.012,
      ry: (Math.random() - 0.5) * 0.015,
      fy: Math.random() * 0.3 + 0.15,
      amp: Math.random() * 0.4 + 0.2,
      baseY: group.position.y,
      baseX: group.position.x,
      fx: Math.random() * 0.2 + 0.1,
      ampX: Math.random() * 0.2 + 0.05,
    };
    scene.add(group);
    shapes.push(group);
  }

  // Glowing torus rings
  const torusGeo1 = new THREE.TorusGeometry(3, 0.008, 12, 200);
  const torusMat1 = new THREE.MeshBasicMaterial({ color: 0x00D4FF, transparent: true, opacity: 0.12 });
  const torus1 = new THREE.Mesh(torusGeo1, torusMat1);
  torus1.rotation.x = Math.PI / 3; scene.add(torus1);

  const torusGeo2 = new THREE.TorusGeometry(4.5, 0.005, 12, 200);
  const torusMat2 = new THREE.MeshBasicMaterial({ color: 0x7B2FBE, transparent: true, opacity: 0.09 });
  const torus2 = new THREE.Mesh(torusGeo2, torusMat2);
  torus2.rotation.x = -Math.PI / 4; torus2.rotation.y = Math.PI / 5;
  scene.add(torus2);

  const torusGeo3 = new THREE.TorusGeometry(2, 0.006, 12, 200);
  const torusMat3 = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.04 });
  const torus3 = new THREE.Mesh(torusGeo3, torusMat3);
  torus3.rotation.z = Math.PI / 6; scene.add(torus3);

  // Grid / wireframe plane
  const gridHelper = new THREE.GridHelper(30, 40, 0x7B2FBE, 0x7B2FBE);
  gridHelper.material.transparent = true; gridHelper.material.opacity = 0.04;
  gridHelper.position.y = -4; scene.add(gridHelper);

  // Mouse parallax
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  document.addEventListener('mousemove', e => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.005;

    currentX += (targetX - currentX) * 0.03;
    currentY += (targetY - currentY) * 0.03;
    camera.position.x += (currentX * 0.8 - camera.position.x) * 0.02;
    camera.position.y += (currentY * 0.5 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    particles.rotation.y += 0.0004;
    particles.rotation.x += 0.00015;

    shapes.forEach(s => {
      s.rotation.x += s.userData.rx;
      s.rotation.y += s.userData.ry;
      s.position.y = s.userData.baseY + Math.sin(t * s.userData.fy) * s.userData.amp;
      s.position.x = s.userData.baseX + Math.cos(t * s.userData.fx) * s.userData.ampX;
    });

    torus1.rotation.z += 0.0008;
    torus2.rotation.z -= 0.0006;
    torus2.rotation.y += 0.0004;
    torus3.rotation.x += 0.0012;

    gridHelper.position.y = -4 + Math.sin(t * 0.3) * 0.3;

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// ─── HERO CANVAS 3D SCENE ────────────────────────────────────
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || !window.THREE) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  const size = canvas.offsetWidth || 500;
  renderer.setSize(size, size);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 4;

  // Central glowing sphere
  const sphereGeo = new THREE.SphereGeometry(1, 64, 64);
  const sphereMat = new THREE.MeshBasicMaterial({ color: 0x7B2FBE, transparent: true, opacity: 0.08 });
  scene.add(new THREE.Mesh(sphereGeo, sphereMat));

  const sphereWireMat = new THREE.MeshBasicMaterial({ color: 0x7B2FBE, wireframe: true, transparent: true, opacity: 0.15 });
  scene.add(new THREE.Mesh(sphereGeo, sphereWireMat));

  // Orbiting objects
  const orbitGroup = new THREE.Group();
  scene.add(orbitGroup);

  const orbitItems = [
    { geo: new THREE.OctahedronGeometry(0.25), color: 0x00D4FF, r: 1.8, speed: 0.8, y: 0.3 },
    { geo: new THREE.TetrahedronGeometry(0.2), color: 0x7B2FBE, r: 2.2, speed: -0.6, y: -0.2 },
    { geo: new THREE.IcosahedronGeometry(0.18), color: 0xffffff, r: 1.6, speed: 1.2, y: 0.5 },
    { geo: new THREE.OctahedronGeometry(0.15), color: 0x00D4FF, r: 2.5, speed: -0.5, y: 0.0 },
  ];

  const orbiters = orbitItems.map(item => {
    const mat = new THREE.MeshBasicMaterial({ color: item.color, wireframe: true, transparent: true, opacity: 0.6 });
    const mesh = new THREE.Mesh(item.geo, mat);
    mesh.userData = { r: item.r, speed: item.speed, y: item.y, angle: Math.random() * Math.PI * 2 };
    orbitGroup.add(mesh);
    return mesh;
  });

  // Orbit rings
  [1.8, 2.2, 2.5].forEach((r, i) => {
    const colors = [0x00D4FF, 0x7B2FBE, 0xffffff];
    const opacities = [0.2, 0.15, 0.08];
    const ringGeo = new THREE.TorusGeometry(r, 0.006, 8, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: colors[i], transparent: true, opacity: opacities[i] });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / (2 + i * 0.5);
    ring.rotation.y = (i * Math.PI) / 3;
    scene.add(ring);
  });

  // Floating particles around sphere
  const fpCount = 200;
  const fpPos = new Float32Array(fpCount * 3);
  const fpCol = new Float32Array(fpCount * 3);
  for (let i = 0; i < fpCount; i++) {
    const r = 1.2 + Math.random() * 1.8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    fpPos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    fpPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    fpPos[i*3+2] = r * Math.cos(phi);
    const t = Math.random();
    if (t < 0.5) { fpCol[i*3]=0.47; fpCol[i*3+1]=0.18; fpCol[i*3+2]=0.74; }
    else { fpCol[i*3]=0.0; fpCol[i*3+1]=0.83; fpCol[i*3+2]=1.0; }
  }
  const fpGeo = new THREE.BufferGeometry();
  fpGeo.setAttribute('position', new THREE.BufferAttribute(fpPos, 3));
  fpGeo.setAttribute('color', new THREE.BufferAttribute(fpCol, 3));
  const fpMat = new THREE.PointsMaterial({ size: 0.04, vertexColors: true, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending });
  scene.add(new THREE.Points(fpGeo, fpMat));

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.008;
    orbitGroup.rotation.y = t * 0.3;
    orbiters.forEach(o => {
      o.userData.angle += o.userData.speed * 0.02;
      o.position.x = Math.cos(o.userData.angle) * o.userData.r;
      o.position.z = Math.sin(o.userData.angle) * o.userData.r;
      o.position.y = o.userData.y + Math.sin(t * 1.5) * 0.1;
      o.rotation.x += 0.02;
      o.rotation.y += 0.03;
    });
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const s = canvas.offsetWidth || 500;
    renderer.setSize(s, s);
  });
}

// ─── INIT ─────────────────────────────────────────────────────
function initAnimations() {
  initThreeBackground();
  initHeroCanvas();
}

// Wait for THREE to load
if (document.readyState === 'complete') {
  setTimeout(initAnimations, 100);
} else {
  window.addEventListener('load', () => setTimeout(initAnimations, 100));
}

// ─── SMOOTH ANCHOR SCROLL ─────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

})();
