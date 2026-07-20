import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { palette, spineColorFor } from '../colors';
import { searchBooks } from '../googleBooks';
import { RootStackParamList } from '../navigation';
import { useBooks } from '../store';
import { Book, SearchResult } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const { books, addBook } = useBooks();
  const navigation = useNavigation<Nav>();

  const onSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    try {
      setResults(await searchBooks(q));
      setSearched(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : '検索に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const onAdd = (result: SearchResult) => {
    const book: Book = {
      id: `${result.googleId}-${Date.now()}`,
      title: result.title,
      authors: result.authors,
      coverUrl: result.coverUrl,
      rating: 0,
      notes: '',
      finishedAt: currentMonth(),
      favorite: false,
      addedAt: new Date().toISOString(),
      spineColor: spineColorFor(result.title),
    };
    addBook(book);
    navigation.navigate('BookDetail', { bookId: book.id });
  };

  const addedTitles = new Set(books.map((b) => b.title));

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="タイトルや著者名で検索"
          placeholderTextColor={palette.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={onSearch}
          returnKeyType="search"
        />
        <Pressable style={styles.searchButton} onPress={onSearch}>
          <Text style={styles.searchButtonText}>検索</Text>
        </Pressable>
      </View>
      {loading && <ActivityIndicator style={styles.loading} color={palette.accent} />}
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={results}
        keyExtractor={(item) => item.googleId}
        ListEmptyComponent={
          !loading && searched ? (
            <Text style={styles.emptyText}>見つかりませんでした</Text>
          ) : null
        }
        renderItem={({ item }) => {
          const added = addedTitles.has(item.title);
          return (
            <View style={styles.resultRow}>
              {item.coverUrl ? (
                <Image source={{ uri: item.coverUrl }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, styles.thumbPlaceholder]}>
                  <Text style={styles.thumbPlaceholderText}>📕</Text>
                </View>
              )}
              <View style={styles.resultInfo}>
                <Text style={styles.resultTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.resultAuthors} numberOfLines={1}>
                  {item.authors.join('、') || '著者不明'}
                  {item.publishedDate ? ` ・ ${item.publishedDate.slice(0, 4)}` : ''}
                </Text>
              </View>
              <Pressable
                style={[styles.addButton, added && styles.addButtonDone]}
                onPress={() => onAdd(item)}
              >
                <Text style={[styles.addButtonText, added && styles.addButtonTextDone]}>
                  {added ? '追加済' : '追加'}
                </Text>
              </Pressable>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  searchRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: palette.card,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: palette.text,
  },
  searchButton: {
    backgroundColor: palette.accent,
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  loading: {
    marginTop: 16,
  },
  error: {
    color: palette.accent,
    paddingHorizontal: 16,
  },
  emptyText: {
    color: palette.textMuted,
    textAlign: 'center',
    marginTop: 32,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  thumb: {
    width: 48,
    height: 68,
    borderRadius: 4,
    backgroundColor: palette.shelfBack,
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbPlaceholderText: {
    fontSize: 22,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.text,
  },
  resultAuthors: {
    fontSize: 13,
    color: palette.textMuted,
    marginTop: 2,
  },
  addButton: {
    borderWidth: 1.5,
    borderColor: palette.accent,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  addButtonDone: {
    borderColor: palette.starOff,
  },
  addButtonText: {
    color: palette.accent,
    fontWeight: '700',
  },
  addButtonTextDone: {
    color: palette.textMuted,
  },
});
