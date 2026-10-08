import { useEffect, useState } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import { ImageBackground, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Product, productImageUrl, SITE_ROOT } from './api';
import { palette } from './ShopComponents';

type Props = {
  products: Product[];
  storageBaseUrl: string;
  onOpen: (product: Product) => void;
  onCategory: (category: string) => void;
  compact?: boolean;
};

export function PromoBoard({ products, storageBaseUrl, onOpen, onCategory, compact = false }: Props) {
  const [activePromo, setActivePromo] = useState(0);
  const featuredBook = products.find((product) => product.title.toLowerCase().includes('fainted'));
  const promos = [
    {
      eyebrow: 'PAZ THRIVING SHOP',
      title: 'Discover Ebooks & Journals',
      copy: 'Read · Plan · Achieve',
      image: featuredBook ? productImageUrl(featuredBook.cover, storageBaseUrl) : `${SITE_ROOT}/logo/logo2.jpeg`,
      action: 'Shop Now',
      onPress: () => onCategory('Ebooks'),
    },
    {
      eyebrow: 'PAZ THRIVING TRIBE',
      title: 'Coaching, mentoring and counselling.',
      copy: 'Soaring with peace, influencing the world.',
      image: `${SITE_ROOT}/logo/logo2.jpeg`,
      action: 'Explore PAZ',
      onPress: () => onCategory('All'),
    },
    {
      eyebrow: 'FEATURED BOOK',
      title: 'I Fainted! …But I Didn’t Quit!',
      copy: 'A new book from PAZ Thriving Tribe.',
      image: featuredBook ? productImageUrl(featuredBook.cover, storageBaseUrl) : 'https://pcprbkqpxntxgtseiyie.supabase.co/storage/v1/object/public/prof-upload/products/covers/1790535861008-ifainted-coveer--1-.png',
      action: 'View book',
      onPress: () => featuredBook ? onOpen(featuredBook) : onCategory('Ebooks'),
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

  useEffect(() => {
    const timer = setInterval(() => setActivePromo((current) => (current + 1) % promos.length), 6000);
    return () => clearInterval(timer);
  }, [promos.length]);

  if (compact) {
    return (
      <ImageBackground source={promoImage} style={styles.compactBoard} imageStyle={styles.compactBackground}>
        <View style={styles.compactShade} />
        <View style={styles.compactCopy}>
          <Text numberOfLines={1} style={styles.compactKicker}>{promo.eyebrow}</Text>
          <Text numberOfLines={2} style={styles.compactTitle}>{promo.title}</Text>
          <Text numberOfLines={1} style={styles.compactDescription}>{promo.copy}</Text>
          <Pressable accessibilityRole="button" onPress={promo.onPress} style={({ pressed }) => [styles.compactAction, pressed && styles.promoActionPressed]}>
            <Text style={styles.compactActionText}>{promo.action}</Text>
            <FontAwesome5 name="arrow-right" size={9} color={palette.darkGreen} />
          </Pressable>
        </View>
        <View style={styles.compactDots}>
          {promos.map((item, index) => (
            <Pressable
              key={item.eyebrow}
              accessibilityRole="button"
              accessibilityLabel={`Show promotion ${index + 1}`}
              accessibilityState={{ selected: activePromo === index }}
              onPress={() => setActivePromo(index)}
              style={[styles.promoDot, styles.compactDot, activePromo === index && styles.compactDotActive]}
            />
          ))}
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={promoImage} style={styles.promoBoard} imageStyle={styles.promoImage}>
      <View style={styles.promoShade} />
      <View style={styles.promoCopy}>
        <Text style={styles.promoKicker}>{promo.eyebrow}</Text>
        <Text numberOfLines={2} style={styles.promoTitle}>{promo.title}</Text>
        <Text numberOfLines={2} style={styles.promoDescription}>{promo.copy}</Text>
        <Pressable accessibilityRole="button" onPress={promo.onPress} style={({ pressed }) => [styles.promoAction, pressed && styles.promoActionPressed]}>
          <Text style={styles.promoActionText}>{promo.action}</Text>
          <FontAwesome5 name="chevron-right" size={10} color="#173f30" />
        </Pressable>
      </View>
      <View style={styles.promoDots}>
        {promos.map((item, index) => (
          <Pressable
            key={item.eyebrow}
            accessibilityRole="button"
            accessibilityLabel={`Show promotion ${index + 1}`}
            onPress={() => setActivePromo(index)}
            style={[styles.promoDot, activePromo === index && styles.promoDotActive]}
          />
        ))}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  promoBoard: { height: 140, marginTop: 10, marginBottom: 5, marginHorizontal: 14, overflow: 'hidden', justifyContent: 'center', borderRadius: 12, backgroundColor: palette.darkGreen },
  compactBoard: { height: 90, marginHorizontal: 9, marginTop: 8, marginBottom: 6, paddingLeft: 10, paddingRight: 8, overflow: 'hidden', borderRadius: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#4816b2' },
  compactBackground: { borderRadius: 11 },
  compactShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(42, 9, 101, 0.62)' },
  compactCopy: { zIndex: 1, maxWidth: '83%', alignItems: 'flex-start' },
  compactKicker: { color: '#eadfff', fontSize: 6, fontWeight: '900', letterSpacing: 0.7 },
  compactTitle: { marginTop: 2, color: palette.white, fontSize: 13, lineHeight: 15, fontWeight: '900' },
  compactDescription: { marginTop: 2, color: '#eee6ff', fontSize: 7, fontWeight: '600' },
  compactAction: { minHeight: 20, marginTop: 5, paddingHorizontal: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: palette.white },
  compactActionText: { color: palette.darkGreen, fontSize: 7, fontWeight: '900' },
  compactDots: { position: 'absolute', right: 9, bottom: 5, flexDirection: 'row', alignItems: 'center', gap: 2 },
  compactDot: { width: 3, height: 3 },
  compactDotActive: { width: 7, backgroundColor: '#f1c77f' },
  promoImage: { borderRadius: 12 },
  promoShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(10, 35, 25, 0.66)' },
  promoCopy: { maxWidth: 390, paddingHorizontal: 16, paddingVertical: 10, alignItems: 'flex-start' },
  promoKicker: { color: '#f1c77f', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  promoTitle: { maxWidth: '100%', marginTop: 4, color: palette.white, fontSize: 18, lineHeight: 22, fontWeight: '900' },
  promoDescription: { maxWidth: 340, marginTop: 3, color: '#f4f5ef', fontSize: 10, lineHeight: 14 },
  promoAction: { minHeight: 29, marginTop: 6, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 7, backgroundColor: '#edb767' },
  promoActionPressed: { opacity: 0.78 },
  promoActionText: { color: '#173f30', fontSize: 9, fontWeight: '900' },
  promoDots: { position: 'absolute', right: 13, bottom: 10, flexDirection: 'row', alignItems: 'center', gap: 5 },
  promoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.55)' },
  promoDotActive: { width: 16, backgroundColor: '#f1c77f' },
});
