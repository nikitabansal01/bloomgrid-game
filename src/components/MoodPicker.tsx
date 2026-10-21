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
    padding: 12,
    width: '100%',
    maxWidth: 360,
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
    gap: 6,
  },
  chip: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: palette.cream,
    borderWidth: 1,
    borderColor: palette.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: {
    borderWidth: 2,
    borderColor: palette.plum,
    backgroundColor: palette.lavender,
  },
  emoji: {
    fontSize: 22,
  },
});
