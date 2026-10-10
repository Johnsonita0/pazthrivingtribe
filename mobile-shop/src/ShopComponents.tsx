import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Rect, Stop } from 'react-native-svg';
import { formatPrice, Product, productAvailability, productImageUrl } from './api';

export type TapPoint = { x: number; y: number };

export function getTapPoint(event: GestureResponderEvent): TapPoint {
  return { x: event.nativeEvent.pageX, y: event.nativeEvent.pageY };
}

type ShopPalette = {
  ink: string;
  muted: string;
  green: string;
  darkGreen: string;
  actionGreen: string;
  greenWash: string;
  orange: string;
  orangeWash: string;
  blue: string;
  actionBlue: string;
  blueWash: string;
  gold: string;
  paper: string;
  white: string;
  line: string;
  red: string;
};

export type ShopThemeName = 'sage' | 'sky' | 'sunshine' | 'peach' | 'teal' | 'dark';

export function isShopThemeName(value: string | null): value is ShopThemeName {
  return value !== null && Object.prototype.hasOwnProperty.call(SHOP_THEMES, value);
}

export const SHOP_THEMES: Record<ShopThemeName, { label: string; colors: ShopPalette }> = {
  sage: {
    label: 'Sage',
    colors: {
      ink: '#2e2a26', muted: '#665f5a', green: '#417e6c', darkGreen: '#356656', actionGreen: '#417e6c',
      greenWash: '#e7f2ee', orange: '#f1a27a', orangeWash: '#fbede6',
      blue: '#638fbd', actionBlue: '#426b90', blueWash: '#eaf1f8', gold: '#a18a2e',
      paper: '#f7f2ec', white: '#fffdfb', line: '#eadfd5', red: '#bd3157',
    },
  },
  sky: {
    label: 'Sky',
    colors: {
      ink: '#2e2a26', muted: '#665f5a', green: '#4c7299', darkGreen: '#385977', actionGreen: '#4c7299',
      greenWash: '#eaf1f8', orange: '#a18a2e', orangeWash: '#f8f2df',
      blue: '#638fbd', actionBlue: '#426b90', blueWash: '#eaf1f8', gold: '#a18a2e',
      paper: '#f7f2ec', white: '#fffdfb', line: '#eadfd5', red: '#bd3157',
    },
  },
  sunshine: {
    label: 'Sunshine',
    colors: {
      ink: '#2e2a26', muted: '#665f5a', green: '#76651f', darkGreen: '#584b19', actionGreen: '#76651f',
      greenWash: '#f5f0db', orange: '#638fbd', orangeWash: '#eaf1f8',
      blue: '#638fbd', actionBlue: '#426b90', blueWash: '#eaf1f8', gold: '#a18a2e',
      paper: '#f7f2ec', white: '#fffdfb', line: '#eadfd5', red: '#bd3157',
    },
  },
  peach: {
    label: 'Peach',
    colors: {
      ink: '#2e2a26', muted: '#665f5a', green: '#995c40', darkGreen: '#75452f', actionGreen: '#995c40',
      greenWash: '#fbede6', orange: '#4b9991', orangeWash: '#e8f5f3',
      blue: '#638fbd', actionBlue: '#426b90', blueWash: '#eaf1f8', gold: '#a18a2e',
      paper: '#f7f2ec', white: '#fffdfb', line: '#eadfd5', red: '#bd3157',
    },
  },
  teal: {
    label: 'Teal',
    colors: {
      ink: '#2e2a26', muted: '#665f5a', green: '#347a74', darkGreen: '#265e59', actionGreen: '#347a74',
      greenWash: '#e8f5f3', orange: '#638fbd', orangeWash: '#eaf1f8',
      blue: '#638fbd', actionBlue: '#2c6661', blueWash: '#eaf1f8', gold: '#a18a2e',
      paper: '#f7f2ec', white: '#fffdfb', line: '#eadfd5', red: '#bd3157',
    },
  },
  dark: {
    label: 'Dark mode',
    colors: {
      ink: '#f7f2ec', muted: '#c0b8af', green: '#63d59c', darkGreen: '#c6eedb', actionGreen: '#277d5a',
      greenWash: '#293f34', orange: '#ffb27a', orangeWash: '#3d302a',
      blue: '#80c6ff', actionBlue: '#346f9f', blueWash: '#263e54', gold: '#ffd45c',
      paper: '#171613', white: '#24211e', line: '#403a33', red: '#ff9b9b',
    },
  },
};

export const palette: ShopPalette = { ...SHOP_THEMES.sage.colors };

const themeStyleRefreshers = new Set<() => void>();

export function registerShopThemeStyles(refresh: () => void) {
  themeStyleRefreshers.add(refresh);
}

export function setShopTheme(theme: ShopThemeName) {
  Object.assign(palette, SHOP_THEMES[theme].colors);
  themeStyleRefreshers.forEach((refresh) => refresh());
}

export function ShopGradient({ opacity = 1 }: { opacity?: number }) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity }]}>
      <Svg width="100%" height="100%">
        <Defs>
          <SvgLinearGradient id="paz-shop-gradient" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={palette.actionGreen} />
            <Stop offset="1" stopColor={palette.actionBlue} />
          </SvgLinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#paz-shop-gradient)" />
      </Svg>
    </View>
  );
}

export function Button({ title, onPress, disabled = false, secondary = false, compact = false, fill = false }: {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
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
      style={({ pressed }) => [styles.button, compact && styles.buttonCompact, fill && styles.buttonFill, secondary && styles.buttonSecondary, !disabled && (secondary ? { borderColor: palette.green, backgroundColor: palette.white } : { backgroundColor: palette.actionGreen }), disabled && { backgroundColor: palette.line }, pressed && !disabled && styles.pressed]}
    >
      {!disabled && !secondary ? <ShopGradient /> : null}
      <Text style={[styles.buttonText, secondary && styles.buttonSecondaryText, secondary && !disabled && { color: palette.darkGreen }, disabled && { color: palette.muted }]}>{title}</Text>
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
        placeholderTextColor={palette.muted}
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
  return <Text style={{ color: palette.gold, fontSize: size }}>{'★'.repeat(count)}{'☆'.repeat(5 - count)}</Text>;
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
          <View style={[styles.coverPlaceholder, { backgroundColor: palette.actionGreen }]}>
            <Text style={[styles.coverCategory, { color: palette.white }]}>{product.category}</Text>
            <Text numberOfLines={3} style={styles.coverTitle}>{product.title}</Text>
            <Text style={[styles.coverBrand, { color: palette.white }]}>PAZ THRIVING TRIBE</Text>
          </View>
        )}
        {product.releaseEnabled ? <Text style={[styles.releaseBadge, { backgroundColor: palette.orange }]}>{availability.reason === 'not-released' ? 'COMING SOON' : 'NEW RELEASE'}</Text> : null}
      </View>
      <View style={styles.cardBody}>
        <Text numberOfLines={1} style={[styles.category, { color: palette.green }]}>{product.category}</Text>
        <Text numberOfLines={2} style={styles.title}>{product.title}</Text>
        <View style={styles.ratingRow}><Stars rating={product.rating} size={12} /><Text style={styles.ratingText}>{product.rating ? `${product.rating.toFixed(1)} · ${product.reviews || 0}` : 'New'}</Text></View>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(product)}</Text>
          <Text style={[styles.availability, { color: unavailable ? palette.red : palette.green }]}>{unavailable ? 'Unavailable' : 'View'}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function createStyles() {
  return StyleSheet.create({
  button: { alignSelf: 'stretch', minHeight: 48, paddingHorizontal: 16, overflow: 'hidden', borderRadius: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.actionGreen },
  buttonCompact: { flex: 0, minHeight: 38 },
  buttonFill: { flex: 1 },
  buttonSecondary: { borderWidth: 1, borderColor: palette.green, backgroundColor: palette.white },
  buttonDisabled: { backgroundColor: palette.line },
  buttonText: { color: palette.white, fontSize: 13, fontWeight: '900', textAlign: 'center' },
  buttonSecondaryText: { color: palette.darkGreen },
  pressed: { opacity: 0.78 },
  fieldGroup: { marginTop: 10 },
  fieldLabel: { marginBottom: 5, color: palette.ink, fontSize: 11, fontWeight: '800' },
  input: { minHeight: 45, paddingHorizontal: 12, borderWidth: 1, borderColor: palette.line, borderRadius: 6, color: palette.ink, backgroundColor: palette.white, fontSize: 13 },
  multiline: { minHeight: 76, paddingTop: 11, textAlignVertical: 'top' },
  productCard: { width: '48.4%', overflow: 'hidden', borderWidth: 1, borderColor: palette.line, borderRadius: 12, backgroundColor: palette.white },
  imageWrap: { height: 164, position: 'relative', overflow: 'hidden', backgroundColor: palette.greenWash },
  image: { width: '100%', height: '100%' },
  coverPlaceholder: { flex: 1, justifyContent: 'space-between', padding: 13, backgroundColor: palette.actionGreen },
  coverCategory: { color: palette.white, fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  coverTitle: { color: palette.white, fontSize: 16, lineHeight: 20, fontWeight: '900' },
  coverBrand: { color: palette.white, fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  releaseBadge: { position: 'absolute', top: 9, left: 9, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6, backgroundColor: palette.orange, color: '#2e2a26', fontSize: 8, fontWeight: '900' },
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
}

let styles = createStyles();
registerShopThemeStyles(() => { styles = createStyles(); });