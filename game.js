

window.state = {
    score: 0, totalEarned: 0, runEarned: 0, selectedSkin: 'c1',
    levels: {}, nextWheelTime: 0, dailyDay: 0, lastDailyDate: '',
    fish: 0, talents: { t_greed: 0, t_crit: 0, t_auto: 0, t_mouse: 0, t_boss: 0 },
    bossCooldowns: {}, manualClicks: 0, miceCaught: 0, bossesKilled: 0, wheelSpins: 0, prestiges: 0, claimedAchs: {},
    roomBought: {}
};
let x2TimeLeft = 0, lastUnlockedCount = -1, lastClickTime = 0;
let curBossIdx = 0, activeBoss = null, bossHp = 0, bossTime = 0;

function loadGame() {
    try {
        const saved = JSON.parse(localStorage.getItem('meme_cat_save'));
        if (saved) {
            state = { ...state, ...saved, levels: { ...(saved.levels || {}) }, talents: { ...state.talents, ...(saved.talents || {}) }, bossCooldowns: { ...(saved.bossCooldowns || {}) }, claimedAchs: { ...(saved.claimedAchs || {}) }, roomBought: { ...(saved.roomBought || {}) } };
            if (!state.runEarned) state.runEarned = state.totalEarned;
        }
    } catch (e) {}
    if (!SKINS.find(s => s.id === state.selectedSkin)) state.selectedSkin = 'c1';
    applySkin(state.selectedSkin);
    if (window.renderRoom) renderRoom();
    renderUpgrades(); updateUI();
}

const saveGame = () => { try { localStorage.setItem('meme_cat_save', JSON.stringify(state)); } catch (e) {} };
const getSkinMult = () => (SKINS.find(s => s.id === state.selectedSkin) || SKINS.at(0)).mult;
const getGreedMult = () => 1 + (state.talents.t_greed || 0) * 0.25;
const getAchMult = () => 1 + Object.keys(state.claimedAchs).length * 0.05;
const getRoomMult = () => (state.roomBought.r_sofa ? 1.15 : 1) * (state.roomBought.r_space ? 1.5 : 1);
const getBossDmgMult = () => 1 + (state.talents.t_boss || 0) * 0.5;
const getTotalMult = () => (x2TimeLeft > 0 ? 2 : 1) * getSkinMult() * getGreedMult() * getAchMult() * getRoomMult();
const getClickPower = () => Math.round((1 + UPGRADES.filter(u => u.type === 'click').reduce((s, u) => s + (state.levels[u.id] || 0) * u.power, 0)) * getTotalMult() * (state.roomBought.r_bowl ? 1.3 : 1) * 10) / 10;
const getAutoIncome = () => Math.round(UPGRADES.filter(u => u.type === 'auto').reduce((s, u) => s + (state.levels[u.id] || 0) * u.power, 0) * getTotalMult() * (state.roomBought.r_pc ? 1.4 : 1) * 10) / 10;
const getCost = u => Math.floor(u.baseCost * Math.pow(1.55, state.levels[u.id] || 0));
const calcReward = r => Math.floor((r.base || r.baseReward) + state.runEarned * r.pct);
const getPendingFish = () => state.runEarned < 1e6 ? 0 : Math.floor(Math.pow(state.runEarned / 1e6, 0.35));

const fmt = n => {
    if (n >= 1e27) return (n / 1e27).toFixed(2) + 'Oc';
    if (n >= 1e24) return (n / 1e24).toFixed(2) + 'Sp';
    if (n >= 1e21) return (n / 1e21).toFixed(2) + 'Sx';
    if (n >= 1e18) return (n / 1e18).toFixed(2) + 'Qi';
    if (n >= 1e15) return (n / 1e15).toFixed(2) + 'Qa';
    if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e4) return (n / 1e3).toFixed(1) + 'K';
    return Math.floor(n);
};

function spawnFloat(x, y, text, color) {
    const el = document.createElement('div');
    el.className = 'float-num'; el.innerText = text;
    if (color) el.style.color = color;
    el.style.left = x + 'px'; el.style.top = y + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
}

function addClicks(amount) { state.score += amount; state.totalEarned += amount; state.runEarned += amount; }

function performClick(x, y) {
    let gain = getClickPower();
    const isCrit = Math.random() < (state.talents.t_crit || 0) * 0.04;
    if (isCrit) gain *= 10;
    addClicks(gain);
    if (x !== null) spawnFloat(x + (Math.random() - 0.5) * 60, y - 20, (isCrit ? 'КРИТ! +' : '+') + fmt(gain), isCrit ? '#facc15' : null);
    updateUI();
}

document.getElementById('cat-btn').addEventListener('pointerdown', e => {
    const now = Date.now();
    if (now - lastClickTime < 45) return;
    lastClickTime = now;
    state.manualClicks = (state.manualClicks || 0) + 1;
    if (window.SFX) (Math.random() < 0.03 && SFX.meow) ? SFX.meow() : SFX.click();
    performClick(e.clientX, e.clientY);
});

function spawnMouse() {
    if (document.getElementById('bonus-mouse') || activeBoss) return;
    const mouse = document.createElement('div');
    mouse.id = 'bonus-mouse'; mouse.innerText = '🐁';
    mouse.style.top = (15 + Math.random() * 65) + 'vh';
    mouse.style.animation = (Math.random() > 0.5 ? 'runRight' : 'runLeft') + ' 4.5s linear forwards';
    mouse.onpointerdown = e => {
        e.stopPropagation();
        state.miceCaught = (state.miceCaught || 0) + 1;
        const mMult = 1 + (state.talents.t_mouse || 0) * 0.25;
        const bonus = Math.max(50, Math.floor((state.runEarned * 0.04 + getClickPower() * 25) * mMult));
        addClicks(bonus);
        if (window.SFX) SFX.win();
        spawnFloat(e.clientX, e.clientY - 20, 'МЫШЬ! +' + fmt(bonus), '#facc15');
        mouse.remove(); updateUI();
    };
    document.body.appendChild(mouse);
    setTimeout(() => { if (mouse.parentNode) mouse.remove(); }, 4600);
}
setInterval(() => { if (Math.random() < Math.min(0.95, 0.5 + (state.talents.t_mouse || 0) * 0.03)) spawnMouse(); }, 25000);
function buyUpgrade(id) {
    const u = UPGRADES.find(item => item.id === id);
    const lvl = state.levels[id] || 0;
    if (!u || state.runEarned < u.unlockAt || lvl >= MAX_UPGRADE_LVL) return;
    const cost = getCost(u);
    if (state.score >= cost) {
        if (window.SFX) SFX.buy();
        state.score -= cost; state.levels[id] = lvl + 1;
        saveGame(); renderUpgrades(); updateUI();
    }
}

function renderUpgrades() {
    const panel = document.getElementById('right-panel'); panel.innerHTML = '';
    UPGRADES.forEach(u => {
        const unlocked = state.runEarned >= u.unlockAt;
        const card = document.createElement('div');
        if (!unlocked) {
            card.className = 'upgrade-card locked';
            card.innerHTML = `<div class="u-title">???</div><div class="u-desc">Откроется при ${fmt(u.unlockAt)} кл.</div>`;
        } else {
            const lvl = state.levels[u.id] || 0;
            const isMax = lvl >= MAX_UPGRADE_LVL;
            const cost = getCost(u);
            card.className = 'upgrade-card' + ((!isMax && state.score >= cost) ? '' : ' disabled');
            if (!isMax) card.onclick = () => buyUpgrade(u.id);
            card.innerHTML = `<div><div class="u-title">${u.name} (${lvl}/${MAX_UPGRADE_LVL})</div><div class="u-desc">${u.type === 'click' ? `+${fmt(u.power)} за клик` : `+${fmt(u.power)} кл./сек`}</div></div><div class="u-cost">${isMax ? 'МАКС' : fmt(cost) + ' кл.'}</div>`;
        }
        panel.appendChild(card);
    });
}

function renderBossMenu() {
    const b = BOSSES.at(curBossIdx);
    const unlocked = state.totalEarned >= b.reqClicks;
    const cdLeft = Math.max(0, Math.ceil(((state.bossCooldowns[b.id] || 0) - Date.now()) / 1000));
    const iconEl = document.getElementById('boss-icon'), imgEl = document.getElementById('boss-img');
    if (b.img) {
        imgEl.src = b.img; imgEl.style.display = 'block'; iconEl.style.display = 'none';
        imgEl.style.filter = unlocked ? 'drop-shadow(0 0 18px rgba(239,68,68,0.6))' : 'blur(14px) brightness(0.45)';
        imgEl.onerror = () => { imgEl.style.display = 'none'; iconEl.style.display = 'block'; iconEl.innerText = unlocked ? b.emoji : '❓'; };
    } else { imgEl.style.display = 'none'; iconEl.style.display = 'block'; iconEl.innerText = unlocked ? b.emoji : '❓'; }
    document.getElementById('boss-name').innerText = b.name;
    document.getElementById('boss-req').innerText = unlocked ? `HP: ${fmt(b.hp)}` : `Заблокировано! Нужно всего ${fmt(b.reqClicks)} кл.`;
    document.getElementById('boss-reward-info').innerText = unlocked ? `Награда: +${fmt(calcReward(b))} кл. и +${b.fish} 🐟` : 'Награда скрыта';
    const startBtn = document.getElementById('boss-start-btn');
    if (!unlocked) { startBtn.disabled = true; startBtn.innerText = 'Недостаточно кликов'; }
    else if (cdLeft > 0) { startBtn.disabled = true; startBtn.innerText = `Отдых: ${cdLeft} сек`; }
    else { startBtn.disabled = false; startBtn.innerText = 'В БОЙ! (30 сек)'; }
}

document.getElementById('btn-bosses').onclick = () => { activeBoss = null; document.getElementById('boss-select-view').style.display = 'block'; document.getElementById('boss-fight-view').style.display = 'none'; renderBossMenu(); document.getElementById('boss-modal').style.display = 'flex'; };
document.getElementById('boss-prev').onclick = () => { curBossIdx = (curBossIdx - 1 + BOSSES.length) % BOSSES.length; renderBossMenu(); };
document.getElementById('boss-next').onclick = () => { curBossIdx = (curBossIdx + 1) % BOSSES.length; renderBossMenu(); };

document.getElementById('boss-start-btn').onclick = () => {
    const b = BOSSES.at(curBossIdx);
    if (state.totalEarned < b.reqClicks || Date.now() < (state.bossCooldowns[b.id] || 0)) return;
    activeBoss = b; bossHp = b.hp; bossTime = 30.0;
    document.getElementById('boss-select-view').style.display = 'none'; document.getElementById('boss-fight-view').style.display = 'block';
    const fImg = document.getElementById('boss-fight-img'), fEmoji = document.getElementById('boss-fight-emoji');
    if (b.img) { fImg.src = b.img; fImg.style.display = 'block'; fEmoji.style.display = 'none'; fImg.onerror = () => { fImg.style.display = 'none'; fEmoji.style.display = 'block'; fEmoji.innerText = b.emoji; }; }
    else { fImg.style.display = 'none'; fEmoji.style.display = 'block'; fEmoji.innerText = b.emoji; }
    updateBossUI();
};

function hitBoss(dmg, x, y) {
    if (!activeBoss) return;
    bossHp = Math.max(0, bossHp - dmg);
    if (x) spawnFloat(x, y - 20, '-' + fmt(dmg), '#f87171');
    updateBossUI();
    if (bossHp <= 0) {
        const b = activeBoss; activeBoss = null; state.bossesKilled = (state.bossesKilled || 0) + 1;
        const winClicks = calcReward(b); addClicks(winClicks); state.fish += b.fish; state.bossCooldowns[b.id] = Date.now() + 120000;
        if (window.SFX) SFX.win(); saveGame(); updateUI();
        document.getElementById('boss-modal').style.display = 'none';
        document.getElementById('boss-win-title').innerText = `ПОБЕДА: ${b.name}!`;
        document.getElementById('boss-win-reward').innerHTML = `+${fmt(winClicks)} кликов<br>+${b.fish} 🐟`;
        document.getElementById('boss-win-modal').style.display = 'flex';
    }
}

document.getElementById('boss-target').onpointerdown = e => {
    const now = Date.now(); if (now - lastClickTime < 45) return; lastClickTime = now;
    if (window.SFX) SFX.click();
    const target = document.getElementById('boss-target'); target.style.transform = 'scale(0.88)'; setTimeout(() => target.style.transform = 'scale(1)', 60);
    hitBoss(getClickPower() * getBossDmgMult(), e.clientX, e.clientY);
};

function updateBossUI() {
    if (!activeBoss) return;
    document.getElementById('boss-timer').innerText = bossTime.toFixed(1) + ' сек';
    document.getElementById('boss-hp-bar').style.width = (bossHp / activeBoss.hp * 100) + '%';
    document.getElementById('boss-hp-text').innerText = `${fmt(bossHp)} / ${fmt(activeBoss.hp)} HP`;
}
document.getElementById('btn-ach').onclick = function openAch() {
    const claimedCount = Object.keys(state.claimedAchs).length;
    document.getElementById('ach-bonus-text').innerText = `+${claimedCount * 5}% (${claimedCount}/${ACHIEVEMENTS.length})`;
    const list = document.getElementById('ach-list'); list.innerHTML = '';
    ACHIEVEMENTS.forEach(a => {
        const cur = Math.floor(state[a.stat] || 0), done = cur >= a.goal, claimed = !!state.claimedAchs[a.id];
        const row = document.createElement('div');
        row.style.cssText = 'background:#1e293b;padding:10px 14px;border-radius:10px;display:flex;justify-content:space-between;align-items:center;border:1px solid ' + (claimed ? '#22c55e' : '#334155') + ';';
        row.innerHTML = `<div><b>${a.name}</b> (${fmt(Math.min(cur, a.goal))}/${fmt(a.goal)})<div style="font-size:12px;color:#94a3b8">${a.desc}</div></div>`;
        const b = document.createElement('button');
        b.className = 'action-btn'; b.style.cssText = 'padding:6px 12px;font-size:13px;margin:0;';
        if (claimed) { b.innerText = '✅'; b.disabled = true; }
        else if (done) { b.innerText = `+${a.fish} 🐟`; b.onclick = () => { state.claimedAchs[a.id] = true; state.fish += a.fish; if (window.SFX) SFX.win(); saveGame(); openAch(); updateUI(); }; }
        else { b.innerText = 'В пути'; b.disabled = true; }
        row.appendChild(b); list.appendChild(row);
    });
    document.getElementById('ach-modal').style.display = 'flex';
};

document.getElementById('btn-prestige').onclick = function openPrestige() {
    const pending = getPendingFish();
    document.getElementById('modal-fish').innerText = state.fish + ' 🐟';
    const pBtn = document.getElementById('do-prestige-btn');
    pBtn.innerText = pending > 0 ? `Переродиться (+${pending} 🐟)` : 'Нужно 1.00M кл. за забег'; pBtn.disabled = pending <= 0;
    const list = document.getElementById('talents-list'); list.innerHTML = '';
    TALENTS.forEach(t => {
        const lvl = state.talents[t.id] || 0, isMax = lvl >= t.maxLvl, cost = t.baseCost * (lvl + 1);
        const row = document.createElement('div');
        row.style.cssText = 'background:#1e293b;padding:10px 14px;border-radius:10px;display:flex;justify-content:space-between;align-items:center;border:1px solid #334155;';
        row.innerHTML = `<div><b>${t.name}</b> (${lvl}/${t.maxLvl})<div style="font-size:12px;color:#94a3b8">${t.desc}</div></div>`;
        const b = document.createElement('button');
        b.className = 'action-btn'; b.style.cssText = 'padding:6px 12px;font-size:13px;margin:0;';
        b.innerText = isMax ? 'МАКС' : `${cost} 🐟`; b.disabled = isMax || state.fish < cost;
        b.onclick = () => { if (state.fish >= cost && !isMax) { state.fish -= cost; state.talents[t.id] = lvl + 1; if (window.SFX) SFX.buy(); saveGame(); openPrestige(); updateUI(); } };
        row.appendChild(b); list.appendChild(row);
    });
    document.getElementById('prestige-modal').style.display = 'flex';
};

document.getElementById('do-prestige-btn').onclick = () => {
    const pending = getPendingFish(); if (pending <= 0) return;
    state.fish += pending; state.score = 0; state.runEarned = 0; state.levels = {}; lastUnlockedCount = -1;
    state.prestiges = (state.prestiges || 0) + 1;
    if (window.SFX) SFX.win(); saveGame(); renderUpgrades(); updateUI(); document.getElementById('btn-prestige').click();
};

document.getElementById('btn-x2').onclick = () => {
    if (x2TimeLeft > 0) return;
    const start = () => { x2TimeLeft = 60; updateUI(); };
    if (window.showVKRewarded) showVKRewarded(start);
    else start();
};

const getToday = () => new Date().toISOString().slice(0, 10);
document.getElementById('btn-daily').onclick = () => {
    const grid = document.getElementById('daily-grid'); grid.innerHTML = '';
    const claimedToday = state.lastDailyDate === getToday();
    DAILY_REWARDS.forEach((r, idx) => {
        const div = document.createElement('div');
        const isDone = idx < state.dailyDay, isCurrent = idx === state.dailyDay && !claimedToday;
        div.className = 'item-card' + (isCurrent ? ' selected' : '') + (isDone ? ' locked-skin' : '');
        div.innerHTML = `<div style="font-size:12px">День ${idx + 1}</div><div style="font-weight:bold;color:#38bdf8">${isDone ? '✅' : '+' + fmt(calcReward(r))}</div>`;
        grid.appendChild(div);
    });
    document.getElementById('claim-daily-btn').disabled = claimedToday;
    document.getElementById('daily-modal').style.display = 'flex';
};

document.getElementById('claim-daily-btn').onclick = () => {
    if (state.lastDailyDate === getToday()) return;
    addClicks(calcReward(DAILY_REWARDS.at(state.dailyDay % DAILY_REWARDS.length)));
    state.dailyDay = (state.dailyDay + 1) % DAILY_REWARDS.length; state.lastDailyDate = getToday();
    if (window.SFX) SFX.win(); saveGame(); updateUI(); document.getElementById('btn-daily').click();
};

document.getElementById('btn-skins').onclick = function openSkins() {
    const grid = document.getElementById('skin-grid'); grid.innerHTML = '';
    SKINS.forEach(s => {
        const unlocked = state.totalEarned >= s.unlockClicks;
        const div = document.createElement('div');
        div.className = 'item-card' + (state.selectedSkin === s.id ? ' selected' : '') + (!unlocked ? ' locked-skin' : '');
        div.innerHTML = `<img src="${s.img}" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" style="width:48px;height:48px;object-fit:contain;margin:0 auto;"><div style="font-size:36px;display:none;">${s.emoji || '🐱'}</div><div style="font-weight:bold;font-size:13px">${s.name}</div><div style="font-size:12px;color:#4ade80">${s.mult}x доход</div><div style="font-size:11px;color:#94a3b8">${unlocked ? 'Доступен' : `Нужно ${fmt(s.unlockClicks)}`}</div>`;
        if (unlocked) div.onclick = () => { state.selectedSkin = s.id; applySkin(s.id); saveGame(); openSkins(); };
        grid.appendChild(div);
    });
    document.getElementById('skin-modal').style.display = 'flex';
};

function closeModals() { activeBoss = null; document.querySelectorAll('.modal').forEach(m => m.style.display = 'none'); }

function applySkin(id) {
    const skin = SKINS.find(s => s.id === id) || SKINS.at(0);
    const imgEl = document.getElementById('cat-img'), emojiEl = document.getElementById('cat-emoji');
    imgEl.src = skin.img; imgEl.style.display = 'block'; emojiEl.style.display = 'none';
    imgEl.onerror = () => { imgEl.style.display = 'none'; emojiEl.style.display = 'block'; emojiEl.innerText = skin.emoji || '😼'; };
}

function updateUI() {
    document.getElementById('score').innerText = fmt(state.score) + ' кл.';
    const totalMult = (getSkinMult() * getGreedMult() * getAchMult() * getRoomMult()).toFixed(2);
    document.getElementById('per-sec').innerText = `${fmt(getAutoIncome())} кл./сек (${totalMult}x)`;
    document.getElementById('x2-timer').innerText = x2TimeLeft > 0 ? x2TimeLeft + ' сек' : 'Реклама 60с';
    document.getElementById('btn-x2').classList.toggle('active-boost', x2TimeLeft > 0);
    const pending = getPendingFish();
    document.getElementById('fish-count').innerText = pending > 0 ? `${state.fish} (+${pending})` : `${state.fish} рыбок`;
    document.getElementById('btn-prestige').classList.toggle('ready-glow', pending > 0);
    const wheelLeft = Math.max(0, Math.ceil((state.nextWheelTime - Date.now()) / 1000));
    document.getElementById('wheel-timer').innerText = wheelLeft > 0 ? `${Math.floor(wheelLeft / 60)}:${String(wheelLeft % 60).padStart(2, '0')}` : 'Готово!';
    document.getElementById('btn-wheel').classList.toggle('ready-glow', wheelLeft <= 0);
    const canDaily = state.lastDailyDate !== getToday();
    document.getElementById('daily-status').innerText = canDaily ? 'Забрать!' : 'Получено';
    document.getElementById('btn-daily').classList.toggle('ready-glow', canDaily);
    const readyAchs = ACHIEVEMENTS.filter(a => (state[a.stat] || 0) >= a.goal && !state.claimedAchs[a.id]).length;
    document.getElementById('ach-status').innerText = readyAchs > 0 ? `Готово (${readyAchs})` : 'Ачивки';
    document.getElementById('btn-ach').classList.toggle('ready-glow', readyAchs > 0);

    const unlockedCount = UPGRADES.filter(u => state.runEarned >= u.unlockAt).length;
    if (unlockedCount !== lastUnlockedCount) { lastUnlockedCount = unlockedCount; renderUpgrades(); }
    else {
        const cards = document.querySelectorAll('#right-panel .upgrade-card:not(.locked)');
        let idx = 0;
        UPGRADES.forEach(u => {
            if (state.runEarned >= u.unlockAt && cards[idx]) {
                const isMax = (state.levels[u.id] || 0) >= MAX_UPGRADE_LVL;
                cards[idx].classList.toggle('disabled', isMax || state.score < getCost(u));
                idx++;
            }
        });
    }
}

setInterval(() => {
    const inc = getAutoIncome() / 10;
    if (inc > 0) { addClicks(inc); updateUI(); }
    if (activeBoss) {
        bossTime -= 0.1;
        hitBoss((getAutoIncome() / 10) * getBossDmgMult(), null, null);
        if (activeBoss && bossTime <= 0) { activeBoss = null; document.getElementById('btn-bosses').click(); }
    }
}, 100);

setInterval(() => {
    if (x2TimeLeft > 0) x2TimeLeft--;
    const autoClicks = state.talents.t_auto || 0;
    if (autoClicks > 0 && !activeBoss) {
        const r = document.getElementById('cat-btn').getBoundingClientRect();
        for (let i = 0; i < autoClicks; i++) performClick(r.left + r.width / 2, r.top + r.height / 2);
    }
    if (document.getElementById('boss-modal').style.display === 'flex' && !activeBoss) renderBossMenu();
    updateUI();
}, 1000);

setInterval(saveGame, 5000);
loadGame();
setTimeout(() => {
    const wheelBtn = document.getElementById('btn-wheel');
    const wheelModal = document.getElementById('wheel-modal');
    const spinBtn = document.getElementById('spin-btn');
    if (wheelBtn && wheelModal) {
        wheelBtn.onclick = () => {
            wheelModal.style.display = 'flex';
            if (spinBtn) spinBtn.disabled = Date.now() < (window.state?.nextWheelTime || 0);
        };
    }
}, 500);
setTimeout(() => {
    const wheelBtn = document.getElementById('btn-wheel');
    const wheelModal = document.getElementById('wheel-modal');
    const spinBtn = document.getElementById('spin-btn');
    const resEl = document.getElementById('wheel-result');

    if (wheelBtn && wheelModal) {
        wheelBtn.onclick = () => {
            wheelModal.style.display = 'flex';
            if (spinBtn) spinBtn.disabled = Date.now() < (window.state?.nextWheelTime || 0);
        };
    }

    if (spinBtn) {
        spinBtn.onclick = () => {
            if (Date.now() < (window.state?.nextWheelTime || 0)) return;
            spinBtn.disabled = true;
            if (resEl) resEl.innerText = 'Крутим... 🎰';
            setTimeout(() => {
                if (!window.state) return;
                state.wheelSpins = (state.wheelSpins || 0) + 1;
                const prizes = window.WHEEL_PRIZES || [{ name: '+500 кл.', chance: 100, type: 'clicks', base: 500, pct: 0.05 }];
                let roll = Math.random() * 100, sum = 0, prize = prizes[0];
                for (const p of prizes) { sum += p.chance; if (roll <= sum) { prize = p; break; } }

                let msg = prize.name;
                if (prize.type === 'clicks') {
                    const gain = Math.floor((prize.base || 100) + (state.runEarned || 0) * (prize.pct || 0.02));
                    state.score += gain; state.totalEarned += gain; state.runEarned += gain;
                    msg = '+' + fmt(gain) + ' кликов!';
                } else if (prize.type === 'x2') {
                    x2TimeLeft = (x2TimeLeft || 0) + (prize.val || 60);
                }

                state.nextWheelTime = Date.now() + 15 * 60 * 1000;
                if (resEl) resEl.innerText = 'Выпало: ' + msg;
                if (window.SFX) SFX.win();
                saveGame(); updateUI();
            }, 800);
        };
    }
}, 500);
