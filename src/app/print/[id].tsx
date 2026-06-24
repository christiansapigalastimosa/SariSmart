import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from "expo-print";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import bento from "../../components/ui/bento-styles";
import AppButton from "../../components/ui/button";
import { COLORS } from "../../components/ui/theme";
import { initOrders, listOrders, Order } from "../../lib/orders";

export default function PrintOrderPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    initOrders().then(() => {
      if (!mounted) return;
      const oid = parseInt(id as string, 10);
      const o = listOrders().find((x) => x.id === oid) ?? null;
      setOrder(o);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    let mounted = true;
    async function tryAutoPrint() {
      if (!mounted || loading || !order) return;
      try {
        const saved = await AsyncStorage.getItem('preferredPrinter');
        if (saved) {
          // attempt to print silently to saved printer
          await handlePrintToPrinter(saved);
        }
      } catch (err) {
        console.warn('Auto-print attempt failed', err);
      }
    }
    tryAutoPrint();
    return () => { mounted = false; };
  }, [loading, order]);

  function buildHtml(o: Order) {
    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            :root { color-scheme: light; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color: #222; margin: 0; padding: 24px; background: #fff; }
            .receipt { max-width: 720px; margin: 0 auto; }
            header { margin-bottom: 18px; }
            h1 { font-size: 22px; margin: 0 0 6px 0; }
            .lead { color: #555; margin: 0 0 10px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { padding: 10px 6px; border-bottom: 1px solid #eee; }
            th { text-align: left; color: #666; font-weight: 700; font-size: 12px; text-transform: uppercase; }
            td { font-size: 14px; }
            .qty { text-align: center; width: 72px; }
            .subtotal { text-align: right; width: 120px; }
            .totalRow { display: flex; justify-content: space-between; margin-top: 18px; font-size: 16px; font-weight: 800; }
            .meta { margin-top: 18px; color: #666; font-size: 13px; }
            @media print {
              body { padding: 12mm; }
              .receipt { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <header>
              <h1>Order #${o.id.toString().padStart(4, '0')}</h1>
              <p class="lead">Please present this receipt to the cashier for payment confirmation.</p>
            </header>

            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th class="qty">Qty</th>
                  <th class="subtotal">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${o.items.map((item) => `
                  <tr>
                    <td>${item.name}</td>
                    <td class="qty">${item.quantity}</td>
                    <td class="subtotal">₱${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totalRow">
              <div>Total</div>
              <div>₱${o.total.toFixed(2)}</div>
            </div>

            <p class="meta">Order Number: <strong>#${o.id.toString().padStart(4, '0')}</strong></p>
          </div>
        </body>
      </html>
    `;
  }

  async function handlePrint() {
    if (!order) return;
    const html = buildHtml(order);
    try {
      await Print.printAsync({ html });
    } catch (err) {
      console.warn('Print failed', err);
    }
  }

  async function handlePrintToPrinter(printerUrl?: string) {
    if (!order) return;
    const html = buildHtml(order);
    try {
      const opts: any = { html };
      if (printerUrl) opts.printerUrl = printerUrl;
      await Print.printAsync(opts);
    } catch (err) {
      console.warn('Print to printer failed', err);
    }
  }

  async function selectAndSavePrinter() {
    try {
      // prompts user to pick a printer and returns printer info (native only)
      const printer = await (Print as any).selectPrinterAsync?.();
      if (printer?.url) {
        await AsyncStorage.setItem('preferredPrinter', printer.url);
        return printer.url;
      }
    } catch (err) {
      console.warn('Select printer failed', err);
    }
    return null;
  }

  if (loading) return null;
  if (!order) {
    return (
      <View style={styles.container}>
        <View style={[bento.card, styles.heroCard]}>
          <Text style={styles.title}>Print Receipt</Text>
          <Text style={styles.sectionDescription}>Order not found.</Text>
          <AppButton title="Back" onPress={() => router.push('/admin')} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.flatContentContainer}>
      <View style={[bento.card, styles.heroCard]}>
        <View style={styles.titleRow}>
          <MaterialIcons name="print" size={28} color={COLORS.primary} />
          <Text style={styles.title}>Print Receipt</Text>
        </View>
        <Text style={styles.sectionDescription}>Review the receipt below, then tap Print.</Text>
        <View style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: '700', marginBottom: 8 }}>Order #{order.id.toString().padStart(4, '0')}</Text>
          {order.items.map((it) => (
            <View key={it.productId} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text>{it.name} x{it.quantity}</Text>
              <Text>₱{(it.price * it.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '700' }}>Total</Text>
            <Text style={{ fontWeight: '700' }}>₱{order.total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={{ marginTop: 18 }}>
          <AppButton title="Print receipt" onPress={handlePrint} />
          <AppButton title="Done" onPress={() => router.push('/customer')} variant="secondary" style={{ marginTop: 8 }} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  flatContentContainer: { padding: 18, paddingBottom: 28 },
  heroCard: { width: '100%', maxWidth: 640, alignSelf: 'center', padding: 24, backgroundColor: COLORS.surface, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  sectionDescription: { color: COLORS.muted, marginTop: 6 },
});
