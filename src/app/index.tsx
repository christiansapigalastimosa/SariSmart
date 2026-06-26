import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import AppButton from "../components/ui/button";
import { COLORS } from "../components/ui/theme";

export default function Index() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <MaterialIcons
            name="storefront"
            size={55}
            color={COLORS.primary || "#16A34A"}
          />
        </View>

        <Text style={styles.title}>SmartCanteen</Text>

        <Text style={styles.subtitle}>
          A modern school canteen management system for Admin, Cashier,
          Staff, and Customers.
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <AppButton
          title="Login"
          onPress={() => router.push("/login")}
          style={styles.button}
        />

        <AppButton
          title="Register"
          variant="secondary"
          onPress={() => router.push("/register")}
          style={styles.button}
        />

        <AppButton
          title="About SmartCanteen"
          variant="secondary"
          onPress={() => router.push("/examples")}
          style={styles.button}
        />
      </View>

      {/* Cards */}
      <View style={styles.card}>
        <MaterialIcons
          name="admin-panel-settings"
          size={34}
          color={COLORS.primary || "#16A34A"}
        />
        <Text style={styles.cardTitle}>Admin</Text>
        <Text style={styles.cardText}>
          Manage products, inventory, reports, and monitor daily sales.
        </Text>
      </View>

      <View style={styles.card}>
        <MaterialIcons
          name="point-of-sale"
          size={34}
          color={COLORS.primary || "#16A34A"}
        />
        <Text style={styles.cardTitle}>Cashier</Text>
        <Text style={styles.cardText}>
          Process customer orders quickly and print receipts.
        </Text>
      </View>

      <View style={styles.card}>
        <MaterialIcons
          name="restaurant-menu"
          size={34}
          color={COLORS.primary || "#16A34A"}
        />
        <Text style={styles.cardTitle}>Customer</Text>
        <Text style={styles.cardText}>
          Browse food, place orders, and enjoy a faster canteen experience.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F6F9",
  },

  container: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
  },

  header: {
    alignItems: "center",
    marginBottom: 40,
  },

  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 10,
  },

  subtitle: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  buttonContainer: {
    width: "100%",
    marginBottom: 30,
  },

  button: {
    width: "100%",
    marginBottom: 15,
  },

  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 22,
    marginBottom: 18,
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#E5E7EB",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 12,
    marginBottom: 8,
  },

  cardText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 15,
    lineHeight: 22,
  },
});
