import { useState } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CartLine, DeliveryAddress, formatPrice, productImageUrl } from './api';
import { Button, palette } from './ShopComponents';

export type CheckoutPaymentMethod = 'card' | 'bank_transfer';

type Props = {
  cart: CartLine[];
  storageBaseUrl: string;
  totalLabel: string;
  freeOrder: boolean;
  customerName: string;
  customerEmail: string;
  deliveryAddress: DeliveryAddress | null;
  busy: boolean;
  error: string;
  pendingPayment: boolean;
  onName: (value: string) => void;
  onEmail: (value: string) => void;
  onManageAddress: () => void;
  onQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onBack: () => void;
  onPlaceOrder: (paymentMethod: CheckoutPaymentMethod) => void;
  onRequestFreeProduct: () => void;
  onConfirmPayment: () => void;
  onContinueShopping: () => void;
};

function PaymentOption({
  selected,
  disabled = false,
  title,
  detail,
  onPress,
}: {
  selected: boolean;
  disabled?: boolean;
  title: string;
  detail: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.paymentOption, disabled && styles.paymentOptionDisabled]}
    >
      <View style={[styles.radio, selected && styles.radioSelected, disabled && styles.radioDisabled]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
      <View style={styles.paymentCopy}>
        <Text style={[styles.paymentTitle, disabled && styles.disabledText]}>{title}</Text>
        <Text style={styles.paymentDetail}>{detail}</Text>
      </View>
      {title === 'Card' ? <FontAwesome5 name="credit-card" size={16} color={palette.green} /> : null}
      {title === 'Bank transfer' ? <FontAwesome5 name="university" size={16} color={palette.green} /> : null}
    </Pressable>
  );
}

export function CheckoutView({
  cart,
  storageBaseUrl,
  totalLabel,
  freeOrder,
  customerName,
  customerEmail,
  deliveryAddress,
  busy,
  error,
  pendingPayment,
  onName,
  onEmail,
  onManageAddress,
  onQuantity,
  onRemove,
  onBack,
  onPlaceOrder,
  onRequestFreeProduct,
  onConfirmPayment,
  onContinueShopping,
}: Props) {
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>('card');
  const [editingDelivery, setEditingDelivery] = useState(!customerName.trim() || !customerEmail.trim());
  const itemCount = cart.reduce((count, line) => count + line.quantity, 0);
  const deliveryReady = Boolean(customerName.trim() && customerEmail.trim());

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to shop" onPress={onBack} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={17} color={palette.darkGreen} />
        </Pressable>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {cart.length ? <View style={styles.card}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Delivery details</Text>
            <Pressable accessibilityRole="button" onPress={() => setEditingDelivery((editing) => !editing)}>
              <Text style={styles.editText}>{editingDelivery ? 'Done' : 'Edit'}</Text>
            </Pressable>
          </View>
          <View style={styles.deliverySummary}>
            <View style={styles.deliveryIcon}><FontAwesome5 name="envelope" size={16} color={palette.green} /></View>
            {editingDelivery ? (
              <View style={styles.deliveryFields}>
                <TextInput
                  accessibilityLabel="Full name for digital delivery"
                  autoCapitalize="words"
                  autoComplete="name"
                  maxLength={120}
                  onChangeText={onName}
                  placeholder="Full name"
                  placeholderTextColor={palette.muted}
                  style={styles.input}
                  value={customerName}
                />
                <TextInput
                  accessibilityLabel="Email address for digital delivery"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  maxLength={254}
                  onChangeText={onEmail}
                  placeholder="Email for book delivery"
                  placeholderTextColor={palette.muted}
                  style={styles.input}
                  value={customerEmail}
                />
              </View>
            ) : (
              <View style={styles.deliveryCopy}>
                <Text numberOfLines={1} style={styles.deliveryName}>{customerName}</Text>
                <Text numberOfLines={1} style={styles.deliveryEmail}>{customerEmail}</Text>
              </View>
            )}
          </View>
          <Text style={styles.deliveryHint}>Your books and order confirmation will be sent to this email address.</Text>
          {!deliveryReady && !editingDelivery ? <Text style={styles.validationHint}>Add a name and email to continue.</Text> : null}
          <View style={styles.savedAddress}>
            <View style={styles.sectionHeading}>
              <Text style={styles.addressTitle}>Saved delivery address</Text>
              <Pressable accessibilityRole="button" onPress={onManageAddress}>
                <Text style={styles.editText}>{deliveryAddress ? 'Change' : 'Add address'}</Text>
              </Pressable>
            </View>
            {deliveryAddress ? (
              <Text style={styles.deliveryHint}>
                {[deliveryAddress.addressLine1, deliveryAddress.addressLine2, deliveryAddress.city, deliveryAddress.state, deliveryAddress.postalCode, deliveryAddress.country].filter(Boolean).join(', ')}
              </Text>
            ) : <Text style={styles.deliveryHint}>Add an address to keep it saved on your profile for future checkouts.</Text>}
          </View>
        </View> : null}

        {cart.length && !freeOrder ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Payment method</Text>
            <View style={styles.paymentList}>
              <PaymentOption
                selected={paymentMethod === 'card'}
                title="Card"
                detail="Secure card payment through Paystack"
                onPress={() => setPaymentMethod('card')}
              />
              <PaymentOption
                selected={paymentMethod === 'bank_transfer'}
                title="Bank transfer"
                detail="Complete a secure transfer through Paystack"
                onPress={() => setPaymentMethod('bank_transfer')}
              />
              <PaymentOption
                selected={false}
                disabled
                title="Pay on delivery"
                detail="Not available for digital books"
              />
            </View>
            <View style={styles.secureNote}>
              <FontAwesome5 name="lock" size={12} color={palette.green} />
              <Text style={styles.secureText}>Payment details are handled securely by Paystack.</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Order summary</Text>
          {cart.length ? <>
            <Text style={styles.itemCount}>{itemCount} {itemCount === 1 ? 'item' : 'items'}</Text>
            <View style={styles.orderItems}>
            {cart.map(({ product, quantity }) => {
              const imageUrl = productImageUrl(product.cover, storageBaseUrl);
              const lineTotal = formatPrice({
                ...product,
                price: product.price * quantity,
              });
              return (
                <View key={product.id} style={styles.orderItem}>
                  <View style={styles.productImage}>
                    {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" /> : <FontAwesome5 name="book-open" size={16} color={palette.green} />}
                  </View>
                  <View style={styles.itemCopy}>
                    <Text numberOfLines={2} style={styles.itemTitle}>{product.title}</Text>
                    <View style={styles.quantityRow}>
                      <Pressable accessibilityRole="button" accessibilityLabel={`Decrease ${product.title} quantity`} onPress={() => onQuantity(product.id, -1)} style={styles.quantityButton}>
                        <Text style={styles.quantityButtonText}>−</Text>
                      </Pressable>
                      <Text style={styles.itemQuantity}>Qty {quantity}</Text>
                      <Pressable accessibilityRole="button" accessibilityLabel={`Increase ${product.title} quantity`} onPress={() => onQuantity(product.id, 1)} style={styles.quantityButton}>
                        <Text style={styles.quantityButtonText}>＋</Text>
                      </Pressable>
                    </View>
                  </View>
                  <View style={styles.itemActions}>
                    <Text style={styles.itemPrice}>{lineTotal}</Text>
                    <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${product.title} from order`} onPress={() => onRemove(product.id)}>
                      <Text style={styles.removeText}>Remove</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.total}>{totalLabel}</Text>
            </View>
            <Text style={styles.taxNote}>Digital delivery by email · No shipping fees</Text>
          </> : <View style={styles.emptyState}>
            <FontAwesome5 name="shopping-bag" size={23} color={palette.green} />
            <Text style={styles.emptyTitle}>Your bag is empty</Text>
            <Text style={styles.taxNote}>Browse available books and add one to continue.</Text>
          </View>}
        </View>

        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        {pendingPayment ? (
          <Button title={busy ? 'Checking payment…' : 'Check payment'} secondary disabled={busy} onPress={onConfirmPayment} />
        ) : null}
        {cart.length ? (
          <Button
            title={busy ? 'Please wait…' : freeOrder ? 'Place free order' : 'Place order'}
            disabled={busy}
            onPress={freeOrder ? onRequestFreeProduct : () => onPlaceOrder(paymentMethod)}
          />
        ) : <Button title="Browse books" onPress={onContinueShopping} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f7f5fc' },
  header: { height: 54, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: palette.white },
  backButton: { width: 32, height: 38, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: palette.ink, fontSize: 18, fontWeight: '900' },
  scrollContent: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 14, paddingTop: 10, paddingBottom: 12, gap: 10 },
  card: { padding: 14, borderWidth: 1, borderColor: '#ebe7f1', borderRadius: 14, backgroundColor: palette.white, shadowColor: '#261342', shadowOpacity: 0.04, shadowRadius: 9, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: palette.ink, fontSize: 14, fontWeight: '900' },
  editText: { color: palette.green, fontSize: 11, fontWeight: '900' },
  deliverySummary: { marginTop: 10, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  deliveryIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.greenWash },
  deliveryFields: { flex: 1, gap: 7 },
  input: { minHeight: 38, paddingHorizontal: 10, borderWidth: 1, borderColor: palette.line, borderRadius: 8, color: palette.ink, backgroundColor: '#fff', fontSize: 11 },
  deliveryCopy: { flex: 1, paddingTop: 2, gap: 3 },
  deliveryName: { color: palette.ink, fontSize: 11, fontWeight: '800' },
  deliveryEmail: { color: palette.muted, fontSize: 10 },
  deliveryHint: { marginTop: 8, color: palette.muted, fontSize: 9, lineHeight: 13 },
  savedAddress: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderColor: palette.line },
  addressTitle: { color: palette.ink, fontSize: 11, fontWeight: '800' },
  validationHint: { marginTop: 5, color: palette.red, fontSize: 10 },
  paymentList: { marginTop: 8, gap: 6 },
  paymentOption: { minHeight: 48, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: palette.line, borderRadius: 9, flexDirection: 'row', alignItems: 'center', gap: 10 },
  paymentOptionDisabled: { backgroundColor: '#f8f7fa' },
  radio: { width: 17, height: 17, borderWidth: 1.5, borderColor: '#a69bb9', borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: palette.green },
  radioDisabled: { borderColor: '#d4cfda' },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.green },
  paymentCopy: { flex: 1 },
  paymentTitle: { color: palette.ink, fontSize: 10, fontWeight: '800' },
  paymentDetail: { marginTop: 2, color: palette.muted, fontSize: 8 },
  disabledText: { color: '#aaa4b1' },
  secureNote: { marginTop: 9, flexDirection: 'row', alignItems: 'center', gap: 7 },
  secureText: { flex: 1, color: palette.muted, fontSize: 9 },
  itemCount: { marginTop: 4, color: palette.muted, fontSize: 9 },
  orderItems: { marginTop: 5, borderTopWidth: 1, borderColor: palette.line },
  orderItem: { minHeight: 48, paddingVertical: 6, borderBottomWidth: 1, borderColor: palette.line, flexDirection: 'row', alignItems: 'center', gap: 8 },
  productImage: { width: 34, height: 40, overflow: 'hidden', borderRadius: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.greenWash },
  image: { width: '100%', height: '100%' },
  itemCopy: { flex: 1, minWidth: 0 },
  itemTitle: { color: palette.ink, fontSize: 9, lineHeight: 12, fontWeight: '800' },
  quantityRow: { marginTop: 3, flexDirection: 'row', alignItems: 'center', gap: 6 },
  quantityButton: { width: 20, height: 20, borderWidth: 1, borderColor: palette.line, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  quantityButtonText: { color: palette.ink, fontSize: 11, fontWeight: '800' },
  itemQuantity: { color: palette.muted, fontSize: 8 },
  itemActions: { minWidth: 48, alignItems: 'flex-end', gap: 6 },
  itemPrice: { color: palette.ink, fontSize: 9, fontWeight: '800' },
  removeText: { color: palette.red, fontSize: 8, fontWeight: '800' },
  totalRow: { marginTop: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { color: palette.ink, fontSize: 12, fontWeight: '900' },
  total: { color: palette.darkGreen, fontSize: 14, fontWeight: '900' },
  taxNote: { marginTop: 4, color: palette.muted, fontSize: 8 },
  error: { paddingHorizontal: 4, color: palette.red, fontSize: 10, lineHeight: 15 },
  emptyState: { minHeight: 120, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyTitle: { color: palette.ink, fontSize: 13, fontWeight: '900' },
  footer: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10, borderTopWidth: 1, borderColor: palette.line, backgroundColor: palette.white, gap: 7 },
});
