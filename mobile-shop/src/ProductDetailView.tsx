import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { productAvailability, productImageUrl, Product, Rating } from './api';
import { Button, Field, getTapPoint, palette, registerShopThemeStyles, Stars, TapPoint } from './ShopComponents';

export type ProductMetrics = { views?: number; completedOrders?: number; notified?: number; hasReleaseDate?: boolean };

type Props = {
  product: Product;
  storageBaseUrl: string;
  metrics: ProductMetrics | null;
  ratings: Rating[];
  loading: boolean;
  ratingValue: number;
  ratingName: string;
  ratingEmail: string;
  ratingComment: string;
  ratingBusy: boolean;
  cartCount: number;
  isFavorite: boolean;
  onBack: () => void;
  onCart: () => void;
  onAdd: (point: TapPoint) => void;
  onBuyNow: (point: TapPoint) => void;
  onShare: () => void;
  onToggleFavorite: () => void;
  onChat: () => void;
  onRatingValue: (value: number) => void;
  onRatingName: (value: string) => void;
  onRatingEmail: (value: string) => void;
  onRatingComment: (value: string) => void;
  onSubmitRating: () => void;
};

export function ProductDetailView(props: Props) {
  const { product } = props;
  const availability = productAvailability(product);
  const average = props.ratings.length
    ? props.ratings.reduce((sum, item) => sum + Number(item.rating || 0), 0) / props.ratings.length
    : product.rating;
  const cover = productImageUrl(product.cover, props.storageBaseUrl);
  const disabled = availability.reason === 'closed' || !product.inStock || product.stockCount <= 0;
  const actionLabel = availability.reason === 'not-released' ? 'Notify me' : disabled ? 'Unavailable' : 'Add to Cart';
  const hasDiscount = !product.isFree && product.originalPrice != null && product.originalPrice > product.price;
  const discountPercent = hasDiscount ? Math.round((1 - product.price / product.originalPrice!) * 100) : 0;

  return (
    <View style={[styles.screen, { backgroundColor: palette.paper }]}>
      <View style={styles.detailTopBar}>
        <Pressable onPress={props.onBack} style={styles.headerAction} accessibilityRole="button" accessibilityLabel="Back to books">
          <FontAwesome5 name="arrow-left" size={15} color={palette.ink} />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable onPress={props.onShare} style={styles.headerAction} accessibilityRole="button" accessibilityLabel={`Share ${product.title}`}>
            <FontAwesome5 name="share-alt" size={15} color={palette.ink} />
          </Pressable>
          <Pressable onPress={props.onToggleFavorite} style={styles.headerAction} accessibilityRole="button" accessibilityLabel={props.isFavorite ? 'Remove from favorites' : 'Add to favorites'} accessibilityState={{ selected: props.isFavorite }}>
            <FontAwesome5 name="heart" size={16} color={props.isFavorite ? palette.orange : palette.ink} solid={props.isFavorite} />
          </Pressable>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.coverWrap}>
          {cover ? <Image source={{ uri: cover }} style={styles.cover} resizeMode="contain" /> : <View style={styles.coverFallback}><Text style={styles.fallbackCategory}>{product.category}</Text><Text style={styles.fallbackTitle}>{product.title}</Text><Text style={styles.fallbackBrand}>PAZ THRIVING TRIBE</Text></View>}
        </View>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.title}>{product.title}</Text>
        {product.vendorName ? <Text style={styles.author}>by {product.vendorName}</Text> : null}
        <View style={styles.ratingRow}><Stars rating={average} size={16} /><Text style={styles.ratingText}>{average ? `${average.toFixed(1)}/5 · ${props.ratings.length || product.reviews} reviews` : 'No ratings yet'}</Text></View>
        <View style={styles.priceRow}>
          <View style={styles.priceGroup}>
            <Text style={styles.price}>{product.isFree ? 'Free' : `${product.currency} ${product.price.toLocaleString()}`}</Text>
            {hasDiscount && product.originalPrice != null ? <Text style={styles.originalPrice}>{`${product.currency} ${product.originalPrice.toLocaleString()}`}</Text> : null}
          </View>
          {hasDiscount ? <Text style={styles.discountBadge}>{discountPercent}% OFF</Text> : <Text style={styles.stock}>{product.inStock && product.stockCount > 0 ? 'In stock' : 'Out of stock'}</Text>}
        </View>
        <View style={styles.deliveryMeta}>
          <View style={styles.deliveryMetaItem}><FontAwesome5 name="download" size={11} color={palette.green} /><Text style={styles.deliveryMetaText}>Instant download</Text></View>
          <View style={styles.deliveryMetaItem}><FontAwesome5 name="file-alt" size={11} color={palette.green} /><Text style={styles.deliveryMetaText}>{product.fileFormats.length ? product.fileFormats.join(', ') : 'Digital file'}</Text></View>
        </View>
        <View style={styles.purchaseActions}>
          <Button title={actionLabel} disabled={disabled} onPress={(event) => props.onAdd(getTapPoint(event))} />
          <Button title="Buy Now" secondary disabled={disabled} onPress={(event) => props.onBuyNow(getTapPoint(event))} />
        </View>
        {props.metrics ? <View style={styles.metricsRow}>
          <Metric label="Viewed" value={props.metrics.views || 0} />
          <Metric label="Orders" value={props.metrics.completedOrders || 0} />
          {props.metrics.hasReleaseDate ? <Metric label="Notify signups" value={props.metrics.notified || 0} /> : null}
        </View> : null}
        {product.vendorName ? <Text style={styles.vendor}>Published by {product.vendorName}</Text> : null}
        <Text style={styles.sectionTitle}>About this product</Text>
        <Text style={styles.description}>{product.description || 'A digital resource from PAZ Thriving Tribe.'}</Text>
        <View style={styles.deliveryNote}><Text style={styles.deliveryHeading}>Email delivery</Text><Text style={styles.deliveryCopy}>{product.isFree ? 'Request a free copy and we’ll send it to your email.' : 'After payment is confirmed, your digital file is sent to your email.'}</Text></View>
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Ratings & reviews</Text><Text style={styles.reviewCount}>{props.ratings.length} reviews</Text></View>
        <View style={styles.starPicker}>{[1, 2, 3, 4, 5].map((value) => <Pressable key={value} onPress={() => props.onRatingValue(value)} hitSlop={4}><Text style={[styles.pickStar, value <= props.ratingValue && styles.pickStarActive]}>★</Text></Pressable>)}</View>
        <Field label="Your name" value={props.ratingName} onChangeText={props.onRatingName} placeholder="Name" maxLength={120} />
        <Field label="Email (optional)" value={props.ratingEmail} onChangeText={props.onRatingEmail} placeholder="Email address" keyboardType="email-address" maxLength={254} />
        <Field label="Review (optional)" value={props.ratingComment} onChangeText={props.onRatingComment} placeholder="Share a short review" multiline maxLength={3000} />
        <Button title={props.ratingBusy ? 'Saving…' : 'Submit rating'} disabled={props.ratingBusy} onPress={props.onSubmitRating} />
        {props.loading ? <ActivityIndicator color={palette.green} style={styles.loading} /> : props.ratings.slice(0, 10).map((rating) => (
          <View key={rating.id} style={styles.review}>
            <View style={styles.reviewHeader}><Text style={styles.reviewer}>{rating.reviewer_name}</Text><Stars rating={Number(rating.rating)} size={12} /></View>
            {rating.comment ? <Text style={styles.reviewBody}>{rating.comment}</Text> : null}
            <Text style={styles.reviewDate}>{rating.created_at ? new Date(rating.created_at).toLocaleDateString() : ''}</Text>
          </View>
        ))}
        <View style={styles.chatCard}>
          <Text style={styles.chatKicker}>PRODUCT QUESTIONS</Text>
          <Text style={styles.chatTitle}>Talk to the PAZ team</Text>
          <Text style={styles.chatCopy}>Ask a question about this product or continue an existing conversation.</Text>
          <Button title="Message about this product" secondary onPress={props.onChat} />
        </View>
      </ScrollView>
      <Pressable accessibilityRole="button" accessibilityLabel={`Open cart, ${props.cartCount} items`} onPress={props.onCart} style={styles.cartFloatingButton}>
        <FontAwesome5 name="shopping-cart" size={15} color={palette.white} />
        <Text style={styles.cartFloatingText}>{props.cartCount}</Text>
      </Pressable>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{Number(value).toLocaleString()}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

function createStyles() {
  return StyleSheet.create({
  screen: { flex: 1 },
  detailTopBar: { height: 42, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: palette.white },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  headerAction: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 18, paddingTop: 2, paddingBottom: 30 },
  coverWrap: { height: 210, overflow: 'hidden', borderRadius: 8, backgroundColor: palette.greenWash },
  cover: { width: '100%', height: '100%' },
  coverFallback: { flex: 1, justifyContent: 'space-between', padding: 18, backgroundColor: palette.actionGreen },
  fallbackCategory: { color: palette.white, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  fallbackTitle: { color: palette.white, fontSize: 23, lineHeight: 28, fontWeight: '900' },
  fallbackBrand: { color: palette.white, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  category: { marginTop: 10, color: palette.green, fontSize: 9, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase' },
  title: { marginTop: 4, color: palette.ink, fontSize: 21, lineHeight: 26, fontWeight: '900' },
  author: { marginTop: 2, color: palette.muted, fontSize: 11, fontWeight: '700' },
  ratingRow: { marginTop: 9, flexDirection: 'row', alignItems: 'center', gap: 7 },
  ratingText: { color: palette.muted, fontSize: 10 },
  priceRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceGroup: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  price: { color: palette.green, fontSize: 19, fontWeight: '900' },
  originalPrice: { color: palette.muted, fontSize: 12, textDecorationLine: 'line-through' },
  discountBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12, color: palette.orange, backgroundColor: palette.orangeWash, fontSize: 8, fontWeight: '900' },
  stock: { color: palette.green, fontSize: 9, fontWeight: '800' },
  deliveryMeta: { marginTop: 9, flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  deliveryMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  deliveryMetaText: { color: palette.muted, fontSize: 9, fontWeight: '700' },
  purchaseActions: { marginTop: 15, gap: 9 },
  metricsRow: { paddingVertical: 12, borderBottomWidth: 1, borderColor: palette.line, flexDirection: 'row', justifyContent: 'space-around' },
  metric: { alignItems: 'center' },
  metricValue: { color: palette.ink, fontSize: 15, fontWeight: '900' },
  metricLabel: { marginTop: 2, color: palette.muted, fontSize: 9 },
  vendor: { marginTop: 11, color: palette.muted, fontSize: 11 },
  sectionTitle: { marginTop: 19, marginBottom: 7, color: palette.ink, fontSize: 16, fontWeight: '900' },
  description: { color: palette.ink, fontSize: 13, lineHeight: 21 },
  deliveryNote: { marginTop: 15, padding: 13, borderLeftWidth: 3, borderLeftColor: palette.orange, backgroundColor: palette.orangeWash },
  deliveryHeading: { color: palette.ink, fontSize: 11, fontWeight: '900' },
  deliveryCopy: { marginTop: 4, color: palette.muted, fontSize: 11, lineHeight: 17 },
  sectionHeader: { marginTop: 16, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  reviewCount: { color: palette.muted, fontSize: 10 },
  starPicker: { marginTop: 4, marginBottom: 8, flexDirection: 'row', gap: 4 },
  pickStar: { color: palette.line, fontSize: 29 },
  pickStarActive: { color: palette.gold },
  loading: { marginVertical: 15 },
  review: { marginTop: 11, paddingTop: 10, borderTopWidth: 1, borderColor: palette.line },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reviewer: { color: palette.ink, fontSize: 11, fontWeight: '800' },
  reviewBody: { marginTop: 5, color: palette.ink, fontSize: 11, lineHeight: 17 },
  reviewDate: { marginTop: 4, color: palette.muted, fontSize: 9 },
  chatCard: { marginTop: 19, padding: 14, borderWidth: 1, borderColor: palette.line, borderRadius: 8, backgroundColor: palette.white },
  chatKicker: { color: palette.orange, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  chatTitle: { marginTop: 4, color: palette.ink, fontSize: 16, fontWeight: '900' },
  chatCopy: { marginTop: 5, marginBottom: 10, color: palette.muted, fontSize: 11, lineHeight: 17 },
  cartFloatingButton: { position: 'absolute', right: 15, bottom: 15, width: 40, height: 40, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: palette.actionGreen, elevation: 3 },
  cartFloatingText: { color: palette.white, fontSize: 9, fontWeight: '900' },
  });
}

let styles = createStyles();
registerShopThemeStyles(() => { styles = createStyles(); });
