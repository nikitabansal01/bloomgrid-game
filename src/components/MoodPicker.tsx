import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette } from '../theme/colors';

const MOODS = ['🌸', '🌙', '💧', '✨', '🫶', '😌'] as const;

type Props = {
  onPick: (emoji: string) => void;
  selected: string | null;
};

export function MoodPicker({ onPick, selected }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>How are you feeling today? (saved on this device only)</Text>
      <View style={styles.row}>
        {MOODS.map((m) => (
          <Pressable
            key={m}
            onPress={() => onPick(m)}
            style={[styles.chip, selected === m && styles.chipOn]}
            accessibilityRole="button"
            accessibilityLabel={`Mood ${m}`}
          >
            <Text style={styles.emoji}>{m}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 16,
    padding: 16,
    backgroundColor: palette.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.blush,
  },
  title: {
    fontSize: 13,
    color: palette.inkSoft,
    textAlign: 'center',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  chip: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: palette.cream,
    borderWidth: 1,
    borderColor: palette.lavender,
  },
  chipOn: {
    borderColor: palette.lavenderDeep,
    backgroundColor: palette.lavender,
  },
  emoji: {
    fontSize: 24,
  },
});
