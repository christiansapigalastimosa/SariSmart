import { Slot } from "expo-router";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../components/ui/theme";

export default function ExamplesLayout() {
  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Mini SariSmart Demo</Text>
        <Text style={styles.subtitle}>A compact set of customer-facing screens to showcase the system flow.</Text>
      </View>
      <Slot />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    width: '100%',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 6,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
