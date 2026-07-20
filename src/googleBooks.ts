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

export async function searchBooks(query: string): Promise<SearchResult[]> {
  const url =
    'https://www.googleapis.com/books/v1/volumes?q=' +
    encodeURIComponent(query) +
    '&maxResults=20&country=JP';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`検索に失敗しました (${res.status})`);
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
