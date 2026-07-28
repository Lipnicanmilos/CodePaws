/* Kódolabky — ikony ako inline SVG.
   Zámerne žiadne emoji v hernom UI: emoji vyzerá na každom systéme inak
   a nedá sa mu nastaviť farba. */

const stroke = (inner, rot = 0) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
        style="transform: rotate(${rot}deg)">${inner}</svg>`;

const solid = (inner) =>
  `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">${inner}</svg>`;

export const ICONS = {
  arrow: (rot = 0) => stroke('<path d="M12 20V5"/><path d="M5.5 11.5 12 5l6.5 6.5"/>', rot),

  turnRight: () => stroke('<path d="M11 20v-9a4 4 0 0 1 4-4h5"/><path d="m16 3 4 4-4 4"/>'),
  turnLeft:  () => stroke('<path d="M13 20v-9a4 4 0 0 0-4-4H4"/><path d="M8 3 4 7l4 4"/>'),

  drop: () => solid('<path d="M12 3.2c3.7 4.2 6.2 7.2 6.2 10.1a6.2 6.2 0 0 1-12.4 0C5.8 10.4 8.3 7.4 12 3.2z"/>'),

  bone: () => solid(
    '<rect x="7" y="10" width="10" height="4" rx="2"/>' +
    '<circle cx="6.3" cy="9.7" r="2.7"/><circle cx="6.3" cy="14.3" r="2.7"/>' +
    '<circle cx="17.7" cy="9.7" r="2.7"/><circle cx="17.7" cy="14.3" r="2.7"/>'
  ),

  fire: () => solid(
    '<path d="M13 2.2c.7 2.6 1.6 4.3 2.7 5.7 1.4 1.8 2.6 3.3 2.6 6A6.3 6.3 0 0 1 5.7 14c0-2.1 1-3.6 2-5 .3.9.9 1.5 1.7 1.8-.6-3.4.9-6.7 3.6-8.6z"/>'
  ),

  house: () =>
    '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M12 3.2 21 11v9.5a.5.5 0 0 1-.5.5h-17a.5.5 0 0 1-.5-.5V11z" fill="currentColor"/>' +
      '<path d="M12 21v-5.5a2.8 2.8 0 0 1 5.6 0V21z" fill="rgba(255,255,255,.72)" transform="translate(-2.8 0)"/>' +
    '</svg>',
};

/** Šteniatko zhora. `coat` a `ears` sa menia podľa postavičky. */
export function dogSvg({ coat = '#f0c184', ears = '#b9793c', vest = '#e0572a' } = {}) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">
    <ellipse cx="12" cy="15.4" rx="5.9" ry="6.3" fill="${coat}"/>
    <rect x="6.6" y="13.4" width="10.8" height="2.7" rx="1.35" fill="${vest}"/>
    <ellipse cx="7.5" cy="6" rx="2.2" ry="3.1" fill="${ears}" transform="rotate(-24 7.5 6)"/>
    <ellipse cx="16.5" cy="6" rx="2.2" ry="3.1" fill="${ears}" transform="rotate(24 16.5 6)"/>
    <circle cx="12" cy="8.6" r="5.3" fill="${coat}"/>
    <circle cx="10.1" cy="7.9" r="0.95" fill="#3a2a18"/>
    <circle cx="13.9" cy="7.9" r="0.95" fill="#3a2a18"/>
    <ellipse cx="12" cy="11" rx="2.2" ry="1.7" fill="#fdeedb"/>
    <ellipse cx="12" cy="10.3" rx="1" ry="0.8" fill="#3a2a18"/>
  </svg>`;
}

export const CHARACTERS = {
  fifo: { name: 'Fifo', coat: '#f2c98a', ears: '#c08a45', vest: '#e0572a' },
  bit:  { name: 'Bit',  coat: '#d9d2c6', ears: '#8e857a', vest: '#1d7a6c' },
  ajka: { name: 'Ajka', coat: '#2f2a26', ears: '#1b1815', vest: '#e8a317' },
  luna: { name: 'Luna', coat: '#cfe0e8', ears: '#7f9bab', vest: '#3f6fb5' },
  rex:  { name: 'Rex',  coat: '#c98a5a', ears: '#8d5730', vest: '#e8a317' },
  cent: { name: 'Cent', coat: '#a9743f', ears: '#6d451f', vest: '#7a4fa8' },
};
