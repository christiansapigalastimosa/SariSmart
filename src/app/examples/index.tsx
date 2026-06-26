import { MaterialIcons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import ExampleCard from "../../components/examples/ExampleCard";
import bento from "../../components/ui/bento-styles";
import { COLORS } from "../../components/ui/theme";
import { EXAMPLE_NAV } from "../../lib/examples";

const EXAMPLES = EXAMPLE_NAV;

export default function ExamplesIndex() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[bento.card, styles.heroCard]}>
        <MaterialIcons name="storefront" size={32} color={COLORS.primary} />
        <Text style={styles.title}>Mini SmartCanteen Showcase</Text>
        <Text style={styles.subtitle}>
          A compact customer-facing walkthrough of menu browsing, product details, cart review, and checkout.
        </Text>
      </View>

      <View style={styles.grid}>
        {EXAMPLES.map((example) => (
          <ExampleCard
            key={example.href}
            href={example.href}
            icon={example.icon}
            title={example.title}
            description={example.description}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center', backgroundColor: COLORS.background },
  heroCard: { width: '100%', maxWidth: 700, marginBottom: 18, padding: 22, borderRadius: 24, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, shadowColor: COLORS.secondary, shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  title: { color: COLORS.primary, fontSize: 24, fontWeight: '800', marginTop: 12 },
  subtitle: { color: COLORS.muted, fontSize: 15, lineHeight: 22, marginTop: 10 },
  grid: { width: '100%', maxWidth: 700, marginTop: 12, gap: 12 },
  card: { backgroundColor: '#f8fafc', borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: COLORS.secondary },
  cardDescription: { color: COLORS.muted, lineHeight: 20 },
});
