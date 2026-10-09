import { useState } from 'react';
import { Image, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';
import { palette } from './ShopComponents';

type Props = { visible: boolean; onGetStarted: () => void; onContinueAsGuest: () => void };

const slides = [
  { title: 'Welcome to PAZ\nDigital Shop', copy: 'Your one-stop shop for ebooks, journals, digital products, groceries and gadgets.' },
  { title: 'Fast & Secure', copy: 'Enjoy quick delivery, secure payments and reliable service, always.' },
  { title: 'Great Products', copy: 'From everyday essentials to unique finds, we’ve got you covered.' },
  { title: 'Shop Smarter', copy: 'Discover useful finds and have them delivered with ease.' },
];

export function OnboardingFlow({ visible, onGetStarted, onContinueAsGuest }: Props) {
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
      <View style={styles.illustrationStage}><OnboardingIllustration activeIndex={activeIndex} /></View>

      <View style={styles.footer}>
        <View style={styles.pagination} accessibilityLabel={`Page ${activeIndex + 1} of ${slides.length}`}>
          {slides.map((item, index) => <View key={item.title} style={[styles.pageDot, index === activeIndex && styles.pageDotActive]} />)}
        </View>
        <Pressable accessibilityRole="button" onPress={advance} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
          <Text style={styles.primaryButtonText}>{activeIndex === 0 ? 'Get start' : isLastSlide ? 'Get Started' : 'Next'}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onContinueAsGuest} style={styles.guestLink}>
          <Text style={styles.guestLinkText}>Continue as guest</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onGetStarted} style={styles.accountLink}>
          <Text style={styles.accountLinkText}>Already have an account? <Text style={styles.loginText}>Log In</Text></Text>
        </Pressable>
      </View>
    </View>
  );
}

function OnboardingIllustration({ activeIndex }: { activeIndex: number }) {
  return (
    <View style={styles.illustration} accessibilityElementsHidden>
      {activeIndex === 0 ? <WelcomeIllustration /> : activeIndex === 1 ? <DeliveryIllustration /> : <ProductsIllustration />}
    </View>
  );
}

function WelcomeIllustration() {
  return (
    <Svg viewBox="0 0 360 250" width="100%" height="100%">
      <Ellipse cx="180" cy="220" rx="133" ry="14" fill="#eee8dc" />
      <Path d="M47 166c9-54 49-91 104-87 38 3 59 29 92 17 29-11 53-4 70 18 17 22 9 57-7 83H61z" fill="#e7f3e8" />
      <Circle cx="63" cy="75" r="18" fill="#f8d367" />
      <Rect x="65" y="92" width="83" height="104" rx="8" fill="#fffdf8" stroke="#333a35" strokeWidth="4" transform="rotate(-8 106 144)" />
      <Rect x="75" y="102" width="63" height="56" rx="4" fill="#ea6f50" transform="rotate(-8 106 130)" />
      <Path d="M87 146c8-17 16-17 22-4 8-20 16-18 25-4v20H87z" fill="#f8d367" />
      <Path d="M92 119h29M91 126h18" stroke="#fff7e9" strokeWidth="3" strokeLinecap="round" />
      <Rect x="153" y="42" width="91" height="160" rx="17" fill="#2f3934" />
      <Rect x="159" y="49" width="79" height="146" rx="12" fill="#fffdf8" />
      <Rect x="185" y="55" width="28" height="4" rx="2" fill="#59645c" />
      <Rect x="170" y="68" width="23" height="4" rx="2" fill="#df5f42" />
      <Rect x="170" y="75" width="40" height="3" rx="2" fill="#d9ded4" />
      <Rect x="169" y="83" width="59" height="48" rx="6" fill="#f6e5c2" />
      <Path d="M172 119c10-19 17-22 27-9 8-13 18-12 26-3v24h-53z" fill="#7ca987" />
      <Circle cx="185" cy="102" r="7" fill="#f2ad45" />
      <Rect x="169" y="138" width="36" height="4" rx="2" fill="#d9ded4" />
      <Rect x="169" y="147" width="49" height="4" rx="2" fill="#d9ded4" />
      <Rect x="169" y="160" width="59" height="23" rx="7" fill="#df5f42" />
      <Circle cx="278" cy="121" r="38" fill="#f2c64f" />
      <Path d="M260 112h36l-4 36h-28z" fill="#d76d49" />
      <Path d="M268 112c0-14 20-14 20 0M272 124c-5 6-5 12 0 17M286 122c5 8 4 13-1 18" fill="none" stroke="#78533a" strokeWidth="4" strokeLinecap="round" />
      <Path d="m287 54 4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill="#df5f42" />
      <Circle cx="115" cy="54" r="4" fill="#7ca987" />
      <Circle cx="305" cy="88" r="5" fill="#df5f42" />
    </Svg>
  );
}

function DeliveryIllustration() {
  return (
    <Svg viewBox="0 0 360 250" width="100%" height="100%">
      <Ellipse cx="180" cy="220" rx="135" ry="14" fill="#eee8dc" />
      <Path d="M46 180c24-34 52-44 84-31 33 13 66 7 92-22 31-35 75-24 92 17v58H46z" fill="#e7f3e8" />
      <Rect x="51" y="71" width="77" height="131" rx="13" fill="#2f3934" />
      <Rect x="57" y="78" width="65" height="116" rx="9" fill="#fffdf8" />
      <Rect x="75" y="84" width="29" height="4" rx="2" fill="#59645c" />
      <Rect x="66" y="99" width="47" height="39" rx="5" fill="#f5e7ca" />
      <Circle cx="89" cy="117" r="11" fill="#df5f42" />
      <Path d="M84 117h10M89 112v10" stroke="#fff8e8" strokeWidth="2" strokeLinecap="round" />
      <Rect x="67" y="147" width="42" height="4" rx="2" fill="#d9ded4" />
      <Rect x="67" y="156" width="34" height="4" rx="2" fill="#d9ded4" />
      <Rect x="66" y="168" width="47" height="17" rx="6" fill="#7ca987" />
      <Path d="M181 50 238 71v47c0 42-25 66-57 83-32-17-57-41-57-83V71z" fill="#7ca987" stroke="#2f3934" strokeWidth="4" strokeLinejoin="round" />
      <Path d="m154 119 18 18 38-42" fill="none" stroke="#fffdf8" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="m267 126 38 16v48l-38 19-39-19v-48z" fill="#df5f42" stroke="#2f3934" strokeWidth="4" strokeLinejoin="round" />
      <Path d="m229 143 38 18 38-18M267 161v48M248 135l39 18v9" fill="none" stroke="#f8dca2" strokeWidth="3" strokeLinejoin="round" />
      <Path d="M248 129v-9c0-25 38-25 38 0v10" fill="none" stroke="#2f3934" strokeWidth="5" strokeLinecap="round" />
      <Circle cx="275" cy="128" r="4" fill="#fffdf8" />
      <Path d="M273 128h4v7h-4z" fill="#fffdf8" />
      <Path d="M143 185c-7 6-12 15-13 23M217 47l8-10m14 18 11-5M40 112l9 2" fill="none" stroke="#df5f42" strokeWidth="4" strokeLinecap="round" />
      <Circle cx="146" cy="64" r="5" fill="#f2c64f" />
    </Svg>
  );
}

function ProductsIllustration() {
  return (
    <Svg viewBox="0 0 360 250" width="100%" height="100%">
      <Ellipse cx="180" cy="220" rx="135" ry="14" fill="#eee8dc" />
      <Path d="M45 177c16-43 47-66 83-50 29 12 46 5 71-21 30-31 79-14 103 18 12 17 16 38 13 65H48z" fill="#e7f3e8" />
      <Rect x="49" y="119" width="74" height="82" rx="8" fill="#f2c64f" stroke="#2f3934" strokeWidth="4" />
      <Path d="M65 119c0-27 42-27 42 0" fill="none" stroke="#2f3934" strokeWidth="4" strokeLinecap="round" />
      <Path d="M63 162c11-17 22-17 31-2 9-17 19-16 29-2v39H63z" fill="#7ca987" />
      <Circle cx="78" cy="146" r="10" fill="#df5f42" />
      <Circle cx="104" cy="148" r="9" fill="#f3a943" />
      <Rect x="137" y="71" width="76" height="107" rx="7" fill="#fffdf8" stroke="#2f3934" strokeWidth="4" transform="rotate(-7 175 124)" />
      <Rect x="151" y="89" width="45" height="41" rx="3" fill="#df5f42" transform="rotate(-7 173 109)" />
      <Path d="M158 120c8-16 14-14 20-3 6-13 12-12 19-3v12h-39z" fill="#f2c64f" />
      <Path d="M159 140h37M157 148h31M156 156h36" stroke="#cbd3c9" strokeWidth="3" strokeLinecap="round" />
      <Rect x="232" y="94" width="75" height="82" rx="8" fill="#7ca987" stroke="#2f3934" strokeWidth="4" />
      <Path d="M250 94c0-26 39-26 39 0" fill="none" stroke="#2f3934" strokeWidth="4" strokeLinecap="round" />
      <Path d="M252 113h35v42h-35z" fill="#e7f3e8" />
      <Path d="M259 121c-7 8-7 18 0 26m19-26c7 8 7 18 0 26" fill="none" stroke="#df5f42" strokeWidth="4" strokeLinecap="round" />
      <Circle cx="270" cy="134" r="7" fill="#f2c64f" />
      <Path d="M77 81c11-10 19-11 29-1m150-28c8-8 15-9 23-3" fill="none" stroke="#df5f42" strokeWidth="4" strokeLinecap="round" />
      <Path d="m111 62 4-9 4 9 9 2-7 6 2 9-8-5-8 5 2-9-7-6z" fill="#f2c64f" />
      <Circle cx="217" cy="59" r="5" fill="#df5f42" />
      <Line x1="134" y1="197" x2="226" y2="197" stroke="#2f3934" strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  screen: { ...StyleSheet.absoluteFill, zIndex: 100, paddingTop: 30, paddingHorizontal: 16, paddingBottom: 62, justifyContent: 'space-between', backgroundColor: '#ffffff' },
  heading: { width: '100%', alignItems: 'center' },
  logo: { width: 96, height: 96 },
  title: { marginTop: 5, color: '#301276', fontSize: 25, lineHeight: 29, fontWeight: '900', textAlign: 'center' },
  copy: { maxWidth: 300, marginTop: 7, color: '#554979', fontSize: 14, lineHeight: 19, textAlign: 'center' },
  illustrationStage: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
  illustration: { width: '100%', maxWidth: 355, height: 230, alignSelf: 'center' },
  footer: { width: '100%', maxWidth: 440, alignSelf: 'center', paddingBottom: 1 },
  pagination: { height: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  pageDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#d4cde4' },
  pageDotActive: { backgroundColor: '#5520bc' },
  primaryButton: { minHeight: 54, marginTop: 7, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#5520bc' },
  primaryButtonText: { color: palette.white, fontSize: 13, fontWeight: '900' },
  guestLink: { minHeight: 34, marginTop: 2, alignItems: 'center', justifyContent: 'center' },
  guestLinkText: { color: '#5520bc', fontSize: 11, fontWeight: '900' },
  accountLink: { minHeight: 38, marginTop: 5, alignItems: 'center', justifyContent: 'center' },
  accountLinkText: { color: '#544875', fontSize: 11, fontWeight: '600' },
  loginText: { color: '#5520bc', fontWeight: '900' },
  pressed: { opacity: 0.82 },
});