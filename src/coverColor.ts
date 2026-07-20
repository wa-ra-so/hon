import * as jpeg from 'jpeg-js';

/**
 * 表紙画像(JPEG)から背表紙向けの代表色を抽出する。
 * 取得・解析に失敗した場合は null を返し、呼び出し側はフォールバック色を使う。
 */
export async function spineColorFromCover(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    const { data, width, height } = jpeg.decode(buf, {
      useTArray: true,
      maxMemoryUsageInMB: 64,
    });
    return dominantSpineColor(data, width, height);
  } catch {
    return null;
  }
}

const HUE_BUCKETS = 24;

export function dominantSpineColor(
  data: Uint8Array,
  width: number,
  height: number
): string | null {
  const pixelCount = width * height;
  if (!pixelCount) return null;
  const step = Math.max(1, Math.floor(pixelCount / 2500));

  const weights = new Array<number>(HUE_BUCKETS).fill(0);
  const sums = Array.from({ length: HUE_BUCKETS }, () => [0, 0, 0]);
  let graySum = 0;
  let grayCount = 0;

  for (let p = 0; p < pixelCount; p += step) {
    const i = p * 4;
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const [h, s, l] = rgbToHsl(r, g, b);
    // 白背景・黒ベタは背表紙の色として拾わない
    if (l > 0.92 || l < 0.06) continue;
    if (s < 0.12) {
      graySum += l;
      grayCount++;
      continue;
    }
    const bucket = Math.min(HUE_BUCKETS - 1, Math.floor(h * HUE_BUCKETS));
    // 彩度が高く中間調に近いほど「その本らしい色」とみなす
    const w = s * (1 - Math.abs(l - 0.5));
    weights[bucket] += w;
    sums[bucket][0] += r * w;
    sums[bucket][1] += g * w;
    sums[bucket][2] += b * w;
  }

  let best = -1;
  let bestW = 0;
  for (let i = 0; i < HUE_BUCKETS; i++) {
    if (weights[i] > bestW) {
      bestW = weights[i];
      best = i;
    }
  }

  // ほぼ無彩色の表紙: 明度だけ拾って墨〜生成りの背表紙にする
  if (best < 0 || bestW < 1) {
    if (!grayCount) return null;
    const l = graySum / grayCount;
    return hslToHex(0.08, 0.08, clamp(l * 0.5, 0.24, 0.4));
  }

  const w = weights[best];
  const [h, s, l] = rgbToHsl(sums[best][0] / w, sums[best][1] / w, sums[best][2] / w);
  // 棚の世界観(深い色調)に収まるよう彩度と明度を整える
  return hslToHex(h, clamp(s, 0.2, 0.52), clamp(l, 0.26, 0.4));
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const to255 = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    let v: number;
    if (t < 1 / 6) v = p + (q - p) * 6 * t;
    else if (t < 1 / 2) v = q;
    else if (t < 2 / 3) v = p + (q - p) * (2 / 3 - t) * 6;
    else v = p;
    return Math.round(v * 255);
  };
  const r = to255(h + 1 / 3);
  const g = to255(h);
  const b = to255(h - 1 / 3);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
