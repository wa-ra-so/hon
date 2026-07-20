import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { palette } from '../colors';
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
      <View style={styles.tiles}>
        <StatTile label="ぜんぶで" value={`${books.length}冊`} />
        <StatTile label="今年" value={`${stats.thisYear}冊`} />
        <StatTile label="お気に入り" value={`${stats.favorites}冊`} />
        <StatTile label="平均評価" value={`★${stats.avgRating}`} />
      </View>

      <Text style={styles.sectionTitle}>月ごとの読了数（直近12か月）</Text>
      <View style={styles.chart}>
        {stats.monthly.map(({ month, count }) => (
          <View key={month} style={styles.barColumn}>
            <Text style={styles.barCount}>{count > 0 ? count : ''}</Text>
            <View
              style={[
                styles.bar,
                { height: Math.max(4, (count / stats.maxMonthly) * 120) },
                count === 0 && styles.barEmpty,
              ]}
            />
            <Text style={styles.barLabel}>{Number(month.slice(5))}月</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>評価の内訳</Text>
      <View style={styles.ratingList}>
        {stats.ratingDist.map(({ rating, count }) => (
          <View key={rating} style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>
              {'★'.repeat(rating)}
            </Text>
            <View style={styles.ratingBarTrack}>
              <View
                style={[styles.ratingBar, { flex: count / stats.maxRating }]}
              />
              <View style={{ flex: 1 - count / stats.maxRating }} />
            </View>
            <Text style={styles.ratingCount}>{count}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileValue}>{value}</Text>
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
    padding: 16,
    paddingBottom: 40,
  },
  tiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    backgroundColor: palette.card,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    flexBasis: '47%',
    flexGrow: 1,
  },
  tileValue: {
    fontSize: 22,
    fontWeight: '800',
    color: palette.text,
  },
  tileLabel: {
    fontSize: 12,
    color: palette.textMuted,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.text,
    marginTop: 28,
    marginBottom: 12,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: palette.card,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barCount: {
    fontSize: 10,
    color: palette.textMuted,
    marginBottom: 2,
  },
  bar: {
    width: 12,
    borderRadius: 6,
    backgroundColor: palette.accent,
  },
  barEmpty: {
    backgroundColor: palette.starOff,
  },
  barLabel: {
    fontSize: 10,
    color: palette.textMuted,
    marginTop: 4,
  },
  ratingList: {
    backgroundColor: palette.card,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ratingLabel: {
    width: 80,
    color: palette.star,
    fontSize: 13,
  },
  ratingBarTrack: {
    flex: 1,
    flexDirection: 'row',
    height: 10,
  },
  ratingBar: {
    backgroundColor: palette.star,
    borderRadius: 5,
  },
  ratingCount: {
    width: 24,
    textAlign: 'right',
    color: palette.textMuted,
    fontSize: 13,
  },
});
