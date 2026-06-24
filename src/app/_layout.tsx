import { MaterialIcons } from "@expo/vector-icons";
import { Link, useRouter, useSegments } from "expo-router";
import Stack from "expo-router/stack";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
    getCurrentUser().then(setUser);
  }, [segments]);

  useEffect(() => {
    if (!isSmall) {
      setMenuOpen(false);
    }
  }, [isSmall]);

  useEffect(() => {
    setMenuOpen(false);
  }, [segments]);

  const handleLogout = async () => {
    await clearCurrentUser();
    setUser(null);
    router.replace("/login");
  };

  const navItems = user ? ROLE_NAV[user.role] : PUBLIC_NAV;

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <View style={styles.brandRow}>
            <MaterialIcons name="storefront" size={24} color={COLORS.primary} />
            <Text style={styles.brand}>SariSmart</Text>
          </View>

          {isSmall ? (
            <TouchableOpacity style={styles.menuToggle} onPress={() => setMenuOpen((prev) => !prev)}>
              <MaterialIcons name={menuOpen ? "close" : "menu"} size={24} color={COLORS.primary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.links}>
              {navItems.map((item) => (
                <Link key={item.href} href={item.href as any} style={styles.headerLink}>
                  <MaterialIcons name={item.icon as any} size={16} color={COLORS.primary} style={styles.linkIcon} />
                  <Text style={styles.headerText}>{item.label}</Text>
                </Link>
              ))}
              {user ? (
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                  <MaterialIcons name="logout" size={16} color={COLORS.primary} style={styles.linkIcon} />
                  <Text style={styles.headerText}>Logout</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}
        </View>

        {isSmall && menuOpen ? (
          <View style={styles.mobileNav}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href as any}
                style={[styles.headerLink, styles.mobileLink]}
                onPress={() => setMenuOpen(false)}
              >
                <MaterialIcons name={item.icon as any} size={16} color={COLORS.primary} style={styles.linkIcon} />
                <Text style={styles.headerText}>{item.label}</Text>
              </Link>
            ))}
            {user ? (
              <TouchableOpacity style={[styles.logoutButton, styles.mobileLink]} onPress={handleLogout}>
                <MaterialIcons name="logout" size={16} color={COLORS.primary} style={styles.linkIcon} />
                <Text style={styles.headerText}>Logout</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </View>
      <View style={styles.main}>
        <ErrorBoundary>
          <Stack screenOptions={{ headerShown: false }} />
        </ErrorBoundary>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  main: { flex: 1, width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 16 },
  header: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  headerInner: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brand: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  headerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#eef2ff',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    marginRight: 8,
    marginBottom: 8,
  },
  menuToggle: {
    padding: 10,
    borderRadius: 999,
    backgroundColor: '#eef2ff',
  },
  mobileNav: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  mobileLink: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
  },
  linkIcon: { marginRight: 6 },
  headerText: { fontSize: 14, color: COLORS.secondary, fontWeight: '700' },
});