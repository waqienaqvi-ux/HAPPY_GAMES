// THREE.js setup
const canvas = document.getElementById('gameCanvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.02);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer({canvas});
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.enablePan = false;

// Lighting
scene.add(new THREE.AmbientLight(0x888888));
const moonLight = new THREE.DirectionalLight(0xffffff, 0.7);
moonLight.position.set(10, 20, 10);
scene.add(moonLight);

// Ground
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshLambertMaterial({color:0x0b3d0b})
);
ground.rotation.x = -Math.PI/2;
scene.add(ground);

// Trees
function createTree(x,z){
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.3,2), new THREE.MeshLambertMaterial({color:0x8b4513}));
    trunk.position.set(x,1,z);
    const leaves = new THREE.Mesh(new THREE.ConeGeometry(1.5,3,8), new THREE.MeshLambertMaterial({color:0x228B22}));
    leaves.position.set(x,3.5,z);
    scene.add(trunk); scene.add(leaves);
}
for(let i=0;i<50;i++) createTree((Math.random()-0.5)*100,(Math.random()-0.5)*100);

// Player (humanoid)
const player = new THREE.Group();
const torso = new THREE.Mesh(new THREE.BoxGeometry(1,1.5,0.5), new THREE.MeshLambertMaterial({color:0x00ff00}));
const head = new THREE.Mesh(new THREE.BoxGeometry(0.8,0.8,0.8), new THREE.MeshLambertMaterial({color:0xffcc99}));
const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.3,1.2,0.3), new THREE.MeshLambertMaterial({color:0x00ff00}));
const rightArm = leftArm.clone();
const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.3,1.2,0.3), new THREE.MeshLambertMaterial({color:0x0000ff}));
const rightLeg = leftLeg.clone();

torso.position.y=1.8; head.position.y=3;
leftArm.position.set(-0.65,1.8,0); rightArm.position.set(0.65,1.8,0);
leftLeg.position.set(-0.3,0.6,0); rightLeg.position.set(0.3,0.6,0);
player.add(torso,head,leftArm,rightArm,leftLeg,rightLeg);
player.position.set(0,0,0);
scene.add(player);

// Kids
const kids=[];
for(let i=0;i<6;i++){
    const kid=new THREE.Group();
    const kTorso=new THREE.Mesh(new THREE.BoxGeometry(0.6,1,0.4), new THREE.MeshLambertMaterial({color:0xffff00}));
    const kHead=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.5,0.5), new THREE.MeshLambertMaterial({color:0xffaaaa}));
    kTorso.position.y=0.8; kHead.position.y=1.5;
    kid.add(kTorso,kHead);
    kid.position.set(Math.random()*30-15,0,Math.random()*30-15);
    scene.add(kid); kids.push(kid);
}

// Enemies (simplified)
function createWolf(x,z){ scene.add(new THREE.Mesh(new THREE.BoxGeometry(1,0.5,0.3), new THREE.MeshLambertMaterial({color:0x555555}))).position.set(x,0.25,z);}
function createBear(x,z){ scene.add(new THREE.Mesh(new THREE.BoxGeometry(2,1,1), new THREE.MeshLambertMaterial({color:0x663300}))).position.set(x,0.5,z);}
for(let i=0;i<5;i++){ createWolf(Math.random()*30-15,Math.random()*30-15); createBear(Math.random()*30-15,Math.random()*30-15); }

// Dens
function createDen(x,z,color){ const den=new THREE.Mesh(new THREE.BoxGeometry(3,2,3), new THREE.MeshLambertMaterial({color:color})); den.position.set(x,1,z); scene.add(den);}
createDen(10,10,0xff0000); createDen(-10,15,0x00ffff); createDen(15,-10,0xffff00);

// Movement
const keys={};
document.addEventListener('keydown',e=>keys[e.key]=true);
document.addEventListener('keyup',e=>keys[e.key]=false);

// Night system
let night=1, dayMultiplier=1;
const cutsceneDiv=document.getElementById('cutscene');
const cutsceneText=document.getElementById('cutsceneText');

function updateHUD(message=''){
    document.getElementById('night').textContent=night;
    document.getElementById('dayMultiplier').textContent=dayMultiplier;
    document.getElementById('playerName').textContent="Player1";
    document.getElementById('groupName').textContent="None";
    document.getElementById('health').textContent="100";
    document.getElementById('inventory').textContent="None";
    document.getElementById('level').textContent="1";
    document.getElementById('class').textContent="Novice";
    document.getElementById('eventMessage').textContent=message;
}
updateHUD();

// Lobby and night check
function goToLobby(){ player.position.set(0,0,0); alert("You are in the lobby!"); cutsceneDiv.style.display="none";}
function checkNightCompletion(){
    if(night===99 || night%99===0){
        cutsceneDiv.style.display="flex";
        cutsceneText.innerHTML=`Congratulations! You survived Night ${night}.<br>Choose:`;
        cutsceneDiv.innerHTML+=`<button id="continueBtnModal">Continue</button>
        <button id="lobbyBtnModal">Back to Lobby</button>`;
        document.getElementById('continueBtnModal').addEventListener('click',()=>{ cutsceneDiv.style.display="none"; });
        document.getElementById('lobbyBtnModal').addEventListener('click',()=>{ goToLobby(); });
    }
}
function nextNight(){
