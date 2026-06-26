import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import bento from "../components/ui/bento-styles";
import AppButton from "../components/ui/button";
import { COLORS } from "../components/ui/theme";
import { login } from "../lib/auth";
import { setCurrentUser } from "../lib/session";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    try {
      const user = login(email.trim(), password);
      if (!user) {
        setError("Invalid credentials");
        return;
      }
      await setCurrentUser(user);
      switch (user.role) {
        case "admin":
          router.replace("/admin");
          break;
        case "staff":
          router.replace("/staff");
          break;
        case "cashier":
          router.replace("/cashier");
          break;
        case "customer":
        default:
          router.replace("/customer");
          break;
      }
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
      <View style={[bento.card, styles.card]}>
        <View style={styles.titleRow}>
          <MaterialIcons name="login" size={24} color={COLORS.primary} />
          <Text style={styles.title}>Welcome back</Text>
        </View>
        <Text style={styles.subtitle}>Sign in to access orders, track purchases, and continue browsing securely.</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#94a3b8"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#94a3b8"
        />
        <AppButton title="Sign in" onPress={onSubmit} style={styles.primaryButton} />
        <View style={styles.footerRow}>
          <Text style={styles.noteText}>New here?</Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.registerLink}>Create an account</Text>
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
  registerLink: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },
  primaryButton: { marginTop: 8 },
});
