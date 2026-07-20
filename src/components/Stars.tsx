import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette } from '../colors';

type Props = {
  rating: number;
  size?: number;
  onChange?: (rating: number) => void;
};

export default function Stars({ rating, size = 28, onChange }: Props) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          disabled={!onChange}
          onPress={() => onChange?.(n === rating ? 0 : n)}
          hitSlop={4}
        >
          <Text
            style={{
              fontSize: size,
              color: n <= rating ? palette.star : palette.starOff,
            }}
          >
            ★
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 2,
  },
});
