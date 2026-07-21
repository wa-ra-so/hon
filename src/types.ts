export type Book = {
  id: string;
  title: string;
  authors: string[];
  coverUrl?: string;
  /** 0 = 未評価, 1-5 = 星 */
  rating: number;
  notes: string;
  /** 読了月 "YYYY-MM" */
  finishedAt?: string;
  /** true なら本棚に表紙を見せて面置きする */
  favorite: boolean;
  addedAt: string;
  spineColor: string;
};

export type SearchResult = {
  googleId: string;
  title: string;
  authors: string[];
  coverUrl?: string;
  publishedDate?: string;
};
