// Three.js setup
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// Ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({ color: 0x88cc88 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Player avatar
const playerGeometry = new THREE.BoxGeometry(1, 2, 1);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.y = 1;
scene.add(player);

// Friend avatars
const friendGeometry = new THREE.BoxGeometry(1, 2, 1);
const friendMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const friend1 = new THREE.Mesh(friendGeometry, friendMaterial);
friend1.position.set(3, 1, 0);
scene.add(friend1);

const friend2 = new THREE.Mesh(friendGeometry, friendMaterial);
friend2.position.set(-3, 1, 0);
scene.add(friend2);

// Coins
const coins = [];
const coinGeometry = new THREE.SphereGeometry(0.3, 16, 16);
const coinMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 });

for(let i = 0; i < 5; i++) {
  const coin = new THREE.Mesh(coinGeometry, coinMaterial);
  coin.position.set(
    (Math.random() - 0.5) * 20,
    0.3,
    (Math.random() - 0.5) * 20
  );
  scene.add(coin);
  coins.push(coin);
}

let score = 0;

// Player movement & jumping
const moveSpeed = 0.1;
const keys = {};
let isJumping = false;
let jumpVelocity = 0;
const gravity = 0.02;

window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

function updatePlayer() {
  // Horizontal movement
  if(keys['w']) player.position.z -= moveSpeed;
  if(keys['s']) player.position.z += moveSpeed;
  if(keys['a']) player.position.x -= moveSpeed;
  if(keys['d']) player.position.x += moveSpeed;

  // Jumping
  if(keys[' '] && !isJumping) {
    jumpVelocity = 0.3;
    isJumping = true;
  }

  if(isJumping) {
    player.position.y += jumpVelocity;
    jumpVelocity -= gravity;

    if(player.position.y <= 1) {
      player.position.y = 1;
      isJumping = false;
      jumpVelocity = 0;
    }
  }

  // Collect coins
  coins.forEach((coin, index) => {
    const distance = player.position.distanceTo(coin.position);
    if(distance < 1) {
      scene.remove(coin);
      coins.splice(index, 1);
      score += 1;
      document.querySelector('#topbar span:nth-child(2)').textContent = `Coins: ${score}`;
    }
  });
}

// Camera follows player
function updateCamera() {
  camera.position.x = player.position.x;
  camera.position.z = player.position.z + 5; // behind player
  camera.position.y = player.position.y + 3; // above player
  camera.lookAt(player.position);
}

// Animate loop
function animate() {
  requestAnimationFrame(animate);
  updatePlayer();
  updateCamera();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

// Chat system
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const sendBtn = document.getElementById('sendBtn');

sendBtn.addEventListener('click', () => {
  const msg = chatInput.value.trim();
  if(msg) {
    const messageElement = document.createElement('div');
    messageElement.textContent = `You: ${msg}`;
    chatMessages.appendChild(messageElement);
    chatInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});

chatInput.addEventListener('keydown', (e) => {
  if(e.key === 'Enter') sendBtn.click();
});

