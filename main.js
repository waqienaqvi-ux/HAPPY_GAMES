// ------------------ Game Hub ------------------
let coins = 0;
let friends = [];
let friendBonus = 0.05; // 5% income per friend
let soundEnabled = true;
let animationsEnabled = true;

function launchGame(gameName) {
  const container = document.getElementById('gameContainer');
  container.innerHTML = `<h2>Loading ${gameName}...</h2>`;
  setTimeout(() => {
    if(gameName === 'plantsVsBrainrots') loadPlantsVsBrainrots();
    if(gameName === 'growAGarden') loadGrowAGarden();
    if(gameName === 'stealABrainrot') loadStealABrainrot();
    if(gameName === 'ninetyNineNights') load99Nights();
  }, 500);
}

// ------------------ Games ------------------
function loadPlantsVsBrainrots() {
  const container = document.getElementById('gameContainer');
  container.innerHTML = `
    <h2>Plants vs Meme Brainrot</h2>
    <p>Defend your garden, fuse plants, and earn coins!</p>
    <button onclick="adminPanel('plants')">Open Admin Panel</button>
  `;
}

function loadGrowAGarden() {
  const container = document.getElementById('gameContainer');
  container.innerHTML = `
    <h2>Grow a Garden</h2>
    <p>Plant crops, water them, harvest, and expand your farm!</p>
    <button onclick="adminPanel('garden')">Open Admin Panel</button>
  `;
}

function loadStealABrainrot() {
  const container = document.getElementById('gameContainer');
  container.innerHTML = `
    <h2>Steal a Brainrot</h2>
    <p>Plan heists, steal Brainrots, and collect rewards!</p>
    <button onclick="adminPanel('heist')">Open Admin Panel</button>
  `;
}

function load99Nights() {
  const container = document.getElementById('gameContainer');
  container.innerHTML = `
    <h2>99 Nights in a Forest</h2>
    <p>Survive the forest nights, collect items, and complete challenges!</p>
    <button onclick="adminPanel('forest')">Open Admin Panel</button>
  `;
}

// ------------------ Admin Panel ------------------
function adminPanel(game) {
  const container = document.getElementById('gameContainer');
  container.innerHTML += `
    <h3>Admin Panel - ${game}</h3>
    <p>Spawn coins, plants, or Brainrots.</p>
    <button onclick="spawn('coins')">Spawn Coins</button>
    <button onclick="spawn('plants')">Spawn Plants</button>
    <button onclick="spawn('brainrots')">Spawn Brainrots</button>
  `;
}

function spawn(type) {
  alert(type + " spawned! Admin access confirmed.");
}

// ------------------ Currency ------------------
function addCoins(amount) {
  const totalAmount = Math.floor(amount * (1 + friends.length * friendBonus));
  coins += totalAmount;
  document.getElementById('currency').innerText = "Coins: " + coins;
}

// ------------------ Friend System ------------------
function openFriends() {
  const container = document.getElementById('friendsContainer');
  container.style.display = container.style.display === 'none' ? 'block' : 'none';
  renderFriends();
}

function addFriend() {
  const input = document.getElementById('friendNameInput');
  const name = input.value.trim();
  if(name && !friends.includes(name)) {
    friends.push(name);
    alert(name + " added! +5% income per friend.");
    input.value = '';
    renderFriends();
  } else {
    alert("Invalid or duplicate friend.");
  }
}

function renderFriends() {
  const list = document.getElementById('friendsList');
  list.innerHTML = '';
  friends.forEach(f => {
    const li = document.createElement('li');
    li.innerText = f + " (Online)";
    const visitBtn = document.createElement('button');
    visitBtn.innerText = "Visit Garden";
    visitBtn.style.marginLeft = "10px";
    visitBtn.onclick = () => visitFriend(f);
    li.appendChild(visitBtn);
    list.appendChild(li);
  });
}

function visitFriend(friendName) {
  alert("Visiting " + friendName + "'s garden! Bonus coins added.");
  addCoins(50); // example bonus
}

// ------------------ Shop System ------------------
function openShop() {
  const container = document.getElementById('shopContainer');
  container.style.display = container.style.display === 'none' ? 'block' : 'none';
}

function buyItem(itemName) {
  alert(itemName + " obtained! It's free.");
  if(itemName === 'Speed Boost') alert("Plant growth and coin generation is faster for 5 minutes!");
  if(itemName === 'Extra Plot') alert("You can place one extra plant!");
  if(itemName === 'Mystery Seed') alert("You got a random plant seed!");
}

// ------------------ Settings ------------------
function openSettings() {
  const container = document.getElementById('settingsContainer');
  container.style.display = container.style.display === 'none' ? 'block' : 'none';
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  alert("Sound is now " + (soundEnabled ? "ON" : "OFF"));
}

function toggleAnimations() {
  animationsEnabled = !animationsEnabled;
  alert("Animations are now " + (animationsEnabled ? "ON" : "OFF"));
}
