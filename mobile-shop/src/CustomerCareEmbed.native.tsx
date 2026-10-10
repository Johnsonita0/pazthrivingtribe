import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { palette, registerShopThemeStyles } from './ShopComponents';

export function CustomerCareEmbed() {
  return (
    <WebView
      source={{ uri: 'https://www.pazthrivingtribe.org/#contact' }}
      style={styles.webView}
      startInLoadingState
      renderLoading={() => <View style={styles.loading}><ActivityIndicator color={palette.green} /></View>}
      javaScriptEnabled
      domStorageEnabled
      originWhitelist={['https://*']}
      setSupportMultipleWindows={false}
    />
  );
}

const createStyles = () => StyleSheet.create({
  webView: { flex: 1, backgroundColor: palette.paper },
  loading: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.paper },
});

let styles = createStyles();
registerShopThemeStyles(() => { styles = createStyles(); });
