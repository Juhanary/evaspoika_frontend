import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { getSettings, saveSettings } from '@/src/config/settingsStore';
import { ScreenLayout } from '@/src/shared/ui/ScreenLayout/ScreenLayout';
import { screen } from '@/src/shared/styles/screen';

export default function SettingsScreen() {
  const current = getSettings();
  const [apiBaseUrl, setApiBaseUrl] = useState(current.apiBaseUrl);
  const [apiReadToken, setApiReadToken] = useState(current.apiReadToken);
  const [apiWriteToken, setApiWriteToken] = useState(current.apiWriteToken);
  const [netvisorReadToken, setNetvisorReadToken] = useState(current.netvisorReadToken);
  const [netvisorWriteToken, setNetvisorWriteToken] = useState(current.netvisorWriteToken);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmedUrl = apiBaseUrl.trim();
    if (!trimmedUrl) {
      Alert.alert('Virhe', 'Backend URL ei voi olla tyhjä.');
      return;
    }
    setSaving(true);
    try {
      await saveSettings({
        apiBaseUrl: trimmedUrl,
        apiReadToken: apiReadToken.trim(),
        apiWriteToken: apiWriteToken.trim(),
        netvisorReadToken: netvisorReadToken.trim(),
        netvisorWriteToken: netvisorWriteToken.trim(),
      });
      Alert.alert('Tallennettu', 'Asetukset tallennettu onnistuneesti.');
    } catch {
      Alert.alert('Virhe', 'Asetusten tallentaminen epäonnistui.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenLayout title="ASETUKSET" leftAction="back">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={screen.sectionTitle}>YHTEYS</Text>
          <View style={styles.divider} />

          <View style={styles.field}>
            <Text style={styles.label}>Backend URL</Text>
            <TextInput
              style={styles.input}
              value={apiBaseUrl}
              onChangeText={setApiBaseUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              placeholder="https://127.0.1.1:3000/api"
              placeholderTextColor="rgba(255,255,255,0.3)"
            />
          </View>

          <Text style={[screen.sectionTitle, styles.sectionGap]}>TOKENIT</Text>
          <View style={styles.divider} />

          <View style={styles.field}>
            <Text style={styles.label}>API Read Token</Text>
            <TextInput
              style={styles.input}
              value={apiReadToken}
              onChangeText={setApiReadToken}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              placeholder="Lukutoken"
              placeholderTextColor="rgba(255,255,255,0.3)"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>API Write Token</Text>
            <TextInput
              style={styles.input}
              value={apiWriteToken}
              onChangeText={setApiWriteToken}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              placeholder="Kirjoitustoken"
              placeholderTextColor="rgba(255,255,255,0.3)"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Netvisor Read Token</Text>
            <TextInput
              style={styles.input}
              value={netvisorReadToken}
              onChangeText={setNetvisorReadToken}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              placeholder="Netvisor lukutoken"
              placeholderTextColor="rgba(255,255,255,0.3)"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Netvisor Write Token</Text>
            <TextInput
              style={styles.input}
              value={netvisorWriteToken}
              onChangeText={setNetvisorWriteToken}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              placeholder="Netvisor kirjoitustoken"
              placeholderTextColor="rgba(255,255,255,0.3)"
            />
          </View>

          <Pressable
            style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>{saving ? 'Tallennetaan...' : 'TALLENNA'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  divider: {
    height: 1,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  sectionGap: {
    marginTop: 32,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 13,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 18,
    color: '#EDEDED',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  saveBtn: {
    marginTop: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  saveBtnPressed: {
    opacity: 0.7,
  },
  saveBtnText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 20,
    letterSpacing: 2,
    color: '#EDEDED',
  },
});
