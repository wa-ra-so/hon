export const palette = {
  background: '#F6EFE3',
  shelfBack: '#EADFCB',
  shelfBoard: '#8B5E3C',
  shelfBoardEdge: '#6E4526',
  text: '#3A2E24',
  textMuted: '#8A7A68',
  accent: '#B5542D',
  card: '#FFFFFF',
  star: '#E0A11B',
  starOff: '#D9CDBB',
};

const spineColors = [
  '#7B4B3A',
  '#31555E',
  '#5B4A68',
  '#7A6A2F',
  '#3E5C3A',
  '#84403E',
  '#2F4858',
  '#8A6D3B',
  '#4A5D23',
  '#6E3B54',
  '#37536B',
  '#805531',
];

export function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function spineColorFor(title: string): string {
  return spineColors[hashString(title) % spineColors.length];
}
