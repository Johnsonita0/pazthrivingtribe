import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ImageBackground, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Product, productImageUrl, SITE_ROOT } from './api';
import { palette, ProductCard } from './ShopComponents';

type Props = {
  products: Product[];
  storageBaseUrl: string;
  categories: string[];
  category: string;
  search: string;
  loading: boolean;
  error: string;
  onCategory: (category: string) => void;
  onSearch: (value: string) => void;
  onOpen: (product: Product) => void;
  onRefresh: () => void;
};

export function CatalogView(props: Props) {
  const [activePromo, setActivePromo] = useState(0);
  const featuredBook = props.products.find((product) => product.title.toLowerCase().includes('fainted'));
  const promos = [
    {
      eyebrow: 'PAZ THRIVING TRIBE',
      title: 'Coaching, mentoring and counselling.',
      copy: 'Soaring with peace, influencing the world.',
      image: `${SITE_ROOT}/logo/logo2.jpeg`,
      action: 'Explore PAZ',
      onPress: () => { props.onSearch(''); props.onCategory('All'); },
    },
    {
      eyebrow: 'FEATURED BOOK',
      title: 'I Fainted! …But I Didn’t Quit!',
      copy: 'A new book from PAZ Thriving Tribe.',
      image: featuredBook ? productImageUrl(featuredBook.cover, props.storageBaseUrl) : 'https://pcprbkqpxntxgtseiyie.supabase.co/storage/v1/object/public/prof-upload/products/covers/1790535861008-ifainted-coveer--1-.png',
      action: 'View book',
      onPress: () => featuredBook ? props.onOpen(featuredBook) : props.onCategory('Ebook'),
    },
    {
      eyebrow: 'POSITIVE VALUES',
      title: 'Building Positive Values.',
      copy: 'Helping you build the values you need to thrive.',
      image: `${SITE_ROOT}/image/pic2.png`,
      action: 'Browse resources',
      onPress: () => Linking.openURL(`${SITE_ROOT}/care-counseling`),
    },
    {
      eyebrow: 'COACHING & MENTORING',
      title: 'Reach your full potential.',
      copy: 'Empowering you with core values to grow.',
      image: `${SITE_ROOT}/image/pic3.png`,
      action: 'Explore coaching',
      onPress: () => Linking.openURL(`${SITE_ROOT}/care-counseling`),
    },
    {
      eyebrow: 'TALK & THRIVE',
      title: 'Need someone to talk to?',
      copy: 'A safe and confidential space where you can talk and be heard.',
      image: `${SITE_ROOT}/image/pic7.png`,
      action: 'Find support',
      onPress: () => Linking.openURL(`${SITE_ROOT}/care-counseling`),
    },
    {
      eyebrow: 'YOUR VOICE MATTERS',
      title: 'Share your feedback.',
      copy: 'Help us celebrate progress and improve the support we offer.',
      image: `${SITE_ROOT}/image/pic8.png`,
      action: 'Share feedback',
      onPress: () => Linking.openURL(`${SITE_ROOT}/feedback`),
    },
    {
      eyebrow: 'CHURCH COACHING',
      title: 'Coaching for young congregants.',
      copy: 'Spiritual growth, character development and meaningful mentorship.',
      image: `${SITE_ROOT}/image/pic11.png`,
      action: 'Explore coaching',
      onPress: () => Linking.openURL(`${SITE_ROOT}/care-counseling`),
    },
    {
      eyebrow: 'TEENS DEVELOPMENT',
      title: 'Structured support for young people.',
      copy: 'Build life skills, self-confidence and resilience.',
      image: `${SITE_ROOT}/image/pic5.png`,
      action: 'Explore the program',
      onPress: () => Linking.openURL(`${SITE_ROOT}/teens-kids-academy`),
    },
    {
      eyebrow: 'PAZ IN THE COMMUNITY',
      title: 'Growing together, one step at a time.',
      copy: 'Mentorship, connection and values-led development.',
      image: `${SITE_ROOT}/image/pic6.png`,
      action: 'Meet the community',
      onPress: () => Linking.openURL(SITE_ROOT),
    },
    {
      eyebrow: 'PAZ MARKETPLACE',
      title: 'Publish your books and earn from every sale.',
      copy: 'Bring your digital products to the PAZ community.',
      image: `${SITE_ROOT}/image/pic12.png`,
      action: 'Register as a vendor',
      onPress: () => Linking.openURL(`${SITE_ROOT}/vendor`),
    },
    {
      eyebrow: 'REACH MORE READERS',
      title: 'Put your guides and ebooks in front of more readers.',
      copy: 'Join a growing community of creators and vendors.',
      image: `${SITE_ROOT}/image/pic13.png`,
      action: 'Join as a vendor',
      onPress: () => Linking.openURL(`${SITE_ROOT}/vendor`),
    },
    {
      eyebrow: 'VERIFIED VENDOR NETWORK',
      title: 'Build trust with your own storefront.',
      copy: 'Secure product delivery and a professional marketplace.',
      image: `${SITE_ROOT}/image/pic10.png`,
      action: 'Become a vendor',
      onPress: () => Linking.openURL(`${SITE_ROOT}/vendor`),
    },
  ];
  const promo = promos[activePromo];
  const promoImage = typeof promo.image === 'string' ? { uri: promo.image } : promo.image;
  const filtered = props.products.filter((product) => {
    const text = `${product.title} ${product.category} ${product.description}`.toLowerCase();
    return (props.category === 'All' || product.category === props.category) && text.includes(props.search.trim().toLowerCase());
  });

  useEffect(() => {
    const timer = setInterval(() => setActivePromo((current) => (current + 1) % promos.length), 6000);
    return () => clearInterval(timer);
  }, [promos.length]);

  return (
    <View style={styles.screen}>
      <ImageBackground source={promoImage} style={styles.promoBoard} imageStyle={styles.promoImage}>
        <View style={styles.promoShade} />
        <View style={styles.promoCopy}>
          <Text style={styles.promoKicker}>{promo.eyebrow}</Text>
          <Text numberOfLines={2} style={styles.promoTitle}>{promo.title}</Text>
          <Text numberOfLines={2} style={styles.promoDescription}>{promo.copy}</Text>
          <Pressable accessibilityRole="button" onPress={promo.onPress} style={({ pressed }) => [styles.promoAction, pressed && styles.promoActionPressed]}>
            <Text style={styles.promoActionText}>{promo.action}</Text>
            <Text style={styles.promoArrow}>›</Text>
          </Pressable>
        </View>
        <View style={styles.promoDots}>
          {promos.map((item, index) => (
            <Pressable key={item.eyebrow} accessibilityRole="button" accessibilityLabel={`Show promotion ${index + 1}`} onPress={() => setActivePromo(index)} style={[styles.promoDot, activePromo === index && styles.promoDotActive]} />
          ))}
        </View>
      </ImageBackground>
      <View style={styles.searchBox}>
        <Text accessibilityElementsHidden style={styles.searchMark}>⌕</Text>
        <TextInput value={props.search} onChangeText={props.onSearch} placeholder="Search the shop" placeholderTextColor="#78857c" style={styles.searchInput} returnKeyType="search" />
        {props.search ? <Pressable onPress={() => props.onSearch('')}><Text style={styles.clearSearch}>×</Text></Pressable> : null}
      </View>
      <ScrollView horizontal style={styles.categoryScroll} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
        {props.categories.map((item) => (
          <Pressable key={item} onPress={() => props.onCategory(item)} style={[styles.chip, props.category === item && styles.chipActive]}>
            <Text style={[styles.chipText, props.category === item && styles.chipTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{props.search || props.category !== 'All' ? 'Matching products' : 'Shop resources'}</Text>
        <Text style={styles.resultCount}>{filtered.length} {filtered.length === 1 ? 'item' : 'items'}</Text>
      </View>
      {props.loading ? <View style={styles.state}><ActivityIndicator color={palette.green} size="large" /><Text style={styles.stateText}>Opening the shop…</Text></View>
        : props.error ? <View style={styles.state}><Text style={styles.sectionTitle}>Shop unavailable</Text><Text style={styles.stateText}>{props.error}</Text><Pressable onPress={props.onRefresh}><Text style={styles.retry}>Try again</Text></Pressable></View>
          : <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ProductCard product={item} storageBaseUrl={props.storageBaseUrl} onPress={() => props.onOpen(item)} />}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
            refreshing={false}
            onRefresh={props.onRefresh}
            ListEmptyComponent={<View style={styles.state}><Text style={styles.sectionTitle}>No matching products</Text><Text style={styles.stateText}>Try a different search or category.</Text></View>}
          />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  promoBoard: { height: 140, marginTop: 12, marginHorizontal: 14, overflow: 'hidden', justifyContent: 'center', borderRadius: 12, backgroundColor: palette.darkGreen },
  promoImage: { borderRadius: 12 },
  promoShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(10, 35, 25, 0.66)' },
  promoCopy: { maxWidth: 390, paddingHorizontal: 16, paddingVertical: 10, alignItems: 'flex-start' },
  promoKicker: { color: '#f1c77f', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  promoTitle: { maxWidth: '100%', marginTop: 4, color: palette.white, fontSize: 18, lineHeight: 22, fontWeight: '900' },
  promoDescription: { maxWidth: 340, marginTop: 3, color: '#f4f5ef', fontSize: 10, lineHeight: 14 },
  promoAction: { minHeight: 29, marginTop: 6, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 7, backgroundColor: '#edb767' },
  promoActionPressed: { opacity: 0.78 },
  promoActionText: { color: '#173f30', fontSize: 9, fontWeight: '900' },
  promoArrow: { color: '#173f30', fontSize: 16, lineHeight: 18, fontWeight: '900' },
  promoDots: { position: 'absolute', right: 13, bottom: 10, flexDirection: 'row', alignItems: 'center', gap: 5 },
  promoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.55)' },
  promoDotActive: { width: 16, backgroundColor: '#f1c77f' },
  searchBox: { height: 50, marginHorizontal: 18, paddingHorizontal: 14, borderWidth: 1, borderColor: palette.line, borderRadius: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: palette.white },
  searchMark: { marginRight: 9, color: palette.green, fontSize: 23 },
  searchInput: { flex: 1, paddingVertical: 8, color: palette.ink, fontSize: 14 },
  clearSearch: { paddingHorizontal: 5, color: palette.muted, fontSize: 21 },
  categoryScroll: { height: 53, flexGrow: 0, flexShrink: 0 },
  categories: { paddingHorizontal: 18, paddingTop: 9, paddingBottom: 8, gap: 8 },
  chip: { minHeight: 36, paddingHorizontal: 14, borderWidth: 1, borderColor: palette.line, borderRadius: 11, justifyContent: 'center', backgroundColor: palette.white },
  chipActive: { borderColor: palette.darkGreen, backgroundColor: palette.darkGreen },
  chipText: { color: palette.ink, fontSize: 11, fontWeight: '700' },
  chipTextActive: { color: palette.white },
  sectionHeader: { minHeight: 28, marginHorizontal: 19, marginBottom: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: palette.ink, fontSize: 16, fontWeight: '900' },
  resultCount: { color: palette.muted, fontSize: 11, fontWeight: '600' },
  grid: { paddingHorizontal: 14, paddingBottom: 28 },
  productRow: { justifyContent: 'space-between', gap: 10, marginBottom: 11 },
  state: { flex: 1, minHeight: 180, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 10 },
  stateText: { color: palette.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  retry: { padding: 10, color: palette.green, fontSize: 13, fontWeight: '900' },
});
