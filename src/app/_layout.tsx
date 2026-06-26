import { MaterialIcons } from "@expo/vector-icons";
import { Link, useRouter, useSegments } from "expo-router";
import Stack from "expo-router/stack";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConfirmDialog from "../components/ui/confirm-dialog";
import ErrorBoundary from "../components/ui/error-boundary";
import { COLORS } from "../components/ui/theme";
import type { CurrentUser } from "../lib/auth";
import { clearCurrentUser, getCurrentUser } from "../lib/session";

const PUBLIC_NAV = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/login", label: "Login", icon: "login" },
  { href: "/register", label: "Register", icon: "person-add" },
];

const ROLE_NAV: Record<string, Array<{ href: string; label: string; icon: string }>> = {
  admin: [
    { href: "/", label: "Home", icon: "home" },
    { href: "/admin", label: "Admin Dashboard", icon: "admin-panel-settings" },
    { href: "/admin/reports", label: "Reports", icon: "bar-chart" },
  ],
  staff: [
    { href: "/", label: "Home", icon: "home" },
    { href: "/staff", label: "Staff Dashboard", icon: "assignment" },
  ],
  cashier: [
    { href: "/", label: "Home", icon: "home" },
    { href: "/cashier", label: "Cashier Dashboard", icon: "attach-money" },
    { href: "/cashier/report", label: "Daily Report", icon: "summarize" },
  ],
  customer: [
    { href: "/", label: "Home", icon: "home" },
    { href: "/customer", label: "Customer Area", icon: "shopping-bag" },
    { href: "/cart", label: "Cart", icon: "shopping-cart" },
  ],
};

export default function RootLayout() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const { width } = useWindowDimensions();
  const isSmall = width < 760;

  useEffect(() => {
    let active = true;
    getCurrentUser().then((currentUser) => {
      if (active) setUser(currentUser);
    });
    return () => {
      active = false;
    };
  }, [segments]);

  useEffect(() => {
    if (!isSmall) {
      setMenuOpen(false);
    }
  }, [isSmall]);

  useEffect(() => {
    setMenuOpen(false);
  }, [segments]);

  const [confirmLogoutVisible, setConfirmLogoutVisible] = useState(false);

  const handleLogout = async () => {
    await clearCurrentUser();
    setUser(null);
    setConfirmLogoutVisible(false);
    router.replace("/login");
  };

  const promptLogout = () => {
    setConfirmLogoutVisible(true);
  };

  const navItems = user ? ROLE_NAV[user.role] : PUBLIC_NAV;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <MaterialIcons name="storefront" size={28} color={COLORS.primary} />
          <Text style={styles.headerTitle}>SmartCanteen</Text>
        </View>

        {isSmall ? (
          <TouchableOpacity style={styles.menuToggle} onPress={() => setMenuOpen((prev) => !prev)}>
            <MaterialIcons name={menuOpen ? "close" : "menu"} size={24} color={COLORS.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.navLinks}>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href as any} style={styles.navLink}>
                <MaterialIcons name={item.icon as any} size={16} color={COLORS.primary} />
                <Text style={styles.navText}>{item.label}</Text>
              </Link>
            ))}
            {user ? (
              <TouchableOpacity style={styles.navLink} onPress={promptLogout}>
                <MaterialIcons name="logout" size={16} color={COLORS.primary} />
                <Text style={styles.navText}>Logout</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </View>

      {isSmall && menuOpen && (
        <View style={styles.mobileMenu}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href as any}
              style={styles.mobileMenuItem}
              onPress={() => setMenuOpen(false)}
            >
              <MaterialIcons name={item.icon as any} size={16} color={COLORS.primary} />
              <Text style={styles.mobileMenuText}>{item.label}</Text>
            </Link>
          ))}
          {user ? (
            <TouchableOpacity style={styles.mobileMenuItem} onPress={promptLogout}>
              <MaterialIcons name="logout" size={16} color={COLORS.primary} />
              <Text style={styles.mobileMenuText}>Logout</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      <View style={styles.main}>
        <ErrorBoundary>
          <Stack screenOptions={{ headerShown: false }} />
        </ErrorBoundary>
      </View>

      <ConfirmDialog
        visible={confirmLogoutVisible}
        title="Logout"
        message="Are you sure you want to logout? You can login again anytime."
        confirmLabel="Logout"
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogoutVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F6F9",
  },

  headerContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.primary,
  },

  navLinks: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },

  navLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    gap: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  navText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.secondary,
  },

  menuToggle: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  mobileMenu: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },

  mobileMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    gap: 8,
  },

  mobileMenuText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.secondary,
  },

  main: {
    flex: 1,
    width: "100%",
  },
});