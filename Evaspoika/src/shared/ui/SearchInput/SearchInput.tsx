import React from 'react';
import {
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
import { components } from '@/src/shared/styles/components';

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
    <View style={[components.searchContainer, style]}>
      {label ? (
        <Text style={[components.searchLabel, darkVariant ? components.searchLabelDark : components.searchLabelLight]}>
          {label}
        </Text>
      ) : null}

      <View style={[components.searchField, darkVariant ? components.searchFieldDark : components.searchFieldLight]}>
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
          style={[components.searchInput, darkVariant ? components.searchInputDark : components.searchInputLight]}
          value={value}
        />
      </View>
    </View>
  );
}
