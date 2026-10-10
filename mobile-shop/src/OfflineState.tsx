import { FontAwesome5 } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import { palette, registerShopThemeStyles } from './ShopComponents';

type Props = { offline: boolean; onRetry: () => void };

export function OfflineState({ offline, onRetry }: Props) {
  const motion = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(motion, { toValue: 1, duration: 1350, easing: Easing.inOut(Easing.ease), useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(motion, { toValue: 0, duration: 1350, easing: Easing.inOut(Easing.ease), useNativeDriver: Platform.OS !== 'web' }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [motion]);

  const drift = motion.interpolate({ inputRange: [0, 1], outputRange: [3, -5] });
  const ringScale = motion.interpolate({ inputRange: [0, 1], outputRange: [0.78, 1.18] });
  const ringOpacity = motion.interpolate({ inputRange: [0, 1], outputRange: [0.42, 0.04] });

  return (
    <View style={[styles.screen, { backgroundColor: palette.paper }]}>
      <View style={styles.content}>
        <View style={styles.illustrationStage} accessibilityElementsHidden>
          <Animated.View style={[styles.pulseRing, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]} />
          <Animated.View style={[styles.illustration, { transform: [{ translateY: drift }] }]}>
            <Svg width="100%" height="100%" viewBox="0 0 320 230">
              <Ellipse cx="160" cy="205" rx="112" ry="12" fill={palette.line} />
              <Circle cx="160" cy="119" r="84" fill={palette.greenWash} />
              <Path d="M73 117c0-18 14-32 32-32 7-22 28-37 52-37 28 0 51 21 54 48 17 1 30 15 30 32 0 18-15 33-33 33H105c-18 0-32-14-32-32z" fill={palette.line} />
              <Rect x="126" y="61" width="68" height="130" rx="16" fill={palette.actionGreen} />
              <Rect x="132" y="68" width="56" height="115" rx="11" fill={palette.paper} />
              <Rect x="151" y="73" width="18" height="3" rx="2" fill={palette.darkGreen} />
              <Circle cx="160" cy="126" r="26" fill={palette.greenWash} />
              <Path d="M142 119c10-10 26-10 36 0M148 126c7-7 17-7 24 0M157 133h6" fill="none" stroke={palette.green} strokeWidth="3.5" strokeLinecap="round" />
              <Path d="m146 108 28 35" fill="none" stroke={palette.orange} strokeWidth="4" strokeLinecap="round" />
              <Path d="M143 151h34M148 159h24" fill="none" stroke={palette.darkGreen} strokeWidth="3" strokeLinecap="round" />
              <Circle cx="221" cy="83" r="17" fill={palette.gold} />
              <Path d="m212 83 6 6 12-13" fill="none" stroke="#2e2a26" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <Circle cx="95" cy="155" r="6" fill={palette.orange} />
              <Path d="M99 62c7-8 15-11 24-10M216 128c8 2 13 7 17 14" fill="none" stroke={palette.blue} strokeWidth="3" strokeLinecap="round" strokeDasharray="3 7" />
            </Svg>
          </Animated.View>
        </View>
        <Text style={styles.title}>{offline ? 'You’re offline' : 'Can’t reach PAZ'}</Text>
        <Text style={styles.copy}>Check your connection, then try again.</Text>
        <Pressable accessibilityRole="button" onPress={onRetry} style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}>
          <FontAwesome5 name="redo-alt" size={13} color={palette.white} />
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles() {
  return StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', backgroundColor: palette.paper },
  content: { width: '100%', maxWidth: 360, alignSelf: 'center', alignItems: 'center' },
  illustrationStage: { width: '100%', height: 245, alignItems: 'center', justifyContent: 'center' },
  pulseRing: { position: 'absolute', width: 170, height: 170, borderWidth: 2, borderColor: palette.line, borderRadius: 85 },
  illustration: { width: '100%', height: 230 },
  title: { marginTop: 7, color: palette.ink, fontSize: 22, fontWeight: '900', textAlign: 'center' },
  copy: { marginTop: 7, color: palette.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  retryButton: { minHeight: 44, minWidth: 128, marginTop: 20, paddingHorizontal: 20, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: palette.actionGreen },
  retryText: { color: palette.white, fontSize: 12, fontWeight: '900' },
  pressed: { opacity: 0.78 },
  });
}

let styles = createStyles();
registerShopThemeStyles(() => { styles = createStyles(); });