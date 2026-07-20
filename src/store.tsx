import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Book } from './types';

const STORAGE_KEY = 'hondana.books.v1';

type BooksContextValue = {
  books: Book[];
  loaded: boolean;
  addBook: (book: Book) => void;
  updateBook: (id: string, patch: Partial<Book>) => void;
  removeBook: (id: string) => void;
};

const BooksContext = createContext<BooksContextValue | null>(null);

export function BooksProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loaded, setLoaded] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved: Book[] = JSON.parse(raw);
        // 読み込み完了前に追加された本を上書きしないようマージする
        setBooks((prev) => [...saved, ...prev.filter((b) => !saved.some((s) => s.id === b.id))]);
      })
      .catch(() => {})
      .finally(() => {
        loadedRef.current = true;
        setLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (!loadedRef.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(books)).catch(() => {});
  }, [books, loaded]);

  const addBook = useCallback((book: Book) => {
    setBooks((prev) => [...prev, book]);
  }, []);

  const updateBook = useCallback((id: string, patch: Partial<Book>) => {
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }, []);

  const removeBook = useCallback((id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return (
    <BooksContext.Provider value={{ books, loaded, addBook, updateBook, removeBook }}>
      {children}
    </BooksContext.Provider>
  );
}

export function useBooks(): BooksContextValue {
  const ctx = useContext(BooksContext);
  if (!ctx) throw new Error('useBooks must be used within BooksProvider');
  return ctx;
}
