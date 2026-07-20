import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, serifFont } from '../colors';
import Shelf from '../components/Shelf';
import { notify } from '../dialogs';
import { RootStackParamList } from '../navigation';
import { shareShelf } from '../share';
import { useBooks } from '../store';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ShelfScreen() {
  const { books } = useBooks();
  const navigation = useNavigation<Nav>();

  const onShare = async () => {
    if (books.length === 0) {
      notify('本棚が空です', '検索タブから読んだ本を追加してみましょう。');
      return;
    }
    try {
      const result = await shareShelf(books);
      if (result === 'copied') {
        notify('共有リンクをコピーしました', 'そのまま貼り付けて本棚を見せられます。');
      }
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
});
