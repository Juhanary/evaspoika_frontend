import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { components } from '@/src/shared/styles/components';

type Props = ViewProps & {
  children: React.ReactNode;
  blurRadius?: number;
};

const blurRadiusToIntensity = (blurRadius: number) =>
  Math.min(100, Math.max(28, Math.round(blurRadius * 4.7)));

export function GlassCard({ children, style, blurRadius = 1, ...props }: Props) {
  return (
    <View style={[components.glassCard, style]} {...props}>
      <BlurView
        experimentalBlurMethod="dimezisBlurView"
        intensity={blurRadiusToIntensity(blurRadius)}
        style={StyleSheet.absoluteFill}
        tint="dark"
      />
      <View pointerEvents="none" style={components.glassCardOverlay} />
      {children}
    </View>
  );
}
