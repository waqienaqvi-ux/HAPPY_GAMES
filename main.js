/* ===== Hub System Master Build with Name Tags ===== */
class HubSystem {
  constructor() {
    this.player = { name: "Player1", level: 1, color: "gray", shape: "cube" };
    this.friends = []; // {name, color, shape, online}
    this.xp = 0;
    this.coins = 0;
    this.lastRewardDate = null;
    this.miniGames = [];
    this.updateUI();
    this.updateAvatarDisplay();
  }

  /* ===== NAME TAGS ===== */
  changePlayerName(newName) {
    if (!newName.trim()) return;
    const old = this.player.name;
    this.player.name = newName.trim();
    this.updateUI();
    this.updateAvatarDisplay();
    this.addChatMessage(`System: You changed your name from ${old} → ${this.player.name}`, "system");
    this.log(`Name changed: ${old} → ${this.player.name}`);
  }

  changeFriendName(oldName, newName) {
    const friend = this.friends.find(f => f.name === oldName);
    if (friend && newName.trim()) {
      friend.name = newName.trim();
      this.updateAvatarDisplay();
      this.addChatMessage(`System: Renamed friend ${oldName} → ${friend.name}`, "system");
      this.log(`Friend renamed: ${oldName} → ${friend.name}`);
    }
  }

  /* ===== FRIENDS ===== */
  addFriend(name, color = "lightblue", shape = "cube") {
    if (!this.friends.find(f => f.name === name)) {
      this.friends.push({ name, color, shape, online: true });
      this.log(`Added friend: ${name}`);
      this.addChatMessage(`System: ${name} joined your hub.`, "system");
      this.updateAvatarDisplay();
      this.addXP(100);
    } else {
      this.addChatMessage(`System: ${name} is already your friend.`, "system");
    }
  }

  removeFriend(name) {
    this.friends = this.friends.filter(f => f.name !== name);
    this.log(`Removed friend: ${name}`);
    this.addChatMessage(`System: ${name} was removed.`, "system");
    this.updateAvatarDisplay();
  }

  toggleFriendStatus(name) {
    const f = this.friends.find(fr => fr.name === name);
    if (f) {
      f.online = !f.online;
      this.updateAvatarDisplay();
      this.addChatMessage(
        `System: ${f.name} is now ${f.online ? "online ✅" : "offline ⛔"}`,
        "system"
      );
    }
  }

  /* ===== AVATARS ===== */
  changeAvatar(color, shape) {
    this.player.color = color;
    this.player.shape = shape;
    this.updateAvatarDisplay();
    this.addChatMessage(`System: Avatar updated to ${color} ${shape}`, "system");
  }

  updateAvatarDisplay() {
    const hubDiv = document.getElementById("hub");
    hubDiv.innerHTML = "";

    // Player
    hubDiv.appendChild(this.createAvatar(this.player.name, this.player.color, this.player.shape, true));

    // Friends
    this.friends.forEach(f => {
      hubDiv.appendChild(this.createAvatar(f.name, f.color, f.shape, false, f.online));
    });
  }

  createAvatar(name, color, shape, isPlayer = false, online = true) {
    const div = document.createElement("div");
    div.className = "player";
    div.style.backgroundColor = color;
    this.applyShape(div, shape);

    const label = document.createElement("span");
    label.textContent = `${name}${isPlayer ? " (You)" : ""}`;
    label.className = "avatarLabel";
    div.appendChild(label);

    if (!isPlayer) {
      const status = document.createElement("span");
      status.textContent = online ? "🟢" : "🔴";
      status.className = "statusBadge";
      div.appendChild(status);
    }

    return div;
  }

  applyShape(div, shape) {
    if (shape === "sphere") div.style.borderRadius = "50%";
    else if (shape === "cylinder") div.style.borderRadius = "30% / 50%";
    else div.style.borderRadius = "5px";
  }

  /* ===== XP / COINS / LEVEL ===== */
  addXP(amount) {
    this.xp += amount;
    const needed = this.player.level * 500;
    if (this.xp >= needed) {
      this.player.level++;
      this.addChatMessage(`🎉 Level up! You reached Lv.${this.player.level}`, "system");
      showNotification(`⭐ Level Up → Lv.${this.player.level}`);
    }
    this.updateUI();
  }

  addCoins(amount) {
    this.coins += amount;
    animateCoins(this.coins);
    showNotification(`💰 +${amount} Coins`);
    this.updateUI();
  }

  /* ===== MINI-GAMES ===== */
  registerMiniGame(game) {
    this.miniGames.push(game);
  }

  launchMiniGame(name, friendName = null) {
    const game = this.miniGames.find(g => g.name === name);
    const area = document.getElementById("miniGameArea");

    if (!game) {
      this.addChatMessage(`System: Mini-game ${name} not found.`, "system");
      return;
    }

    area.innerHTML = `<h3>${game.name}</h3><p>${game.description}</p>`;
    this.addChatMessage(`System: Starting ${game.name}...`, "system");

    setTimeout(() => {
      const win = Math.random() > 0.5;
      const card = document.createElement("div");
      card.className = `miniGameResult ${win ? "win" : "lose"}`;
      card.textContent = win ? `🏆 You won ${game.name}!` : `❌ You lost ${game.name}`;
      area.appendChild(card);

      if (win) {
        this.addXP(100);
        this.addCoins(50);
      }

      if (friendName) {
        const friend = this.friends.find(f => f.name === friendName);
        if (friend) {
          this.addXP(50);
          this.addChatMessage(`System: You played ${game.name} with ${friend.name}`, "system");
        }
      }
    }, 1500);
  }

  /* ===== CHAT ===== */
  addChatMessage(message, type = "player") {
    const chatMessages = document.getElementById("chatMessages");
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble " + type;

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    bubble.innerHTML = `<span class="time">[${time}]</span> ${message}`;

    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  /* ===== LOGS ===== */
  log(message) {
    const logDiv = document.getElementById("log");
    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.textContent = message;
    logDiv.appendChild(entry);
    logDiv.scrollTop = logDiv.scrollHeight;
  }

  /* ===== UI ===== */
  updateUI() {
    document.getElementById("xp").textContent = `XP: ${this.xp}`;
    document.getElementById("playerName").textContent =
      `Player: ${this.player.name} (Lv.${this.player.level})`;

    // XP bar
    const currentLevelXP = this.xp % 500;
    const progressPercent = (currentLevelXP / 500) * 100;
    const bar = document.getElementById("levelBar");
    bar.style.width = progressPercent + "%";

    if (progressPercent < 40)
      bar.style.background = "linear-gradient(90deg, #00ff88, #00ccff)";
    else if (progressPercent < 70)
      bar.style.background = "linear-gradient(90deg, #ffeb3b, #ff9800)";
    else bar.style.background = "linear-gradient(90deg, #ff5722, #e53935)";
  }
}

/* ===== GLOBAL ===== */
const hub = new HubSystem();

/* ===== ANIMATIONS ===== */
function animateCoins(finalValue) {
  let current = parseInt(document.getElementById("coins").textContent.replace("Coins: ", "")) || 0;
  const step = Math.ceil(Math.abs(finalValue - current) / 20);
  const interval = setInterval(() => {
    if (current < finalValue) current += step;
    else {
      current = finalValue;
      clearInterval(interval);
    }
    document.getElementById("coins").textContent = `Coins: ${current}`;
  }, 40);
}

/* ===== NOTIFICATIONS ===== */
function showNotification(msg) {
  const container = document.getElementById("notifications");
  const note = document.createElement("div");
  note.className = "notification";
  note.textContent = msg;
  container.appendChild(note);
  setTimeout(() => note.remove(), 4000);
}

/* ===== DAILY REWARD ===== */
function claimDailyReward() {
  const today = new Date().toDateString();
  if (hub.lastRewardDate === today) {
    showNotification("❌ Already claimed today!");
    return;
  }
  hub.lastRewardDate = today;
  hub.addCoins(100);
  hub.addXP(200);
  showNotification("🎁 Daily reward claimed!");
}

/* ===== CHAT INPUT ENTER ===== */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("chatInput").addEventListener("keypress", e => {
    if (e.key === "Enter") sendChat();
  });
});

/* ===== BUTTON FUNCTIONS ===== */
function addFriend() {
  const name = document.getElementById("friendName").value.trim();
  if (name) hub.addFriend(name, "lightblue", "cube");
}

function removeFriend() {
  const name = document.getElementById("friendName").value.trim();
  if (name) hub.removeFriend(name);
}

function toggleFriend() {
  const name = document.getElementById("friendName").value.trim();
  if (name) hub.toggleFriendStatus(name);
}

function changeAvatar() {
  const color = document.getElementById("avatarColor").value.trim() || "gray";
  const shape = document.getElementById("avatarShape").value;
  hub.changeAvatar(color, shape);
}

function sendChat() {
  const input = document.getElementById("chatInput");
  const message = input.value.trim();
  if (message) {
    hub.addChatMessage(`You: ${message}`, "player");
    input.value = "";
  }
}

function openShop() {
  hub.addChatMessage("System: Shop feature coming soon!", "system");
}

function openSettings() {
  hub.addChatMessage("System: Settings feature coming soon!", "system");
}

/* ===== NEW: NAME TAG BUTTON FUNCTIONS ===== */
function changePlayerName() {
  const newName = document.getElementById("playerNameInput").value.trim();
  if (newName) hub.changePlayerName(newName);
}

function changeFriendName() {
  const oldName = document.getElementById("oldFriendName").value.trim();
  const newName = document.getElementById("newFriendName").value.trim();
  if (oldName && newName) hub.changeFriendName(oldName, newName);
}
