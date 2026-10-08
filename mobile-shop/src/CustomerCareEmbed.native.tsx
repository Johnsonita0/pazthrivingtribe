import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export function CustomerCareEmbed() {
  return (
    <WebView
      source={{ uri: 'https://www.pazthrivingtribe.org/#contact' }}
      style={styles.webView}
      startInLoadingState
      renderLoading={() => <View style={styles.loading}><ActivityIndicator color="#145c3d" /></View>}
      javaScriptEnabled
      domStorageEnabled
      originWhitelist={['https://*']}
      setSupportMultipleWindows={false}
    />
  );
}

const styles = StyleSheet.create({
  webView: { flex: 1, backgroundColor: '#f8f6fc' },
  loading: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f6fc' },
});
