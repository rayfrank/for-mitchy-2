// src/main.js ✅ EXTRA SLOW SNAP + LONGER PRE-POP ANIMATION (ring pulse + heart burst)
// ✅ FIXED for GitHub Pages photos by using absolute repo path: /for-mitchy/photos/*.jpeg
// Replace your current src/main.js with this

import "./style.css";
import * as THREE from "three";

/* ---------- Build DOM ---------- */
const app = document.querySelector("#app");
if (app && !document.getElementById("c")) {
  app.innerHTML = `
    <canvas id="c"></canvas>

    <div class="hud">
      <div class="brand">Mitchyy & Ray 💞</div>
      <div class="hint">Tap a photo → it slowly snaps to center + magic happens 💗</div>
    </div>

    <div class="modal" id="modal" aria-hidden="true">
      <div class="modal-backdrop" id="modalBackdrop"></div>

      <div class="modal-card">
        <button class="close" id="closeBtn" aria-label="Close">✕</button>
        <img id="modalImg" alt="Memory" />
        <div class="modal-text">
          <div class="m-title" id="mTitle"></div>
          <div class="m-msg" id="mMsg"></div>
        </div>
      </div>
    </div>
  `;
}

const canvas = document.getElementById("c");
if (!canvas) throw new Error("Canvas #c not found");

/* ---------- Modal ---------- */
const modal = document.getElementById("modal");
const modalBackdrop = document.getElementById("modalBackdrop");
const closeBtn = document.getElementById("closeBtn");
const modalImg = document.getElementById("modalImg");
const mTitle = document.getElementById("mTitle");
const mMsg = document.getElementById("mMsg");

function openModal(item) {
  modal.setAttribute("aria-hidden", "false");
  modalImg.src = item.fullSrc;
  mTitle.textContent = item.title;
  mMsg.textContent = item.message;
}
function closeModal() {
  modal.setAttribute("aria-hidden", "true");
}
modalBackdrop.addEventListener("click", closeModal);
closeBtn.addEventListener("click", closeModal);
window.addEventListener("keydown", (e) => e.key === "Escape" && closeModal());

/* ---------- Three.js ---------- */
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x09061a, 6, 28);

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  120
);
camera.position.set(0, 1.2, 9.4);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/* Lights (bright + romantic) */
scene.add(new THREE.AmbientLight(0xffffff, 0.55));

const pink = new THREE.PointLight(0xff3da8, 1.85, 60);
pink.position.set(-6, 3.5, 5);
scene.add(pink);

const purple = new THREE.PointLight(0xa97bff, 1.55, 60);
purple.position.set(6, 3.0, 4);
scene.add(purple);

const magenta = new THREE.PointLight(0xff5bf2, 1.2, 55);
magenta.position.set(0, 3.0, -6);
scene.add(magenta);

const warm = new THREE.PointLight(0xffb38a, 0.85, 60);
warm.position.set(0, 5.5, 0);
scene.add(warm);

/* Star dust */
const stars = new THREE.Points(
  new THREE.BufferGeometry(),
  new THREE.PointsMaterial({ size: 0.02, transparent: true, opacity: 0.6 })
);
{
  const count = 1200;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3 + 0] = (Math.random() - 0.5) * 60;
    pos[i * 3 + 1] = (Math.random() - 0.2) * 30;
    pos[i * 3 + 2] = -Math.random() * 60;
  }
  stars.geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
}
scene.add(stars);

/* ---------- ❤️ Floating hearts background ---------- */
function makeHeartShape() {
  const s = new THREE.Shape();
  s.moveTo(0, 0.35);
  s.bezierCurveTo(0, 0.88, -0.85, 0.88, -0.85, 0.22);
  s.bezierCurveTo(-0.85, -0.22, -0.2, -0.36, 0, -0.82);
  s.bezierCurveTo(0.2, -0.36, 0.85, -0.22, 0.85, 0.22);
  s.bezierCurveTo(0.85, 0.88, 0, 0.88, 0, 0.35);
  return s;
}

const heartGroup = new THREE.Group();
scene.add(heartGroup);

const heartGeom = new THREE.ExtrudeGeometry(makeHeartShape(), {
  depth: 0.12,
  bevelEnabled: true,
  bevelThickness: 0.06,
  bevelSize: 0.05,
  bevelSegments: 2,
  steps: 1,
});

const heartMat = new THREE.MeshStandardMaterial({
  color: 0xff0000,
  metalness: 0.25,
  roughness: 0.35,
  emissive: new THREE.Color(0x660000),
  emissiveIntensity: 0.9,
});

const hearts = [];
for (let i = 0; i < 22; i++) {
  const h = new THREE.Mesh(heartGeom, heartMat);
  h.scale.setScalar(0.18 + Math.random() * 0.25);
  h.position.set(
    (Math.random() - 0.5) * 12,
    0.2 + Math.random() * 3.8,
    -6 - Math.random() * 18
  );
  h.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  h.userData = {
    baseX: h.position.x,
    baseY: h.position.y,
    speed: 0.25 + Math.random() * 0.45,
    bob: 0.10 + Math.random() * 0.22,
    drift: 0.16 + Math.random() * 0.30,
    zSpeed: 0.010 + Math.random() * 0.004,
  };
  heartGroup.add(h);
  hearts.push(h);
}

/* ---------- Photos (Coverflow) ---------- */
/* ✅ GitHub Pages fix: hardcode repo base path */
const itemsData = [
  {
    src: "/for-mitchy/photos/1.jpeg",
    title: "Babeeeee😍",
    message:
      "You sent me this when you were preparing for your event, event though i was busy working with my sister.Every time I look at you, my heart says: that’s my person.",
  },
  {
    src: "/for-mitchy/photos/2.jpeg",
    title: "That glow 🖤",
    message: "You’re the kind of beautiful that makes everything feel softer.",
  },
  {
    src: "/for-mitchy/photos/3.jpeg",
    title:
      "Our little movie propably one of my favourite memories cause i was just alone with you 🎬",
    message:
      "despite it being in a dark tunnel my donnyas came out and i saw light",
  },
  {
    src: "/for-mitchy/photos/4.jpeg",
    title: "this smile makes me want to smile every time i see you, Us, always 😁",
    message: "Your smile takes me places. esepecially when you hold my hand",
  },
  {
    src: "/for-mitchy/photos/5.jpeg",
    title: "Also another goofy memory that i think about alot 😜",
    message: "I want the silly, the serious, memories all with you.",
  },
  {
    src: "/for-mitchy/photos/6.jpeg",
    title:
      "This kiss honest to God i dont know how you took it while kissing, but i really love it!!! ",
    message: "the way you held me while kissing me was the best feeling ever",
  },
  {
    src: "/for-mitchy/photos/7.jpeg",
    title: "last but not least 💞",
    message:
      "This babeee honestly is my favourite image of us and wow it brings all the good memories back and truly i want to make more even if it means throwing up again 😭 i will do it",
  },
];

const loader = new THREE.TextureLoader();
const frames = [];
const gallery = new THREE.Group();
scene.add(gallery);

function makeFrame(texture, w = 2.0, h = 2.7) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const borderMat = new THREE.MeshStandardMaterial({
    color: 0x0b0713,
    metalness: 0.35,
    roughness: 0.5,
    emissive: new THREE.Color(0x2a0033),
    emissiveIntensity: 1.0,
  });

  const border = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.24, h + 0.24), borderMat);

  const photo = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ map: texture, roughness: 0.95, metalness: 0.02 })
  );
  photo.position.z = 0.012;

  // bigger invisible hit area for easy taps
  const hit = new THREE.Mesh(
    new THREE.PlaneGeometry(w + 0.9, h + 0.9),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
  );
  hit.position.z = 0.06;

  const g = new THREE.Group();
  g.add(border, photo, hit);

  return g;
}

/* indices (slower snap) */
let targetIndex = 0;
let currentIndex = 0;

/* load frames */
itemsData.forEach((item, i) => {
  loader.load(
    item.src,
    (tex) => {
      const g = makeFrame(tex);
      g.userData = {
        ...item,
        fullSrc: item.src, // modal uses this
        index: i,
        targetPos: new THREE.Vector3(),
        targetRotY: 0,
        targetScale: 1,
      };
      gallery.add(g);
      frames.push(g);
    },
    undefined,
    (err) => console.error("Texture load failed:", item.src, err)
  );
});

function clampIndex(i) {
  return Math.max(0, Math.min(itemsData.length - 1, i));
}
function goTo(i) {
  targetIndex = clampIndex(i);
}
function stepIndex(dir) {
  goTo(targetIndex + dir);
}

/* ---------- PRE-MESSAGE COOL ANIMATION (ring pulse + mini heart burst) ---------- */
const fxGroup = new THREE.Group();
scene.add(fxGroup);

// pink ring
const ringMat = new THREE.MeshBasicMaterial({ color: 0xff4fb8, transparent: true, opacity: 0 });
const ring = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.28, 64), ringMat);
ring.visible = false;
fxGroup.add(ring);

// tiny burst particles
const burstCount = 10;
const burst = [];
const burstGeo = new THREE.PlaneGeometry(0.18, 0.18);
for (let i = 0; i < burstCount; i++) {
  const mat = new THREE.MeshBasicMaterial({ color: 0xff2b6d, transparent: true, opacity: 0 });
  const p = new THREE.Mesh(burstGeo, mat);
  p.visible = false;
  fxGroup.add(p);
  burst.push(p);
}

let fxActive = false;
let fxT = 0;
let fxPos = new THREE.Vector3();

function startPrePopupFX(frame) {
  fxActive = true;
  fxT = 0;

  fxPos.copy(frame.position);

  ring.visible = true;
  ring.position.set(fxPos.x, fxPos.y, fxPos.z + 0.06);
  ring.scale.set(0.65, 0.65, 0.65);
  ringMat.opacity = 0;

  for (let i = 0; i < burst.length; i++) {
    const p = burst[i];
    p.visible = true;
    p.position.set(fxPos.x, fxPos.y, fxPos.z + 0.08);
    p.userData = {
      ang: (i / burst.length) * Math.PI * 2 + Math.random() * 0.3,
      spd: 0.9 + Math.random() * 0.6,
      lift: 0.35 + Math.random() * 0.4,
    };
    p.material.opacity = 0;
    p.scale.setScalar(0.8);
  }
}

function stopFX() {
  fxActive = false;
  ring.visible = false;
  ringMat.opacity = 0;
  for (const p of burst) {
    p.visible = false;
    p.material.opacity = 0;
  }
}

/* ---------- Delayed popup with FX (slower) ---------- */
let pendingTimer = null;
let pendingForIndex = null;

function schedulePopupWithFX(frame) {
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
  }
  pendingForIndex = frame.userData.index;

  const isPhone = window.innerWidth < 520;

  // ✅ slower overall
  const minDelay = isPhone ? 520 : 420; // wait longer before FX
  const maxDelay = isPhone ? 1800 : 1500; // fallback
  const fxDuration = isPhone ? 900 : 750; // longer pre-popup animation

  const start = performance.now();

  function check() {
    if (pendingForIndex !== frame.userData.index) return;

    const elapsed = performance.now() - start;
    const closeness = Math.abs(currentIndex - frame.userData.index);
    const closeEnough = closeness < 0.10;

    if ((closeEnough && elapsed >= minDelay) || elapsed >= maxDelay) {
      startPrePopupFX(frame);

      setTimeout(() => {
        if (pendingForIndex !== frame.userData.index) return;
        stopFX();
        openModal(frame.userData);
      }, fxDuration);

      pendingTimer = null;
      return;
    }

    pendingTimer = setTimeout(check, 32);
  }

  pendingTimer = setTimeout(check, 80);
}

/* ---------- Coverflow layout ---------- */
function layoutCoverflow() {
  const gap = window.innerWidth < 520 ? 2.25 : 2.75;
  const baseY = 1.25;

  for (const f of frames) {
    const i = f.userData.index;
    const offset = i - currentIndex;

    const x = offset * gap;
    const z = -Math.abs(offset) * 0.95;
    const y = baseY;

    const rotY = THREE.MathUtils.clamp(-offset * 0.25, -0.55, 0.55);

    const focus = 1 - Math.min(1, Math.abs(offset));
    const scale = 0.88 + focus * 0.26;

    f.userData.targetPos.set(x, y, z);
    f.userData.targetRotY = rotY;
    f.userData.targetScale = scale;
  }
}

/* ---------- Swipe / Wheel navigation ---------- */
let dragging = false;
let dragStartX = 0;

window.addEventListener(
  "wheel",
  (e) => {
    if (Math.abs(e.deltaY) < 3) return;
    stepIndex(e.deltaY > 0 ? 1 : -1);
  },
  { passive: true }
);

canvas.addEventListener(
  "touchstart",
  (e) => {
    dragging = true;
    dragStartX = e.touches[0].clientX;
  },
  { passive: true }
);

canvas.addEventListener(
  "touchmove",
  (e) => {
    if (!dragging) return;
    const dx = e.touches[0].clientX - dragStartX;
    if (Math.abs(dx) > 45) {
      stepIndex(dx < 0 ? 1 : -1);
      dragStartX = e.touches[0].clientX;
    }
  },
  { passive: true }
);

canvas.addEventListener("touchend", () => (dragging = false));

/* ---------- Tap to center + delayed popup ---------- */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function setPointerFromEvent(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
  const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

  const x = (clientX - rect.left) / rect.width;
  const y = (clientY - rect.top) / rect.height;

  pointer.x = x * 2 - 1;
  pointer.y = -(y * 2 - 1);
}

function findRoot(obj) {
  let cur = obj;
  while (cur) {
    if (cur.userData && Number.isInteger(cur.userData.index)) return cur;
    cur = cur.parent;
  }
  return null;
}

function pickAndOpen() {
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(frames, true);
  if (!hits.length) return;

  const root = findRoot(hits[0].object);
  if (!root) return;

  // switching selection cancels old FX
  stopFX();
  pendingForIndex = root.userData.index;

  goTo(root.userData.index);
  schedulePopupWithFX(root);
}

canvas.addEventListener("click", (e) => {
  setPointerFromEvent(e);
  pickAndOpen();
});

canvas.addEventListener(
  "touchstart",
  (e) => {
    setPointerFromEvent(e);
    pickAndOpen();
  },
  { passive: true }
);

/* ---------- Resize ---------- */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ---------- Animate ---------- */
const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();

  // ✅ EXTRA slow snap to center
  currentIndex = THREE.MathUtils.lerp(currentIndex, targetIndex, 0.045);

  layoutCoverflow();

  // subtle camera breathing
  camera.position.x = Math.sin(t * 0.10) * 0.14;
  camera.position.y = 1.2 + Math.sin(t * 0.08) * 0.03;
  camera.lookAt(0, 1.2, 0);

  // hearts drift
  for (const h of hearts) {
    const d = h.userData;
    h.position.x = d.baseX + Math.sin(t * d.speed) * d.drift;
    h.position.y = d.baseY + Math.sin(t * (d.speed + 0.2)) * d.bob;
    h.rotation.y += 0.007;
    h.rotation.x += 0.003;
    h.position.z += d.zSpeed;
    if (h.position.z > 10) h.position.z = -26 - Math.random() * 16;
  }

  // frames
  for (const f of frames) {
    f.position.lerp(f.userData.targetPos, 0.10);
    f.rotation.y = THREE.MathUtils.lerp(f.rotation.y, f.userData.targetRotY, 0.10);

    const s = THREE.MathUtils.lerp(f.scale.x, f.userData.targetScale, 0.12);
    f.scale.setScalar(s);

    // glow for centered
    const dist = Math.abs(f.userData.index - currentIndex);
    const focus = 1 - Math.min(1, dist);
    const borderMesh = f.children[0];
    if (borderMesh?.material) {
      borderMesh.material.emissiveIntensity = 0.75 + focus * 1.45;
    }
  }

  // FX animation
  if (fxActive) {
    fxT += 1 / 60;

    const p = Math.min(1, fxT / 0.80); // ✅ slower FX speed
    const ease = 1 - Math.pow(1 - p, 3);

    ringMat.opacity = (p < 0.55 ? p / 0.55 : 1) * (1 - p) * 1.25;
    const sc = 0.65 + ease * 0.95;
    ring.scale.set(sc, sc, sc);
    ring.rotation.z += 0.018;

    for (const particle of burst) {
      const d = particle.userData;
      const r = ease * 1.2;
      particle.position.x = fxPos.x + Math.cos(d.ang) * r * d.spd;
      particle.position.y = fxPos.y + ease * d.lift;
      particle.position.z = fxPos.z + 0.09;

      particle.material.opacity = (1 - p) * 0.95;
      particle.rotation.z += 0.05;
      particle.scale.setScalar(0.8 + ease * 0.38);
    }

    if (p >= 1) stopFX();
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
