// ======================
// THREE.JS SETUP
// ======================
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

// ======================
// PLAYER SETUP
// ======================
const playerGeometry = new THREE.BoxGeometry(1, 2, 1);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.y = 1;
scene.add(player);

// ======================
// MOVEMENT & JUMPING
// ======================
const moveSpeed = 0.1;
const keys = {};
let isJumping = false;
let jumpVelocity = 0;
const gravity = 0.02;

window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

function updatePlayer() {
  // Movement
  if(keys['w']) player.position.z -= moveSpeed;
  if(keys['s']) player.position.z += moveSpeed;
  if(keys['a']) player.position.x -= moveSpeed;
  if(keys['d']) player.position.x += moveSpeed;

  // Jump
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

// ======================
// COINS SETUP
// ======================
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

// ======================
// CAMERA
// ======================
function updateCamera() {
  camera.position.x = player.position.x;
  camera.position.z = player.position.z + 5;
  camera.position.y = player.position.y + 3;
  camera.lookAt(player.position);
}

// ======================
// CHAT SYSTEM
// ======================
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const sendBtn = document.getElementById('sendBtn');

sendBtn.addEventListener('click', () => {
  const msg = chatInput.value.trim();
  if(msg) {
    sendMessageToFirebase(msg);
    chatInput.value = '';
  }
});

chatInput.addEventListener('keydown', (e) => {
  if(e.key === 'Enter') sendBtn.click();
});

// ======================
// NAME TAGS
// ======================
const nameTagsContainer = document.getElementById('nameTags');
const playerTag = document.createElement('div');
playerTag.className = 'nameTag';
playerTag.textContent = 'You';
nameTagsContainer.appendChild(playerTag);

const friendCubes = {};
const friendTags = {};

// ======================
// FIREBASE SETUP
// ======================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Assign a random UID for demo purposes
const currentPlayer = {
  uid: 'player_' + Math.floor(Math.random()*10000),
  name: 'You',
  friends: [] // Add friend UIDs here
};

// Update player position to Firebase
function updateFirebasePlayer() {
  db.ref(`players/${currentPlayer.uid}`).set({
    name: currentPlayer.name,
    position: {
      x: player.position.x,
      y: player.position.y,
      z: player.position.z
    },
    friends: currentPlayer.friends
  });
}

// Listen for other players
db.ref('players').on('value', snapshot => {
  const allPlayers = snapshot.val();
  if(!allPlayers) return;

  Object.keys(allPlayers).forEach(uid => {
    const playerData = allPlayers[uid];
    if(uid === currentPlayer.uid) return; // skip self

    if(currentPlayer.friends.includes(uid)) {
      // Spawn/update friend cube
      let friendCube = friendCubes[uid];
      if(!friendCube) {
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        friendCube = new THREE.Mesh(geometry, material);
        scene.add(friendCube);
        friendCubes[uid] = friendCube;

        // Name tag
        const tag = document.createElement('div');
        tag.className = 'nameTag';
        tag.textContent = playerData.name;
        nameTagsContainer.appendChild(tag);
        friendTags[uid] = tag;
      }
      friendCube.position.set(playerData.position.x, playerData.position.y, playerData.position.z);
    }
  });
});

// Send chat message to Firebase
function sendMessageToFirebase(text) {
  const msgRef = db.ref('messages').push();
  msgRef.set({
    sender: currentPlayer.uid,
    name: currentPlayer.name,
    text: text,
    timestamp: Date.now()
  });
}

// Listen for messages
db.ref('messages').on('child_added', snapshot => {
  const msg = snapshot.val();
  if(currentPlayer.friends.includes(msg.sender) || msg.sender === currentPlayer.uid) {
    const msgDiv = document.createElement('div');
    msgDiv.textContent = `${msg.name}: ${msg.text}`;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});

// ======================
// UPDATE NAME TAGS
// ======================
function updateNameTags() {
  // Player tag
  const playerPos = player.position.clone();
  playerPos.y += 2.5;
  const vector = playerPos.project(camera);
  const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
  playerTag.style.transform = `translate(${x}px, ${y}px)`;

  // Friend tags
  Object.keys(friendCubes).forEach(uid => {
    const friendPos = friendCubes[uid].position.clone();
    friendPos.y += 2.5;
    const vec = friendPos.project(camera);
    const fx = (vec.x * 0.5 + 0.5) * window.innerWidth;
    const fy = (-vec.y * 0.5 + 0.5) * window.innerHeight;
    friendTags[uid].style.transform = `translate(${fx}px, ${fy}px)`;
  });
}

// ======================
// ANIMATE LOOP
// ======================
function animate() {
  requestAnimationFrame(animate);
  updatePlayer();
  updateCamera();
  updateNameTags();
  updateFirebasePlayer();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
// HubSystem.js

class HubSystem {
    constructor(player, hubScene) {
        this.player = player;
        this.hubScene = hubScene;

        // Friend / XP system
        this.friends = [];
        this.xp = 0;

        // Mini-games system
        this.miniGames = [];

        // Avatar system
        this.currentAvatar = "default";
    }

    // ===== FRIEND / XP SYSTEM =====
    addFriend(friendName) {
        if (!this.friends.includes(friendName)) {
            this.friends.push(friendName);
            this.giveFriendBonus();
            console.log(`${friendName} added as a friend! Current XP: ${this.xp}`);
        }
    }

    giveFriendBonus() {
        const bonusXP = 100; // Adjust as needed
        this.xp += bonusXP;
    }

    getXP() {
        return this.xp;
    }

    // ===== MINI-GAMES SYSTEM =====
    registerMiniGame(game) {
        this.miniGames.push(game);
    }

    launchMiniGame(gameName) {
        const game = this.miniGames.find(g => g.name === gameName);
        if (game) {
            console.log(`Launching mini-game: ${game.name}`);
            game.start();
        } else {
            console.log(`Mini-game ${gameName} not found`);
        }
    }

    // ===== AVATAR SYSTEM =====
    changeAvatar(avatarName) {
        this.currentAvatar = avatarName;
        // Replace model/texture on player entity if exists
        if (this.player.entity && this.player.entity.model) {
            this.player.entity.model.asset = `models/${avatarName}.glb`;
        }
        console.log(`Avatar changed to ${avatarName}`);
    }
}

// ===== USAGE EXAMPLE =====
const player = { name: "Player1", entity: { model: {} } };
const hubSystem = new HubSystem(player, "HubScene");

// Friend XP
hubSystem.addFriend("Player2");
hubSystem.addFriend("Player3");
console.log(`Player XP: ${hubSystem.getXP()}`);

// Mini-games
const exampleGame = {
    name: "FruitCollector",
    start: function() { console.log("Mini-game started!"); }
};
hubSystem.registerMiniGame(exampleGame);
hubSystem.launchMiniGame("FruitCollector");

// Avatar
hubSystem.changeAvatar("coolAvatar");
// HubSystem.js

class HubSystem {
    constructor(player, hubScene) {
        this.player = player;
        this.hubScene = hubScene;

        // Friend / XP system
        this.friends = [];
        this.xp = 0;

        // Mini-games system
        this.miniGames = [];

        // Avatar system
        this.currentAvatar = "default";
    }

    // ===== FRIEND / XP SYSTEM =====
    addFriend(friendName) {
        if (!this.friends.includes(friendName)) {
            this.friends.push(friendName);
            this.giveFriendBonus();
            console.log(`${friendName} added as a friend! Current XP: ${this.xp}`);
        }
    }

    giveFriendBonus(amount = 100) {
        this.xp += amount;
    }

    getXP() {
        return this.xp;
    }

    // ===== MINI-GAMES SYSTEM =====
    registerMiniGame(game) {
        this.miniGames.push(game);
    }

    launchMiniGame(gameName, playingWithFriend = null) {
        const game = this.miniGames.find(g => g.name === gameName);
        if (game) {
            console.log(`Launching mini-game: ${game.name}`);
            game.start();

            // Friend XP bonus if playing with a friend
            if (playingWithFriend && this.friends.includes(playingWithFriend)) {
                const bonusXP = 50; // XP bonus for playing with a friend
                this.giveFriendBonus(bonusXP);
                console.log(`Played with friend ${playingWithFriend}, gained ${bonusXP} XP! Total XP: ${this.xp}`);
            }
        } else {
            console.log(`Mini-game ${gameName} not found`);
        }
    }

    // ===== AVATAR SYSTEM =====
    changeAvatar(avatarName) {
        this.currentAvatar = avatarName;
        if (this.player.entity && this.player.entity.model) {
            this.player.entity.model.asset = `models/${avatarName}.glb`;
        }
        console.log(`Avatar changed to ${avatarName}`);
    }
}

// ===== USAGE EXAMPLE =====
const player = { name: "Player1", entity: { model: {} } };
const hubSystem = new HubSystem(player, "HubScene");

// Friend XP
hubSystem.addFriend("Player2");

// Mini-games
const exampleGame = {
    name: "FruitCollector",
    start: function() { console.log("Mini-game started!"); }
};
hubSystem.registerMiniGame(exampleGame);

// Launch mini-game solo
hubSystem.launchMiniGame("FruitCollector");

// Launch mini-game with a friend
hubSystem.launchMiniGame("FruitCollector", "Player2");

// Avatar
hubSystem.changeAvatar("coolAvatar");
