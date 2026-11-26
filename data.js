const SKINS = new Array(
    { id: 'c1', name: 'Обычный кот', img: 'cat1.jpg', emoji: '😼', unlockClicks: 0, mult: 1.0 },
    { id: 'c2', name: 'Кот 2.5K', img: 'cat2.jpg', emoji: '😺', unlockClicks: 2500, mult: 1.1 },
    { id: 'c3', name: 'Кот 15K', img: 'cat3.jpg', emoji: '😸', unlockClicks: 15000, mult: 1.2 },
    { id: 'c4', name: 'Кот 100K', img: 'cat4.jpg', emoji: '😹', unlockClicks: 100000, mult: 1.35 },
    { id: 'c5', name: 'Кот 10M', img: 'cat5.jpg', emoji: '😻', unlockClicks: 10000000, mult: 1.5 },
    { id: 'c6', name: 'Бог 1B', img: 'cat6.jpg', emoji: '👑', unlockClicks: 1e9, mult: 1.75 },
    { id: 'c7', name: 'Кот-Ниндзя', img: 'cat7.jpg', emoji: '🥷', unlockClicks: 5e10, mult: 2.0 },
    { id: 'c8', name: 'Кибер-Кот', img: 'cat8.jpg', emoji: '🤖', unlockClicks: 2.5e12, mult: 2.3 },
    { id: 'c9', name: 'Кот-Пират', img: 'cat9.jpg', emoji: '🏴‍☠️', unlockClicks: 1e14, mult: 2.6 },
    { id: 'c10', name: 'Кот-Маг', img: 'cat10.jpg', emoji: '🧙‍♂️', unlockClicks: 5e15, mult: 3.0 },
    { id: 'c11', name: 'Кот-Дракон', img: 'cat11.jpg', emoji: '🐉', unlockClicks: 2e17, mult: 3.5 },
    { id: 'c12', name: 'Пришелец', img: 'cat12.jpg', emoji: '👽', unlockClicks: 1e19, mult: 4.0 },
    { id: 'c13', name: 'Кот-Самурай', img: 'cat13.jpg', emoji: '⚔️', unlockClicks: 5e20, mult: 4.6 },
    { id: 'c14', name: 'Космонавт', img: 'cat14.jpg', emoji: '🚀', unlockClicks: 2e22, mult: 5.3 },
    { id: 'c15', name: 'Лорд Времени', img: 'cat15.jpg', emoji: '⏳', unlockClicks: 1e24, mult: 6.2 },
    { id: 'c16', name: 'Абсолют Мемов', img: 'cat16.jpg', emoji: '🌌', unlockClicks: 5e25, mult: 7.5 }
);

const UPGRADE_NAMES = new Array(
    'Сила лапки', 'Авто-дрон', 'Когтеточка', 'Миска вискаса', 'Лазерная указка',
    'Мем-ферма', 'Коробка из-под обуви', 'Мягкий плед', 'Клубок ниток', 'Вкусняшка с лососем',
    'Кошачья мята', 'Игровой тоннель', 'Авто-кормушка', 'Кот-блогер', 'TikTok-аккаунт кота',
    'Мемный паблик', 'Стрим с котом', 'Мерч с лапками', 'Кото-кафе', 'Армия дворовых котов',
    'Подпольный завод валерьянки', 'Кошачий банк', 'Биржа рыбов', 'Спутник Мяу-1', 'Лунная база котов',
    'Терраформинг Марса', 'Кото-сингулярность', 'Квантовый лоток', 'Машина времени', 'Храм Бастет',
    'Галактический совет котов', 'Чёрная дыра из шерсти', 'Ускоритель тыгыдыка', 'Сверхсветовой кусь', 'Генератор мурчания',
    'Вселенский интернет', 'Серверная мемных котов', 'ИИ-кот', 'Матрица котиков', 'Мультивселенная мяу',
    'Измерение сметаны', 'Кот Шрёдингера', 'Бесконечный клубок', 'Хроники тыгыдыка', 'Повелитель реальности',
    'Архитектор мемов', 'Космический мурлыка', 'Создатель интернета', 'Абсолютный кусь', 'Божественный Кот'
);

const MAX_UPGRADE_LVL = 25;

const UPGRADES = UPGRADE_NAMES.map((name, i) => {
    const isClick = i % 2 === 0;
    const baseCost = Math.floor(15 * Math.pow(2.45, i));
    const power = Math.max(1, Math.floor(Math.pow(1.85, i)));
    const unlockAt = i < 2 ? 0 : Math.floor(baseCost * 0.5);
    return { id: 'u' + (i + 1), name, type: isClick ? 'click' : 'auto', power, baseCost, unlockAt };
});
const WHEEL_PRIZES = new Array(
    { name: '+100 и 2% от всех кл.', chance: 40, type: 'clicks', base: 100, pct: 0.02 },
    { name: '+500 и 5% от всех кл.', chance: 25, type: 'clicks', base: 500, pct: 0.05 },
    { name: 'Буст X2 на 60 сек', chance: 20, type: 'x2', val: 60 },
    { name: '+2.5K и 10% от всех кл.', chance: 10, type: 'clicks', base: 2500, pct: 0.10 },
    { name: 'ДЖЕКПОТ +10K и 25% кл.!', chance: 5, type: 'clicks', base: 10000, pct: 0.25 }
);

const DAILY_REWARDS = new Array(
    { base: 100, pct: 0.03 }, { base: 250, pct: 0.05 }, { base: 500, pct: 0.08 },
    { base: 1000, pct: 0.12 }, { base: 2500, pct: 0.18 }, { base: 5000, pct: 0.25 }
);

const TALENTS = new Array(
    { id: 't_greed', name: 'Кошачья жадность', desc: '+25% ко всему доходу навсегда', baseCost: 1, maxLvl: 50 },
    { id: 't_crit', name: 'Крит-кусь x10', desc: '+4% шанс ударить на 10x кликов', baseCost: 2, maxLvl: 15 },
    { id: 't_auto', name: 'Призрачная лапка', desc: '+1 авто-клик в секунду по коту', baseCost: 3, maxLvl: 15 },
    { id: 't_mouse', name: 'Охотник на мышей', desc: 'Мыши чаще и дают +25% награды', baseCost: 2, maxLvl: 20 },
    { id: 't_boss', name: 'Гроза Боссов', desc: '+50% урона по боссам', baseCost: 2, maxLvl: 30 }
);

const BOSSES = new Array(
    { id: 'b1', name: 'Злой Огурец', emoji: '🥒', img: 'boss1.png', reqClicks: 5000, hp: 1500, baseReward: 1500, pct: 0.08, fish: 1 },
    { id: 'b2', name: 'Кот-Боксёр', emoji: '🥊', img: 'boss2.png', reqClicks: 50000, hp: 18000, baseReward: 15000, pct: 0.12, fish: 3 },
    { id: 'b3', name: 'Адский Пылесос', emoji: '🌪️', img: 'boss3.png', reqClicks: 1000000, hp: 350000, baseReward: 250000, pct: 0.15, fish: 8 },
    { id: 'b4', name: 'Шланг с водой', emoji: '💦', img: 'boss4.png', reqClicks: 25000000, hp: 8000000, baseReward: 5000000, pct: 0.20, fish: 20 },
    { id: 'b5', name: 'Бешеный Пёс', emoji: '🐕', img: 'boss5.png', reqClicks: 500000000, hp: 150000000, baseReward: 100000000, pct: 0.25, fish: 50 }
);

const ACHIEVEMENTS = new Array(
    { id: 'a_c1', name: 'Первый тык', desc: 'Сделать 100 кликов вручную', stat: 'manualClicks', goal: 100, fish: 1 },
    { id: 'a_c2', name: 'Бешеный палец', desc: 'Сделать 2 500 кликов вручную', stat: 'manualClicks', goal: 2500, fish: 3 },
    { id: 'a_c3', name: 'Мозоль на лапке', desc: 'Сделать 15 000 кликов вручную', stat: 'manualClicks', goal: 15000, fish: 10 },
    { id: 'a_e1', name: 'Начинающий магнат', desc: 'Накопить 100K общих кликов', stat: 'totalEarned', goal: 100000, fish: 2 },
    { id: 'a_e2', name: 'Миллионер', desc: 'Накопить 10M общих кликов', stat: 'totalEarned', goal: 10000000, fish: 5 },
    { id: 'a_e3', name: 'Кошачий олигарх', desc: 'Накопить 1B общих кликов', stat: 'totalEarned', goal: 1000000000, fish: 15 },
    { id: 'a_m1', name: 'Мышелов', desc: 'Поймать 3 бонусных мыши', stat: 'miceCaught', goal: 3, fish: 2 },
    { id: 'a_m2', name: 'Гроза грызунов', desc: 'Поймать 15 бонусных мышей', stat: 'miceCaught', goal: 15, fish: 8 },
    { id: 'a_b1', name: 'Победитель огурца', desc: 'Победить 1 босса', stat: 'bossesKilled', goal: 1, fish: 2 },
    { id: 'a_b2', name: 'Чемпион арены', desc: 'Победить 10 боссов', stat: 'bossesKilled', goal: 10, fish: 12 },
    { id: 'a_w1', name: 'Везунчик', desc: 'Прокрутить рулетку 3 раза', stat: 'wheelSpins', goal: 3, fish: 3 },
    { id: 'a_p1', name: 'Новая жизнь', desc: 'Сделать 1 перерождение', stat: 'prestiges', goal: 1, fish: 5 }
);

const ROOM_ITEMS = new Array(
    { id: 'r_sofa', name: 'Мягкий пуфик', emoji: '🛋️', currency: 'clicks', cost: 5000, desc: '+15% ко всему доходу', pos: 'bottom:40px;left:30px;' },
    { id: 'r_bowl', name: 'Золотая миска', emoji: '🥣', currency: 'clicks', cost: 50000, desc: '+30% к силе клика', pos: 'bottom:40px;right:30px;' },
    { id: 'r_aqua', name: 'Неон-аквариум', emoji: '🐠', currency: 'fish', cost: 5, desc: '+1 🐟 каждые 2 минуты', pos: 'top:130px;left:30px;' },
    { id: 'r_pc', name: 'Игровой ПК', emoji: '🖥️', currency: 'clicks', cost: 5000000, desc: '+40% к автодобыче', pos: 'top:130px;right:30px;' },
    { id: 'r_turret', name: 'Лазер-турель', emoji: '🔫', currency: 'fish', cost: 20, desc: 'Сама ловит бегущих мышей!', pos: 'top:115px;left:50%;transform:translateX(-50%);' },
    { id: 'r_space', name: 'Космо-фон', emoji: '🌌', currency: 'fish', cost: 50, desc: 'Меняет фон игры + 1.5x доход', pos: '' }
);
