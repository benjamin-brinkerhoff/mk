/**
 * MK: LEGACY ARENA
 * Complete HTML5 Action-RPG Arena Brawler inspired by Mighty Knight
 * Built with procedural audio (Web Audio API) & dynamic canvas rendering
 */

// --- AUDIO SYSTEM (Procedural Web Audio) ---
class SoundManager {
  constructor() {
    this.ctx = null;
    this.sfxVolume = 0.7;
    this.musicVolume = 0.4;
    this.muted = false;
    this.musicPlaying = false;
    this.musicTimer = null;
    this.step = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type, duration, startVol = 0.3, endVol = 0.01) {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(startVol * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(endVol, 0.0001), this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playNoise(duration, startVol = 0.2) {
    if (this.muted || !this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(startVol * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      noise.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch (e) {}
  }

  playSwing() {
    this.playTone(180, 'sine', 0.12, 0.25, 0.01);
  }

  playHit() {
    this.playNoise(0.09, 0.35);
    this.playTone(120, 'square', 0.1, 0.3, 0.01);
  }

  playCrit() {
    this.playNoise(0.18, 0.5);
    this.playTone(320, 'triangle', 0.25, 0.4, 0.01);
  }

  playDash() {
    this.playTone(400, 'sine', 0.15, 0.2, 0.01);
  }

  playSkill() {
    this.playTone(280, 'sawtooth', 0.25, 0.35, 0.01);
  }

  playUlt() {
    this.playNoise(0.4, 0.6);
    this.playTone(160, 'sawtooth', 0.5, 0.5, 0.01);
  }

  playCoin() {
    this.playTone(980, 'sine', 0.08, 0.25);
    setTimeout(() => this.playTone(1320, 'sine', 0.12, 0.2), 60);
  }

  playBossRoar() {
    this.playTone(65, 'sawtooth', 0.7, 0.7, 0.05);
    this.playNoise(0.5, 0.4);
  }

  playVictory() {
    const notes = [440, 554, 659, 880];
    notes.forEach((n, idx) => {
      setTimeout(() => this.playTone(n, 'triangle', 0.3, 0.4), idx * 120);
    });
  }

  playDefeat() {
    const notes = [440, 392, 349, 293];
    notes.forEach((n, idx) => {
      setTimeout(() => this.playTone(n, 'sawtooth', 0.35, 0.3), idx * 150);
    });
  }

  startMusic() {
    if (this.musicPlaying || this.muted) return;
    this.init();
    this.musicPlaying = true;
    const bassline = [110, 110, 130, 110, 146, 130, 98, 110];
    this.musicTimer = setInterval(() => {
      if (this.muted || !this.musicPlaying || !this.ctx) return;
      const note = bassline[this.step % bassline.length];
      this.playTone(note, 'triangle', 0.2, 0.15 * this.musicVolume, 0.01);
      if (this.step % 2 === 0) {
        this.playNoise(0.05, 0.08 * this.musicVolume);
      }
      if (this.step % 4 === 2) {
        this.playTone(70, 'sine', 0.15, 0.2 * this.musicVolume, 0.01);
      }
      this.step++;
    }, 180);
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.muted;
  }
}

const sounds = new SoundManager();

// --- HERO CLASS DEFINITIONS ---
const HERO_ROSTER = {
  valen: {
    id: 'valen',
    name: 'Sir Valen',
    role: 'Paladin (Tank & Melee)',
    avatar: '🗡️',
    color: '#3b82f6',
    armorColor: '#94a3b8',
    weaponType: 'sword',
    baseHp: 320,
    baseSp: 100,
    speed: 3.6,
    attackPower: 35,
    attackRange: 65,
    attackRate: 0.35,
    defense: 0.25,
    critChance: 0.15,
    skills: {
      s1: { name: 'Shield Slam', icon: '🛡️', cd: 5.0, cost: 25, desc: 'Charges forward, slamming foes with stun and knockback.' },
      s2: { name: 'Whirlwind Blade', icon: '🌪️', cd: 7.0, cost: 35, desc: 'Spins in a lethal circle damaging all adjacent enemies.' },
      ult: { name: 'Holy Aegis', icon: '✨', cd: 18.0, cost: 60, desc: 'Emits a golden blast and renders the hero invulnerable for 5s.' }
    }
  },
  lyra: {
    id: 'lyra',
    name: 'Lyra Windrunner',
    role: 'Ranger (Swift Ranged Sniper)',
    avatar: '🏹',
    color: '#22c55e',
    armorColor: '#15803d',
    weaponType: 'bow',
    baseHp: 220,
    baseSp: 120,
    speed: 4.2,
    attackPower: 30,
    attackRange: 260,
    attackRate: 0.4,
    defense: 0.12,
    critChance: 0.28,
    skills: {
      s1: { name: 'Arrow Barrage', icon: '🎯', cd: 4.0, cost: 20, desc: 'Fires a rapid cone of 5 piercing arrows.' },
      s2: { name: 'Gale Shot', icon: '💨', cd: 6.5, cost: 30, desc: 'Fires a massive spiral vortex that pierces through lines of enemies.' },
      ult: { name: 'Rain of Arrows', icon: '🌧️', cd: 16.0, cost: 50, desc: 'Calls down a lethal storm of arrows striking all arena foes.' }
    }
  },
  ignis: {
    id: 'ignis',
    name: 'Ignis the Pyromancer',
    role: 'Mage (Area Burst Damage)',
    avatar: '🔥',
    color: '#ef4444',
    armorColor: '#b91c1c',
    weaponType: 'staff',
    baseHp: 190,
    baseSp: 160,
    speed: 3.4,
    attackPower: 45,
    attackRange: 220,
    attackRate: 0.55,
    defense: 0.08,
    critChance: 0.22,
    skills: {
      s1: { name: 'Flame Pillar', icon: '🌋', cd: 4.5, cost: 25, desc: 'Erupts a column of fire incinerating enemies.' },
      s2: { name: 'Fire Wave', icon: '🌊', cd: 7.0, cost: 35, desc: 'Unleashes an expanding tidal ring of flames.' },
      ult: { name: 'Cataclysm Meteor', icon: '☄️', cd: 20.0, cost: 70, desc: 'Calls down a gigantic burning meteor causing a massive explosion.' }
    }
  },
  kael: {
    id: 'kael',
    name: 'Kael the Shadowblade',
    role: 'Rogue (Critical Assassin)',
    avatar: '🗡️',
    color: '#a855f7',
    armorColor: '#581c87',
    weaponType: 'daggers',
    baseHp: 240,
    baseSp: 110,
    speed: 4.5,
    attackPower: 40,
    attackRange: 55,
    attackRate: 0.25,
    defense: 0.15,
    critChance: 0.40,
    skills: {
      s1: { name: 'Shadow Strike', icon: '⚡', cd: 4.0, cost: 20, desc: 'Teleports behind the nearest foe with guaranteed critical strike.' },
      s2: { name: 'Blade Fan', icon: '🗡️', cd: 6.0, cost: 30, desc: 'Flings throwing daggers in all 360 degrees.' },
      ult: { name: 'Blade Tempest', icon: '🌪️', cd: 15.0, cost: 55, desc: 'Becomes a blur of lethal shadows dashing through every enemy.' }
    }
  }
};

// --- CAMPAIGN STAGES ---
const CAMPAIGN_STAGES = [
  {
    id: 1,
    title: 'Stage 1: Royal Courtyard',
    desc: 'Repel the goblin warband breach at the castle outer walls.',
    waves: 3,
    difficulty: 'Normal',
    env: 'courtyard',
    boss: {
      name: 'Warlord Grimgor',
      hp: 1200,
      atk: 45,
      spd: 2.2,
      size: 42,
      color: '#4ade80',
      type: 'brute'
    }
  },
  {
    id: 2,
    title: 'Stage 2: Whispering Woods',
    desc: 'Hunt the pack of savage shadow beasts and their alpha.',
    waves: 3,
    difficulty: 'Challenging',
    env: 'forest',
    boss: {
      name: 'Fenrir Bloodfang',
      hp: 1800,
      atk: 55,
      spd: 3.5,
      size: 38,
      color: '#f87171',
      type: 'fast'
    }
  },
  {
    id: 3,
    title: 'Stage 3: Crypt of the Damned',
    desc: 'Cleanse the subterranean mausoleum of the restless undead.',
    waves: 4,
    difficulty: 'Hard',
    env: 'crypt',
    boss: {
      name: 'Lord Malakar the Lich',
      hp: 2400,
      atk: 65,
      spd: 2.5,
      size: 40,
      color: '#c084fc',
      type: 'caster'
    }
  },
  {
    id: 4,
    title: 'Stage 4: Molten Depths',
    desc: 'Descend into the volcanic heart where magma monstrosities dwell.',
    waves: 4,
    difficulty: 'Heroic',
    env: 'lava',
    boss: {
      name: 'Ignis Rex the Magma Golem',
      hp: 3200,
      atk: 80,
      spd: 2.0,
      size: 50,
      color: '#fb923c',
      type: 'brute'
    }
  },
  {
    id: 5,
    title: 'Stage 5: Frostpeak Bastion',
    desc: 'Breach the frozen citadel defended by crystalline ice guardians.',
    waves: 4,
    difficulty: 'Extreme',
    env: 'ice',
    boss: {
      name: 'General Frostfall',
      hp: 4000,
      atk: 90,
      spd: 3.0,
      size: 44,
      color: '#67e8f9',
      type: 'hybrid'
    }
  },
  {
    id: 6,
    title: 'Stage 6: The Dread Citadel',
    desc: 'The final confrontation with Overlord Morvath at the throne of chaos.',
    waves: 5,
    difficulty: 'LEGENDARY',
    env: 'void',
    boss: {
      name: 'Overlord Morvath the Undying',
      hp: 5500,
      atk: 110,
      spd: 3.4,
      size: 52,
      color: '#f43f5e',
      type: 'overlord'
    }
  }
];

// --- UPGRADE SHOP DEFINITIONS ---
const SHOP_UPGRADES = [
  { id: 'hp', title: 'Fortitude of Iron', icon: '❤️', desc: '+20% Max Health for all heroes', baseCost: 150, maxLevel: 5 },
  { id: 'atk', title: 'Honed Steel', icon: '⚔️', desc: '+15% Attack Damage on all attacks', baseCost: 200, maxLevel: 5 },
  { id: 'def', title: 'Reinforced Plating', icon: '🛡️', desc: '+5% Damage Reduction (Armor)', baseCost: 180, maxLevel: 5 },
  { id: 'spd', title: 'Boots of Haste', icon: '👟', desc: '+10% Movement Speed', baseCost: 140, maxLevel: 4 },
  { id: 'crit', title: 'Deadly Precision', icon: '🎯', desc: '+5% Critical Strike Chance', baseCost: 220, maxLevel: 5 },
  { id: 'cdr', title: 'Arcane Mastery', icon: '⏱️', desc: '-10% Skill Cooldown durations', baseCost: 250, maxLevel: 4 }
];

// --- MAIN GAME ENGINE ---
class MKGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.width = 1080;
    this.height = 640;

    // Arena Bounds
    this.arena = {
      x: 60,
      y: 110,
      w: 960,
      h: 470
    };

    // Save Data
    this.loadSaveData();

    // Runtime state
    this.state = 'MENU';
    this.currentStageId = 1;
    this.currentWave = 1;
    this.waveSpawnTimer = 0;
    this.waveCompleteTimer = 0;
    this.player = null;
    this.companions = [];
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.damageTexts = [];
    this.loots = [];
    this.activeBoss = null;

    // Input state
    this.keys = {};
    this.mouse = { x: 0, y: 0, down: false };
    this.touchJoystick = { active: false, startX: 0, startY: 0, dx: 0, dy: 0 };

    // Stats
    this.stageKills = 0;
    this.stageGold = 0;
    this.stageGems = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.comboTimer = 0;
    this.screenShake = 0;
    this.freezeFrames = 0;

    this.selectedHeroDetailId = 'valen';
    this.selectedStageDeployId = 1;

    // Timing
    this.lastTime = performance.now();

    this.bindEvents();
    this.renderHeroList();
    this.renderStageGrid();
    this.renderShopGrid();
    this.updateCurrencyUI();
    this.updatePartySummary();

    // Start Main Loop
    requestAnimationFrame(this.loop.bind(this));
  }

  loadSaveData() {
    const raw = localStorage.getItem('mk_save_data');
    if (raw) {
      try {
        this.save = JSON.parse(raw);
      } catch (e) {
        this.resetDefaultSave();
      }
    } else {
      this.resetDefaultSave();
    }
  }

  resetDefaultSave() {
    this.save = {
      gold: 250,
      gems: 10,
      leader: 'valen',
      companions: ['lyra'],
      unlockedHeroes: ['valen', 'lyra', 'ignis', 'kael'],
      highestStage: 1,
      upgrades: { hp: 0, atk: 0, def: 0, spd: 0, crit: 0, cdr: 0 }
    };
    this.persistSave();
  }

  persistSave() {
    localStorage.setItem('mk_save_data', JSON.stringify(this.save));
  }

  getStatMultipliers() {
    const u = this.save.upgrades;
    return {
      hpMult: 1 + (u.hp || 0) * 0.20,
      atkMult: 1 + (u.atk || 0) * 0.15,
      defBonus: (u.def || 0) * 0.05,
      spdMult: 1 + (u.spd || 0) * 0.10,
      critBonus: (u.crit || 0) * 0.05,
      cdrMult: 1 - (u.cdr || 0) * 0.10
    };
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (this.state === 'PLAYING') this.pauseGame();
        else if (this.state === 'PAUSED') this.resumeGame();
      }
      if (this.state === 'PLAYING') {
        if (e.code === 'Space' || e.code === 'KeyJ') this.playerTriggerAttack();
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.playerTriggerDash();
        if (e.code === 'KeyK' || e.code === 'KeyQ') this.playerTriggerSkill('s1');
        if (e.code === 'KeyL' || e.code === 'KeyE') this.playerTriggerSkill('s2');
        if (e.code === 'KeyU' || e.code === 'KeyR') this.playerTriggerSkill('ult');
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - rect.left) * (this.width / rect.width);
      this.mouse.y = (e.clientY - rect.top) * (this.height / rect.height);
    });

    this.canvas.addEventListener('mousedown', (e) => {
      sounds.init();
      if (this.state === 'PLAYING') {
        if (e.button === 0) this.playerTriggerAttack();
        if (e.button === 2) this.playerTriggerSkill('s1');
      }
    });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    document.getElementById('btn-start-campaign').addEventListener('click', () => {
      sounds.init();
      sounds.startMusic();
      this.openLevelSelect();
    });
    document.getElementById('btn-open-party').addEventListener('click', () => this.openPartySelect());
    document.getElementById('btn-open-shop').addEventListener('click', () => this.openShop());
    document.getElementById('btn-open-settings').addEventListener('click', () => this.openSettings());

    document.getElementById('btn-close-levels').addEventListener('click', () => this.closeModal('level-select-menu'));
    document.getElementById('btn-back-from-levels').addEventListener('click', () => this.closeModal('level-select-menu'));
    document.getElementById('btn-launch-stage').addEventListener('click', () => this.launchStage(this.selectedStageDeployId));

    document.getElementById('btn-close-party').addEventListener('click', () => this.closeModal('party-select-menu'));
    document.getElementById('btn-back-from-party').addEventListener('click', () => this.closeModal('party-select-menu'));
    document.getElementById('btn-set-leader').addEventListener('click', () => this.setLeader(this.selectedHeroDetailId));
    document.getElementById('btn-toggle-companion').addEventListener('click', () => this.toggleCompanion(this.selectedHeroDetailId));

    document.getElementById('btn-close-shop').addEventListener('click', () => this.closeModal('shop-menu'));
    document.getElementById('btn-back-from-shop').addEventListener('click', () => this.closeModal('shop-menu'));

    document.getElementById('btn-close-settings').addEventListener('click', () => this.closeModal('settings-menu'));
    document.getElementById('btn-back-from-settings').addEventListener('click', () => this.closeModal('settings-menu'));
    document.getElementById('btn-reset-save').addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all progress, gold, and upgrades?')) {
        this.resetDefaultSave();
        this.renderHeroList();
        this.renderStageGrid();
        this.renderShopGrid();
        this.updateCurrencyUI();
        this.updatePartySummary();
        alert('Save data reset successfully.');
      }
    });

    document.getElementById('btn-sound-toggle').addEventListener('click', () => {
      const isMuted = sounds.toggleMute();
      document.getElementById('btn-sound-toggle').innerText = isMuted ? '🔇' : '🔊';
    });

    document.getElementById('btn-pause').addEventListener('click', () => {
      if (this.state === 'PLAYING') this.pauseGame();
      else if (this.state === 'PAUSED') this.resumeGame();
    });

    document.getElementById('slot-attack').addEventListener('click', () => this.playerTriggerAttack());
    document.getElementById('slot-dash').addEventListener('click', () => this.playerTriggerDash());
    document.getElementById('slot-skill1').addEventListener('click', () => this.playerTriggerSkill('s1'));
    document.getElementById('slot-skill2').addEventListener('click', () => this.playerTriggerSkill('s2'));
    document.getElementById('slot-ultimate').addEventListener('click', () => this.playerTriggerSkill('ult'));

    document.getElementById('touch-btn-atk').addEventListener('touchstart', (e) => { e.preventDefault(); this.playerTriggerAttack(); });
    document.getElementById('touch-btn-dash').addEventListener('touchstart', (e) => { e.preventDefault(); this.playerTriggerDash(); });
    document.getElementById('touch-btn-s1').addEventListener('touchstart', (e) => { e.preventDefault(); this.playerTriggerSkill('s1'); });
    document.getElementById('touch-btn-s2').addEventListener('touchstart', (e) => { e.preventDefault(); this.playerTriggerSkill('s2'); });
    document.getElementById('touch-btn-ult').addEventListener('touchstart', (e) => { e.preventDefault(); this.playerTriggerSkill('ult'); });

    const joyZone = document.getElementById('touch-joystick-zone');
    const joyKnob = document.getElementById('touch-joystick-knob');
    joyZone.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      const rect = joyZone.getBoundingClientRect();
      this.touchJoystick.active = true;
      this.touchJoystick.startX = rect.left + rect.width / 2;
      this.touchJoystick.startY = rect.top + rect.height / 2;
    });

    joyZone.addEventListener('touchmove', (e) => {
      if (!this.touchJoystick.active) return;
      const touch = e.touches[0];
      let dx = touch.clientX - this.touchJoystick.startX;
      let dy = touch.clientY - this.touchJoystick.startY;
      const dist = Math.hypot(dx, dy);
      const maxDist = 45;
      if (dist > maxDist) {
        dx = (dx / dist) * maxDist;
        dy = (dy / dist) * maxDist;
      }
      joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
      this.touchJoystick.dx = dx / maxDist;
      this.touchJoystick.dy = dy / maxDist;
    });

    const resetJoy = () => {
      this.touchJoystick.active = false;
      this.touchJoystick.dx = 0;
      this.touchJoystick.dy = 0;
      joyKnob.style.transform = 'translate(0px, 0px)';
    };
    joyZone.addEventListener('touchend', resetJoy);
    joyZone.addEventListener('touchcancel', resetJoy);

    document.getElementById('btn-result-menu').addEventListener('click', () => {
      this.closeModal('end-stage-modal');
      this.openLevelSelect();
    });
    document.getElementById('btn-result-next').addEventListener('click', () => {
      this.closeModal('end-stage-modal');
      if (this.currentStageId < CAMPAIGN_STAGES.length) {
        this.launchStage(this.currentStageId + 1);
      } else {
        this.openLevelSelect();
      }
    });

    document.getElementById('slider-sfx').addEventListener('input', (e) => {
      sounds.sfxVolume = parseFloat(e.target.value);
    });
    document.getElementById('slider-music').addEventListener('input', (e) => {
      sounds.musicVolume = parseFloat(e.target.value);
    });
  }

  openModal(id) { document.getElementById(id).classList.remove('hidden'); }
  closeModal(id) { document.getElementById(id).classList.add('hidden'); }

  openLevelSelect() {
    this.renderStageGrid();
    this.openModal('level-select-menu');
  }

  openPartySelect() {
    this.renderHeroList();
    this.showHeroDetails(this.selectedHeroDetailId);
    this.openModal('party-select-menu');
  }

  openShop() {
    this.renderShopGrid();
    this.updateCurrencyUI();
    this.openModal('shop-menu');
  }

  openSettings() { this.openModal('settings-menu'); }

  pauseGame() {
    this.state = 'PAUSED';
    sounds.stopMusic();
  }

  resumeGame() {
    this.state = 'PLAYING';
    sounds.startMusic();
  }

  updateCurrencyUI() {
    document.getElementById('hud-gold').innerText = this.save.gold;
    document.getElementById('hud-gems').innerText = this.save.gems;
    document.getElementById('shop-gold').innerText = this.save.gold;
    document.getElementById('shop-gems').innerText = this.save.gems;
  }

  updatePartySummary() {
    const leaderHero = HERO_ROSTER[this.save.leader];
    document.getElementById('summary-leader').innerText = leaderHero.name;
    document.getElementById('summary-companion-count').innerText = this.save.companions.length;
    const compNames = this.save.companions.map(c => HERO_ROSTER[c].name).join(', ') || 'None';
    document.getElementById('summary-companions').innerText = compNames;
  }

  renderHeroList() {
    const list = document.getElementById('hero-list');
    list.innerHTML = '';
    Object.values(HERO_ROSTER).forEach(hero => {
      const card = document.createElement('div');
      card.className = 'hero-select-card';
      if (hero.id === this.selectedHeroDetailId) card.classList.add('selected');
      if (hero.id === this.save.leader) card.classList.add('leader');
      if (this.save.companions.includes(hero.id)) card.classList.add('companion');

      let tagHtml = '';
      if (hero.id === this.save.leader) tagHtml = '<span class="hero-tag leader-tag">LEADER (YOU)</span>';
      else if (this.save.companions.includes(hero.id)) tagHtml = '<span class="hero-tag companion-tag">COMPANION</span>';

      card.innerHTML = `
        <div class="hero-select-icon">${hero.avatar}</div>
        <div class="hero-select-info">
          <strong>${hero.name}</strong>
          <span class="hero-select-role">${hero.role}</span>
          ${tagHtml}
        </div>
      `;
      card.addEventListener('click', () => {
        this.selectedHeroDetailId = hero.id;
        this.renderHeroList();
        this.showHeroDetails(hero.id);
      });
      list.appendChild(card);
    });
  }

  showHeroDetails(heroId) {
    const hero = HERO_ROSTER[heroId];
    if (!hero) return;
    document.getElementById('detail-portrait').innerText = hero.avatar;
    document.getElementById('detail-name').innerText = hero.name;
    document.getElementById('detail-class').innerText = hero.role;
    document.getElementById('detail-skill-list').innerHTML = `
      <li><strong>${hero.skills.s1.name}:</strong> ${hero.skills.s1.desc}</li>
      <li><strong>${hero.skills.s2.name}:</strong> ${hero.skills.s2.desc}</li>
      <li><strong>${hero.skills.ult.name} (Ultimate):</strong> ${hero.skills.ult.desc}</li>
    `;

    const btnLeader = document.getElementById('btn-set-leader');
    const btnComp = document.getElementById('btn-toggle-companion');

    if (this.save.leader === heroId) {
      btnLeader.disabled = true;
      btnLeader.innerText = 'CURRENT LEADER';
      btnComp.disabled = true;
      btnComp.innerText = 'CANNOT ASSIGN (IS LEADER)';
    } else {
      btnLeader.disabled = false;
      btnLeader.innerText = 'PLAY AS THIS HERO';
      btnComp.disabled = false;
      if (this.save.companions.includes(heroId)) {
        btnComp.innerText = 'REMOVE COMPANION';
      } else {
        btnComp.innerText = `RECRUIT COMPANION (${this.save.companions.length}/2)`;
        btnComp.disabled = this.save.companions.length >= 2;
      }
    }
  }

  setLeader(heroId) {
    this.save.leader = heroId;
    this.save.companions = this.save.companions.filter(id => id !== heroId);
    this.persistSave();
    this.renderHeroList();
    this.showHeroDetails(heroId);
    this.updatePartySummary();
  }

  toggleCompanion(heroId) {
    if (this.save.leader === heroId) return;
    if (this.save.companions.includes(heroId)) {
      this.save.companions = this.save.companions.filter(id => id !== heroId);
    } else {
      if (this.save.companions.length < 2) {
        this.save.companions.push(heroId);
      }
    }
    this.persistSave();
    this.renderHeroList();
    this.showHeroDetails(heroId);
    this.updatePartySummary();
  }

  renderStageGrid() {
    const grid = document.getElementById('stage-grid');
    grid.innerHTML = '';
    CAMPAIGN_STAGES.forEach(stg => {
      const card = document.createElement('div');
      card.className = 'stage-card';
      const isLocked = stg.id > this.save.highestStage;
      if (isLocked) card.classList.add('locked');
      if (stg.id === this.selectedStageDeployId) card.classList.add('selected');

      card.innerHTML = `
        <div class="stage-card-header">
          <span>${stg.title}</span>
          <span class="stage-difficulty">${stg.difficulty}</span>
        </div>
        <div class="stage-desc">${stg.desc}</div>
        <div class="stage-boss-preview">Boss: ${stg.boss.name}</div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: auto;">
          ${isLocked ? '🔒 Locked' : '⭐ ' + stg.waves + ' Waves of Combat'}
        </div>
      `;

      if (!isLocked) {
        card.addEventListener('click', () => {
          this.selectedStageDeployId = stg.id;
          this.renderStageGrid();
          document.getElementById('btn-launch-stage').disabled = false;
        });
      }

      grid.appendChild(card);
    });

    document.getElementById('btn-launch-stage').disabled = (this.selectedStageDeployId > this.save.highestStage);
  }

  renderShopGrid() {
    const grid = document.getElementById('shop-grid');
    grid.innerHTML = '';
    SHOP_UPGRADES.forEach(upg => {
      const curLvl = this.save.upgrades[upg.id] || 0;
      const isMax = curLvl >= upg.maxLevel;
      const cost = Math.floor(upg.baseCost * Math.pow(1.5, curLvl));

      const card = document.createElement('div');
      card.className = 'upgrade-card';

      let dotsHtml = '';
      for (let i = 1; i <= upg.maxLevel; i++) {
        dotsHtml += `<div class="level-dot ${i <= curLvl ? 'filled' : ''}"></div>`;
      }

      card.innerHTML = `
        <div class="upgrade-info">
          <div class="upgrade-title">${upg.icon} ${upg.title}</div>
          <div class="upgrade-desc">${upg.desc}</div>
          <div class="upgrade-level-dots">${dotsHtml}</div>
        </div>
        <button class="menu-btn primary-glow btn-buy-upgrade" ${isMax || this.save.gold < cost ? 'disabled' : ''}>
          ${isMax ? 'MAX' : `🪙 ${cost}`}
        </button>
      `;

      const btn = card.querySelector('.btn-buy-upgrade');
      btn.addEventListener('click', () => {
        if (!isMax && this.save.gold >= cost) {
          this.save.gold -= cost;
          this.save.upgrades[upg.id] = curLvl + 1;
          this.persistSave();
          sounds.playCrit();
          this.renderShopGrid();
          this.updateCurrencyUI();
        }
      });

      grid.appendChild(card);
    });
  }

  launchStage(stageId) {
    this.currentStageId = stageId;
    this.currentWave = 1;
    this.stageKills = 0;
    this.stageGold = 0;
    this.stageGems = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.damageTexts = [];
    this.loots = [];
    this.activeBoss = null;

    this.closeModal('main-menu');
    this.closeModal('level-select-menu');
    this.closeModal('end-stage-modal');
    document.getElementById('hud').classList.remove('hidden');

    const mult = this.getStatMultipliers();
    const leaderDef = HERO_ROSTER[this.save.leader];
    this.player = new Combatant(this, {
      ...leaderDef,
      isPlayer: true,
      x: 200,
      y: 350,
      maxHp: leaderDef.baseHp * mult.hpMult,
      maxSp: leaderDef.baseSp,
      attackPower: leaderDef.attackPower * mult.atkMult,
      defense: leaderDef.defense + mult.defBonus,
      speed: leaderDef.speed * mult.spdMult,
      critChance: leaderDef.critChance + mult.critBonus,
      cdr: mult.cdrMult
    });

    this.companions = [];
    this.save.companions.forEach((compId, index) => {
      const compDef = HERO_ROSTER[compId];
      const comp = new Combatant(this, {
        ...compDef,
        isPlayer: false,
        isCompanion: true,
        x: 160 + index * 40,
        y: 280 + index * 100,
        maxHp: compDef.baseHp * mult.hpMult * 0.9,
        maxSp: compDef.baseSp,
        attackPower: compDef.attackPower * mult.atkMult * 0.85,
        defense: compDef.defense + mult.defBonus,
        speed: compDef.speed * mult.spdMult,
        critChance: compDef.critChance + mult.critBonus,
        cdr: mult.cdrMult
      });
      this.companions.push(comp);
    });

    this.updateHUDStatic();
    this.spawnWave(1);

    this.state = 'PLAYING';
    sounds.startMusic();
  }

  updateHUDStatic() {
    const stage = CAMPAIGN_STAGES.find(s => s.id === this.currentStageId);
    document.getElementById('hud-stage-name').innerText = stage.title;
    document.getElementById('hud-wave-info').innerText = `Wave ${this.currentWave} / ${stage.waves}`;
    document.getElementById('hud-hero-avatar').innerText = this.player.avatar;
    document.getElementById('hud-hero-name').innerText = this.player.name;

    document.getElementById('icon-skill1').innerText = this.player.skills.s1.icon;
    document.getElementById('icon-skill2').innerText = this.player.skills.s2.icon;
    document.getElementById('icon-ult').innerText = this.player.skills.ult.icon;

    const compContainer = document.getElementById('companion-party-container');
    compContainer.innerHTML = '';
    this.companions.forEach((comp, idx) => {
      const card = document.createElement('div');
      card.className = 'companion-mini-card';
      card.id = `comp-card-${idx}`;
      card.innerHTML = `
        <span class="comp-avatar">${comp.avatar}</span>
        <div class="comp-info">
          <span class="comp-name">${comp.name.split(' ')[0]}</span>
          <div class="bar-container hp-bar" style="height: 8px;">
            <div class="bar-fill" id="comp-hp-fill-${idx}" style="width: 100%;"></div>
          </div>
        </div>
      `;
      compContainer.appendChild(card);
    });
  }

  spawnWave(waveNum) {
    this.currentWave = waveNum;
    const stage = CAMPAIGN_STAGES.find(s => s.id === this.currentStageId);
    document.getElementById('hud-wave-info').innerText = `Wave ${this.currentWave} / ${stage.waves}`;

    const isFinalWave = (waveNum === stage.waves);
    const count = 4 + waveNum * 2 + this.currentStageId;

    for (let i = 0; i < count; i++) {
      const enemyType = this.chooseEnemyType(stage.env, waveNum);
      const spawnX = Math.random() < 0.5 ? this.arena.x + this.arena.w - 40 : this.arena.x + this.arena.w - 120 + Math.random() * 80;
      const spawnY = this.arena.y + 40 + Math.random() * (this.arena.h - 80);

      this.enemies.push(new Enemy(this, {
        ...enemyType,
        x: spawnX,
        y: spawnY,
        hp: enemyType.baseHp * (1 + (this.currentStageId - 1) * 0.35 + waveNum * 0.15),
        atk: enemyType.baseAtk * (1 + (this.currentStageId - 1) * 0.25)
      }));
    }

    if (isFinalWave) {
      setTimeout(() => {
        this.spawnBoss(stage.boss);
      }, 1000);
    }
  }

  chooseEnemyType(env, wave) {
    const types = [
      { name: 'Goblin Scout', avatar: '👺', color: '#22c55e', baseHp: 90, baseAtk: 16, spd: 2.8, size: 22, type: 'melee' },
      { name: 'Orc Berserker', avatar: '👹', color: '#dc2626', baseHp: 180, baseAtk: 28, spd: 2.1, size: 28, type: 'melee' },
      { name: 'Skeleton Archer', avatar: '💀', color: '#94a3b8', baseHp: 75, baseAtk: 22, spd: 2.2, size: 20, type: 'ranged' },
      { name: 'Dark Sorcerer', avatar: '🧙‍♂️', color: '#a855f7', baseHp: 110, baseAtk: 32, spd: 1.8, size: 24, type: 'caster' }
    ];
    if (env === 'forest') types[0].name = 'Shadow Wolf';
    if (env === 'crypt') types[0].name = 'Ghoul';
    if (env === 'lava') types[0].name = 'Fire Imp';
    if (env === 'ice') types[0].name = 'Frostling';
    if (env === 'void') types[0].name = 'Void Demon';

    const idx = Math.floor(Math.random() * (wave >= 2 ? types.length : 2));
    return types[idx];
  }

  spawnBoss(bossConfig) {
    sounds.playBossRoar();
    this.screenShake = 20;

    const spawnX = this.arena.x + this.arena.w - 120;
    const spawnY = this.arena.y + this.arena.h / 2;

    this.activeBoss = new Boss(this, {
      ...bossConfig,
      x: spawnX,
      y: spawnY
    });
    this.enemies.push(this.activeBoss);

    const bossHud = document.getElementById('boss-health-container');
    bossHud.classList.remove('hidden');
    document.getElementById('boss-name').innerText = bossConfig.name;
    document.getElementById('boss-hp-fill').style.width = '100%';
    document.getElementById('boss-hp-text').innerText = `${bossConfig.hp} / ${bossConfig.hp}`;
  }

  checkWaveProgress() {
    if (this.enemies.length === 0 && this.state === 'PLAYING') {
      const stage = CAMPAIGN_STAGES.find(s => s.id === this.currentStageId);
      if (this.currentWave < stage.waves) {
        this.currentWave++;
        this.spawnWave(this.currentWave);
      } else {
        this.triggerVictory();
      }
    }
  }

  triggerVictory() {
    this.state = 'STAGE_CLEAR';
    sounds.stopMusic();
    sounds.playVictory();

    const earnedGold = 120 + this.currentStageId * 90;
    const earnedGems = 2 + this.currentStageId;
    this.save.gold += earnedGold;
    this.save.gems += earnedGems;

    if (this.currentStageId >= this.save.highestStage && this.save.highestStage < CAMPAIGN_STAGES.length) {
      this.save.highestStage = this.currentStageId + 1;
    }
    this.persistSave();
    this.updateCurrencyUI();

    document.getElementById('result-title').className = 'victory-title';
    document.getElementById('result-title').innerText = 'VICTORY!';
    document.getElementById('result-subtitle').innerText = 'The battlefield is conquered with honor!';
    document.getElementById('res-kills').innerText = this.stageKills;
    document.getElementById('res-combo').innerText = this.maxCombo;
    document.getElementById('res-gold').innerText = `+${earnedGold}`;
    document.getElementById('res-gems').innerText = `+${earnedGems}`;

    document.getElementById('boss-health-container').classList.add('hidden');
    this.openModal('end-stage-modal');
  }

  triggerDefeat() {
    this.state = 'GAME_OVER';
    sounds.stopMusic();
    sounds.playDefeat();

    document.getElementById('result-title').className = 'defeat-title';
    document.getElementById('result-title').innerText = 'DEFEATED';
    document.getElementById('result-subtitle').innerText = 'Fall back to the armory and forge stronger gear.';
    document.getElementById('res-kills').innerText = this.stageKills;
    document.getElementById('res-combo').innerText = this.maxCombo;
    document.getElementById('res-gold').innerText = '+0';
    document.getElementById('res-gems').innerText = '+0';

    document.getElementById('boss-health-container').classList.add('hidden');
    this.openModal('end-stage-modal');
  }

  playerTriggerAttack() {
    if (!this.player || this.player.isDead) return;
    this.player.performBasicAttack();
  }

  playerTriggerDash() {
    if (!this.player || this.player.isDead) return;
    this.player.performDash();
  }

  playerTriggerSkill(slot) {
    if (!this.player || this.player.isDead) return;
    this.player.performSkill(slot);
  }

  addCombo(hits = 1) {
    this.combo += hits;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;
    this.comboTimer = 2.5;

    const display = document.getElementById('combo-display');
    const countEl = document.getElementById('combo-count');
    if (this.combo >= 2) {
      display.classList.remove('hidden');
      countEl.innerText = this.combo;
      display.style.animation = 'none';
      display.offsetHeight;
      display.style.animation = 'pulse 0.25s ease';
    }
  }

  addDamageText(x, y, text, color = '#ffffff', isCrit = false) {
    this.damageTexts.push({
      x: x + (Math.random() * 20 - 10),
      y: y - 20,
      text: text,
      color: color,
      isCrit: isCrit,
      life: 1.0,
      vy: -1.8
    });
  }

  spawnParticle(x, y, color, speed = 3, count = 5) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const s = Math.random() * speed;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * s,
        vy: Math.sin(angle) * s,
        size: 3 + Math.random() * 3,
        color: color,
        life: 0.5 + Math.random() * 0.4
      });
    }
  }

  spawnLoot(x, y) {
    const isGem = Math.random() < 0.12;
    this.loots.push({
      x: x,
      y: y,
      type: isGem ? 'gem' : 'gold',
      val: isGem ? 1 : (5 + Math.floor(Math.random() * 10)),
      life: 20
    });
  }

  loop(now) {
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    if (this.state === 'PLAYING') {
      if (this.freezeFrames > 0) {
        this.freezeFrames--;
      } else {
        this.update(dt);
      }
    }

    this.render();
    requestAnimationFrame(this.loop.bind(this));
  }

  update(dt) {
    if (this.screenShake > 0) {
      this.screenShake *= 0.9;
      if (this.screenShake < 0.2) this.screenShake = 0;
    }

    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 0;
        document.getElementById('combo-display').classList.add('hidden');
      }
    }

    if (this.player && !this.player.isDead) {
      this.player.update(dt);
      this.loots.forEach(loot => {
        const d = Math.hypot(this.player.x - loot.x, this.player.y - loot.y);
        if (d < 160) {
          loot.x += ((this.player.x - loot.x) / d) * 7;
          loot.y += ((this.player.y - loot.y) / d) * 7;
          if (d < 25) {
            loot.life = 0;
            if (loot.type === 'gem') {
              this.save.gems += loot.val;
              this.stageGems += loot.val;
              sounds.playCrit();
            } else {
              this.save.gold += loot.val;
              this.stageGold += loot.val;
              sounds.playCoin();
            }
            this.updateCurrencyUI();
          }
        }
      });
    }

    this.companions.forEach(comp => comp.update(dt));
    this.enemies.forEach(enemy => enemy.update(dt));
    this.projectiles.forEach(p => p.update(dt));

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.damageTexts.length - 1; i >= 0; i--) {
      const dtObj = this.damageTexts[i];
      dtObj.y += dtObj.vy;
      dtObj.life -= dt;
      if (dtObj.life <= 0) this.damageTexts.splice(i, 1);
    }

    this.projectiles = this.projectiles.filter(p => !p.destroyed);
    this.enemies = this.enemies.filter(e => !e.isDead);
    this.loots = this.loots.filter(l => l.life > 0);

    if (this.activeBoss) {
      if (this.activeBoss.isDead) {
        document.getElementById('boss-health-container').classList.add('hidden');
        this.activeBoss = null;
      } else {
        const pct = Math.max(0, (this.activeBoss.hp / this.activeBoss.maxHp) * 100);
        document.getElementById('boss-hp-fill').style.width = `${pct}%`;
        document.getElementById('boss-hp-text').innerText = `${Math.ceil(this.activeBoss.hp)} / ${this.activeBoss.maxHp}`;
      }
    }

    if (this.player) {
      const hpPct = Math.max(0, (this.player.hp / this.player.maxHp) * 100);
      const spPct = Math.max(0, (this.player.sp / this.player.maxSp) * 100);
      document.getElementById('hud-hp-fill').style.width = `${hpPct}%`;
      document.getElementById('hud-hp-text').innerText = `${Math.ceil(this.player.hp)} / ${Math.ceil(this.player.maxHp)}`;
      document.getElementById('hud-sp-fill').style.width = `${spPct}%`;
      document.getElementById('hud-sp-text').innerText = `${Math.ceil(this.player.sp)} / ${Math.ceil(this.player.maxSp)}`;

      this.updateCooldownOverlay('cd-attack', this.player.attackTimer, this.player.attackRate);
      this.updateCooldownOverlay('cd-dash', this.player.dashCooldown, 1.8);
      this.updateCooldownOverlay('cd-skill1', this.player.skillTimers.s1, this.player.skills.s1.cd * this.player.cdr);
      this.updateCooldownOverlay('cd-skill2', this.player.skillTimers.s2, this.player.skills.s2.cd * this.player.cdr);
      this.updateCooldownOverlay('cd-ult', this.player.skillTimers.ult, this.player.skills.ult.cd * this.player.cdr);
    }

    this.companions.forEach((comp, idx) => {
      const fill = document.getElementById(`comp-hp-fill-${idx}`);
      if (fill) {
        const pct = Math.max(0, (comp.hp / comp.maxHp) * 100);
        fill.style.width = `${pct}%`;
      }
    });

    this.checkWaveProgress();
  }

  updateCooldownOverlay(elemId, currentTimer, maxTimer) {
    const el = document.getElementById(elemId);
    if (!el) return;
    if (currentTimer > 0 && maxTimer > 0) {
      const pct = (currentTimer / maxTimer) * 100;
      el.style.height = `${pct}%`;
    } else {
      el.style.height = '0%';
    }
  }

  render() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.screenShake > 0) {
      const sx = (Math.random() * 2 - 1) * this.screenShake;
      const sy = (Math.random() * 2 - 1) * this.screenShake;
      this.ctx.translate(sx, sy);
    }

    this.drawArena();

    this.loots.forEach(loot => {
      this.ctx.fillStyle = loot.type === 'gem' ? '#38bdf8' : '#eab308';
      this.ctx.beginPath();
      this.ctx.arc(loot.x, loot.y, 6, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();
    });

    const entities = [];
    if (this.player) entities.push(this.player);
    this.companions.forEach(c => entities.push(c));
    this.enemies.forEach(e => entities.push(e));
    entities.sort((a, b) => a.y - b.y);

    entities.forEach(ent => {
      this.ctx.fillStyle = 'rgba(0,0,0,0.35)';
      this.ctx.beginPath();
      this.ctx.ellipse(ent.x, ent.y + ent.radius * 0.7, ent.radius * 0.9, ent.radius * 0.35, 0, 0, Math.PI * 2);
      this.ctx.fill();
    });

    entities.forEach(ent => ent.draw(this.ctx));
    this.projectiles.forEach(p => p.draw(this.ctx));

    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.damageTexts.forEach(dt => {
      this.ctx.font = dt.isCrit ? 'bold 20px Cinzel, sans-serif' : 'bold 15px Rajdhani, sans-serif';
      this.ctx.fillStyle = dt.color;
      this.ctx.strokeStyle = '#000';
      this.ctx.lineWidth = 3;
      this.ctx.strokeText(dt.text, dt.x, dt.y);
      this.ctx.fillText(dt.text, dt.x, dt.y);
    });

    this.ctx.restore();
  }

  drawArena() {
    const stage = CAMPAIGN_STAGES.find(s => s.id === this.currentStageId) || CAMPAIGN_STAGES[0];
    const env = stage.env;

    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, this.width, this.height);

    let floorColor = '#1e293b';
    let borderColor = '#334155';
    let tileColor = '#172033';

    if (env === 'forest') {
      floorColor = '#14281d';
      borderColor = '#166534';
      tileColor = '#0f1f17';
    } else if (env === 'crypt') {
      floorColor = '#261b2e';
      borderColor = '#581c87';
      tileColor = '#1f1526';
    } else if (env === 'lava') {
      floorColor = '#2b1313';
      borderColor = '#991b1b';
      tileColor = '#210d0d';
    } else if (env === 'ice') {
      floorColor = '#132433';
      borderColor = '#0284c7';
      tileColor = '#0f1d29';
    } else if (env === 'void') {
      floorColor = '#1b122c';
      borderColor = '#701a75';
      tileColor = '#140c22';
    }

    this.ctx.fillStyle = floorColor;
    this.ctx.fillRect(this.arena.x, this.arena.y, this.arena.w, this.arena.h);

    this.ctx.strokeStyle = tileColor;
    this.ctx.lineWidth = 1;
    const tileSize = 60;
    for (let x = this.arena.x; x <= this.arena.x + this.arena.w; x += tileSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, this.arena.y);
      this.ctx.lineTo(x, this.arena.y + this.arena.h);
      this.ctx.stroke();
    }
    for (let y = this.arena.y; y <= this.arena.y + this.arena.h; y += tileSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.arena.x, y);
      this.ctx.lineTo(this.arena.x + this.arena.w, y);
      this.ctx.stroke();
    }

    this.ctx.strokeStyle = borderColor;
    this.ctx.lineWidth = 8;
    this.ctx.strokeRect(this.arena.x, this.arena.y, this.arena.w, this.arena.h);

    const corners = [
      [this.arena.x, this.arena.y],
      [this.arena.x + this.arena.w, this.arena.y],
      [this.arena.x, this.arena.y + this.arena.h],
      [this.arena.x + this.arena.w, this.arena.y + this.arena.h]
    ];
    corners.forEach(([cx, cy]) => {
      this.ctx.fillStyle = '#ffd700';
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }
}

// --- COMBATANT (HERO / COMPANION) CLASS ---
class Combatant {
  constructor(game, config) {
    this.game = game;
    this.isPlayer = config.isPlayer || false;
    this.isCompanion = config.isCompanion || false;
    this.id = config.id;
    this.name = config.name;
    this.role = config.role;
    this.avatar = config.avatar;
    this.color = config.color;
    this.armorColor = config.armorColor;
    this.weaponType = config.weaponType;

    this.x = config.x;
    this.y = config.y;
    this.radius = 24;
    this.maxHp = config.maxHp;
    this.hp = this.maxHp;
    this.maxSp = config.maxSp;
    this.sp = this.maxSp;
    this.speed = config.speed;
    this.attackPower = config.attackPower;
    this.attackRange = config.attackRange;
    this.attackRate = config.attackRate;
    this.defense = config.defense;
    this.critChance = config.critChance;
    this.cdr = config.cdr || 1.0;
    this.skills = config.skills;

    this.facing = 1;
    this.vx = 0;
    this.vy = 0;
    this.isDead = false;

    this.attackTimer = 0;
    this.dashCooldown = 0;
    this.dashDuration = 0;
    this.invulnerableTimer = 0;
    this.skillTimers = { s1: 0, s2: 0, ult: 0 };
    this.swingAnim = 0;
    this.hitFlash = 0;

    this.aiTarget = null;
    this.aiSkillCooldown = 2.0;
  }

  update(dt) {
    if (this.isDead) return;

    this.sp = Math.min(this.maxSp, this.sp + 12 * dt);

    if (this.attackTimer > 0) this.attackTimer -= dt;
    if (this.dashCooldown > 0) this.dashCooldown -= dt;
    if (this.dashDuration > 0) this.dashDuration -= dt;
    if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt;
    if (this.hitFlash > 0) this.hitFlash -= dt;
    if (this.swingAnim > 0) this.swingAnim -= dt * 6;

    Object.keys(this.skillTimers).forEach(k => {
      if (this.skillTimers[k] > 0) this.skillTimers[k] -= dt;
    });

    if (this.isPlayer) {
      this.handlePlayerInput(dt);
    } else if (this.isCompanion) {
      this.handleCompanionAI(dt);
    }

    this.x += this.vx;
    this.y += this.vy;

    const pad = this.radius;
    this.x = Math.max(this.game.arena.x + pad, Math.min(this.game.arena.x + this.game.arena.w - pad, this.x));
    this.y = Math.max(this.game.arena.y + pad, Math.min(this.game.arena.y + this.game.arena.h - pad, this.y));

    this.vx *= 0.82;
    this.vy *= 0.82;
  }

  handlePlayerInput(dt) {
    let moveX = 0;
    let moveY = 0;

    if (this.game.keys['KeyW'] || this.game.keys['ArrowUp']) moveY -= 1;
    if (this.game.keys['KeyS'] || this.game.keys['ArrowDown']) moveY += 1;
    if (this.game.keys['KeyA'] || this.game.keys['ArrowLeft']) moveX -= 1;
    if (this.game.keys['KeyD'] || this.game.keys['ArrowRight']) moveX += 1;

    if (this.game.touchJoystick.active) {
      moveX += this.game.touchJoystick.dx;
      moveY += this.game.touchJoystick.dy;
    }

    const len = Math.hypot(moveX, moveY);
    if (len > 0.05) {
      const curSpeed = this.dashDuration > 0 ? this.speed * 2.8 : this.speed;
      this.vx = (moveX / len) * curSpeed;
      this.vy = (moveY / len) * curSpeed;
      if (moveX !== 0) this.facing = moveX > 0 ? 1 : -1;
    }
  }

  handleCompanionAI(dt) {
    let closest = null;
    let minDist = 9999;
    this.game.enemies.forEach(e => {
      const d = Math.hypot(e.x - this.x, e.y - this.y);
      if (d < minDist) {
        minDist = d;
        closest = e;
      }
    });
    this.aiTarget = closest;

    if (!closest) {
      const dPlayer = Math.hypot(this.game.player.x - this.x, this.game.player.y - this.y);
      if (dPlayer > 90) {
        const dx = (this.game.player.x - this.x) / dPlayer;
        const dy = (this.game.player.y - this.y) / dPlayer;
        this.vx = dx * (this.speed * 0.9);
        this.vy = dy * (this.speed * 0.9);
        this.facing = dx > 0 ? 1 : -1;
      }
      return;
    }

    const desiredDist = this.weaponType === 'sword' || this.weaponType === 'daggers' ? 50 : 180;
    const dx = closest.x - this.x;
    const dy = closest.y - this.y;
    const dist = Math.hypot(dx, dy);

    this.facing = dx > 0 ? 1 : -1;

    if (dist > desiredDist + 15) {
      this.vx = (dx / dist) * this.speed;
      this.vy = (dy / dist) * this.speed;
    } else if (dist < desiredDist - 25) {
      this.vx = -(dx / dist) * (this.speed * 0.6);
      this.vy = -(dy / dist) * (this.speed * 0.6);
    }

    if (dist <= this.attackRange + 15 && this.attackTimer <= 0) {
      this.performBasicAttack();
    }

    this.aiSkillCooldown -= dt;
    if (this.aiSkillCooldown <= 0) {
      this.aiSkillCooldown = 3.5 + Math.random() * 2;
      if (this.skillTimers.s1 <= 0) this.performSkill('s1');
      else if (this.skillTimers.s2 <= 0) this.performSkill('s2');
    }
  }

  performBasicAttack() {
    if (this.attackTimer > 0) return;
    this.attackTimer = this.attackRate;
    this.swingAnim = 1.0;

    sounds.playSwing();

    if (this.weaponType === 'bow') {
      this.game.projectiles.push(new Projectile(this.game, {
        x: this.x + this.facing * 20,
        y: this.y,
        vx: this.facing * 12,
        vy: (Math.random() * 2 - 1) * 0.8,
        damage: this.attackPower,
        critChance: this.critChance,
        isFromPlayer: true,
        type: 'arrow',
        color: '#22c55e'
      }));
    } else if (this.weaponType === 'staff') {
      this.game.projectiles.push(new Projectile(this.game, {
        x: this.x + this.facing * 20,
        y: this.y,
        vx: this.facing * 9,
        vy: (Math.random() * 2 - 1) * 1.0,
        damage: this.attackPower,
        critChance: this.critChance,
        isFromPlayer: true,
        type: 'fireball',
        color: '#ef4444'
      }));
    } else {
      const hitBoxX = this.x + this.facing * (this.attackRange * 0.5);
      const hitBoxY = this.y;
      const hitRadius = this.attackRange;

      let hitCount = 0;
      this.game.enemies.forEach(e => {
        const d = Math.hypot(e.x - hitBoxX, e.y - hitBoxY);
        if (d <= hitRadius + e.radius) {
          const isCrit = Math.random() < this.critChance;
          const dmg = Math.floor(this.attackPower * (isCrit ? 1.8 : 1.0));
          e.takeDamage(dmg, isCrit, this.facing);
          hitCount++;
        }
      });

      if (hitCount > 0) {
        this.game.addCombo(hitCount);
        sounds.playHit();
      }
    }
  }

  performDash() {
    if (this.dashCooldown > 0 || this.sp < 15) return;
    this.sp -= 15;
    this.dashCooldown = 1.8 * this.cdr;
    this.dashDuration = 0.25;
    this.invulnerableTimer = 0.3;
    sounds.playDash();
    this.game.spawnParticle(this.x, this.y, '#38bdf8', 4, 8);
  }

  performSkill(slot) {
    const skill = this.skills[slot];
    if (!skill || this.skillTimers[slot] > 0 || this.sp < skill.cost) return;

    this.sp -= skill.cost;
    this.skillTimers[slot] = skill.cd * this.cdr;

    if (slot === 'ult') {
      sounds.playUlt();
      this.game.screenShake = 16;
    } else {
      sounds.playSkill();
    }

    if (this.id === 'valen') {
      if (slot === 's1') {
        this.dashDuration = 0.35;
        this.vx = this.facing * 14;
        this.game.enemies.forEach(e => {
          if (Math.hypot(e.x - (this.x + this.facing * 60), e.y - this.y) < 80) {
            e.takeDamage(this.attackPower * 2.2, true, this.facing * 2.5);
          }
        });
      } else if (slot === 's2') {
        this.game.spawnParticle(this.x, this.y, '#ffd700', 8, 20);
        this.game.enemies.forEach(e => {
          if (Math.hypot(e.x - this.x, e.y - this.y) < 130) {
            e.takeDamage(this.attackPower * 2.5, true, Math.sign(e.x - this.x));
          }
        });
      } else if (slot === 'ult') {
        this.invulnerableTimer = 5.0;
        this.game.spawnParticle(this.x, this.y, '#f59e0b', 12, 35);
        this.game.enemies.forEach(e => {
          e.takeDamage(this.attackPower * 3.5, true, Math.sign(e.x - this.x));
        });
      }
    } else if (this.id === 'lyra') {
      if (slot === 's1') {
        for (let a = -2; a <= 2; a++) {
          this.game.projectiles.push(new Projectile(this.game, {
            x: this.x + this.facing * 20,
            y: this.y,
            vx: this.facing * 13,
            vy: a * 1.8,
            damage: this.attackPower * 1.2,
            critChance: this.critChance,
            isFromPlayer: true,
            type: 'arrow',
            color: '#22c55e'
          }));
        }
      } else if (slot === 's2') {
        this.game.projectiles.push(new Projectile(this.game, {
          x: this.x + this.facing * 20,
          y: this.y,
          vx: this.facing * 16,
          vy: 0,
          damage: this.attackPower * 3.0,
          critChance: 0.5,
          isFromPlayer: true,
          type: 'gale',
          color: '#38bdf8'
        }));
      } else if (slot === 'ult') {
        this.game.enemies.forEach(e => {
          this.game.projectiles.push(new Projectile(this.game, {
            x: e.x + (Math.random() * 40 - 20),
            y: 0,
            vx: 0,
            vy: 18,
            damage: this.attackPower * 2.8,
            critChance: 0.4,
            isFromPlayer: true,
            type: 'arrow',
            color: '#4ade80'
          }));
        });
      }
    } else if (this.id === 'ignis') {
      if (slot === 's1') {
        const targetX = this.x + this.facing * 120;
        this.game.spawnParticle(targetX, this.y, '#ef4444', 9, 25);
        this.game.enemies.forEach(e => {
          if (Math.hypot(e.x - targetX, e.y - this.y) < 100) {
            e.takeDamage(this.attackPower * 2.4, true, this.facing);
          }
        });
      } else if (slot === 's2') {
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 / 8) * i;
          this.game.projectiles.push(new Projectile(this.game, {
            x: this.x,
            y: this.y,
            vx: Math.cos(angle) * 8,
            vy: Math.sin(angle) * 8,
            damage: this.attackPower * 1.8,
            critChance: this.critChance,
            isFromPlayer: true,
            type: 'fireball',
            color: '#f97316'
          }));
        }
      } else if (slot === 'ult') {
        this.game.enemies.forEach(e => {
          this.game.spawnParticle(e.x, e.y, '#ea580c', 10, 20);
          e.takeDamage(this.attackPower * 4.5, true, this.facing);
        });
      }
    } else if (this.id === 'kael') {
      if (slot === 's1') {
        let closest = null;
        let dMin = 999;
        this.game.enemies.forEach(e => {
          const d = Math.hypot(e.x - this.x, e.y - this.y);
          if (d < dMin) { dMin = d; closest = e; }
        });
        if (closest) {
          this.x = closest.x - this.facing * 35;
          this.y = closest.y;
          closest.takeDamage(this.attackPower * 3.0, true, this.facing);
          this.game.spawnParticle(this.x, this.y, '#a855f7', 6, 15);
        }
      } else if (slot === 's2') {
        for (let i = 0; i < 10; i++) {
          const angle = (Math.PI * 2 / 10) * i;
          this.game.projectiles.push(new Projectile(this.game, {
            x: this.x,
            y: this.y,
            vx: Math.cos(angle) * 11,
            vy: Math.sin(angle) * 11,
            damage: this.attackPower * 1.6,
            critChance: 0.45,
            isFromPlayer: true,
            type: 'dagger',
            color: '#c084fc'
          }));
        }
      } else if (slot === 'ult') {
        this.invulnerableTimer = 2.0;
        this.game.enemies.forEach(e => {
          e.takeDamage(this.attackPower * 3.8, true, this.facing);
          this.game.spawnParticle(e.x, e.y, '#9333ea', 8, 15);
        });
      }
    }
  }

  takeDamage(amount, fromDir = 0) {
    if (this.invulnerableTimer > 0 || this.isDead) return;

    const actualDmg = Math.max(1, Math.floor(amount * (1 - this.defense)));
    this.hp -= actualDmg;
    this.hitFlash = 0.12;
    this.game.addDamageText(this.x, this.y, `-${actualDmg}`, '#ef4444');

    this.vx += fromDir * 3;
    sounds.playHit();

    if (this.hp <= 0) {
      this.hp = 0;
      this.isDead = true;
      this.game.spawnParticle(this.x, this.y, this.color, 6, 20);

      if (this.isPlayer) {
        this.game.triggerDefeat();
      }
    }
  }

  draw(ctx) {
    if (this.isDead) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.hitFlash > 0) {
      ctx.fillStyle = '#ffffff';
    } else {
      ctx.fillStyle = this.color;
    }

    if (this.invulnerableTimer > 0) {
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = this.armorColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = this.armorColor;
    ctx.fillRect(-8, -this.radius - 4, 16, 6);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(this.facing > 0 ? 2 : -10, -6, 8, 4);

    ctx.save();
    const swingAngle = this.swingAnim > 0 ? (this.swingAnim - 0.5) * Math.PI * this.facing : 0;
    ctx.rotate(swingAngle);

    if (this.weaponType === 'sword') {
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(this.facing * (this.radius - 2), -4, this.facing * 28, 6);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(this.facing * (this.radius - 4), -8, this.facing * 4, 14);
    } else if (this.weaponType === 'bow') {
      ctx.strokeStyle = '#854d0e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.facing * this.radius, 0, 16, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    } else if (this.weaponType === 'staff') {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(this.facing * (this.radius - 2), -16, this.facing * 4, 32);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(this.facing * (this.radius + 2), -18, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.weaponType === 'daggers') {
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(this.facing * (this.radius - 2), -2, this.facing * 16, 4);
    }
    ctx.restore();

    if (this.isCompanion) {
      const barW = 32;
      const barH = 4;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(-barW / 2, -this.radius - 12, barW, barH);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(-barW / 2, -this.radius - 12, barW * (this.hp / this.maxHp), barH);
    }

    ctx.restore();
  }
}

// --- ENEMY CLASS ---
class Enemy {
  constructor(game, config) {
    this.game = game;
    this.name = config.name;
    this.avatar = config.avatar;
    this.color = config.color;
    this.hp = config.hp;
    this.maxHp = config.hp;
    this.atk = config.atk;
    this.spd = config.spd;
    this.radius = config.size || 22;
    this.type = config.type || 'melee';

    this.x = config.x;
    this.y = config.y;
    this.vx = 0;
    this.vy = 0;
    this.facing = -1;
    this.isDead = false;
    this.attackCooldown = Math.random() * 1.5;
    this.hitFlash = 0;
  }

  update(dt) {
    if (this.isDead) return;

    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    if (this.hitFlash > 0) this.hitFlash -= dt;

    const targets = [];
    if (this.game.player && !this.game.player.isDead) targets.push(this.game.player);
    this.game.companions.forEach(c => { if (!c.isDead) targets.push(c); });

    let target = null;
    let minDist = 9999;
    targets.forEach(t => {
      const d = Math.hypot(t.x - this.x, t.y - this.y);
      if (d < minDist) {
        minDist = d;
        target = t;
      }
    });

    if (target) {
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.hypot(dx, dy);
      this.facing = dx > 0 ? 1 : -1;

      if (this.type === 'ranged' || this.type === 'caster') {
        if (dist > 220) {
          this.vx = (dx / dist) * this.spd;
          this.vy = (dy / dist) * this.spd;
        } else if (dist < 140) {
          this.vx = -(dx / dist) * this.spd;
          this.vy = -(dy / dist) * this.spd;
        }

        if (this.attackCooldown <= 0 && dist < 300) {
          this.attackCooldown = 2.2;
          this.game.projectiles.push(new Projectile(this.game, {
            x: this.x + this.facing * 15,
            y: this.y,
            vx: (dx / dist) * 7.5,
            vy: (dy / dist) * 7.5,
            damage: this.atk,
            isFromPlayer: false,
            type: this.type === 'caster' ? 'darkbolt' : 'arrow',
            color: this.color
          }));
        }
      } else {
        if (dist > this.radius + target.radius - 5) {
          this.vx = (dx / dist) * this.spd;
          this.vy = (dy / dist) * this.spd;
        }

        if (dist <= this.radius + target.radius + 10 && this.attackCooldown <= 0) {
          this.attackCooldown = 1.4;
          target.takeDamage(this.atk, this.facing);
        }
      }
    }

    this.x += this.vx;
    this.y += this.vy;

    const pad = this.radius;
    this.x = Math.max(this.game.arena.x + pad, Math.min(this.game.arena.x + this.game.arena.w - pad, this.x));
    this.y = Math.max(this.game.arena.y + pad, Math.min(this.game.arena.y + this.game.arena.h - pad, this.y));

    this.vx *= 0.8;
    this.vy *= 0.8;
  }

  takeDamage(amount, isCrit = false, fromDir = 0) {
    if (this.isDead) return;

    this.hp -= amount;
    this.hitFlash = 0.12;
    this.game.addDamageText(this.x, this.y, `${amount}${isCrit ? '!' : ''}`, isCrit ? '#ffd700' : '#f87171', isCrit);

    this.vx += fromDir * 4;
    this.game.spawnParticle(this.x, this.y, this.color, 3, 5);

    if (this.hp <= 0) {
      this.hp = 0;
      this.isDead = true;
      this.game.stageKills++;
      this.game.spawnLoot(this.x, this.y);
      this.game.spawnParticle(this.x, this.y, '#fbbf24', 5, 12);
    }
  }

  draw(ctx) {
    if (this.isDead) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(this.facing * (this.radius - 2), -3, this.facing * 12, 6);

    const barW = this.radius * 1.8;
    const barH = 4;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(-barW / 2, -this.radius - 10, barW, barH);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-barW / 2, -this.radius - 10, barW * (this.hp / this.maxHp), barH);

    ctx.restore();
  }
}

// --- BOSS CLASS ---
class Boss extends Enemy {
  constructor(game, config) {
    super(game, config);
    this.isBoss = true;
    this.phase = 1;
    this.specialSkillCooldown = 4.0;
  }

  update(dt) {
    super.update(dt);
    if (this.isDead) return;

    if (this.phase === 1 && this.hp < this.maxHp * 0.5) {
      this.phase = 2;
      this.game.screenShake = 18;
      this.spd *= 1.25;
      sounds.playBossRoar();
      this.game.spawnParticle(this.x, this.y, '#f43f5e', 10, 30);
    }

    this.specialSkillCooldown -= dt;
    if (this.specialSkillCooldown <= 0) {
      this.specialSkillCooldown = this.phase === 2 ? 3.0 : 5.0;
      this.castBossSpecial();
    }
  }

  castBossSpecial() {
    sounds.playBossRoar();
    this.game.screenShake = 12;

    if (this.type === 'brute') {
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 / 12) * i;
        this.game.projectiles.push(new Projectile(this.game, {
          x: this.x,
          y: this.y,
          vx: Math.cos(angle) * 6,
          vy: Math.sin(angle) * 6,
          damage: this.atk * 1.3,
          isFromPlayer: false,
          type: 'shockwave',
          color: '#fb923c'
        }));
      }
    } else if (this.type === 'caster' || this.type === 'overlord') {
      for (let i = -3; i <= 3; i++) {
        this.game.projectiles.push(new Projectile(this.game, {
          x: this.x,
          y: this.y,
          vx: this.facing * 8,
          vy: i * 2,
          damage: this.atk * 1.2,
          isFromPlayer: false,
          type: 'darkbolt',
          color: '#f43f5e'
        }));
      }
    } else {
      this.vx = this.facing * 18;
      this.game.spawnParticle(this.x, this.y, this.color, 8, 20);
    }
  }

  draw(ctx) {
    super.draw(ctx);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.strokeStyle = this.phase === 2 ? '#ef4444' : '#ffd700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

// --- PROJECTILE CLASS ---
class Projectile {
  constructor(game, config) {
    this.game = game;
    this.x = config.x;
    this.y = config.y;
    this.vx = config.vx;
    this.vy = config.vy;
    this.damage = config.damage;
    this.critChance = config.critChance || 0;
    this.isFromPlayer = config.isFromPlayer;
    this.type = config.type || 'arrow';
    this.color = config.color || '#fff';
    this.radius = 6;
    this.destroyed = false;
    this.life = 2.5;
  }

  update(dt) {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= dt;

    if (this.life <= 0) {
      this.destroyed = true;
      return;
    }

    if (this.x < this.game.arena.x || this.x > this.game.arena.x + this.game.arena.w ||
        this.y < this.game.arena.y || this.y > this.game.arena.y + this.game.arena.h) {
      this.destroyed = true;
      return;
    }

    if (this.isFromPlayer) {
      for (let i = 0; i < this.game.enemies.length; i++) {
        const e = this.game.enemies[i];
        if (Math.hypot(e.x - this.x, e.y - this.y) <= this.radius + e.radius) {
          const isCrit = Math.random() < this.critChance;
          const dmg = Math.floor(this.damage * (isCrit ? 1.8 : 1.0));
          e.takeDamage(dmg, isCrit, Math.sign(this.vx));
          this.game.addCombo(1);
          sounds.playHit();
          if (this.type !== 'gale') this.destroyed = true;
          break;
        }
      }
    } else {
      const targets = [];
      if (this.game.player && !this.game.player.isDead) targets.push(this.game.player);
      this.game.companions.forEach(c => { if (!c.isDead) targets.push(c); });

      for (let i = 0; i < targets.length; i++) {
        const t = targets[i];
        if (Math.hypot(t.x - this.x, t.y - this.y) <= this.radius + t.radius) {
          t.takeDamage(this.damage, Math.sign(this.vx));
          this.destroyed = true;
          break;
        }
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Instantiate game on page load
window.addEventListener('DOMContentLoaded', () => {
  window.game = new MKGame();
});
