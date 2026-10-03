import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { productAvailability, productImageUrl, Product, Rating } from './api';
import { Button, Field, palette, Stars } from './ShopComponents';

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
  onBack: () => void;
  onCart: () => void;
  onAdd: () => void;
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
  const actionLabel = availability.reason === 'not-released' ? 'Notify me' : disabled ? 'Unavailable' : 'Add to bag';

  return (
    <View style={styles.screen}>
      <View style={styles.detailTopBar}>
        <Pressable onPress={props.onBack} style={styles.backButton} accessibilityRole="button"><Text style={styles.backText}>‹  Shop</Text></Pressable>
        <Text style={styles.topBarBrand}>PAZ SHOP</Text>
        <View style={styles.topBarSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.coverWrap}>
          {cover ? <Image source={{ uri: cover }} style={styles.cover} resizeMode="cover" /> : <View style={styles.coverFallback}><Text style={styles.fallbackCategory}>{product.category}</Text><Text style={styles.fallbackTitle}>{product.title}</Text><Text style={styles.fallbackBrand}>PAZ THRIVING TRIBE</Text></View>}
        </View>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.title}>{product.title}</Text>
        <View style={styles.ratingRow}><Stars rating={average} size={16} /><Text style={styles.ratingText}>{average ? `${average.toFixed(1)}/5 · ${props.ratings.length || product.reviews} reviews` : 'No ratings yet'}</Text></View>
        <View style={styles.priceRow}><Text style={styles.price}>{product.isFree ? 'Free' : `${product.currency} ${product.price.toLocaleString()}`}</Text><Text style={styles.stock}>{product.inStock && product.stockCount > 0 ? `${product.stockCount} available` : 'Out of stock'}</Text></View>
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
      <View style={styles.actionBar}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Open bag, ${props.cartCount} items`} onPress={props.onCart} style={styles.bagAction}><Text style={styles.bagActionText}>Bag · {props.cartCount}</Text></Pressable>
        <Button title={actionLabel} disabled={disabled} onPress={props.onAdd} />
      </View>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{Number(value).toLocaleString()}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  detailTopBar: { height: 48, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: palette.darkGreen },
  backButton: { minWidth: 80 },
  backText: { color: palette.white, fontSize: 13, fontWeight: '800' },
  topBarBrand: { color: '#d4e8d8', fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  topBarSpacer: { minWidth: 80 },
  content: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 24 },
  coverWrap: { height: 250, overflow: 'hidden', borderRadius: 8, backgroundColor: '#e5eee6' },
  cover: { width: '100%', height: '100%' },
  coverFallback: { flex: 1, justifyContent: 'space-between', padding: 18, backgroundColor: palette.green },
  fallbackCategory: { color: '#d4e8d8', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  fallbackTitle: { color: palette.white, fontSize: 23, lineHeight: 28, fontWeight: '900' },
  fallbackBrand: { color: '#d4e8d8', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  category: { marginTop: 17, color: palette.green, fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  title: { marginTop: 5, color: palette.ink, fontSize: 25, lineHeight: 30, fontWeight: '900' },
  ratingRow: { marginTop: 9, flexDirection: 'row', alignItems: 'center', gap: 7 },
  ratingText: { color: palette.muted, fontSize: 11 },
  priceRow: { marginTop: 14, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: palette.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { color: palette.darkGreen, fontSize: 20, fontWeight: '900' },
  stock: { color: palette.muted, fontSize: 11, fontWeight: '700' },
  metricsRow: { paddingVertical: 12, borderBottomWidth: 1, borderColor: palette.line, flexDirection: 'row', justifyContent: 'space-around' },
  metric: { alignItems: 'center' },
  metricValue: { color: palette.ink, fontSize: 15, fontWeight: '900' },
  metricLabel: { marginTop: 2, color: palette.muted, fontSize: 9 },
  vendor: { marginTop: 11, color: palette.muted, fontSize: 11 },
  sectionTitle: { marginTop: 19, marginBottom: 7, color: palette.ink, fontSize: 16, fontWeight: '900' },
  description: { color: '#4a5b50', fontSize: 13, lineHeight: 21 },
  deliveryNote: { marginTop: 15, padding: 13, borderLeftWidth: 3, borderLeftColor: palette.orange, backgroundColor: palette.orangeWash },
  deliveryHeading: { color: palette.ink, fontSize: 11, fontWeight: '900' },
  deliveryCopy: { marginTop: 4, color: '#59432e', fontSize: 11, lineHeight: 17 },
  sectionHeader: { marginTop: 16, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  reviewCount: { color: palette.muted, fontSize: 10 },
  starPicker: { marginTop: 4, marginBottom: 8, flexDirection: 'row', gap: 4 },
  pickStar: { color: '#cbd5ce', fontSize: 29 },
  pickStarActive: { color: '#d78622' },
  loading: { marginVertical: 15 },
  review: { marginTop: 11, paddingTop: 10, borderTopWidth: 1, borderColor: palette.line },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reviewer: { color: palette.ink, fontSize: 11, fontWeight: '800' },
  reviewBody: { marginTop: 5, color: '#4a5b50', fontSize: 11, lineHeight: 17 },
  reviewDate: { marginTop: 4, color: palette.muted, fontSize: 9 },
  chatCard: { marginTop: 19, padding: 14, borderWidth: 1, borderColor: palette.line, borderRadius: 8, backgroundColor: palette.white },
  chatKicker: { color: palette.orange, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  chatTitle: { marginTop: 4, color: palette.ink, fontSize: 16, fontWeight: '900' },
  chatCopy: { marginTop: 5, marginBottom: 10, color: palette.muted, fontSize: 11, lineHeight: 17 },
  actionBar: { paddingHorizontal: 15, paddingTop: 9, paddingBottom: 11, borderTopWidth: 1, borderColor: palette.line, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: palette.white },
  bagAction: { minHeight: 47, paddingHorizontal: 15, borderWidth: 1, borderColor: palette.line, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  bagActionText: { color: palette.ink, fontSize: 11, fontWeight: '800' },
});
