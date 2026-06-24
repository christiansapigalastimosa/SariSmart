import { MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../ui/theme";

type ExampleCardProps = {
  href: string;
  icon: string;
  title: string;
  description: string;
};

export default function ExampleCard({ href, icon, title, description }: ExampleCardProps) {
  return (
    <Link href={href} style={styles.card}>
      <View style={styles.cardHeader}>
        <MaterialIcons name={icon as any} size={20} color={COLORS.primary} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.cardDescription}>{description}</Text>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  cardDescription: {
    color: COLORS.muted,
    lineHeight: 20,
  },
});
