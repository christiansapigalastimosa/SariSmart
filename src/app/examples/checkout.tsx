import { MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../components/ui/theme";

export default function ExamplesCheckout() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="payment" size={28} color={COLORS.primary} />
        <Text style={styles.title}>Checkout Flow</Text>
        <Text style={styles.subtitle}>Complete the order and return to the customer showcase.</Text>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryLine}>Order total: ₱150.00</Text>
        <Text style={styles.summaryLine}>Payment method: Mock card</Text>
        <Text style={styles.summaryNote}>This demo uses a sample checkout flow to showcase the system.</Text>
      </View>

      <View style={styles.actions}>
        <Link href="/examples/customer" style={styles.completeBtn}><Text style={styles.completeText}>Finish and return</Text></Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center', backgroundColor: COLORS.background },
  header: { width: '100%', maxWidth: 700, marginBottom: 16, padding: 18, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  title: { color: COLORS.primary, fontSize: 22, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: COLORS.muted, fontSize: 14, lineHeight: 20, marginBottom: 12 },
  summary: { width: '100%', maxWidth: 700, padding: 16, backgroundColor: '#f8fafc', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12 },
  summaryLine: { marginBottom: 8, color: COLORS.secondary },
  summaryNote: { color: COLORS.muted, marginTop: 6 },
  actions: { width: '100%', maxWidth: 700, alignItems: 'flex-end' },
  completeBtn: { backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
  completeText: { color: '#fff', fontWeight: '700' },
});
