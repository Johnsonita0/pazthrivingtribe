import { createElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { palette, registerShopThemeStyles } from './ShopComponents';

export function CustomerCareEmbed() {
  return (
    <View style={styles.frame}>
      {createElement('iframe', {
        title: 'PAZ customer care contact form',
        src: 'https://www.pazthrivingtribe.org/#contact',
        style: { width: '100%', height: '100%', border: 0, backgroundColor: palette.paper },
        allow: 'clipboard-read; clipboard-write',
      })}
    </View>
  );
}

const createStyles = () => StyleSheet.create({
  frame: { flex: 1, overflow: 'hidden', backgroundColor: palette.paper },
});

let styles = createStyles();
registerShopThemeStyles(() => { styles = createStyles(); });
