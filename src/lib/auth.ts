export type Role = "admin" | "staff" | "cashier" | "customer";

export type CurrentUser = {
  email: string;
  role: Role;
  name?: string;
};

type User = CurrentUser & {
  password: string;
};

const users: User[] = [
  { email: "staff@gmail.com", password: "123", role: "staff", name: "Staff User" },
  { email: "admin@gmail.com", password: "123", role: "admin", name: "Admin User" },
  { email: "cashier@gmail.com", password: "123", role: "cashier", name: "Cashier User" },
  { email: "customer@gmail.com", password: "123", role: "customer", name: "Customer User" },
];

function sanitizeUser(user: User): CurrentUser {
  const { password, ...safeUser } = user;
  return safeUser;
}

export function login(email: string, password: string): CurrentUser | null {
  const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
  return u ? sanitizeUser(u) : null;
}

export function register(name: string, email: string, password: string): CurrentUser {
  const exists = users.find((x) => x.email.toLowerCase() === email.toLowerCase());
  if (exists) throw new Error("User already exists");
  const newUser: User = { name, email, password, role: "customer" };
  users.push(newUser);
  return sanitizeUser(newUser);
}

export function listUsers(): CurrentUser[] {
  return users.map(sanitizeUser);
}
