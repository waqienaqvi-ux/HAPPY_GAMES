const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = { x: 400, y: 250, size: 30, health: 100, inventory: [] };
let night = 1;
const items = ['Torch', 'Food', 'Weapon'];
const events = [
    'Nothing happens...',
    'You found food!',
    'A wild creature attacks!',
    'You found a torch!'
];

// Draw player
function drawPlayer() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'green';
    ctx.fillRect(player.x, player.y, player.size, player.size);
}

// Update HUD
function updateHUD(message = '') {
    document.getElementById('night').textContent = night;
    document.getElementById('health').textContent = player.health;
    document.getElementById('inventory').textContent = player.inventory.length > 0 ? player.inventory.join(', ') : 'None';
    document.getElementById('eventMessage').textContent = message;
}

// Random event
function randomEvent() {
    let event = events[Math.floor(Math.random() * events.length)];
    if (event === 'You found food!') {
        player.health = Math.min(player.health + 15, 100);
        player.inventory.push('Food');
    } else if (event === 'A wild creature attacks!') {
        player.health -= 25;
    } else if (event === 'You found a torch!') {
        player.inventory.push('Torch');
    }
    updateHUD(event);
}

// Next night
function nextNight() {
    if (player.health <= 0) {
        updateHUD('Game Over! You did not survive.');
        alert('Game Over! You did not survive.');
        clearInterval(nightInterval);
        return;
    }
    if (night >= 99) {
        updateHUD('Congratulations! You survived 99 nights!');
        alert('You survived 99 nights! Congrats!');
        clearInterval(nightInterval);
        return;
    }
    night++;
    randomEvent();
    drawPlayer();
}

// Player movement
document.addEventListener('keydown', (e) => {
    const speed = 15;
    if (e.key === 'ArrowUp') player.y -= speed;
    if (e.key === 'ArrowDown') player.y += speed;
    if (e.key === 'ArrowLeft') player.x -= speed;
    if (e.key === 'ArrowRight') player.x += speed;

    // Admin/debug keys
    if (e.key === 'h') player.health = 100;           // restore health
    if (e.key === 'n') nextNight();                   // skip night
    if (e.key === 'i') player.inventory.push('Weapon'); // add item

    drawPlayer();
    updateHUD();
});

// Initial draw
drawPlayer();
updateHUD();
randomEvent();

// Night timer
let nightInterval = setInterval(nextNight, 7000);
