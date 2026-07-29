/* Kódolabky — zvuky. Syntetizované cez Web Audio API, žiadne súbory:
   hra musí bežať offline a na GitHub Pages bez ďalších requestov.

   Zvuk je korenie, nie jadro: každý efekt je krátky, tichý a viazaný na
   udalosť vo svete (krok, kosť, náraz, výhra). Vypínateľný jedným klepnutím;
   voľba sa pamätá v nastaveniach zariadenia — súrodenci pri jednom tablete
   sa o hlasitosti hádať nemusia. */

import { getSetting, setSetting } from './progress.js';

let ctx = null;

/** AudioContext sa smie rozbehnúť až po geste používateľa (autoplay policy).
    Prvý zvuk ide vždy po klepnutí na pult, takže lenivé vytvorenie stačí. */
function audio() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export const isOn = () => getSetting('sound') !== false;   // východiskovo zapnuté

export function toggle() {
  setSetting('sound', !isOn());
  return isOn();
}

/** Krátky tón s dobehom. Frekvencia môže kĺzať `freq → to` (haf, fanfára). */
function blip({ freq, to = freq, shape = 'sine', dur = 0.12, vol = 0.2, at = 0 }) {
  const a = audio();
  const t = a.currentTime + at;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = shape;
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

/** Tlmený klepot — krátky výbuch šumu cez pásmový filter. */
function tap({ freq = 700, vol = 0.12, dur = 0.04 }) {
  const a = audio();
  const len = Math.max(1, Math.floor(a.sampleRate * dur));
  const buf = a.createBuffer(1, len, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = a.createBufferSource();
  src.buffer = buf;
  const filter = a.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  const gain = a.createGain();
  gain.gain.value = vol;
  src.connect(filter).connect(gain).connect(a.destination);
  src.start();
}

const EFFECTS = {
  /* Ťapkanie labiek — frekvencia mierne náhodná, nech kroky neznejú ako metronóm. */
  step: () => tap({ freq: 650 + Math.random() * 250 }),

  /* Cink pri kosti — dva veselé tóny nahor. */
  bone: () => {
    blip({ freq: 880, shape: 'triangle', dur: 0.09, vol: 0.18 });
    blip({ freq: 1320, shape: 'triangle', dur: 0.14, vol: 0.18, at: 0.07 });
  },

  /* Zmätené „haf“ pri náraze — dve klesajúce brumlavé slabiky. */
  bump: () => {
    blip({ freq: 220, to: 130, shape: 'sawtooth', dur: 0.16, vol: 0.18 });
    blip({ freq: 170, to: 110, shape: 'sawtooth', dur: 0.2, vol: 0.14, at: 0.13 });
  },

  /* Psst — uhasenie ohňa. */
  douse: () => tap({ freq: 320, vol: 0.2, dur: 0.12 }),

  /* Fanfára v cieli — stúpajúci kvartový rozklad. */
  win: () => [523, 659, 784, 1047].forEach(
    (freq, i) => blip({ freq, shape: 'triangle', dur: 0.18, vol: 0.16, at: i * 0.12 })),
};

/** Jediný verejný vstup. Zvuk nikdy nesmie zhodiť hru — preto try/catch. */
export function play(name) {
  if (!isOn()) return;
  try { EFFECTS[name]?.(); } catch { /* bez zvukovej karty sa hrá potichu */ }
}
