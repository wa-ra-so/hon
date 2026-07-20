import React, { useMemo } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { hashString, palette } from '../colors';
import { Book } from '../types';

const SHELF_HEIGHT = 150;
const BOARD_HEIGHT = 14;
const SIDE_PADDING = 16;
const FACE_WIDTH = 82;
const FACE_HEIGHT = 122;

type Props = {
  books: Book[];
  onPressBook: (book: Book) => void;
};

type Placed = { book: Book; width: number; height: number };

function bookSize(book: Book): { width: number; height: number } {
  if (book.favorite) return { width: FACE_WIDTH, height: FACE_HEIGHT };
  const h = hashString(book.id);
  return { width: 26 + (h % 10), height: 108 + (h % 24) };
}

export default function Shelf({ books, onPressBook }: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const rowWidth = windowWidth - SIDE_PADDING * 2;

  const rows = useMemo(() => {
    const result: Placed[][] = [];
    let row: Placed[] = [];
    let used = 0;
    for (const book of books) {
      const size = bookSize(book);
      if (used + size.width + 4 > rowWidth && row.length > 0) {
        result.push(row);
        row = [];
        used = 0;
      }
      row.push({ book, ...size });
      used += size.width + 4;
    }
    if (row.length > 0) result.push(row);
    // 空でも棚板を数段見せる
    while (result.length < 3) result.push([]);
    return result;
  }, [books, rowWidth]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {rows.map((row, i) => (
        <View key={i} style={styles.shelf}>
          <View style={styles.shelfBooks}>
            {row.map(({ book, width, height }) =>
              book.favorite ? (
                <FaceOutBook key={book.id} book={book} width={width} height={height} onPress={onPressBook} />
              ) : (
                <SpineBook key={book.id} book={book} width={width} height={height} onPress={onPressBook} />
              )
            )}
          </View>
          <View style={styles.board} />
          <View style={styles.boardEdge} />
        </View>
      ))}
    </ScrollView>
  );
}

function SpineBook({
  book,
  width,
  height,
  onPress,
}: {
  book: Book;
  width: number;
  height: number;
  onPress: (b: Book) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress(book)}
      style={[styles.spine, { width, height, backgroundColor: book.spineColor }]}
    >
      <View style={styles.spineHighlight} />
      <Text style={styles.spineText} numberOfLines={Math.floor(height / 15)}>
        {[...book.title].join('\n')}
      </Text>
    </Pressable>
  );
}

function FaceOutBook({
  book,
  width,
  height,
  onPress,
}: {
  book: Book;
  width: number;
  height: number;
  onPress: (b: Book) => void;
}) {
  return (
    <Pressable onPress={() => onPress(book)} style={[styles.face, { width, height }]}>
      {book.coverUrl ? (
        <Image source={{ uri: book.coverUrl }} style={styles.faceImage} resizeMode="cover" />
      ) : (
        <View style={[styles.facePlaceholder, { backgroundColor: book.spineColor }]}>
          <Text style={styles.facePlaceholderText} numberOfLines={4}>
            {book.title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    paddingHorizontal: SIDE_PADDING,
    paddingTop: 12,
    paddingBottom: 40,
  },
  shelf: {
    height: SHELF_HEIGHT + BOARD_HEIGHT,
    justifyContent: 'flex-end',
    backgroundColor: palette.shelfBack,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  shelfBooks: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 6,
    gap: 4,
  },
  board: {
    height: BOARD_HEIGHT,
    backgroundColor: palette.shelfBoard,
    borderRadius: 2,
  },
  boardEdge: {
    height: 3,
    backgroundColor: palette.shelfBoardEdge,
    marginBottom: 6,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  spine: {
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    alignItems: 'center',
    paddingTop: 10,
    overflow: 'hidden',
  },
  spineHighlight: {
    position: 'absolute',
    left: 2,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  spineText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  face: {
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  faceImage: {
    width: '100%',
    height: '100%',
  },
  facePlaceholder: {
    flex: 1,
    padding: 8,
    justifyContent: 'center',
  },
  facePlaceholderText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
