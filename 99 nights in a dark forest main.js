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
const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshLambertMaterial({color:0x0b3d0b}));
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

// HUD and cutscene
const cutsceneDiv=document.getElementById('cutscene');
const cutsceneText=document.getElementById('cutsceneText');

// Night system
let night=1, dayMultiplier=1, gems=0, bedsPlaced=0, craftLevel=1;
let currentClass="Novice";

// Classes
const classes = [];
for(let i=1;i<=22;i++){
    classes.push({name:"Class"+i, boost:i, cost:i*25});
}
const classSelect=document.getElementById('classSelect');
classes.forEach(c=>{ const opt=document.createElement('option'); opt.value=c.name; opt.text=c.name+" ("+c.cost+" gems)"; classSelect.appendChild(opt); });

// Update HUD
function updateHUD(message=''){
    document.getElementById('night').textContent=night;
    document.getElementById('dayMultiplier').textContent=dayMultiplier;
    document.getElementById('gems').textContent=gems;
    document.getElementById('bedsPlaced').textContent=bedsPlaced;
    document.getElementById('craftLevel').textContent=craftLevel;
    document.getElementById('class').textContent=currentClass;
    document.getElementById('eventMessage').textContent=message;
}
updateHUD();

// Crafting functions
document.getElementById('craftBedBtn').addEventListener('click',()=>{
    if(craftLevel>=1 && bedsPlaced<5){
        bedsPlaced++; dayMultiplier++;
        updateHUD("Bed crafted! Day multiplier +1");
    }else{
        updateHUD("Cannot craft more beds!");
    }
});
document.getElementById('upgradeCraftBtn').addEventListener('click',()=>{
    if(craftLevel<5){ craftLevel++; updateHUD("Crafting Machine upgraded to level "+craftLevel);}
    else updateHUD("Crafting Machine at max level!");
});

// Class upgrade
document.getElementById('upgradeClassBtn').addEventListener('click',()=>{
    const selected = classSelect.value;
    const cls = classes.find(c=>c.name===selected);
    if(gems>=cls.cost){ gems-=cls.cost; currentClass=cls.name; updateHUD("Class upgraded to "+cls.name);}
    else updateHUD("Not enough gems!");
});

// Lobby and night system
function goToLobby(){ player.position.set(0,0,0); cutsceneDiv.style.display="none"; alert("You are in the lobby!"); }
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

// AI Creature spawning
function spawnCreature(){
    const type=Math.random()<0.5?"wolf":"bear";
    const x=(Math.random()-0.5)*100; const z=(Math.random()-0.5)*100;
    const color = type==="wolf"?0x555555:0x663300;
    const size = type==="wolf"?[1,0.5,0.3]:[2,1,1];
    const creature = new THREE.Mesh(new THREE.BoxGeometry(...size), new THREE.MeshLambertMaterial({color}));
    creature.position.set(x,size[1]/2,z);
    scene.add(creature);
    // Remove after some time
    setTimeout(()=>{ scene.remove(creature); }, 60000);
}
setInterval(spawnCreature,15000); // Spawn every 15s

// Player movement
const keys={};
document.addEventListener('keydown',e=>keys[e.key]=true);
document.addEventListener('keyup',e=>keys[e.key]=false);

// Night progression
function nextNight(){ night++; gems+=5; updateHUD("Night "+night+" begins"); checkNightCompletion(); }
setInterval(nextNight,20000); // 20s per night

// Animation loop
function animate(){
    requestAnimationFrame(animate);
    const speed=0.2;
    if(keys['w']) player.position.z-=speed;
    if(keys['s']) player.position.z+=speed;
    if(keys['a']) player.position.x-=speed;
    if(keys['d']) player.position.x+=speed;

    camera.position.lerp(new THREE.Vector3(player.position.x,player.position.y+5,player.position.z+10),0.1);
    camera.lookAt(player.position);
    controls.update();
    renderer.render(scene,camera);
}
animate();
