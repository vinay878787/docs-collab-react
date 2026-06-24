// Distinct, accessible collaborator colours. Picked deterministically from a
// user's id so the SAME person always gets the SAME colour across sessions and
// across every other collaborator's screen.
const CURSOR_COLORS = [
  '#e63946',
  '#f4a261',
  '#2a9d8f',
  '#457b9d',
  '#7209b7',
  '#f72585',
  '#4cc9f0',
  '#06d6a0',
  '#ff6b35',
  '#118ab2',
];

export function userColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0; // keep in 32-bit range
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}
