import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { palette } from '../colors';
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
      // ユーザーが共有をキャンセルした場合など
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>わたしの本棚</Text>
        <Pressable style={styles.shareButton} onPress={onShare}>
          <Text style={styles.shareButtonText}>共有</Text>
        </Pressable>
      </View>
      {books.length === 0 && (
        <Text style={styles.empty}>
          まだ本がありません。{'\n'}検索タブから読んだ本を追加すると、ここに並んでいきます。
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: palette.text,
  },
  shareButton: {
    backgroundColor: palette.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  empty: {
    color: palette.textMuted,
    paddingHorizontal: 16,
    paddingBottom: 8,
    lineHeight: 20,
  },
});
