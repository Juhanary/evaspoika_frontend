import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/shared/constants/colors';
import { radii } from '@/src/shared/constants/radii';
import { spacing } from '@/src/shared/constants/spacing';
import { typography } from '@/src/shared/constants/typography';

export type SearchInputVariant = 'light' | 'dark';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  variant?: SearchInputVariant;
  style?: StyleProp<ViewStyle>;
};

export function SearchInput({
  value,
  onChangeText,
  placeholder = 'Hae...',
  label,
  variant = 'light',
  style,
}: Props) {
  const darkVariant = variant === 'dark';

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Text style={[styles.label, darkVariant ? styles.labelDark : styles.labelLight]}>
          {label}
        </Text>
      ) : null}

      <View style={[styles.field, darkVariant ? styles.fieldDark : styles.fieldLight]}>
        <Ionicons
          color={darkVariant ? 'rgba(255,255,255,0.78)' : colors.textSubtle}
          name="search"
          size={20}
        />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={darkVariant ? 'rgba(255,255,255,0.55)' : colors.muted}
          returnKeyType="search"
          style={[styles.input, darkVariant ? styles.inputDark : styles.inputLight]}
          value={value}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  label: {
    alignSelf: 'center',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  labelDark: {
    color: 'rgba(255,255,255,0.82)',
  },
  labelLight: {
    color: colors.textSubtle,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 3,
  },
  fieldDark: {
    backgroundColor: 'rgba(12, 18, 28, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  fieldLight: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: colors.borderMid,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.lg,
    fontFamily: 'Montserrat_400Regular',
  },
  inputDark: {
    color: colors.textOnDark,
  },
  inputLight: {
    color: colors.textSecondary,
  },
});
