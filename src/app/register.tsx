import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import bento from "../components/ui/bento-styles";
import AppButton from "../components/ui/button";
import { COLORS } from "../components/ui/theme";
import { register } from "../lib/auth";
import { setCurrentUser } from "../lib/session";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    try {
      const user = register(name.trim(), email.trim(), password);
      await setCurrentUser(user);
      router.replace("/customer");
    } catch (err: any) {
      setError(err?.message ?? "Registration failed");
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
      <View style={[bento.card, styles.card]}>
        <View style={styles.titleRow}>
          <MaterialIcons name="person-add" size={24} color={COLORS.primary} />
          <Text style={styles.title}>Create your account</Text>
        </View>
        <Text style={styles.subtitle}>Sign up once to order faster and keep your purchases organized.</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} placeholderTextColor="#94a3b8" />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#94a3b8"
        />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="#94a3b8" />
        <AppButton title="Register" onPress={onSubmit} style={styles.primaryButton} />
        <View style={styles.footerRow}>
          <Text style={styles.noteText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.loginLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 18,
    paddingBottom: 32,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 520,
    padding: 22,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  title: { fontSize: 26, fontWeight: "800", color: COLORS.text },
  subtitle: { color: COLORS.muted, fontSize: 15, lineHeight: 22, marginBottom: 18 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    borderRadius: 16,
    marginBottom: 14,
    backgroundColor: '#f8fbff',
    color: COLORS.text,
  },
  error: { color: COLORS.danger, marginBottom: 12 },
  footerRow: { marginTop: 18, alignItems: 'center' },
  noteText: { color: COLORS.muted, marginBottom: 8 },
  loginLink: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },
  primaryButton: { marginTop: 8 },
});
