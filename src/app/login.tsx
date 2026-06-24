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
          <Text style={styles.title}>Login</Text>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <AppButton title="Sign in" onPress={onSubmit} />
        <View style={styles.footerRow}>
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
    padding: 16,
    paddingBottom: 24,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 520,
    padding: 18,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: "800", color: COLORS.primary },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fbfdff',
  },
  error: { color: COLORS.danger, marginBottom: 12 },
  footerRow: { marginTop: 12, alignItems: 'center' },
  registerLink: { color: COLORS.primary, fontWeight: '700', marginTop: 6 },
});
