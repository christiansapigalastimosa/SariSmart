import { MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../components/ui/theme";
import { SAMPLE_PRODUCTS } from "../../lib/examples";

export default function ExamplesCustomer() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="shopping-bag" size={28} color={COLORS.primary} />
        <Text style={styles.title}>Customer Showcase</Text>
        <Text style={styles.subtitle}>Browse the cafeteria menu and simulate selecting products into your basket.</Text>
      </View>

      <View style={styles.list}>
        {SAMPLE_PRODUCTS.map((p) => (
          <View key={p.id} style={styles.item}>
            <View>
              <Text style={styles.itemName}>{p.name}</Text>
              <Text style={styles.itemLabel}>{p.label}</Text>
              <Text style={styles.itemPrice}>{p.price}</Text>
            </View>
            <Link href={`/examples/product?id=${p.id}`} style={styles.viewLink}>
              <Text style={styles.viewText}>Open</Text>
            </Link>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center', backgroundColor: COLORS.background },
  header: { width: '100%', maxWidth: 700, marginBottom: 16, padding: 18, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  title: { color: COLORS.primary, fontSize: 22, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: COLORS.muted, fontSize: 14, lineHeight: 20 },
  list: { width: '100%', maxWidth: 700 },
  item: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#f8fafc', borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  itemName: { fontSize: 16, fontWeight: '800', color: COLORS.secondary },
  itemLabel: { color: COLORS.primary, marginTop: 4, marginBottom: 6 },
  itemPrice: { color: COLORS.muted, marginTop: 2 },
  viewLink: { backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  viewText: { color: '#fff', fontWeight: '700' },
});
