import { useRef, useState } from 'react';
import { Animated, Easing, Image, PanResponder, Platform, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';
import { palette, registerShopThemeStyles } from './ShopComponents';

type Props = { visible: boolean; onGetStarted: () => void; onContinueAsGuest: () => void };

const slides = [
  { title: 'Welcome to PAZ\nDigital Shop', copy: 'Books, journals, digital products, groceries, and gadgets in one place.' },
  { title: 'Fast delivery', copy: 'Get your order quickly and pay safely.' },
  { title: 'Products you’ll love', copy: 'Shop everyday items, helpful books, and useful gadgets.' },
  { title: 'Easy shopping', copy: 'Choose what you need and order in just a few steps.' },
];

export function OnboardingFlow({ visible, onGetStarted, onContinueAsGuest }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slideOffset = useRef(new Animated.Value(0)).current;
  const activeIndexRef = useRef(activeIndex);
  const isAnimatingRef = useRef(false);
  activeIndexRef.current = activeIndex;
  const transitionRef = useRef<(nextIndex: number) => void>(() => {});
  transitionRef.current = (nextIndex) => {
    if (isAnimatingRef.current || nextIndex === activeIndexRef.current) return;
    isAnimatingRef.current = true;
    const direction = nextIndex > activeIndexRef.current ? -1 : 1;
    Animated.timing(slideOffset, {
      toValue: direction * 72,
      duration: 170,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) {
        isAnimatingRef.current = false;
        return;
      }
      setActiveIndex(nextIndex);
      slideOffset.setValue(-direction * 72);
      Animated.timing(slideOffset, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => { isAnimatingRef.current = false; });
    });
  };
  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_event, gesture) => Math.abs(gesture.dx) > 16 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
    onPanResponderRelease: (_event, gesture) => {
      const index = activeIndexRef.current;
      if (gesture.dx < -45) transitionRef.current(Math.min(index + 1, slides.length - 1));
      if (gesture.dx > 45) transitionRef.current(Math.max(index - 1, 0));
    },
  })).current;
  if (!visible) return null;

  const slide = slides[activeIndex];
  const isLastSlide = activeIndex === slides.length - 1;
  const advance = () => {
    if (isLastSlide) {
      setActiveIndex(0);
      onGetStarted();
    } else {
      transitionRef.current(activeIndex + 1);
    }
  };
  const animatedSlideStyle = { transform: [{ translateX: slideOffset }] };

  return (
    <View {...panResponder.panHandlers} style={[styles.screen, { backgroundColor: palette.paper }]} accessibilityViewIsModal>
      <StatusBar barStyle={palette.paper === '#171613' ? 'light-content' : 'dark-content'} />
      <Animated.View style={[styles.heading, animatedSlideStyle]}>
        <Image source={require('../assets/paz-emblem.png')} style={styles.logo} resizeMode="contain" />
        <Text style={[styles.title, { color: palette.darkGreen }]}>{slide.title}</Text>
        <Text style={[styles.copy, { color: palette.muted }]}>{slide.copy}</Text>
      </Animated.View>
      <Animated.View style={[styles.illustrationStage, animatedSlideStyle]}><OnboardingIllustration activeIndex={activeIndex} /></Animated.View>

      <View style={styles.footer}>
        <View style={styles.pagination} accessibilityLabel={`Page ${activeIndex + 1} of ${slides.length}`}>
          {slides.map((item, index) => <View key={item.title} style={[styles.pageDot, index === activeIndex && { backgroundColor: palette.green }]} />)}
        </View>
        <Pressable accessibilityRole="button" onPress={advance} style={({ pressed }) => [styles.primaryButton, { backgroundColor: palette.actionGreen }, pressed && styles.pressed]}>
          <Text style={styles.primaryButtonText}>{isLastSlide ? 'Start shopping' : 'Next'}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onContinueAsGuest} style={styles.guestLink}>
          <Text style={[styles.guestLinkText, { color: palette.green }]}>Continue as guest</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onGetStarted} style={styles.accountLink}>
          <Text style={[styles.accountLinkText, { color: palette.muted }]}>Already have an account? <Text style={[styles.loginText, { color: palette.green }]}>Log in</Text></Text>
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
      <Ellipse cx="180" cy="220" rx="133" ry="14" fill={palette.line} />
      <Path d="M47 166c9-54 49-91 104-87 38 3 59 29 92 17 29-11 53-4 70 18 17 22 9 57-7 83H61z" fill={palette.greenWash} />
      <Circle cx="63" cy="75" r="18" fill={palette.gold} />
      <Rect x="65" y="92" width="83" height="104" rx="8" fill={palette.white} stroke={palette.ink} strokeWidth="4" transform="rotate(-8 106 144)" />
      <Rect x="75" y="102" width="63" height="56" rx="4" fill={palette.orange} transform="rotate(-8 106 130)" />
      <Path d="M87 146c8-17 16-17 22-4 8-20 16-18 25-4v20H87z" fill={palette.gold} />
      <Path d="M92 119h29M91 126h18" stroke={palette.paper} strokeWidth="3" strokeLinecap="round" />
      <Rect x="153" y="42" width="91" height="160" rx="17" fill={palette.actionGreen} />
      <Rect x="159" y="49" width="79" height="146" rx="12" fill={palette.paper} />
      <Rect x="185" y="55" width="28" height="4" rx="2" fill={palette.darkGreen} />
      <Rect x="170" y="68" width="23" height="4" rx="2" fill={palette.orange} />
      <Rect x="170" y="75" width="40" height="3" rx="2" fill={palette.darkGreen} />
      <Rect x="169" y="83" width="59" height="48" rx="6" fill={palette.orangeWash} />
      <Path d="M172 119c10-19 17-22 27-9 8-13 18-12 26-3v24h-53z" fill={palette.green} />
      <Circle cx="185" cy="102" r="7" fill={palette.gold} />
      <Rect x="169" y="138" width="36" height="4" rx="2" fill={palette.darkGreen} />
      <Rect x="169" y="147" width="49" height="4" rx="2" fill={palette.darkGreen} />
      <Rect x="169" y="160" width="59" height="23" rx="7" fill={palette.orange} />
      <Circle cx="278" cy="121" r="38" fill={palette.gold} />
      <Path d="M260 112h36l-4 36h-28z" fill={palette.orange} />
      <Path d="M268 112c0-14 20-14 20 0M272 124c-5 6-5 12 0 17M286 122c5 8 4 13-1 18" fill="none" stroke={palette.ink} strokeWidth="4" strokeLinecap="round" />
      <Path d="m287 54 4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill={palette.orange} />
      <Circle cx="115" cy="54" r="4" fill={palette.green} />
      <Circle cx="305" cy="88" r="5" fill={palette.orange} />
    </Svg>
  );
}

function DeliveryIllustration() {
  return (
    <Svg viewBox="0 0 360 250" width="100%" height="100%">
      <Ellipse cx="180" cy="220" rx="135" ry="14" fill={palette.line} />
      <Path d="M46 180c24-34 52-44 84-31 33 13 66 7 92-22 31-35 75-24 92 17v58H46z" fill={palette.greenWash} />
      <Rect x="51" y="71" width="77" height="131" rx="13" fill={palette.actionGreen} />
      <Rect x="57" y="78" width="65" height="116" rx="9" fill={palette.paper} />
      <Rect x="75" y="84" width="29" height="4" rx="2" fill={palette.darkGreen} />
      <Rect x="66" y="99" width="47" height="39" rx="5" fill={palette.orangeWash} />
      <Circle cx="89" cy="117" r="11" fill={palette.orange} />
      <Path d="M84 117h10M89 112v10" stroke={palette.ink} strokeWidth="2" strokeLinecap="round" />
      <Rect x="67" y="147" width="42" height="4" rx="2" fill={palette.darkGreen} />
      <Rect x="67" y="156" width="34" height="4" rx="2" fill={palette.darkGreen} />
      <Rect x="66" y="168" width="47" height="17" rx="6" fill={palette.green} />
      <Path d="M181 50 238 71v47c0 42-25 66-57 83-32-17-57-41-57-83V71z" fill={palette.actionGreen} stroke={palette.ink} strokeWidth="4" strokeLinejoin="round" />
      <Path d="m154 119 18 18 38-42" fill="none" stroke={palette.white} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="m267 126 38 16v48l-38 19-39-19v-48z" fill={palette.orange} stroke={palette.ink} strokeWidth="4" strokeLinejoin="round" />
      <Path d="m229 143 38 18 38-18M267 161v48M248 135l39 18v9" fill="none" stroke={palette.gold} strokeWidth="3" strokeLinejoin="round" />
      <Path d="M248 129v-9c0-25 38-25 38 0v10" fill="none" stroke={palette.ink} strokeWidth="5" strokeLinecap="round" />
      <Circle cx="275" cy="128" r="4" fill={palette.ink} />
      <Path d="M273 128h4v7h-4z" fill={palette.ink} />
      <Path d="M143 185c-7 6-12 15-13 23M217 47l8-10m14 18 11-5M40 112l9 2" fill="none" stroke={palette.orange} strokeWidth="4" strokeLinecap="round" />
      <Circle cx="146" cy="64" r="5" fill={palette.gold} />
    </Svg>
  );
}

function ProductsIllustration() {
  return (
    <Svg viewBox="0 0 360 250" width="100%" height="100%">
      <Ellipse cx="180" cy="220" rx="135" ry="14" fill={palette.line} />
      <Path d="M45 177c16-43 47-66 83-50 29 12 46 5 71-21 30-31 79-14 103 18 12 17 16 38 13 65H48z" fill={palette.greenWash} />
      <Rect x="49" y="119" width="74" height="82" rx="8" fill={palette.gold} stroke={palette.ink} strokeWidth="4" />
      <Path d="M65 119c0-27 42-27 42 0" fill="none" stroke={palette.ink} strokeWidth="4" strokeLinecap="round" />
      <Path d="M63 162c11-17 22-17 31-2 9-17 19-16 29-2v39H63z" fill={palette.green} />
      <Circle cx="78" cy="146" r="10" fill={palette.orange} />
      <Circle cx="104" cy="148" r="9" fill={palette.gold} />
      <Rect x="137" y="71" width="76" height="107" rx="7" fill={palette.white} stroke={palette.ink} strokeWidth="4" transform="rotate(-7 175 124)" />
      <Rect x="151" y="89" width="45" height="41" rx="3" fill={palette.orange} transform="rotate(-7 173 109)" />
      <Path d="M158 120c8-16 14-14 20-3 6-13 12-12 19-3v12h-39z" fill={palette.gold} />
      <Path d="M159 140h37M157 148h31M156 156h36" stroke={palette.darkGreen} strokeWidth="3" strokeLinecap="round" />
      <Rect x="232" y="94" width="75" height="82" rx="8" fill={palette.actionGreen} stroke={palette.ink} strokeWidth="4" />
      <Path d="M250 94c0-26 39-26 39 0" fill="none" stroke={palette.ink} strokeWidth="4" strokeLinecap="round" />
      <Path d="M252 113h35v42h-35z" fill={palette.greenWash} />
      <Path d="M259 121c-7 8-7 18 0 26m19-26c7 8 7 18 0 26" fill="none" stroke={palette.orange} strokeWidth="4" strokeLinecap="round" />
      <Circle cx="270" cy="134" r="7" fill={palette.gold} />
      <Path d="M77 81c11-10 19-11 29-1m150-28c8-8 15-9 23-3" fill="none" stroke={palette.orange} strokeWidth="4" strokeLinecap="round" />
      <Path d="m111 62 4-9 4 9 9 2-7 6 2 9-8-5-8 5 2-9-7-6z" fill={palette.gold} />
      <Circle cx="217" cy="59" r="5" fill={palette.orange} />
      <Line x1="134" y1="197" x2="226" y2="197" stroke={palette.ink} strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
}

function createStyles() {
  return StyleSheet.create({
  screen: { ...StyleSheet.absoluteFill, zIndex: 100, paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight || 24) + 12, paddingHorizontal: 16, paddingBottom: 62, justifyContent: 'space-between', backgroundColor: palette.paper },
  heading: { width: '100%', alignItems: 'center' },
  logo: { width: 96, height: 96 },
  title: { marginTop: 5, color: palette.darkGreen, fontSize: 25, lineHeight: 29, fontWeight: '900', textAlign: 'center' },
  copy: { maxWidth: 300, marginTop: 7, color: palette.muted, fontSize: 14, lineHeight: 19, textAlign: 'center' },
  illustrationStage: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
  illustration: { width: '100%', maxWidth: 355, height: 230, alignSelf: 'center' },
  footer: { width: '100%', maxWidth: 440, alignSelf: 'center', paddingBottom: 1 },
  pagination: { height: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  pageDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: palette.line },
  pageDotActive: { backgroundColor: palette.green },
  primaryButton: { minHeight: 54, marginTop: 7, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.actionGreen },
  primaryButtonText: { color: palette.white, fontSize: 13, fontWeight: '900' },
  guestLink: { minHeight: 34, marginTop: 2, alignItems: 'center', justifyContent: 'center' },
  guestLinkText: { color: palette.green, fontSize: 11, fontWeight: '900' },
  accountLink: { minHeight: 38, marginTop: 5, alignItems: 'center', justifyContent: 'center' },
  accountLinkText: { color: palette.muted, fontSize: 11, fontWeight: '600' },
  loginText: { color: palette.green, fontWeight: '900' },
  pressed: { opacity: 0.82 },
  });
}

let styles = createStyles();
registerShopThemeStyles(() => { styles = createStyles(); });