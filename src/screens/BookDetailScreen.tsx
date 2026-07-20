import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
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
import { palette, serifFont } from '../colors';
import Stars from '../components/Stars';
import { confirmDestructive } from '../dialogs';
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
    confirmDestructive({
      title: '本棚から削除',
      message: `「${book.title}」を本棚から削除しますか？`,
      actionLabel: '削除',
      onConfirm: () => {
        removeBook(book.id);
        navigation.goBack();
      },
    });
  };

  const monthInvalid =
    !!book.finishedAt && !/^\d{4}-(0[1-9]|1[0-2])$/.test(book.finishedAt);

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
              <View style={styles.coverPlaceholderFrame}>
                <Text style={styles.coverPlaceholderText} numberOfLines={5}>
                  {book.title}
                </Text>
              </View>
            </View>
          )}
        </View>
        <Text style={styles.title}>{book.title}</Text>
        {book.authors.length > 0 && (
          <Text style={styles.authors}>{book.authors.join('、')}</Text>
        )}
        <View style={styles.divider} />

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
            trackColor={{ true: palette.accentDim, false: palette.card }}
            thumbColor={book.favorite ? palette.accent : palette.textFaint}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>読んだ月</Text>
          <TextInput
            style={[styles.monthInput, monthInvalid && styles.monthInputInvalid]}
            value={book.finishedAt ?? ''}
            onChangeText={(v) =>
              updateBook(book.id, { finishedAt: v.replace(/[^0-9-]/g, '').slice(0, 7) })
            }
            placeholder="2026-07"
            placeholderTextColor={palette.textFaint}
            keyboardType="numbers-and-punctuation"
            maxLength={7}
          />
          {monthInvalid && (
            <Text style={styles.monthWarning}>「2026-07」の形式で入力すると記録に集計されます</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>感想メモ</Text>
          <TextInput
            style={styles.notesInput}
            value={book.notes}
            onChangeText={(notes) => updateBook(book.id, { notes })}
            placeholder="どんな本だった？"
            placeholderTextColor={palette.textFaint}
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
    padding: 24,
    paddingBottom: 60,
  },
  notFound: {
    color: palette.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },
  coverArea: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cover: {
    width: 132,
    height: 192,
    borderRadius: 3,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  coverPlaceholderFrame: {
    flex: 1,
    margin: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,248,230,0.35)',
    justifyContent: 'center',
    padding: 8,
  },
  coverPlaceholderText: {
    color: 'rgba(255,250,238,0.95)',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1,
  },
  title: {
    fontSize: 21,
    color: palette.text,
    fontFamily: serifFont,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 30,
  },
  authors: {
    fontSize: 13,
    color: palette.textMuted,
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: palette.cardBorder,
    marginTop: 22,
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
    fontSize: 12,
    color: palette.accent,
    letterSpacing: 2,
    marginBottom: 8,
  },
  hint: {
    fontSize: 11,
    color: palette.textFaint,
  },
  monthInputInvalid: {
    borderColor: palette.danger,
  },
  monthWarning: {
    color: palette.danger,
    fontSize: 11,
    marginTop: 6,
  },
  monthInput: {
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: palette.text,
    width: 140,
  },
  notesInput: {
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    lineHeight: 24,
    color: palette.text,
    minHeight: 130,
  },
  deleteButton: {
    marginTop: 40,
    alignSelf: 'center',
  },
  deleteButtonText: {
    color: palette.danger,
    fontSize: 13,
    letterSpacing: 1,
  },
});
