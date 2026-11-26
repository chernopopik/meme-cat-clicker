window.SFX = {
    ctx: null, muted: false, bgmStarted: false, step: 0,
    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
        if (!this.bgmStarted && this.ctx) { this.bgmStarted = true; this.startBGM(); }
    },
    toggleMute() {
        this.init(); this.muted = !this.muted;
        const btn = document.getElementById('mute-btn');
        if (btn) btn.innerText = this.muted ? '🔇' : '🔊';
    },
    startBGM() {
        const bass = new Array(110, 110, 130.81, 146.83, 98, 98, 130.81, 123.47);
        const lead = new Array(329.63, 0, 392.00, 440.00, 392.00, 0, 329.63, 293.66, 261.63, 0, 329.63, 392.00, 329.63, 0, 293.66, 246.94);
        setInterval(() => {
            if (this.muted || document.hidden || !this.ctx || this.ctx.state !== 'running') return;
            const now = this.ctx.currentTime;
            if (this.step % 2 === 0) {
                const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
                osc.type = 'sine'; osc.frequency.setValueAtTime(bass.at((this.step / 2) % bass.length), now);
                gain.gain.setValueAtTime(0.035, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
                osc.connect(gain); gain.connect(this.ctx.destination); osc.start(now); osc.stop(now + 0.46);
            }
            const lFreq = lead.at(this.step % lead.length);
            if (lFreq > 0) {
                const osc2 = this.ctx.createOscillator(), gain2 = this.ctx.createGain();
                osc2.type = 'triangle'; osc2.frequency.setValueAtTime(lFreq, now);
                gain2.gain.setValueAtTime(0.022, now); gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                osc2.connect(gain2); gain2.connect(this.ctx.destination); osc2.start(now); osc2.stop(now + 0.26);
            }
            this.step++;
        }, 280);
    },
    click() {
        if (this.muted) return; this.init(); if (!this.ctx) return;
        const now = this.ctx.currentTime, osc = this.ctx.createOscillator(), gain = this.ctx.createGain(), p = 240 + Math.random() * 50;
        osc.type = 'sine'; osc.frequency.setValueAtTime(p, now); osc.frequency.exponentialRampToValueAtTime(p * 1.35, now + 0.04); osc.frequency.exponentialRampToValueAtTime(p * 0.75, now + 0.09);
        gain.gain.setValueAtTime(0.08, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.connect(gain); gain.connect(this.ctx.destination); osc.start(now); osc.stop(now + 0.09);
    },
    buy() {
        if (this.muted) return; this.init(); if (!this.ctx) return;
        const now = this.ctx.currentTime, osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
        osc.type = 'sine'; osc.frequency.setValueAtTime(440, now); osc.frequency.setValueAtTime(660, now + 0.05);
        gain.gain.setValueAtTime(0.07, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.connect(gain); gain.connect(this.ctx.destination); osc.start(now); osc.stop(now + 0.14);
    },
    win() {
        if (this.muted) return; this.init(); if (!this.ctx) return;
        new Array(440, 554.37, 659.25, 880).forEach((freq, i) => {
            const now = this.ctx.currentTime + i * 0.07, osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
            osc.type = 'sine'; osc.frequency.setValueAtTime(freq, now); gain.gain.setValueAtTime(0.07, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.connect(gain); gain.connect(this.ctx.destination); osc.start(now); osc.stop(now + 0.2);
        });
    },
    meow() {
        if (this.muted) return; this.init(); if (!this.ctx) return;
        const now = this.ctx.currentTime, osc = this.ctx.createOscillator(), gain = this.ctx.createGain(), base = 320 + Math.random() * 260;
        osc.type = 'triangle'; osc.frequency.setValueAtTime(base * 0.85, now); osc.frequency.exponentialRampToValueAtTime(base * 1.45, now + 0.12); osc.frequency.exponentialRampToValueAtTime(base * 0.7, now + 0.34);
        gain.gain.setValueAtTime(0.001, now); gain.gain.linearRampToValueAtTime(0.11, now + 0.06); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain); gain.connect(this.ctx.destination); osc.start(now); osc.stop(now + 0.35);
    }
};
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.SFX?.ctx) window.SFX.ctx.suspend();
    else if (!document.hidden && window.SFX?.ctx && !window.SFX.muted) window.SFX.ctx.resume();
});
