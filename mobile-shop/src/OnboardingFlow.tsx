import { useState } from 'react';
import { Image, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { palette } from './ShopComponents';

type Props = { visible: boolean; onGetStarted: () => void };

const slides = [
  { title: 'Welcome to PAZ\nDigital Shop', copy: 'Your one-stop shop for ebooks, journals, digital products, groceries and gadgets.' },
  { title: 'Fast & Secure', copy: 'Enjoy quick delivery, secure payments and reliable service, always.' },
  { title: 'Great Products', copy: 'From everyday essentials to unique finds, we’ve got you covered.' },
  { title: 'Shop Smarter', copy: 'Discover useful finds and have them delivered with ease.' },
];

export function OnboardingFlow({ visible, onGetStarted }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  if (!visible) return null;

  const slide = slides[activeIndex];
  const isLastSlide = activeIndex === slides.length - 1;
  const advance = () => {
    if (isLastSlide) {
      setActiveIndex(0);
      onGetStarted();
    } else {
      setActiveIndex((index) => index + 1);
    }
  };

  return (
    <View style={styles.screen} accessibilityViewIsModal>
      <StatusBar barStyle="dark-content" />
      <View style={styles.heading}>
        <Image source={require('../assets/paz-emblem.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.copy}>{slide.copy}</Text>
      </View>
      <View style={styles.illustrationStage}><ShoppingIllustration /></View>

      <View style={styles.footer}>
        <View style={styles.pagination} accessibilityLabel={`Page ${activeIndex + 1} of ${slides.length}`}>
          {slides.map((item, index) => <View key={item.title} style={[styles.pageDot, index === activeIndex && styles.pageDotActive]} />)}
        </View>
        <Pressable accessibilityRole="button" onPress={advance} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
          <Text style={styles.primaryButtonText}>{activeIndex === 0 ? 'Get start' : isLastSlide ? 'Get Started' : 'Next'}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onGetStarted} style={styles.accountLink}>
          <Text style={styles.accountLinkText}>Already have an account? <Text style={styles.loginText}>Log In</Text></Text>
        </Pressable>
      </View>
    </View>
  );
}

function ShoppingIllustration() {
  return (
    <View style={styles.illustration} accessibilityElementsHidden>
      <View style={[styles.leaf, styles.leafA]} />
      <View style={[styles.leaf, styles.leafB]} />
      <View style={[styles.leaf, styles.leafC]} />
      <View style={[styles.leaf, styles.leafD]} />
      <View style={[styles.leaf, styles.leafE]} />
      <View style={[styles.leaf, styles.leafF]} />
      <View style={styles.tabletLeft}>
        <View style={styles.tabletScreen}>
          <View style={styles.bookCover}>
            <View style={styles.coverMark} />
            <View style={styles.coverLine} />
            <View style={[styles.coverLine, styles.coverLineShort]} />
          </View>
          <View style={styles.screenLine} />
          <View style={[styles.screenLine, styles.screenLineShort]} />
          <View style={styles.screenLine} />
        </View>
      </View>
      <View style={styles.tabletRight}>
        <View style={styles.tabletScreenRight}>
          <View style={styles.rightScreenHeader} />
          <View style={styles.rightScreenImage} />
          <View style={styles.screenLine} />
          <View style={[styles.screenLine, styles.screenLineShort]} />
        </View>
      </View>
      <View style={styles.phoneLeft}>
        <View style={styles.phoneSpeaker} />
        <View style={styles.phonePage}>
          <View style={styles.phonePageHeading} />
          <View style={styles.phonePageLine} />
          <View style={[styles.phonePageLine, styles.phonePageLineShort]} />
          <View style={styles.phonePageLine} />
        </View>
      </View>
      <View style={styles.phoneRight}>
        <View style={styles.phoneSpeaker} />
        <View style={styles.phonePageRight}>
          <View style={styles.rightScreenHeader} />
          <View style={styles.phonePageLine} />
          <View style={[styles.phonePageLine, styles.phonePageLineShort]} />
        </View>
      </View>
      <View style={styles.cartHandle} />
      <View style={styles.cartNeck} />
      <View style={styles.cartBasket}>
        <View style={[styles.cartItem, styles.cartItemGold]} />
        <View style={[styles.cartItem, styles.cartItemTeal]} />
        <View style={styles.cartBar} />
        <View style={[styles.cartBar, styles.cartBarLower]} />
        <View style={styles.cartBarVertical} />
      </View>
      <View style={styles.cartWheelLeft} />
      <View style={styles.cartWheelRight} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { ...StyleSheet.absoluteFill, zIndex: 100, paddingTop: 30, paddingHorizontal: 16, paddingBottom: 62, justifyContent: 'space-between', backgroundColor: '#ffffff' },
  heading: { width: '100%', alignItems: 'center' },
  logo: { width: 96, height: 96 },
  title: { marginTop: 5, color: '#301276', fontSize: 25, lineHeight: 29, fontWeight: '900', textAlign: 'center' },
  copy: { maxWidth: 300, marginTop: 7, color: '#554979', fontSize: 14, lineHeight: 19, textAlign: 'center' },
  illustrationStage: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
  illustration: { width: '100%', maxWidth: 355, height: 220, position: 'relative', alignSelf: 'center', transform: [{ scale: 1.16 }] },
  leaf: { position: 'absolute', width: 27, height: 13, borderTopLeftRadius: 15, borderBottomRightRadius: 15, borderTopRightRadius: 3, borderBottomLeftRadius: 3 },
  leafA: { left: '6%', top: '44%', backgroundColor: '#18b8a7', transform: [{ rotate: '36deg' }] },
  leafB: { left: '12%', top: '57%', backgroundColor: '#e74369', transform: [{ rotate: '-35deg' }] },
  leafC: { left: '18%', top: '70%', backgroundColor: '#7d35da', transform: [{ rotate: '25deg' }] },
  leafD: { right: '7%', top: '39%', backgroundColor: '#ef4b97', transform: [{ rotate: '-38deg' }] },
  leafE: { right: '11%', top: '55%', backgroundColor: '#20aa77', transform: [{ rotate: '32deg' }] },
  leafF: { right: '16%', top: '68%', backgroundColor: '#f0aa20', transform: [{ rotate: '-24deg' }] },
  tabletLeft: { position: 'absolute', left: '20%', top: '15%', width: '31%', height: '61%', padding: 5, borderWidth: 4, borderColor: '#5525c2', borderRadius: 9, backgroundColor: '#b9a0f4', transform: [{ rotate: '-2deg' }] },
  tabletScreen: { flex: 1, padding: 5, alignItems: 'center', backgroundColor: '#fff' },
  bookCover: { width: '79%', height: '58%', marginBottom: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee8ff' },
  coverMark: { width: 18, height: 18, marginBottom: 4, borderRadius: 9, backgroundColor: '#6936cb' },
  coverLine: { width: '72%', height: 3, marginTop: 3, borderRadius: 2, backgroundColor: '#9b7ce3' },
  coverLineShort: { width: '48%' },
  screenLine: { width: '84%', height: 3, marginTop: 4, borderRadius: 2, backgroundColor: '#c8bedc' },
  screenLineShort: { width: '54%', alignSelf: 'flex-start', marginLeft: '8%' },
  tabletRight: { position: 'absolute', right: '19%', top: '19%', width: '31%', height: '56%', padding: 5, borderWidth: 4, borderColor: '#129a9d', borderRadius: 9, backgroundColor: '#95e0d6', transform: [{ rotate: '2deg' }] },
  tabletScreenRight: { flex: 1, padding: 5, alignItems: 'center', backgroundColor: '#fff' },
  rightScreenHeader: { width: '100%', height: 15, marginBottom: 4, borderRadius: 3, backgroundColor: '#14aeb0' },
  rightScreenImage: { width: '75%', height: '43%', marginBottom: 3, backgroundColor: '#d5f3ef' },
  phoneLeft: { position: 'absolute', left: '14%', bottom: '6%', width: '23%', height: '48%', padding: 4, borderWidth: 4, borderColor: '#4d20ba', borderRadius: 9, backgroundColor: '#aa8df1', transform: [{ rotate: '-5deg' }] },
  phoneRight: { position: 'absolute', right: '13%', bottom: '7%', width: '23%', height: '45%', padding: 4, borderWidth: 4, borderColor: '#4d20ba', borderRadius: 9, backgroundColor: '#aa8df1', transform: [{ rotate: '4deg' }] },
  phoneSpeaker: { width: '34%', height: 2, marginBottom: 4, alignSelf: 'center', borderRadius: 2, backgroundColor: '#381477' },
  phonePage: { flex: 1, padding: 4, alignItems: 'center', backgroundColor: '#fff' },
  phonePageRight: { flex: 1, padding: 4, backgroundColor: '#fff' },
  phonePageHeading: { width: '80%', height: '29%', marginBottom: 4, backgroundColor: '#e9e0ff' },
  phonePageLine: { width: '85%', height: 3, marginTop: 4, borderRadius: 2, backgroundColor: '#9b7ce3' },
  phonePageLineShort: { width: '55%', alignSelf: 'flex-start' },
  cartHandle: { position: 'absolute', left: '32%', bottom: '51%', width: 48, height: 7, borderRadius: 4, backgroundColor: '#5723ca', transform: [{ rotate: '-14deg' }] },
  cartNeck: { position: 'absolute', left: '42%', bottom: '33%', width: 7, height: '25%', borderRadius: 4, backgroundColor: '#5723ca', transform: [{ rotate: '-11deg' }] },
  cartBasket: { position: 'absolute', left: '39%', bottom: '14%', width: '35%', height: '28%', overflow: 'hidden', borderWidth: 5, borderColor: '#5723ca', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, backgroundColor: '#eee8ff', transform: [{ skewX: '-9deg' }] },
  cartItem: { position: 'absolute', bottom: '14%', width: 22, height: 48, borderWidth: 2, borderColor: '#5723ca', borderRadius: 4 },
  cartItemGold: { left: '18%', backgroundColor: '#ffc94a' },
  cartItemTeal: { left: '56%', height: 54, backgroundColor: '#27c2b3' },
  cartBar: { position: 'absolute', top: '35%', left: 0, right: 0, height: 4, backgroundColor: '#9875e4' },
  cartBarLower: { top: '66%' },
  cartBarVertical: { position: 'absolute', top: 0, bottom: 0, left: '48%', width: 4, backgroundColor: '#9875e4' },
  cartWheelLeft: { position: 'absolute', left: '44%', bottom: '7%', width: 13, height: 13, borderWidth: 3, borderColor: '#5723ca', borderRadius: 7, backgroundColor: '#ffffff' },
  cartWheelRight: { position: 'absolute', left: '65%', bottom: '7%', width: 13, height: 13, borderWidth: 3, borderColor: '#5723ca', borderRadius: 7, backgroundColor: '#ffffff' },
  footer: { width: '100%', maxWidth: 440, alignSelf: 'center', paddingBottom: 1 },
  pagination: { height: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  pageDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#d4cde4' },
  pageDotActive: { backgroundColor: '#5520bc' },
  primaryButton: { minHeight: 54, marginTop: 7, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#5520bc' },
  primaryButtonText: { color: palette.white, fontSize: 13, fontWeight: '900' },
  accountLink: { minHeight: 38, marginTop: 5, alignItems: 'center', justifyContent: 'center' },
  accountLinkText: { color: '#544875', fontSize: 11, fontWeight: '600' },
  loginText: { color: '#5520bc', fontWeight: '900' },
  pressed: { opacity: 0.82 },
});