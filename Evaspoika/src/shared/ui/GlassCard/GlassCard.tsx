import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';

type Props = ViewProps & {
  children: React.ReactNode;
  blurRadius?: number;
};

const blurRadiusToIntensity = (blurRadius: number) =>
  Math.min(72, Math.max(28, Math.round(blurRadius * 2.1)));

export function GlassCard({ children, style, blurRadius = 54, ...props }: Props) {
  return (
    <View style={[styles.card, style]} {...props}>
      <BlurView
        experimentalBlurMethod="dimezisBlurView"
        intensity={blurRadiusToIntensity(blurRadius)}
        style={StyleSheet.absoluteFill}
        tint="dark"
      />
      <View pointerEvents="none" style={styles.overlay} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 32,
    padding: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
});
