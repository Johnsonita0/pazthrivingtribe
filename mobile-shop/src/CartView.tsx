import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CartLine, productImageUrl } from './api';
import { Button, Field, palette } from './ShopComponents';

type Props = {
  cart: CartLine[];
  storageBaseUrl: string;
  totalLabel: string;
  freeOrder: boolean;
  customerName: string;
  customerEmail: string;
  busy: boolean;
  error: string;
  pendingPayment: boolean;
  drawer?: boolean;
  onName: (value: string) => void;
  onEmail: (value: string) => void;
  onQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  onConfirmPayment: () => void;
  onShop: () => void;
  onBack: () => void;
};

export function CartView(props: Props) {
  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, props.drawer && styles.drawerContent]} keyboardShouldPersistTaps="handled">
      {!props.drawer ? <Pressable onPress={props.onBack} style={styles.backButton}><Text style={styles.backText}>‹  Continue shopping</Text></Pressable> : null}
      {!props.drawer ? <Text style={styles.heading}>Your bag</Text> : null}
      {!props.cart.length ? (
        <View style={styles.empty}>
          <Text style={styles.emptyMark}>＋</Text>
          <Text style={styles.emptyTitle}>Your bag is empty</Text>
          <Text style={styles.emptyCopy}>Find a resource for your next chapter.</Text>
          <Button title="Browse the shop" compact onPress={props.onShop} />
        </View>
      ) : <>
        {props.cart.map(({ product, quantity }) => {
          const cover = productImageUrl(product.cover, props.storageBaseUrl);
          return <View key={product.id} style={styles.line}>
            <View style={styles.thumb}>{cover ? <Image source={{ uri: cover }} style={styles.thumbImage} resizeMode="cover" /> : <Text style={styles.thumbLetter}>{product.title.slice(0, 1)}</Text>}</View>
            <View style={styles.lineBody}>
              <Text numberOfLines={2} style={styles.lineTitle}>{product.title}</Text>
              <Text style={styles.linePrice}>{product.isFree ? 'Free' : `${product.currency} ${product.price.toLocaleString()}`}</Text>
              <View style={styles.quantityRow}>
                <Pressable onPress={() => props.onQuantity(product.id, -1)} style={styles.quantityButton}><Text style={styles.quantityButtonText}>−</Text></Pressable>
                <Text style={styles.quantity}>{quantity}</Text>
                <Pressable onPress={() => props.onQuantity(product.id, 1)} style={styles.quantityButton}><Text style={styles.quantityButtonText}>＋</Text></Pressable>
                <Pressable onPress={() => props.onRemove(product.id)} style={styles.remove}><Text style={styles.removeText}>Remove</Text></Pressable>
              </View>
            </View>
          </View>;
        })}
        <View style={styles.totalRow}><Text style={styles.totalLabel}>Total</Text><Text style={styles.total}>{props.totalLabel}</Text></View>
        <Text style={styles.secureNote}>{props.freeOrder ? 'Free delivery by email' : 'Secure payment by Paystack'}</Text>
        <View style={styles.form}>
          <Text style={styles.formHeading}>Delivery details</Text>
          <Field label="Full name" value={props.customerName} onChangeText={props.onName} placeholder="Your name" maxLength={120} />
          <Field label="Email address" value={props.customerEmail} onChangeText={props.onEmail} placeholder="you@example.com" keyboardType="email-address" maxLength={254} />
          {props.error ? <Text style={styles.error}>{props.error}</Text> : null}
          {!props.drawer && props.pendingPayment ? <Button title={props.busy ? 'Checking…' : 'Check payment'} secondary disabled={props.busy} onPress={props.onConfirmPayment} /> : null}
          {!props.drawer ? <Button title={props.busy ? 'Please wait…' : props.freeOrder ? 'Request free product' : `Pay ${props.totalLabel}`} disabled={props.busy} onPress={props.onCheckout} /> : null}
          <Text style={styles.deliveryNote}>Digital products are delivered to your email after the order is confirmed.</Text>
        </View>
      </>}
      </ScrollView>
      {props.drawer && props.cart.length ? <View style={styles.stickyFooter}>
        {props.pendingPayment ? <Button title={props.busy ? 'Checking…' : 'Check payment'} secondary compact disabled={props.busy} onPress={props.onConfirmPayment} /> : null}
        <Button title={props.busy ? 'Please wait…' : props.freeOrder ? 'Request free product' : `Pay ${props.totalLabel}`} disabled={props.busy} onPress={props.onCheckout} />
      </View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 19, paddingBottom: 24 },
  drawerContent: { flexGrow: 1, paddingTop: 7, paddingBottom: 14 },
  stickyFooter: { paddingHorizontal: 18, paddingTop: 9, paddingBottom: 12, borderTopWidth: 1, borderColor: palette.line, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: palette.white },
  heading: { color: palette.ink, fontSize: 26, fontWeight: '900' },
  backButton: { marginBottom: 12 },
  backText: { color: palette.green, fontSize: 12, fontWeight: '800' },
  empty: { minHeight: 300, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyMark: { width: 58, height: 58, borderRadius: 29, overflow: 'hidden', backgroundColor: palette.greenWash, color: palette.green, fontSize: 34, lineHeight: 58, textAlign: 'center' },
  emptyTitle: { color: palette.ink, fontSize: 18, fontWeight: '900' },
  emptyCopy: { color: palette.muted, fontSize: 12, textAlign: 'center' },
  line: { marginTop: 13, paddingVertical: 13, borderBottomWidth: 1, borderColor: palette.line, flexDirection: 'row', gap: 12 },
  thumb: { width: 72, height: 82, overflow: 'hidden', borderRadius: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.greenWash },
  thumbImage: { width: '100%', height: '100%' },
  thumbLetter: { color: palette.green, fontSize: 25, fontWeight: '900' },
  lineBody: { flex: 1, justifyContent: 'center' },
  lineTitle: { color: palette.ink, fontSize: 12, lineHeight: 17, fontWeight: '800' },
  linePrice: { marginTop: 4, color: palette.green, fontSize: 11, fontWeight: '900' },
  quantityRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 9 },
  quantityButton: { width: 28, height: 28, borderWidth: 1, borderColor: palette.line, borderRadius: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.white },
  quantityButtonText: { color: palette.ink, fontSize: 16, fontWeight: '800' },
  quantity: { minWidth: 14, color: palette.ink, fontSize: 12, fontWeight: '800', textAlign: 'center' },
  remove: { marginLeft: 'auto', padding: 5 },
  removeText: { color: palette.red, fontSize: 10, fontWeight: '700' },
  totalRow: { marginTop: 18, flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { color: palette.ink, fontSize: 14, fontWeight: '800' },
  total: { color: palette.darkGreen, fontSize: 16, fontWeight: '900' },
  secureNote: { marginTop: 6, color: palette.muted, fontSize: 10 },
  form: { marginTop: 12 },
  formHeading: { marginBottom: 3, color: palette.ink, fontSize: 16, fontWeight: '900' },
  error: { marginTop: 10, color: palette.red, fontSize: 11, lineHeight: 17 },
  deliveryNote: { marginTop: 9, color: palette.muted, fontSize: 9, lineHeight: 14, textAlign: 'center' },
});
