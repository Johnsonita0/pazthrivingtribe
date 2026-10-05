import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { formatPrice, Product, productAvailability, productImageUrl } from './api';

export const palette = {
  ink: '#17261d',
  muted: '#66746b',
  green: '#286247',
  darkGreen: '#173f30',
  greenWash: '#eaf1ec',
  orange: '#e9ad62',
  orangeWash: '#fbf2e6',
  paper: '#f7f7f2',
  white: '#ffffff',
  line: '#e4e8e1',
  red: '#ae3c2d',
};

export function Button({ title, onPress, disabled = false, secondary = false, compact = false, fill = false }: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
  compact?: boolean;
  fill?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.button, compact && styles.buttonCompact, fill && styles.buttonFill, secondary && styles.buttonSecondary, disabled && styles.buttonDisabled, pressed && !disabled && styles.pressed]}
    >
      <Text style={[styles.buttonText, secondary && styles.buttonSecondaryText, disabled && styles.buttonDisabledText]}>{title}</Text>
    </Pressable>
  );
}

export function Field({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false, maxLength }: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  multiline?: boolean;
  maxLength?: number;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#87948a"
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        autoCorrect={keyboardType !== 'email-address'}
        multiline={multiline}
        maxLength={maxLength}
        style={[styles.input, multiline && styles.multiline]}
      />
    </View>
  );
}

export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  const count = Math.max(0, Math.min(5, Math.round(rating)));
  return <Text style={{ color: '#d78622', fontSize: size }}>{'★'.repeat(count)}{'☆'.repeat(5 - count)}</Text>;
}

export function ProductCard({ product, storageBaseUrl, onPress }: {
  product: Product;
  storageBaseUrl: string;
  onPress: () => void;
}) {
  const cover = productImageUrl(product.cover, storageBaseUrl);
  const availability = productAvailability(product);
  const unavailable = !availability.available || !product.inStock || product.stockCount <= 0;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${product.title}, ${formatPrice(product)}`} onPress={onPress} style={({ pressed }) => [styles.productCard, pressed && styles.pressed]}>
      <View style={styles.imageWrap}>
        {cover ? <Image source={{ uri: cover }} style={styles.image} resizeMode="cover" /> : (
          <View style={styles.coverPlaceholder}>
            <Text style={styles.coverCategory}>{product.category}</Text>
            <Text numberOfLines={3} style={styles.coverTitle}>{product.title}</Text>
            <Text style={styles.coverBrand}>PAZ THRIVING TRIBE</Text>
          </View>
        )}
        {product.releaseEnabled ? <Text style={styles.releaseBadge}>{availability.reason === 'not-released' ? 'COMING SOON' : 'NEW RELEASE'}</Text> : null}
      </View>
      <View style={styles.cardBody}>
        <Text numberOfLines={1} style={styles.category}>{product.category}</Text>
        <Text numberOfLines={2} style={styles.title}>{product.title}</Text>
        <View style={styles.ratingRow}><Stars rating={product.rating} size={12} /><Text style={styles.ratingText}>{product.rating ? `${product.rating.toFixed(1)} · ${product.reviews || 0}` : 'New'}</Text></View>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(product)}</Text>
          <Text style={[styles.availability, unavailable && styles.unavailable]}>{unavailable ? 'Unavailable' : 'View'}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignSelf: 'stretch', minHeight: 48, paddingHorizontal: 16, borderRadius: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.green },
  buttonCompact: { flex: 0, minHeight: 38 },
  buttonFill: { flex: 1 },
  buttonSecondary: { borderWidth: 1, borderColor: palette.green, backgroundColor: palette.white },
  buttonDisabled: { backgroundColor: '#dce4de' },
  buttonText: { color: palette.white, fontSize: 13, fontWeight: '900', textAlign: 'center' },
  buttonSecondaryText: { color: palette.green },
  buttonDisabledText: { color: '#78847c' },
  pressed: { opacity: 0.78 },
  fieldGroup: { marginTop: 10 },
  fieldLabel: { marginBottom: 5, color: palette.ink, fontSize: 11, fontWeight: '800' },
  input: { minHeight: 45, paddingHorizontal: 12, borderWidth: 1, borderColor: palette.line, borderRadius: 6, color: palette.ink, backgroundColor: palette.white, fontSize: 13 },
  multiline: { minHeight: 76, paddingTop: 11, textAlignVertical: 'top' },
  productCard: { width: '48.4%', overflow: 'hidden', borderWidth: 1, borderColor: palette.line, borderRadius: 12, backgroundColor: palette.white },
  imageWrap: { height: 164, position: 'relative', overflow: 'hidden', backgroundColor: '#edf0e9' },
  image: { width: '100%', height: '100%' },
  coverPlaceholder: { flex: 1, justifyContent: 'space-between', padding: 13, backgroundColor: palette.green },
  coverCategory: { color: '#d4e8d8', fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  coverTitle: { color: palette.white, fontSize: 16, lineHeight: 20, fontWeight: '900' },
  coverBrand: { color: '#d4e8d8', fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  releaseBadge: { position: 'absolute', top: 9, left: 9, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6, backgroundColor: palette.orange, color: palette.ink, fontSize: 8, fontWeight: '900' },
  cardBody: { padding: 11 },
  category: { color: palette.green, fontSize: 8, fontWeight: '900', letterSpacing: 0.55, textTransform: 'uppercase' },
  title: { minHeight: 40, marginTop: 5, color: palette.ink, fontSize: 12, lineHeight: 17, fontWeight: '800' },
  ratingRow: { marginTop: 7, flexDirection: 'row', alignItems: 'center', gap: 5 },
  ratingText: { color: palette.muted, fontSize: 10 },
  priceRow: { marginTop: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { color: palette.ink, fontSize: 13, fontWeight: '900' },
  availability: { color: palette.green, fontSize: 10, fontWeight: '900' },
  unavailable: { color: palette.red },
});