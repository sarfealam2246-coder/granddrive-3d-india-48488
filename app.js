try {
// GrandDrive 3D India - Complete JavaScript Implementation
window.APP_TUTORIAL_HTML = [
    '<div class="sf-tutorial">',
    '<h3>GrandDrive 3D India Guide</h3>',
    '<ol>',
    '<li><b>3D Camera Angles (CAM):</b> Press CAM button during race to switch between front, rear, and side views</li>',
    '<li><b>Walk/Drive Mode:</b> Walk lets you explore villages slowly, Drive gives full racing controls</li>',
    '<li><b>Vehicle Unlocking:</b> Earn coins by racing to unlock faster vehicles in the garage</li>',
    '<li><b>Pit-Stop Spin:</b> Daily free spin gives bonus coins, fuel, or vehicle discounts</li>',
    '<li><b>Custom Cups:</b> Create your own races with specific vehicles and target scores</li>',
    '</ol>',
    '<button class="sf-btn" onclick="FactorySound.tap();FactoryUI.closeModal()">Got It!</button>',
    '</div>'
].join('');

window.renderTabs = async function() {
    const user = FactoryDB.getUserSync();
    const items = await FactoryDB.getItems("race");
    const txs = await FactoryDB.getTransactions();
    
    // View 1 - Gaming Lobby
    document.getElementById('view-1').innerHTML = [
        `<div class="sf-hero-card" style="background:linear-gradient(135deg,#c00 0%,#900 100%)">`,
        `<h2>${user.full_name || 'Racer'}</h2>`,
        `<div class="sf-badge">3D HIGHWAY LIVE</div>`,
        `<p>Rank: Novice Driver</p>`,
        `<div class="sf-coin-count">${FactoryUI.safeNum(user.coins || 0)} Coins</div>`,
        `<button class="sf-btn" onclick="FactorySound.coin();FactoryPro.claimDailyBonus()">Claim +50 Daily Fuel</button>`,
        `</div>`,
        `<div class="sf-stat-grid">`,
        `<div class="sf-stat-box">`,
        `<span>Total Races</span>`,
        `<strong>${FactoryUI.safeNum(items.length)}</strong>`,
        `</div>`,
        `<div class="sf-stat-box">`,
        `<span>High Score</span>`,
        `<strong>${FactoryUI.safeNum(Math.max(...items.map(i => i.score || 0), 0))}</strong>`,
        `</div>`,
        `</div>`,
        `<div class="sf-hscroll" id="vehicle-garage"></div>`,
        `<button class="sf-btn sf-btn-wide" onclick="FactorySound.coin();FactoryGame.startSpinWheel('Pit-Stop Bonus Wheel')">Lucky Pit-Stop Spin Wheel</button>`
    ].join('');

    // Render vehicle garage
    const vehicles = [
        {id: "car", name: "City Sedan Car", cost: 0, color: "#3a7bd5", free: true},
        {id: "bike", name: "Desi Bullet Bike", cost: 80, color: "#ff416c"},
        {id: "bus", name: "Express Highway Bus", cost: 150, color: "#f46b45"},
        {id: "truck", name: "Heavy Cargo Truck", cost: 300, color: "#a8ff78"},
        {id: "supercar", name: "Turbo Sports Supercar", cost: 500, color: "#12c2e9"}
    ];
    
    document.getElementById('vehicle-garage').innerHTML = vehicles.map(v => {
        const unlocked = FactoryGame.isUnlocked(v.id, v.free);
        return [
            `<div class="sf-hcard" onclick="FactorySound.tap();${unlocked ? 
                `FactoryGame.startVillageRace('${v.name}','${v.color}')` : 
                `FactoryNav.openDetail('${v.name}','${unlockVehicleHTML(v)}')`}">`,
            `<div class="sf-hcard-icon" style="background:${v.color}">${v.name.charAt(0)}</div>`,
            `<h4>${v.name}</h4>`,
            `<p>${unlocked ? 'READY TO RACE' : `${v.cost} Coins`}</p>`,
            `</div>`
        ].join('');
    }).join('');

    // View 2 - Custom Cup
    document.getElementById('view-2').innerHTML = [
        `<div class="sf-form">`,
        `<h3>Create Custom 3D Highway Cup</h3>`,
        `<input type="text" id="cup-name" placeholder="Cup Name" class="sf-input">`,
        `<select id="cup-vehicle" class="sf-select">`,
        `<option value="car">City Sedan Car</option>`,
        `<option value="bike">Desi Bullet Bike</option>`,
        `<option value="bus">Express Highway Bus</option>`,
        `<option value="truck">Heavy Cargo Truck</option>`,
        `<option value="supercar">Turbo Sports Supercar</option>`,
        `</select>`,
        `<input type="number" id="cup-score" placeholder="Target Score" class="sf-input">`,
        `<button class="sf-btn" onclick="saveCustomCup()">Create Cup</button>`,
        `</div>`,
        `<div class="sf-action-tiles">`,
        `<div class="sf-action-tile" onclick="FactorySound.toggle()">`,
        `<span>Toggle 3D Sound</span>`,
        `</div>`,
        `<div class="sf-action-tile" onclick="FactoryPro.showProModal('VIP Pro Garage','Rs. 99 / mo')">`,
        `<span>VIP Pro Garage</span>`,
        `</div>`,
        `</div>`
    ].join('');

    // View 3 - Leaderboard
    document.getElementById('view-3').innerHTML = [
        `<div class="sf-search">`,
        `<input type="text" placeholder="Search races..." oninput="window.onSearchInput(this.value)">`,
        `</div>`,
        `<div class="sf-list" id="race-list"></div>`
    ].join('');
    renderRaceList(items);

    // View 4 - Profile
    document.getElementById('view-4').innerHTML = [
        `<div class="sf-profile-card">`,
        `<h2>${user.full_name || 'Driver'}</h2>`,
        `<p>${user.email || ''}</p>`,
        `<div class="sf-stat-box">`,
        `<span>Total Coins</span>`,
        `<strong>${FactoryUI.safeNum(user.coins || 0)}</strong>`,
        `</div>`,
        `</div>`,
        `<button class="sf-btn" onclick="FactoryEngine.openReferShare()">Invite Crew +25 Coins</button>`,
        `<button class="sf-btn" onclick="FactoryEngine.openTutorial()">3D Controls Guide</button>`,
        `<button class="sf-btn" onclick="FactoryUI.downloadPDF()">Download Driver License PDF</button>`,
        `<button class="sf-btn sf-btn-logout" onclick="FactoryNav.logout()">Reset Session</button>`
    ].join('');
};

window.renderTabs12 = window.renderTabs34 = window.renderTabs;

function unlockVehicleHTML(v) {
    return [
        `<div class="sf-detail">`,
        `<h2>${v.name}</h2>`,
        `<p>Unlock this vehicle to race in 3D village and highway modes</p>`,
        `<div class="sf-stat-box">`,
        `<span>Unlock Cost</span>`,
        `<strong>${v.cost} Coins</strong>`,
        `</div>`,
        `<button class="sf-btn" onclick="FactorySound.coin();FactoryGame.unlockVehicle('${v.id}',${v.cost},'${v.name}')">Unlock Vehicle</button>`,
        `</div>`
    ].join('');
}

function renderRaceList(races) {
    document.getElementById('race-list').innerHTML = races.map(r => {
        return [
            `<div class="sf-list-row" onclick="FactoryNav.openDetail('${r.name}','${raceDetailHTML(r)}')">`,
            `<div class="sf-list-icon" style="background:${getVehicleColor(r.vehicle)}">`,
            `${(r.vehicle || 'car').charAt(0).toUpperCase()}`,
            `</div>`,
            `<div>`,
            `<h4>${r.name}</h4>`,
            `<p>${new Date(r.createdAt).toLocaleDateString()}</p>`,
            `</div>`,
            `<div class="sf-list-score">${r.score || 0}</div>`,
            `</div>`
        ].join('');
    }).join('') || '<p class="sf-empty">No races yet</p>';
}

function raceDetailHTML(r) {
    return [
        `<div class="sf-detail">`,
        `<h2>${r.name}</h2>`,
        `<div class="sf-stat-grid">`,
        `<div class="sf-stat-box">`,
        `<span>Vehicle</span>`,
        `<strong>${getVehicleName(r.vehicle)}</strong>`,
        `</div>`,
        `<div class="sf-stat-box">`,
        `<span>Score</span>`,
        `<strong>${r.score || 0}</strong>`,
        `</div>`,
        `<div class="sf-stat-box">`,
        `<span>Date</span>`,
        `<strong>${new Date(r.createdAt).toLocaleString()}</strong>`,
        `</div>`,
        `</div>`,
        `<button class="sf-btn" onclick="FactoryNav.back()">Back</button>`,
        `</div>`
    ].join('');
}

function getVehicleName(id) {
    const map = {
        car: 'City Sedan Car',
        bike: 'Desi Bullet Bike',
        bus: 'Express Highway Bus',
        truck: 'Heavy Cargo Truck',
        supercar: 'Turbo Sports Supercar'
    };
    return map[id] || id;
}

function getVehicleColor(id) {
    const map = {
        car: '#3a7bd5',
        bike: '#ff416c',
        bus: '#f46b45',
        truck: '#a8ff78',
        supercar: '#12c2e9'
    };
    return map[id] || '#666';
}

async function saveCustomCup() {
    const name = document.getElementById('cup-name').value;
    const vehicle = document.getElementById('cup-vehicle').value;
    const score = parseInt(document.getElementById('cup-score').value);
    
    if (!name || isNaN(score)) {
        FactoryUI.modal('Error', 'Please fill all fields with valid values');
        return;
    }
    
    const item = {
        type: 'race',
        name: name,
        vehicle: vehicle,
        score: score,
        createdAt: new Date().toISOString()
    };
    
    await FactoryDB.saveItem("race", item);
    await FactoryDB.recordTx('custom_cup', -10); // Deduct 10 coins for creation
    FactorySound.coin();
    FactoryUI.modal('Success', 'Custom cup created!');
    window.renderTabs();
}

window.onFloatingAction = function() {
    FactoryUI.modal('Quick Race', [
        '<p>Start an instant race with random settings:</p>',
        '<button class="sf-btn" onclick="FactoryGame.startVillageRace(\'City Sedan Car\',\'#3a7bd5\')">Easy Village</button>',
        '<button class="sf-btn" onclick="FactoryGame.startVillageRace(\'Desi Bullet Bike\',\'#ff416c\')">Medium Highway</button>',
        '<button class="sf-btn" onclick="FactoryPro.showProModal(\'Pro Race\',\'Rs. 49\')">Pro Challenge</button>'
    ].join(''));
};

window.onSearchInput = function(q) {
    const list = document.getElementById('race-list');
    Array.from(list.children).forEach(row => {
        const match = row.textContent.toLowerCase().includes(q.toLowerCase());
        row.style.display = match ? '' : 'none';
    });
};

window.onTabChange = function(tabNum) {
    FactoryUI.refreshIcons();
};

window.onAppReady = async function() {
    await window.renderTabs();
    FactoryUI.refreshIcons();
};

if (window.FactoryDB && FactoryDB.getUserSync()) {
    window.onAppReady();
}

// Helper for view-1 vehicle unlocks
function checkUnlocked(id) {
    return FactoryGame.isUnlocked(id, id === 'car');
}
} catch (sfErr) { console.error("AppJS Error:", sfErr); if (window.FactoryNav) window.FactoryNav.ensureNonBlank(); }