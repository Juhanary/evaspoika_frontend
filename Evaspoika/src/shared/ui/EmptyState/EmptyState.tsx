import React from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import { screen } from '@/src/shared/styles/components';

type EmptyStateProps = {
  /** The message shown when a list/section has nothing to display. */
  message: string;
  /**
   * Text style for the message. Defaults to `screen.muted`. Pass the
   * call site's existing style (e.g. `dark.muted`, `batchStyles.blEmpty`)
   * to preserve its current appearance exactly.
   */
  style?: StyleProp<TextStyle>;
};

/**
 * Shared "nothing to show" text, used for empty lists, empty sections,
 * and not-found states. A thin wrapper around the repeated
 * `<Text style={...}>message</Text>` pattern found across list/detail
 * screens — callers keep full control of styling via `style`.
 */
export function EmptyState({ message, style }: EmptyStateProps) {
  return <Text style={style ?? screen.muted}>{message}</Text>;
}
