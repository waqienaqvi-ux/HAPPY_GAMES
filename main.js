class HubSystem {
  constructor(player) {
    this.player = player;
    this.friends = [];
    this.xp = 0;
    this.coins = 0;
    this.miniGames = [];
    this.currentAvatar = { color: 'gray', shape: 'cube' };
    this.updateUI();
    this.updateAvatarDisplay();
  }

  addFriend(friendName) {
    if (!this.friends.includes(friendName)) {
      this.friends.push(friendName);
      this.giveXP(100);
      this.log(`${friendName} added as a friend! XP: ${this.xp}`);
      this.updateAvatarDisplay();
      this.addChatMessage(`System: ${friendName} joined as your friend!`);
    }
  }

  giveXP(amount = 50) {
    this.xp += amount;
    this.updateUI();
  }

  giveCoins(amount = 10) {
    this.coins += amount;
    this.updateUI();
  }

  registerMiniGame(game) {
    this.miniGames.push(game);
  }

  launchMiniGame(gameName, friendName = null) {
    const game = this.miniGames.find(g => g.name === gameName);
    const gameArea = document.getElementById("miniGameArea");
    if (game) {
      this.log(`Launching mini-game: ${game.name}`);
      gameArea.innerHTML = `<h3>${game.name}</h3><p>${game.description}</p>`;
      game.start();
      this.giveXP(50);
      this.giveCoins(20);

      if (friendName && this.friends.includes(friendName)) {
        this.giveXP(50);
        this.log(`Played with ${friendName}, bonus XP! Total XP: ${this.xp}`);
      }
    } else {
      this.log(`Mini-game ${gameName} not found`);
    }
  }

  changeAvatar(color, shape) {
    this.currentAvatar = { color, shape };
    this.updateAvatarDisplay();
    this.log(`Avatar changed to ${color} (${shape})`);
  }

  updateAvatarDisplay() {
    const hubDiv = document.getElementById("hub");
    hubDiv.innerHTML = '';

    const pDiv = document.createElement('div');
    pDiv.className = 'player';
    pDiv.textContent = this.player.name;
    pDiv.style.backgroundColor = this.currentAvatar.color;
    this.applyShape(pDiv, this.currentAvatar.shape);
    hubDiv.appendChild(pDiv);

    this.friends.forEach(f => {
      const fDiv = document.createElement('div');
      fDiv.className = 'player';
      fDiv.textContent = f;
      fDiv.style.backgroundColor = 'lightblue';
      this.applyShape(fDiv, 'cube');
      hubDiv.appendChild(fDiv);
    });
  }

  applyShape(div, shape) {
    if (shape === 'sphere') {
      div.style.borderRadius = '50%';
    } else if (shape === 'cylinder') {
      div.style.borderRadius = '30% / 50%';
    } else {
      div.style.borderRadius = '5px';
    }
  }

  addChatMessage(message) {
    const chatMessages = document.getElementById("chatMessages");
    const msgDiv = document.createElement("div");
    msgDiv.textContent = message;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  log(message) {
    const logDiv = document.getElementById("log");
    logDiv.textContent += message + "\n";
    logDiv.scrollTop = logDiv.scrollHeight;
  }

  updateUI() {
    document.getElementById("xp").textContent = `XP: ${this.xp}`;
    document.getElementById("coins").textContent = `Coins: ${this.coins}`;
  }
}

// ===== Usage =====
const player = { name: "Player1" };
const hub = new HubSystem(player);

hub.registerMiniGame({
  name: "FruitCollector",
  description: "Collect as many fruits as you can!",
  start: () => hub.log("FruitCollector started!")
});

hub.registerMiniGame({
  name: "CoinGrabber",
  description: "Grab coins before time runs out!",
  start: () => hub.log("CoinGrabber started!")
});

// ===== Button Functions =====
function addFriend() {
  const name = document.getElementById("friendName").value.trim();
  if (name) hub.addFriend(name);
}

function changeAvatar() {
  const color = document.getElementById("avatarColor").value.trim() || 'gray';
  const shape = document.getElementById("avatarShape").value;
  hub.changeAvatar(color, shape);
}

function launchMiniGame(gameName) {
  hub.launchMiniGame(gameName);
}

function launchMiniGameWithFriend() {
  const friend = document.getElementById("friendName").value.trim();
  hub.launchMiniGame("FruitCollector", friend || null);
}

// ✅ Chat system working
function sendChat() {
  const input = document.getElementById("chatInput");
  const message = input.value.trim();
  if (message) {
    hub.addChatMessage(`You: ${message}`);
    input.value = "";
  }
}

function openShop() {
  hub.log("Shop opened (not implemented yet).");
}

function openSettings() {
  hub.log("Settings opened (not implemented yet).");
}
