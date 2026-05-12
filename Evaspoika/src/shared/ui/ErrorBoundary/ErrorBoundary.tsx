import React from 'react';
import { Text, View } from 'react-native';
import { errorBoundaryStyles as styles } from '@/src/shared/styles/errorBoundary';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Jotain meni pieleen</Text>
          <Text style={styles.message}>Sulje sovellus ja yritä uudelleen.</Text>
          {__DEV__ && (
            <Text style={styles.detail}>{this.state.error.message}</Text>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}
