import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { CartItem } from './cart';

export type OrderStatus = 'pending' | 'sentToCashier' | 'completed' | 'reported';

export type OrderItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
};

export type Order = {
  id: number;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
};

const STORAGE_KEY = 'SariSmart:orders';
let orders: Order[] = [];
let nextId = 1;

async function saveOrders(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ orders, nextId }));
  } catch (err) {
    console.warn('Failed to save orders', err);
  }
}

export async function initOrders(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.orders)) {
      orders = parsed.orders as Order[];
    }
    if (typeof parsed.nextId === 'number') nextId = parsed.nextId;
  } catch (err) {
    console.warn('Failed to load orders', err);
  }
}

export function listOrders(): Order[] {
  return orders.slice().sort((a, b) => a.id - b.id);
}

export async function createOrder(items: CartItem[], total: number): Promise<Order> {
  const order: Order = {
    id: nextId++,
    items: items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      category: item.category,
    })),
    total,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  await saveOrders();
  return order;
}

export async function processOrder(orderId: number): Promise<void> {
  const order = orders.find((entry) => entry.id === orderId);
  if (!order || order.status !== 'pending') return;
  order.status = 'sentToCashier';
  await saveOrders();
}

export async function confirmOrderPayment(orderId: number): Promise<void> {
  const order = orders.find((entry) => entry.id === orderId);
  if (!order || order.status !== 'sentToCashier') return;
  order.status = 'completed';
  await saveOrders();
}

export function totalSales(): number {
  // Include both completed and reported orders when computing overall total sales
  return orders.reduce((sum, o) => (o.status === 'completed' || o.status === 'reported' ? sum + o.total : sum), 0);
}

export function currentPeriodSales(): number {
  // Only count completed orders that have not yet been archived/reported.
  return orders.reduce((sum, o) => (o.status === 'completed' ? sum + o.total : sum), 0);
}

export function getCompletedOrders(): Order[] {
  return orders.filter((o) => o.status === 'completed').slice().sort((a, b) => a.id - b.id);
}

const isWeb = Platform.OS === 'web';
const isAndroid = Platform.OS === 'android';
const REPORTS_FOLDER = (FileSystem.documentDirectory || '') + 'Documents/Reports/';

async function ensureReportsFolder(): Promise<void> {
  if (isWeb || isAndroid) return;
  const info = await FileSystem.getInfoAsync(REPORTS_FOLDER);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(REPORTS_FOLDER, { intermediates: true });
  }
}

export async function saveReport(report: any): Promise<void> {
  const key = 'SariSmart:reports';
  try {
    const raw = await AsyncStorage.getItem(key);
    let existing = [] as any[];
    if (raw) existing = JSON.parse(raw);
    existing.push(report);
    await AsyncStorage.setItem(key, JSON.stringify(existing));
  } catch (err) {
    console.warn('Failed to save report', err);
  }
}

async function shareReportFile(uri: string): Promise<void> {
  try {
    if (Platform.OS !== 'web' && await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    }
  } catch (err) {
    console.warn('Failed to open share dialog for report file', err);
  }
}

async function saveReportFileAndroid(report: any, filename: string): Promise<string> {
  const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!permissions.granted || !permissions.directoryUri) {
    throw new Error('Storage access permission denied');
  }

  const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
    permissions.directoryUri,
    filename,
    'application/json'
  );

  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(report, null, 2), {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return fileUri;
}

export async function saveReportFile(report: any): Promise<string> {
  try {
    const safeTime = report.generatedAt.replace(/[^a-zA-Z0-9-]/g, '_');
    const filename = `report-${safeTime}.json`;
    const content = JSON.stringify(report, null, 2);

    if (isWeb) {
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      return `browser-download:${filename}`;
    }

    if (isAndroid) {
      return await saveReportFileAndroid(report, filename);
    }

    await ensureReportsFolder();
    const uri = REPORTS_FOLDER + filename;
    await FileSystem.writeAsStringAsync(uri, content, { encoding: FileSystem.EncodingType.UTF8 });
    await shareReportFile(uri);
    return uri;
  } catch (err) {
    console.warn('Failed to save report file', err);
    throw err;
  }
}

export function generateSalesReport(): { generatedAt: string; totalSales: number; totalOrders: number; items: { productId: number; name: string; quantity: number; revenue: number }[] } {
  const completed = orders.filter((o) => o.status === 'completed');
  const itemsMap: Record<number, { productId: number; name: string; quantity: number; revenue: number }> = {};
  let total = 0;
  completed.forEach((o) => {
    total += o.total;
    o.items.forEach((it) => {
      const existing = itemsMap[it.productId];
      if (existing) {
        existing.quantity += it.quantity;
        existing.revenue += it.price * it.quantity;
      } else {
        itemsMap[it.productId] = { productId: it.productId, name: it.name, quantity: it.quantity, revenue: it.price * it.quantity };
      }
    });
  });
  return {
    generatedAt: new Date().toISOString(),
    totalSales: total,
    totalOrders: completed.length,
    items: Object.values(itemsMap),
  };
}

export async function archiveCompletedOrders(): Promise<void> {
  let changed = false;
  orders.forEach((o) => {
    if (o.status === 'completed') {
      o.status = 'reported';
      changed = true;
    }
  });
  if (changed) await saveOrders();
}

export async function sendReportAndArchive(): Promise<any> {
  const report = generateSalesReport();
  await saveReport(report);
  await archiveCompletedOrders();
  return report;
}

export async function getSavedReports(): Promise<any[]> {
  const key = 'SariSmart:reports';
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch (err) {
    console.warn('Failed to load saved reports', err);
    return [];
  }
}

export async function deleteSavedReport(index: number): Promise<any[]> {
  const key = 'SariSmart:reports';
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const [removed] = parsed.splice(index, 1);
    await AsyncStorage.setItem(key, JSON.stringify(parsed));
    return parsed;
  } catch (err) {
    console.warn('Failed to delete saved report', err);
    return [];
  }
}

export async function clearSavedReports(): Promise<void> {
  const key = 'SariSmart:reports';
  try {
    await AsyncStorage.setItem(key, JSON.stringify([]));
  } catch (err) {
    console.warn('Failed to clear saved reports', err);
  }
}

// Move a saved report into a trash area so it can be restored (soft delete)
export async function moveReportToTrash(index: number): Promise<any[]> {
  const key = 'SariSmart:reports';
  const trashKey = 'SariSmart:reports_trash';
  try {
    const raw = await AsyncStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed) || index < 0 || index >= parsed.length) return parsed || [];
    const [removed] = parsed.splice(index, 1);
    await AsyncStorage.setItem(key, JSON.stringify(parsed));

    const rawTrash = await AsyncStorage.getItem(trashKey);
    const trash = rawTrash ? JSON.parse(rawTrash) : [];
    if (Array.isArray(trash)) {
      trash.push(removed);
      await AsyncStorage.setItem(trashKey, JSON.stringify(trash));
    }

    return parsed;
  } catch (err) {
    console.warn('Failed to move report to trash', err);
    return [];
  }
}

export async function restoreLastTrash(): Promise<any | null> {
  const key = 'SariSmart:reports';
  const trashKey = 'SariSmart:reports_trash';
  try {
    const rawTrash = await AsyncStorage.getItem(trashKey);
    const trash = rawTrash ? JSON.parse(rawTrash) : [];
    if (!Array.isArray(trash) || trash.length === 0) return null;
    const restored = trash.pop();
    await AsyncStorage.setItem(trashKey, JSON.stringify(trash));

    const raw = await AsyncStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      parsed.push(restored);
      await AsyncStorage.setItem(key, JSON.stringify(parsed));
    }
    return restored;
  } catch (err) {
    console.warn('Failed to restore report from trash', err);
    return null;
  }
}

export async function hasTrash(): Promise<boolean> {
  const trashKey = 'SariSmart:reports_trash';
  try {
    const rawTrash = await AsyncStorage.getItem(trashKey);
    const trash = rawTrash ? JSON.parse(rawTrash) : [];
    return Array.isArray(trash) && trash.length > 0;
  } catch (err) {
    return false;
  }
}

// Save arbitrary text content to a file (CSV or text)
export async function saveTextFile(content: string, filename: string): Promise<string> {
  try {
    const isWeb = Platform.OS === 'web';
    const isAndroid = Platform.OS === 'android';
    if (isWeb) {
      const blob = new Blob([content], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      return `browser-download:${filename}`;
    }

    if (isAndroid) {
      // Reuse saveReportFileAndroid logic by writing to SAF if available
      const permissions = await (FileSystem as any).StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permissions.granted || !permissions.directoryUri) throw new Error('Storage permission denied');
      const fileUri = await (FileSystem as any).StorageAccessFramework.createFileAsync(permissions.directoryUri, filename, 'text/csv');
      await FileSystem.writeAsStringAsync(fileUri, content, { encoding: FileSystem.EncodingType.UTF8 });
      return fileUri;
    }

    // iOS / others: write to Documents/Reports
    const REPORTS_FOLDER = (FileSystem.documentDirectory || '') + 'Documents/Reports/';
    const info = await FileSystem.getInfoAsync(REPORTS_FOLDER);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(REPORTS_FOLDER, { intermediates: true });
    }
    const uri = REPORTS_FOLDER + filename;
    await FileSystem.writeAsStringAsync(uri, content, { encoding: FileSystem.EncodingType.UTF8 });
    try { await shareReportFile(uri); } catch {}
    return uri;
  } catch (err) {
    console.warn('Failed to save text file', err);
    throw err;
  }
}

export async function exportAllReportsCSV(): Promise<string> {
  const reports = await getSavedReports();
  const lines: string[] = [];
  // header
  lines.push('reportDate,reportTotal,reportOrders,itemProductId,itemName,itemQty,itemRevenue');
  reports.forEach((r: any) => {
    if (!r.items || r.items.length === 0) {
      lines.push(`${r.generatedAt},${r.totalSales},${r.totalOrders},,, ,`);
    } else {
      r.items.forEach((it: any) => {
        // escape commas in names
        const name = String(it.name).replace(/"/g, '""');
        lines.push(`"${r.generatedAt}",${r.totalSales},${r.totalOrders},${it.productId},"${name}",${it.quantity},${it.revenue}`);
      });
    }
  });
  const csv = lines.join('\n');
  const filename = `reports-archive-${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
  await saveTextFile(csv, filename);
  return filename;
}
