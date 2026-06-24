import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import bento from "../components/ui/bento-styles";
import AppButton from "../components/ui/button";
import { COLORS } from "../components/ui/theme";

export default function Index() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={[bento.card, styles.heroCard]}>
        <View style={styles.titleRow}>
          <MaterialIcons name="storefront" size={28} color={COLORS.primary} />
          <Text style={styles.title}>Welcome to SariSmart</Text>
        </View>
        <Text style={styles.subtitle}>A school canteen sales app built for admin, staff, cashier, and customers.</Text>
      </View>

      <View style={styles.actions}>
        <AppButton title="Login" onPress={() => router.push("/login")} style={styles.actionButton} />
        <AppButton title="Register" onPress={() => router.push("/register")} variant="secondary" style={styles.actionButton} />
        <AppButton title="About SariSmart" onPress={() => router.push("/examples")} variant="secondary" style={styles.actionButton} />
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
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  heroCard: {
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
    marginBottom: 18,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 20,
    marginTop: 4,
  },
  actions: {
    width: '100%',
    maxWidth: 520,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  actionButton: { width: '100%', marginBottom: 10 },
});