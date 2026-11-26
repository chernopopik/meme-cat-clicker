window.renderRoom = function() {
    if (!window.state || !window.ROOM_ITEMS) return;
    if (!state.roomBought) state.roomBought = {};
    const center = document.getElementById('center-area');
    if (!center) return;

    let layer = document.getElementById('room-layer');
    if (!layer) {
        layer = document.createElement('div');
        layer.id = 'room-layer';
        layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:5;';
        center.appendChild(layer);
    }
    layer.innerHTML = '';
    document.body.classList.toggle('space-bg', !!state.roomBought.r_space);

    ROOM_ITEMS.forEach(item => {
        if (state.roomBought[item.id] && item.pos) {
            const wrap = document.createElement('div');
            wrap.style.cssText = 'position:absolute;font-size:64px;pointer-events:none;z-index:5;filter:drop-shadow(0 0 16px #38bdf8);' + item.pos;
            wrap.innerText = item.emoji;
            layer.appendChild(wrap);
        }
    });
};

document.getElementById('btn-room').onclick = function openRoom() {
    if (!state.roomBought) state.roomBought = {};
    const list = document.getElementById('room-list'); list.innerHTML = '';
    ROOM_ITEMS.forEach(item => {
        const bought = !!state.roomBought[item.id];
        const canBuy = item.currency === 'clicks' ? state.score >= item.cost : state.fish >= item.cost;
        const row = document.createElement('div');
        row.style.cssText = 'background:#1e293b;padding:10px 14px;border-radius:10px;display:flex;justify-content:space-between;align-items:center;border:1px solid ' + (bought ? '#22c55e' : '#334155') + ';';
        row.innerHTML = `<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:28px;">${item.emoji}</span><div><b>${item.name}</b><div style="font-size:12px;color:#94a3b8">${item.desc}</div></div></div>`;
        const b = document.createElement('button');
        b.className = 'action-btn'; b.style.cssText = 'padding:6px 12px;font-size:13px;margin:0;';
        if (bought) { b.innerText = 'Куплено'; b.disabled = true; }
        else {
            b.innerText = item.currency === 'clicks' ? `${fmt(item.cost)} кл.` : `${item.cost} 🐟`;
            b.disabled = !canBuy;
            b.onclick = () => {
                if (item.currency === 'clicks' && state.score >= item.cost) state.score -= item.cost;
                else if (item.currency === 'fish' && state.fish >= item.cost) state.fish -= item.cost;
                else return;
                state.roomBought[item.id] = true;
                if (window.SFX) SFX.win();
                saveGame(); renderRoom(); openRoom(); updateUI();
            };
        }
        row.appendChild(b); list.appendChild(row);
    });
    document.getElementById('room-modal').style.display = 'flex';
};

setInterval(() => {
    if (window.state && state.roomBought?.r_aqua) {
        state.fish = (state.fish || 0) + 1;
        spawnFloat(window.innerWidth / 2, 140, 'АКВАРИУМ: +1 🐟', '#facc15');
        saveGame(); updateUI();
    }
}, 120000);

setInterval(() => {
    const mouse = document.getElementById('bonus-mouse');
    if (mouse && window.state && state.roomBought?.r_turret) {
        mouse.dispatchEvent(new PointerEvent('pointerdown', { clientX: window.innerWidth / 2, clientY: 200 }));
    }
}, 1500);

setTimeout(() => { if (window.renderRoom) renderRoom(); }, 300);
