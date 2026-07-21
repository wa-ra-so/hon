import { Platform, Share } from 'react-native';
import { Book } from './types';

/**
 * 共有ビューワーのURL。リポジトリの docs/ を GitHub Pages で公開すると
 * このURLで本棚を表示できる。
 */
export const VIEWER_URL = 'https://wa-ra-so.github.io/hon/';

const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

function utf8Bytes(s: string): number[] {
  const bytes: number[] = [];
  for (const ch of s) {
    const code = ch.codePointAt(0)!;
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      bytes.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f)
      );
    }
  }
  return bytes;
}

/** URLセーフなbase64 (パディングなし) */
export function base64urlEncode(s: string): string {
  const bytes = utf8Bytes(s);
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    out += B64_CHARS[b0 >> 2];
    out += B64_CHARS[((b0 & 3) << 4) | (b1 === undefined ? 0 : b1 >> 4)];
    if (b1 === undefined) break;
    out += B64_CHARS[((b1 & 15) << 2) | (b2 === undefined ? 0 : b2 >> 6)];
    if (b2 === undefined) break;
    out += B64_CHARS[b2 & 63];
  }
  return out;
}

type SharedBook = {
  t: string;
  a?: string;
  c?: string;
  r?: number;
  f?: 1;
  s: string;
  d?: string;
};

export function buildShareUrl(books: Book[]): string {
  const payload: SharedBook[] = books.map((b) => {
    const sb: SharedBook = { t: b.title, s: b.spineColor };
    if (b.authors.length) sb.a = b.authors.join('、');
    // ビューワーで表紙を表示するのは面置きの本だけなので、URL長を抑えるため他は省く
    if (b.favorite && b.coverUrl) sb.c = b.coverUrl;
    if (b.rating) sb.r = b.rating;
    if (b.favorite) sb.f = 1;
    if (b.finishedAt) sb.d = b.finishedAt;
    return sb;
  });
  const json = JSON.stringify({ v: 1, books: payload });
  return `${VIEWER_URL}#b=${base64urlEncode(json)}`;
}

/**
 * 本棚を共有する。Webでは react-native-web の Share が使えない環境があるため、
 * Web Share API → クリップボードの順にフォールバックする。
 * 戻り値はどう共有されたか（'shared' = 共有シート表示, 'copied' = URLコピー）。
 */
export async function shareShelf(books: Book[]): Promise<'shared' | 'copied'> {
  const url = buildShareUrl(books);
  const message = `わたしの本棚（${books.length}冊）\n${url}`;
  if (Platform.OS === 'web') {
    if (typeof navigator.share === 'function') {
      await navigator.share({ text: message, url });
      return 'shared';
    }
    await navigator.clipboard.writeText(url);
    return 'copied';
  }
  await Share.share({ message, url });
  return 'shared';
}
