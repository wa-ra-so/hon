import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { palette } from '../colors';
import Stars from '../components/Stars';
import { RootStackParamList } from '../navigation';
import { useBooks } from '../store';

type Route = RouteProp<RootStackParamList, 'BookDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function BookDetailScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { books, updateBook, removeBook } = useBooks();
  const book = books.find((b) => b.id === route.params.bookId);

  if (!book) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>この本は削除されました</Text>
      </View>
    );
  }

  const onDelete = () => {
    Alert.alert('本棚から削除', `「${book.title}」を本棚から削除しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: () => {
          removeBook(book.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.coverArea}>
          {book.coverUrl ? (
            <Image source={{ uri: book.coverUrl }} style={styles.cover} resizeMode="cover" />
          ) : (
            <View style={[styles.cover, { backgroundColor: book.spineColor }]}>
              <Text style={styles.coverPlaceholderText} numberOfLines={5}>
                {book.title}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.title}>{book.title}</Text>
        {book.authors.length > 0 && (
          <Text style={styles.authors}>{book.authors.join('、')}</Text>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>評価</Text>
          <Stars rating={book.rating} onChange={(rating) => updateBook(book.id, { rating })} />
        </View>

        <View style={[styles.section, styles.rowSection]}>
          <View style={styles.rowLabel}>
            <Text style={styles.label}>お気に入り（面置き）</Text>
            <Text style={styles.hint}>オンにすると本棚に表紙を見せて置きます</Text>
          </View>
          <Switch
            value={book.favorite}
            onValueChange={(favorite) => updateBook(book.id, { favorite })}
            trackColor={{ true: palette.accent }}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>読んだ月</Text>
          <TextInput
            style={styles.monthInput}
            value={book.finishedAt ?? ''}
            onChangeText={(finishedAt) => updateBook(book.id, { finishedAt })}
            placeholder="2026-07"
            placeholderTextColor={palette.textMuted}
            keyboardType="numbers-and-punctuation"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>感想メモ</Text>
          <TextInput
            style={styles.notesInput}
            value={book.notes}
            onChangeText={(notes) => updateBook(book.id, { notes })}
            placeholder="どんな本だった？"
            placeholderTextColor={palette.textMuted}
            multiline
            textAlignVertical="top"
          />
        </View>

        <Pressable style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteButtonText}>本棚から削除</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  notFound: {
    color: palette.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },
  coverArea: {
    alignItems: 'center',
    marginBottom: 16,
  },
  cover: {
    width: 130,
    height: 190,
    borderRadius: 4,
    justifyContent: 'center',
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  coverPlaceholderText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.text,
    textAlign: 'center',
  },
  authors: {
    fontSize: 14,
    color: palette.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
  },
  rowSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    flex: 1,
    paddingRight: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.text,
    marginBottom: 6,
  },
  hint: {
    fontSize: 12,
    color: palette.textMuted,
  },
  monthInput: {
    backgroundColor: palette.card,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: palette.text,
    width: 140,
  },
  notesInput: {
    backgroundColor: palette.card,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: palette.text,
    minHeight: 120,
  },
  deleteButton: {
    marginTop: 36,
    alignSelf: 'center',
  },
  deleteButtonText: {
    color: '#B3372F',
    fontWeight: '600',
  },
});
