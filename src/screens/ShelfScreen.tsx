import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, serifFont } from '../colors';
import Shelf from '../components/Shelf';
import { RootStackParamList } from '../navigation';
import { shareShelf } from '../share';
import { useBooks } from '../store';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ShelfScreen() {
  const { books } = useBooks();
  const navigation = useNavigation<Nav>();

  const onShare = async () => {
    if (books.length === 0) {
      Alert.alert('本棚が空です', '検索タブから読んだ本を追加してみましょう。');
      return;
    }
    try {
      await shareShelf(books);
    } catch {
      // 共有キャンセル時は何もしない
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.overline}>MY LIBRARY</Text>
          <Text style={styles.title}>わたしの本棚</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.count}>
            {books.length}
            <Text style={styles.countUnit}> 冊</Text>
          </Text>
          <Pressable style={styles.shareButton} onPress={onShare}>
            <Text style={styles.shareButtonText}>共有</Text>
          </Pressable>
        </View>
      </View>
      {books.length === 0 && (
        <Text style={styles.empty}>
          まだ本がありません。{'\n'}検索タブから読んだ本を迎え入れると、ここに並んでいきます。
        </Text>
      )}
      <Shelf
        books={books}
        onPressBook={(book) => navigation.navigate('BookDetail', { bookId: book.id })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  count: {
    color: palette.text,
    fontSize: 18,
    fontFamily: serifFont,
  },
  countUnit: {
    fontSize: 12,
    color: palette.textMuted,
  },
  shareButton: {
    borderWidth: 1,
    borderColor: palette.accentDim,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  shareButtonText: {
    color: palette.accent,
    fontSize: 13,
    letterSpacing: 2,
  },
  empty: {
    color: palette.textMuted,
    paddingHorizontal: 20,
    paddingBottom: 10,
    lineHeight: 22,
    fontSize: 13,
  },
});
