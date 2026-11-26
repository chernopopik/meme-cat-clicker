window.vkReady = false;

// Инициализация VK Bridge при запуске игры
if (window.vkBridge) {
    vkBridge.send('VKWebAppInit')
        .then(() => {
            window.vkReady = true;
            // Показываем нижний рекламный баннер ВКонтакте (дополнительный доход)
            vkBridge.send('VKWebAppShowBannerAd', { banner_location: 'bottom' }).catch(() => {});
        })
        .catch(() => {});
}

// Показ видеорекламы за вознаграждение (кнопка X2) с отключением звука
window.showVKRewarded = function(onReward) {
    if (!window.vkReady || !window.vkBridge) {
        onReward();
        return;
    }
    const wasMuted = window.SFX?.muted;
    if (window.SFX && !wasMuted) window.SFX.muted = true;

    vkBridge.send('VKWebAppShowNativeAds', { ad_format: 'reward' })
        .then(data => {
            if (window.SFX && !wasMuted) window.SFX.muted = false;
            if (data.result) onReward();
        })
        .catch(() => {
            if (window.SFX && !wasMuted) window.SFX.muted = false;
            onReward();
        });
};

// Таблица рекордов ВКонтакте (кнопка Топ)
document.addEventListener('DOMContentLoaded', () => {
    const btnTop = document.getElementById('btn-top');
    if (!btnTop) return;

    btnTop.onclick = () => {
        const score = window.state ? Math.floor(state.totalEarned) : 0;
        if (window.vkReady && window.vkBridge) {
            vkBridge.send('VKWebAppShowLeaderBoardBox', { user_result: score })
                .catch(() => showLocalTopModal(score));
        } else {
            showLocalTopModal(score);
        }
    };
});

function showLocalTopModal(score) {
    const list = document.getElementById('top-list');
    document.getElementById('top-modal').style.display = 'flex';
    list.innerHTML = `
        <div style="background:#172554;padding:12px;border-radius:10px;border:1px solid #38bdf8;display:flex;justify-content:space-between;">
            <div><b>#1</b> Ты (Локальный тест)</div>
            <div style="color:#38bdf8;font-weight:bold;">${fmt(score)} кл.</div>
        </div>
        <div style="font-size:12px;color:#94a3b8;margin-top:8px;">Общий лидерборд ВКонтакте откроется автоматически после загрузки в ВК</div>
    `;
}
