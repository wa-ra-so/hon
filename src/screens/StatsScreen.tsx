import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { palette, serifFont } from '../colors';
import { useBooks } from '../store';

function lastMonths(n: number): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

export default function StatsScreen() {
  const { books } = useBooks();

  const stats = useMemo(() => {
    const year = String(new Date().getFullYear());
    const thisYear = books.filter((b) => b.finishedAt?.startsWith(year)).length;
    const favorites = books.filter((b) => b.favorite).length;
    const rated = books.filter((b) => b.rating > 0);
    const avgRating = rated.length
      ? (rated.reduce((sum, b) => sum + b.rating, 0) / rated.length).toFixed(1)
      : '－';

    const months = lastMonths(12);
    const monthly = months.map((m) => ({
      month: m,
      count: books.filter((b) => b.finishedAt === m).length,
    }));
    const maxMonthly = Math.max(1, ...monthly.map((m) => m.count));

    const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
      rating: r,
      count: books.filter((b) => b.rating === r).length,
    }));
    const maxRating = Math.max(1, ...ratingDist.map((r) => r.count));

    return { thisYear, favorites, avgRating, monthly, maxMonthly, ratingDist, maxRating };
  }, [books]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.overline}>READING RECORD</Text>
      <Text style={styles.title}>読書の記録</Text>

      <View style={styles.tiles}>
        <StatTile label="蔵書" value={String(books.length)} unit="冊" />
        <StatTile label="今年" value={String(stats.thisYear)} unit="冊" />
        <StatTile label="お気に入り" value={String(stats.favorites)} unit="冊" />
        <StatTile label="平均評価" value={stats.avgRating} unit="" />
      </View>

      <Text style={styles.sectionTitle}>月ごとの読了数（直近12か月）</Text>
      <View style={styles.chart}>
        {stats.monthly.map(({ month, count }) => (
          <View key={month} style={styles.barColumn}>
            <Text style={styles.barCount}>{count > 0 ? count : ''}</Text>
            <View
              style={[
                styles.bar,
                { height: Math.max(3, (count / stats.maxMonthly) * 110) },
                count === 0 && styles.barEmpty,
              ]}
            />
            <Text style={styles.barLabel}>{Number(month.slice(5))}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>評価の内訳</Text>
      <View style={styles.ratingList}>
        {stats.ratingDist.map(({ rating, count }) => (
          <View key={rating} style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>{'★'.repeat(rating)}</Text>
            <View style={styles.ratingBarTrack}>
              <View style={[styles.ratingBar, { flex: count / stats.maxRating }]} />
              <View style={{ flex: 1 - count / stats.maxRating }} />
            </View>
            <Text style={styles.ratingCount}>{count}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function StatTile({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileValue}>
        {value}
        {unit ? <Text style={styles.tileUnit}> {unit}</Text> : null}
      </Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
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
    marginBottom: 20,
  },
  tiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    borderRadius: 6,
    paddingVertical: 18,
    alignItems: 'center',
    flexBasis: '47%',
    flexGrow: 1,
  },
  tileValue: {
    fontSize: 26,
    color: palette.text,
    fontFamily: serifFont,
    fontWeight: '600',
  },
  tileUnit: {
    fontSize: 13,
    color: palette.textMuted,
  },
  tileLabel: {
    fontSize: 11,
    color: palette.textMuted,
    marginTop: 6,
    letterSpacing: 2,
  },
  sectionTitle: {
    fontSize: 13,
    color: palette.text,
    fontFamily: serifFont,
    fontWeight: '600',
    marginTop: 30,
    marginBottom: 12,
    letterSpacing: 1,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    borderRadius: 6,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barCount: {
    fontSize: 10,
    color: palette.accent,
    marginBottom: 3,
  },
  bar: {
    width: 10,
    borderRadius: 2,
    backgroundColor: palette.accent,
  },
  barEmpty: {
    backgroundColor: palette.starOff,
  },
  barLabel: {
    fontSize: 10,
    color: palette.textFaint,
    marginTop: 6,
  },
  ratingList: {
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    borderRadius: 6,
    padding: 16,
    gap: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingLabel: {
    width: 78,
    color: palette.star,
    fontSize: 12,
    letterSpacing: 1,
  },
  ratingBarTrack: {
    flex: 1,
    flexDirection: 'row',
    height: 8,
  },
  ratingBar: {
    backgroundColor: palette.accentDim,
    borderRadius: 4,
  },
  ratingCount: {
    width: 24,
    textAlign: 'right',
    color: palette.textMuted,
    fontSize: 12,
  },
});
