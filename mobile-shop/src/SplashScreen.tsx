import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const WAVE_CYCLE_MS = 7000;

export function SplashScreen() {
  const wavePhase = useRef(new Animated.Value(0)).current;
  const loaderProgress = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();

  useEffect(() => {
    const waveAnimation = Animated.loop(Animated.sequence([
      Animated.timing(wavePhase, {
        toValue: 1,
        duration: WAVE_CYCLE_MS / 2,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(wavePhase, {
        toValue: 0,
        duration: WAVE_CYCLE_MS / 2,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ]));

    waveAnimation.start();
    return () => waveAnimation.stop();
  }, [wavePhase]);

  useEffect(() => {
    const animation = Animated.timing(loaderProgress, {
      toValue: 1,
      duration: WAVE_CYCLE_MS,
      easing: Easing.linear,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [loaderProgress]);

  const waveDrift = wavePhase.interpolate({ inputRange: [0, 1], outputRange: [-width * 0.12, width * 0.12] });
  const reverseWaveDrift = wavePhase.interpolate({ inputRange: [0, 1], outputRange: [width * 0.12, -width * 0.12] });
  const loaderTravel = loaderProgress.interpolate({ inputRange: [0, 1], outputRange: [0, 32] });

  return (
    <View style={styles.screen} accessibilityLabel="PAZ All-in-One Shop">
      <StatusBar style="dark" />
      <View style={styles.brandContent}>
        <Image source={require('../assets/paz-app-icon.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.name}>PAZ</Text>
        <Text style={styles.descriptor}>THRIVING SHOP</Text>
        <Text style={styles.tagline}>Shop Smarter  ·  Live Better . Paz Thriving</Text>
        <View style={styles.offer}>
          <Text style={styles.offerLine}>Ebooks  |  Journals  |  Digital Products</Text>
          <Text style={styles.offerLine}>Groceries  |  Gadgets &amp; More</Text>
        </View>
      </View>

      <View style={styles.waveStage} accessibilityElementsHidden>
        <Animated.View style={[styles.waveLayer, styles.waveRose, { transform: [{ translateX: reverseWaveDrift }] }]}>
          <Svg width="100%" height="100%" viewBox="0 0 600 180" preserveAspectRatio="none">
            <Path d="M0 42 C52 7 103 14 158 39 C211 64 260 68 312 40 C365 11 414 9 468 39 C518 67 564 65 600 39 L600 180 L0 180 Z" fill="#f04a83" />
          </Svg>
        </Animated.View>
        <Animated.View style={[styles.waveLayer, styles.wavePurple, { transform: [{ translateX: waveDrift }] }]}>
          <Svg width="100%" height="100%" viewBox="0 0 600 180" preserveAspectRatio="none">
            <Path d="M0 71 C59 39 111 42 168 67 C225 92 271 99 326 70 C381 41 430 37 481 66 C529 94 570 95 600 70 L600 180 L0 180 Z" fill="#6327c8" />
          </Svg>
        </Animated.View>
        <Animated.View style={[styles.waveLayer, styles.waveBlue, { transform: [{ translateX: reverseWaveDrift }] }]}>
          <Svg width="100%" height="100%" viewBox="0 0 600 180" preserveAspectRatio="none">
            <Path d="M0 98 C55 72 112 72 170 95 C225 118 275 127 330 98 C384 69 433 66 484 94 C532 121 570 121 600 97 L600 180 L0 180 Z" fill="#286bd1" />
          </Svg>
        </Animated.View>
        <Animated.View style={[styles.waveLayer, styles.waveOrange, { transform: [{ translateX: waveDrift }] }]}>
          <Svg width="100%" height="100%" viewBox="0 0 600 180" preserveAspectRatio="none">
            <Path d="M0 123 C56 99 112 99 170 120 C228 141 278 150 333 123 C387 96 435 91 486 119 C533 145 571 146 600 122 L600 180 L0 180 Z" fill="#f48528" />
          </Svg>
        </Animated.View>
        <Animated.View style={[styles.waveLayer, styles.waveYellow, { transform: [{ translateX: reverseWaveDrift }] }]}>
          <Svg width="100%" height="100%" viewBox="0 0 600 180" preserveAspectRatio="none">
            <Path d="M0 145 C55 124 113 123 171 142 C228 161 278 169 333 145 C388 121 437 116 487 141 C534 165 572 166 600 144 L600 180 L0 180 Z" fill="#ffc629" />
          </Svg>
        </Animated.View>
        <Animated.View style={[styles.waveLayer, styles.waveCoral, { transform: [{ translateX: waveDrift }] }]}>
          <Svg width="100%" height="100%" viewBox="0 0 600 180" preserveAspectRatio="none">
            <Path d="M0 164 C54 146 113 146 171 162 C229 178 279 184 334 164 C388 144 437 140 487 161 C534 180 572 182 600 163 L600 180 L0 180 Z" fill="#ed3e52" />
          </Svg>
        </Animated.View>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { transform: [{ translateX: loaderTravel }] }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden', paddingTop: 10, backgroundColor: '#ffffff' },
  brandContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, paddingBottom: 84 },
  logo: { width: 118, height: 118 },
  name: { marginTop: -2, color: '#49209b', fontSize: 45, lineHeight: 49, fontWeight: '900' },
  descriptor: { marginTop: 0, color: '#171717', fontSize: 13, letterSpacing: 2.7, fontWeight: '900' },
  tagline: { marginTop: 8, color: '#5936a5', fontSize: 14, fontStyle: 'italic', fontWeight: '600' },
  offer: { marginTop: 18, alignItems: 'center', gap: 6 },
  offerLine: { color: '#332552', fontSize: 9, lineHeight: 13, fontWeight: '700', textAlign: 'center' },
  waveStage: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '30%', minHeight: 140, overflow: 'hidden', backgroundColor: '#ffffff' },
  waveLayer: { position: 'absolute', left: '-30%', width: '160%', height: '100%' },
  waveRose: { top: -4 },
  wavePurple: { top: 4 },
  waveBlue: { top: 12 },
  waveOrange: { top: 19 },
  waveYellow: { top: 25 },
  waveCoral: { top: 30 },
  progressTrack: { position: 'absolute', bottom: 12, left: '50%', width: 48, height: 3, marginLeft: -24, overflow: 'hidden', borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.45)' },
  progressFill: { width: 20, height: '100%', borderRadius: 3, backgroundColor: '#ffffff' },
});