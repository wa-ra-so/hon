import { LinearGradient } from 'expo-linear-gradient';
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
import { hashString, palette, shade } from '../colors';
import { Book } from '../types';

const SHELF_HEIGHT = 168;
const BOARD_HEIGHT = 16;
const SIDE_PADDING = 20;
const FACE_WIDTH = 86;
const FACE_HEIGHT = 128;

type Props = {
  books: Book[];
  onPressBook: (book: Book) => void;
};

type Placed = { book: Book; width: number; height: number; lean: boolean };

function placeBook(book: Book, index: number): Placed {
  if (book.favorite) return { book, width: FACE_WIDTH, height: FACE_HEIGHT, lean: false };
  const h = hashString(book.id);
  return {
    book,
    width: 27 + (h % 11),
    height: 112 + (h % 30),
    // 数冊にひとつ、少し傾いた本を置いて「人の棚」らしさを出す
    lean: index % 6 === 4,
  };
}

export default function Shelf({ books, onPressBook }: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const rowWidth = windowWidth - SIDE_PADDING * 2 - 16;

  const rows = useMemo(() => {
    const result: Placed[][] = [];
    let row: Placed[] = [];
    let used = 0;
    books.forEach((book, i) => {
      const placed = placeBook(book, i);
      if (used + placed.width + 5 > rowWidth && row.length > 0) {
        result.push(row);
        row = [];
        used = 0;
      }
      row.push(placed);
      used += placed.width + 5;
    });
    if (row.length > 0) result.push(row);
    while (result.length < 3) result.push([]);
    return result;
  }, [books, rowWidth]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.case}>
        {rows.map((row, i) => (
          <View key={i}>
            <View style={styles.cavity}>
              <LinearGradient
                colors={['#332417', '#141009', '#1E150D']}
                style={StyleSheet.absoluteFill}
              />
              {/* 棚上部のダウンライトの溜まり */}
              <LinearGradient
                colors={['rgba(240,200,140,0.14)', 'rgba(240,200,140,0)']}
                style={styles.downlight}
              />
              {/* 本の足元の落ち影 */}
              <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)']}
                style={styles.contactShadow}
              />
              <View style={styles.shelfBooks}>
                {row.map((placed) =>
                  placed.book.favorite ? (
                    <FaceOutBook key={placed.book.id} placed={placed} onPress={onPressBook} />
                  ) : (
                    <SpineBook key={placed.book.id} placed={placed} onPress={onPressBook} />
                  )
                )}
              </View>
            </View>
            <LinearGradient
              colors={[palette.woodEdge, palette.wood, palette.woodDark]}
              style={styles.board}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function SpineBook({ placed, onPress }: { placed: Placed; onPress: (b: Book) => void }) {
  const { book, width, height, lean } = placed;
  return (
    <Pressable
      onPress={() => onPress(book)}
      style={[
        styles.spine,
        { width, height },
        lean && styles.spineLean,
      ]}
    >
      <LinearGradient
        colors={[shade(book.spineColor, 0.22), book.spineColor, shade(book.spineColor, -0.38)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      {/* 天(上端)の小口 */}
      <View style={styles.spineTopEdge} />
      <Text style={styles.spineText} numberOfLines={Math.max(4, Math.floor((height - 34) / 13))}>
        {[...book.title].join('\n')}
      </Text>
      {book.rating === 5 && <Text style={styles.spineStar}>★</Text>}
    </Pressable>
  );
}

function FaceOutBook({ placed, onPress }: { placed: Placed; onPress: (b: Book) => void }) {
  const { book, width, height } = placed;
  return (
    <Pressable onPress={() => onPress(book)} style={[styles.face, { width, height }]}>
      {book.coverUrl ? (
        <Image source={{ uri: book.coverUrl }} style={styles.faceImage} resizeMode="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: book.spineColor }]}>
          <View style={styles.facePlaceholderInner}>
            <Text style={styles.facePlaceholderText} numberOfLines={5}>
              {book.title}
            </Text>
          </View>
        </View>
      )}
      {/* 表紙のつや */}
      <LinearGradient
        colors={['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.02)', 'rgba(0,0,0,0.18)']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={styles.faceSpineEdge} pointerEvents="none" />
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
    paddingTop: 8,
    paddingBottom: 48,
  },
  case: {
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.5)',
  },
  cavity: {
    height: SHELF_HEIGHT,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  downlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
  },
  contactShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 14,
  },
  shelfBooks: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    gap: 5,
  },
  board: {
    height: BOARD_HEIGHT,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,220,170,0.28)',
  },
  spine: {
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    overflow: 'hidden',
    alignItems: 'center',
    paddingTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 3,
    shadowOffset: { width: 2, height: 2 },
    elevation: 3,
  },
  spineLean: {
    transform: [{ rotate: '-3.5deg' }],
    transformOrigin: 'bottom left',
    marginRight: 3,
  },
  spineTopEdge: {
    position: 'absolute',
    top: 0,
    left: 3,
    right: 3,
    height: 3,
    backgroundColor: 'rgba(255,250,235,0.28)',
    borderRadius: 1,
  },
  spineText: {
    color: 'rgba(255,252,244,0.92)',
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  spineStar: {
    position: 'absolute',
    bottom: 6,
    color: palette.star,
    fontSize: 9,
  },
  face: {
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: '#221B15',
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 5,
    shadowOffset: { width: 3, height: 4 },
    elevation: 5,
  },
  faceImage: {
    width: '100%',
    height: '100%',
  },
  faceSpineEdge: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  facePlaceholderInner: {
    flex: 1,
    margin: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,248,230,0.35)',
    justifyContent: 'center',
    padding: 6,
  },
  facePlaceholderText: {
    color: 'rgba(255,250,238,0.95)',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1,
  },
});
