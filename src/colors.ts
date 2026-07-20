import { Platform } from 'react-native';

/**
 * 蔦屋書店・T-SITE系の「上質な書斎」トーン。
 * 深いエスプレッソの空間に、ウォールナットの棚と真鍮色のアクセント。
 */
export const palette = {
  background: '#181310',
  backgroundDeep: '#120E0B',
  card: '#221B15',
  cardBorder: 'rgba(214,192,158,0.12)',

  shelfBackTop: '#0E0A07',
  shelfBackBottom: '#241A12',
  woodLight: '#5A3F2A',
  wood: '#3E2B1C',
  woodDark: '#241609',
  woodEdge: '#6B4C31',

  text: '#EFE6D6',
  textMuted: '#A2917B',
  textFaint: '#6E6152',

  accent: '#C2985C',
  accentDim: '#8F7245',
  star: '#D4A94F',
  starOff: '#4A3F32',

  danger: '#C25B4E',
};

/** 見出し用の明朝体 */
export const serifFont = Platform.select({
  ios: 'Hiragino Mincho ProN',
  android: 'serif',
  default: "'Shippori Mincho', 'Hiragino Mincho ProN', 'Yu Mincho', serif",
});

const spineColors = [
  '#5E4B3B', // 革のタン
  '#3E4A56', // スレートブルー
  '#54424E', // 熟したプラム
  '#5C5137', // オリーブ
  '#44523F', // モス
  '#5D3A36', // オックスブラッド
  '#31404A', // インディゴ
  '#6B5A40', // キャメル
  '#523B49', // ボルドー
  '#39485C', // 藍鉄
  '#5F4630', // 焦げ茶
  '#4C4A42', // 墨
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

/** #RRGGBB を明度シフトしたグラデーション端色に変換する */
export function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const r = clamp(((n >> 16) & 255) * (1 + amount));
  const g = clamp(((n >> 8) & 255) * (1 + amount));
  const b = clamp((n & 255) * (1 + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
