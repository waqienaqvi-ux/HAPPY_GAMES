class HubSystem {
  constructor(player) {
    this.player = player;
    this.friends = [];
    this.xp = 0;
    this.miniGames = [];
    this.currentAvatar = { color: 'gray', shape: 'cube' };
    this.updateAvatarDisplay();
  }

  addFriend(friendName) {
    if (!this.friends.includes(friendName)) {
      this.friends.push(friendName);
      this.giveXP(100);
      this.log(`${friendName} added as a friend! XP: ${this.xp}`);
      this.updateAvatarDisplay();
    }
  }

  giveXP(amount = 50) { this.xp += amount; }

  registerMiniGame(game) { this.miniGames.push(game); }

  launchMiniGame(gameName, friendName = null) {
    const game = this.miniGames.find(g => g.name === gameName);
    const area = document.getElementById("miniGameArea");
    area.innerHTML = '';
    if(game) {
      this.log(`Starting mini-game: ${game.name}`);
      game.start(area, () => {
        this.giveXP(50);
        if(friendName && this.friends.includes(friendName)) {
          this.giveXP(50);
          this.log(`Played with friend ${friendName}, bonus XP! Total XP: ${this.xp}`);
        } else {
          this.log(`XP after mini-game: ${this.xp}`);
        }
      });
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

    // Player avatar
    const pDiv = document.createElement('div');
    pDiv.className = 'player';
    pDiv.textContent = this.player.name;
    pDiv.style.backgroundColor = this.currentAvatar.color;
    this.applyShape(pDiv, this.currentAvatar.shape);
    hubDiv.appendChild(pDiv);

    // Friends avatars
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
    if(shape === 'sphere') div.style.borderRadius = '50%';
    else if(shape === 'cylinder') div.style.borderRadius = '30% / 50%';
    else div.style.borderRadius = '5px';
  }

  log(message) {
    const logDiv = document.getElementById("log");
    logDiv.textContent += message + "\n";
    logDiv.scrollTop = logDiv.scrollHeight;
  }
}

// ===== Setup =====
const player = { name: "Player1" };
const hub = new HubSystem(player);

// ===== Mini-Games =====
hub.registerMiniGame({
  name: "FruitCollector",
  start: function(area, onComplete) {
    area.innerHTML = '<h3>FruitCollector</h3><button class="game-button">Collect Fruit!</button>';
    const button = area.querySelector('button');
    button.onclick = () => { hub.log("Fruit collected!"); onComplete(); };
  }
});

hub.registerMiniGame({
  name: "CoinGrabber",
  start: function(area, onComplete) {
    area.innerHTML = '<h3>CoinGrabber</h3><button class="game-button">Grab Coin!</button>';
    const button = area.querySelector('button');
    button.onclick = () => { hub.log("Coin grabbed!"); onComplete(); };
  }
});

// ===== Button functions =====
function addFriend() {
  const name = document.getElementById("friendName").value.trim();
  if(name) hub.addFriend(name);
}

function changeAvatar() {
  const color = document.getElementById("avatarColor").value.trim() || 'gray';
  const shape = document.getElementById("avatarShape").value;
  hub.changeAvatar(color, shape);
}

function launchMiniGame(gameName) { hub.launchMiniGame(gameName); }

function launchMiniGameWithFriend() {
  const friend = document.getElementById("friendName").value.trim();
  const gameName = prompt("Enter mini-game name: FruitCollector or CoinGrabber");
  if(gameName) hub.launchMiniGame(gameName, friend || null);
}

function sendChat() {
  const input = document.getElementById("chatInput");
  const msg = input.value.trim();
  if(msg) {
    const chatBox = document.getElementById("chatMessages");
    const p = document.createElement("p");
    p.textContent = `Player1: ${msg}`;
    chatBox.appendChild(p);
    input.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}
