import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { CurrentUser, Role } from "./auth";

const CURRENT_USER_KEY = "sarismart_current_user";

export async function setCurrentUser(user: CurrentUser): Promise<void> {
  await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const raw = await AsyncStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as CurrentUser;
  } catch {
    return null;
  }
}

export async function clearCurrentUser(): Promise<void> {
  await AsyncStorage.removeItem(CURRENT_USER_KEY);
}

export async function ensureRole(allowedRoles: Role | Role[], router: any, fallback = "/login"): Promise<CurrentUser | null> {
  const current = await getCurrentUser();
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (current && roles.includes(current.role)) {
    return current;
  }

  router.replace(fallback);
  return null;
}

export function useRequireRole(allowedRoles: Role | Role[]) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    ensureRole(allowedRoles, router).then((current) => {
      if (!active) return;
      setAuthorized(Boolean(current));
    });
    return () => {
      active = false;
    };
  }, [router, JSON.stringify(Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles])]);

  return authorized;
}
