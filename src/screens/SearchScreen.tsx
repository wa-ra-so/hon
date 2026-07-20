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
import { palette, serifFont, spineColorFor } from '../colors';
import { spineColorFromCover } from '../coverColor';
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
  const { books, addBook, updateBook } = useBooks();
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
    if (book.coverUrl) {
      // 表紙の代表色を抽出して背表紙に反映(失敗時はタイトル由来の色のまま)
      spineColorFromCover(book.coverUrl).then((color) => {
        if (color) updateBook(book.id, { spineColor: color });
      });
    }
    navigation.navigate('BookDetail', { bookId: book.id });
  };

  // 本のIDは `${googleId}-${追加時刻}` なので、googleId 部分で追加済みか判定する
  const isAdded = (result: SearchResult) => books.some((b) => b.id.startsWith(`${result.googleId}-`));

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <Text style={styles.overline}>FIND A BOOK</Text>
        <Text style={styles.title}>本をさがす</Text>
      </View>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="タイトルや著者名で検索"
          placeholderTextColor={palette.textFaint}
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
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          !loading && searched ? (
            <Text style={styles.emptyText}>見つかりませんでした</Text>
          ) : null
        }
        renderItem={({ item }) => {
          const added = isAdded(item);
          return (
            <View style={styles.resultRow}>
              {item.coverUrl ? (
                <Image source={{ uri: item.coverUrl }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, styles.thumbPlaceholder]}>
                  <Text style={styles.thumbPlaceholderText}>本</Text>
                </View>
              )}
              <View style={styles.resultInfo}>
                <Text style={styles.resultTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.resultAuthors} numberOfLines={1}>
                  {item.authors.join('、') || '著者不明'}
                  {item.publishedDate ? `　${item.publishedDate.slice(0, 4)}` : ''}
                </Text>
              </View>
              <Pressable
                style={[styles.addButton, added && styles.addButtonDone]}
                disabled={added}
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
  headerArea: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  overline: {
    color: palette.accent,
    fontSize: 10,
    letterSpacing: 4,
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    color: palette.text,
    fontFamily: serifFont,
    fontWeight: '600',
  },
  searchRow: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 12,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: palette.text,
  },
  searchButton: {
    borderWidth: 1,
    borderColor: palette.accentDim,
    borderRadius: 4,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: palette.accent,
    letterSpacing: 2,
    fontSize: 13,
  },
  loading: {
    marginTop: 16,
  },
  error: {
    color: palette.danger,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: palette.textMuted,
    textAlign: 'center',
    marginTop: 32,
  },
  separator: {
    height: 1,
    backgroundColor: palette.cardBorder,
    marginLeft: 20,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 14,
  },
  thumb: {
    width: 46,
    height: 66,
    borderRadius: 2,
    backgroundColor: palette.card,
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.cardBorder,
  },
  thumbPlaceholderText: {
    color: palette.textMuted,
    fontFamily: serifFont,
    fontSize: 16,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 15,
    color: palette.text,
    fontFamily: serifFont,
    fontWeight: '600',
  },
  resultAuthors: {
    fontSize: 12,
    color: palette.textMuted,
    marginTop: 3,
  },
  addButton: {
    borderWidth: 1,
    borderColor: palette.accentDim,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  addButtonDone: {
    borderColor: palette.starOff,
  },
  addButtonText: {
    color: palette.accent,
    fontSize: 12,
    letterSpacing: 1,
  },
  addButtonTextDone: {
    color: palette.textFaint,
  },
});
