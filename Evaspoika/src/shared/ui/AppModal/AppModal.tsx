import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type Props = {
  visible: boolean;
  onClose?: () => void;
  animationType?: 'fade' | 'slide' | 'none';
  useGestureHandler?: boolean;
  children: React.ReactNode;
};

export function AppModal({
  visible,
  onClose,
  animationType = 'fade',
  useGestureHandler = false,
  children,
}: Props) {
  const Container = useGestureHandler ? GestureHandlerRootView : View;

  return (
    <Modal
      animationType={animationType}
      onRequestClose={onClose ?? (() => {})}
      transparent
      visible={visible}
    >
      <Container style={StyleSheet.absoluteFill}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        {children}
      </Container>
    </Modal>
  );
}
