import { SearchResult } from './types';

type Volume = {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    publishedDate?: string;
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
  };
};

const TIMEOUT_MS = 10000;

export async function searchBooks(query: string): Promise<SearchResult[]> {
  const url =
    'https://www.googleapis.com/books/v1/volumes?q=' +
    encodeURIComponent(query) +
    '&maxResults=20&country=JP';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(url, { signal: controller.signal });
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error('検索に時間がかかりすぎたため中断しました。もう一度お試しください。');
    }
    throw new Error('通信できませんでした。電波のよい場所でもう一度お試しください。');
  } finally {
    clearTimeout(timer);
  }
  if (res.status === 429) {
    throw new Error('検索が混み合っています。少し待ってからもう一度お試しください。');
  }
  if (!res.ok) throw new Error('検索に失敗しました。時間をおいてもう一度お試しください。');
  const data: { items?: Volume[] } = await res.json();
  return (data.items ?? [])
    .filter((v) => v.volumeInfo?.title)
    .map((v) => {
      const info = v.volumeInfo!;
      const thumb = info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail;
      return {
        googleId: v.id,
        title: info.title!,
        authors: info.authors ?? [],
        coverUrl: thumb?.replace('http://', 'https://'),
        publishedDate: info.publishedDate,
      };
    });
}
