import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, Text, View } from 'react-native';

export function SplashScreen() {
  return (
    <View style={styles.screen} accessibilityLabel="PAZ Digital Shop">
      <StatusBar style="dark" />
      <View style={styles.brandContent}>
        <Image source={require('../assets/paz-app-icon.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.name}>PAZ</Text>
        <Text style={styles.descriptor}>DIGITAL SHOP</Text>
        <Text style={styles.tagline}>Shop Smarter  ·  Live Better</Text>
        <View style={styles.offer}>
          <Text style={styles.offerLine}>Ebooks  |  Journals  |  Digital Products</Text>
          <Text style={styles.offerLine}>Groceries  |  Gadgets &amp; More</Text>
        </View>
      </View>

      <View style={styles.waveStage} accessibilityElementsHidden>
        <View style={[styles.wave, styles.waveRose]} />
        <View style={[styles.wave, styles.wavePurple]} />
        <View style={[styles.wave, styles.waveBlue]} />
        <View style={[styles.wave, styles.waveOrange]} />
        <View style={[styles.wave, styles.waveYellow]} />
        <View style={[styles.wave, styles.waveCoral]} />
        <View style={styles.progressTrack}><View style={styles.progressFill} /></View>
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
  waveStage: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '27%', minHeight: 100, overflow: 'hidden', backgroundColor: '#ed477d' },
  wave: { position: 'absolute', borderRadius: 999 },
  waveRose: { width: '122%', height: 86, left: '-12%', top: -41, backgroundColor: '#f04a83', transform: [{ rotate: '7deg' }] },
  wavePurple: { width: '84%', height: 86, left: '-18%', top: -16, backgroundColor: '#6327c8', transform: [{ rotate: '10deg' }] },
  waveBlue: { width: '75%', height: 76, right: '-25%', top: 20, backgroundColor: '#286bd1', transform: [{ rotate: '-10deg' }] },
  waveOrange: { width: '88%', height: 81, right: '-21%', top: -31, backgroundColor: '#f48528', transform: [{ rotate: '-17deg' }] },
  waveYellow: { width: '63%', height: 65, right: '-4%', top: -27, backgroundColor: '#ffc629', transform: [{ rotate: '-18deg' }] },
  waveCoral: { width: '94%', height: 88, left: '20%', bottom: -68, backgroundColor: '#ed3e52', transform: [{ rotate: '-10deg' }] },
  progressTrack: { position: 'absolute', bottom: 12, left: '50%', width: 48, height: 3, marginLeft: -24, overflow: 'hidden', borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.45)' },
  progressFill: { width: 20, height: '100%', borderRadius: 3, backgroundColor: '#ffffff' },
});