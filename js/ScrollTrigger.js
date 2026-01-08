gsap.registerPlugin(ScrollTrigger);

const canvas = document.getElementById("canvas");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 7.8;

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

scene.add(new THREE.AmbientLight(0xffffff, 1));

// 갤러리 텍스처 생성
const galleryCanvas = document.createElement("canvas");
const ctx = galleryCanvas.getContext("2d");
function drawImageContain(ctx, img, x, y, w, h) {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;

  let drawWidth, drawHeight;
  let offsetX = 0,
    offsetY = 0;

  if (imgRatio > boxRatio) {
    drawWidth = w;
    drawHeight = w / imgRatio;
    offsetY = (h - drawHeight) / 2;
  } else {
    drawHeight = h;
    drawWidth = h * imgRatio;
    offsetX = (w - drawWidth) / 2;
  }

  ctx.drawImage(img, x + offsetX, y + offsetY, drawWidth, drawHeight);
}

const images = [
  "images/poster1.jpg",
  "images/poster2.jpg",
  "images/poster3.jpg",
  "images/poster4.jpg",
  "images/poster5.jpg",
  "images/poster6.jpg",
  "images/poster7.jpg",
  "images/poster8.jpg",
  "images/1.jpg",
  "images/2.jpg",
  "images/3.jpg",
  "images/4.jpg",
  "images/5.jpg",
  "images/6.jpg",
  "images/7.jpg",
  "images/8.jpg",
  "images/9.jpg",
  "images/10.jpg",
  "images/11.jpg",
  "images/12.jpg",
  "images/13.jpg",
  "images/14.jpg",
  "images/15.jpg",
  "images/menu_2.jpg",
  "images/menu_1.jpg",
  "images/menu_3.jpg",
  "images/menu_4.jpg",
  // "images/banner1.jpg",
  // "images/banner2.jpg",
  // "images/banner3.jpg",
  // "images/banner4.jpg",
  // "images/banner5.jpg",
  // "images/banner7.jpg",
  // "images/banner8.jpg",
  // "images/banner9.jpg",
  // "images/banner10.jpg",
  // "images/banner11.jpg",
  // "images/banner12.jpg",
  // "images/banner13.jpg"
];

const IMAGE_WIDTH = 2048;
const IMAGE_HEIGHT = 2048;
const IMAGE_GAP = 120;

galleryCanvas.width = (IMAGE_WIDTH + IMAGE_GAP) * images.length;
galleryCanvas.height = IMAGE_HEIGHT;

const galleryTexture = new THREE.CanvasTexture(galleryCanvas);
renderer.outputColorSpace = THREE.SRGBColorSpace;
galleryTexture.colorSpace = THREE.SRGBColorSpace;
galleryTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
galleryTexture.repeat.x = 1;

let loaded = 0;

images.forEach((src, i) => {
  const img = new Image();
  img.src = src;

  img.onload = () => {
    drawImageContain(
      ctx,
      img,
      i * (IMAGE_WIDTH + IMAGE_GAP),
      0,
      IMAGE_WIDTH,
      IMAGE_HEIGHT
    );

    loaded++;

    if (loaded === images.length) {
      galleryTexture.needsUpdate = true;
    }
  };
});

// 원통 갤러리
const geometry = new THREE.CylinderGeometry( 
  55,
  55,
  8, 
  252,
  9, true);

const material = new THREE.MeshStandardMaterial({
  map: galleryTexture,
  side: THREE.BackSide,
  roughness: 0.6,
  metalness: 0.0,
});

const cylinder = new THREE.Mesh(geometry, material);
cylinder.rotation.y = Math.PI / 2;
cylinder.position.y = -0.1;
cylinder.rotation.x = 0.15;
// DRAG STATE
let startRotationY = 0;
scene.add(cylinder);

const centerText = createTextSprite(
  "Visual Campaign Archive",
  "SNS & Poster Design"
);
centerText.position.set(0, 0.3, 0);
scene.add(centerText);
function createTextSprite(title, subtitle) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 메인 타이틀
  ctx.fillStyle = "#2a7a80";
  ctx.font = "600 2.5rem system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 20);

  // 서브 텍스트
  ctx.fillStyle = "#cccccc";
  ctx.font = "400 2rem system-ui, sans-serif";
  ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 30);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });

  const sprite = new THREE.Sprite(material);

  sprite.scale.set(2.8, 1.4, 1);

  return sprite;
}

//스크롤 = 제자리 회전
const rotationST = gsap.to(cylinder.rotation, {
  y: Math.PI * 2 + Math.PI / 2,
  ease: "none",
  scrollTrigger: {
    trigger: ".pin-section",
    start: "top top",
    end: "+=3500",
    scrub: true,
    pin: true,
    anticipatePin: 1,
  },
});

//DRAG = 좌우 회전
let isDragging = false;
let startX = 0;
let startScroll = 0;

canvas.style.cursor = "grab";

canvas.addEventListener("mousedown", (e) => {
  isDragging = true;
  startX = e.clientX;
  startScroll = window.scrollY;
  canvas.style.cursor = "grabbing";
});

window.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const deltaX = e.clientX - startX;

  window.scrollTo({
    top: startScroll - deltaX * 4,
    behavior: "auto",
  });
});

window.addEventListener("mouseup", () => {
  isDragging = false;
  canvas.style.cursor = "grab";
});


window.addEventListener("pointermove", (e) => {
  if (!isDragging) return;

  const deltaX = e.clientX - startX;
  cylinder.rotation.y = startRotationY + deltaX * 0.004;
});

window.addEventListener("pointerup", () => {
  if (!isDragging) return;

  isDragging = false;
  canvas.style.cursor = "grab";

  const st = rotationST.scrollTrigger;

  const minY = Math.PI / 2;
  const maxY = Math.PI * 2 + Math.PI / 2;
  const currentY = cylinder.rotation.y;

  let progress = (currentY - minY) / (maxY - minY);
  progress = Math.max(0, Math.min(1, progress));

  const scrollY = st.start + progress * (st.end - st.start);
  window.scrollTo({ top: scrollY });

  st.enable();
});



window.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const deltaX = e.clientX - startX;
  cylinder.rotation.y = startRotationY + deltaX * 0.004;
});

window.addEventListener("mouseup", () => {
  if (!isDragging) return;

  isDragging = false;
  canvas.style.cursor = "grab";

  ScrollTrigger.getAll().forEach((st) => st.enable());
});

// 렌더 루프
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// 리사이즈 대응
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
