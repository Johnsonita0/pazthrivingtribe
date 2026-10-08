import { createElement } from 'react';
import { StyleSheet, View } from 'react-native';

export function CustomerCareEmbed() {
  return (
    <View style={styles.frame}>
      {createElement('iframe', {
        title: 'PAZ customer care contact form',
        src: 'https://www.pazthrivingtribe.org/#contact',
        style: { width: '100%', height: '100%', border: 0, backgroundColor: '#f8f6fc' },
        allow: 'clipboard-read; clipboard-write',
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { flex: 1, overflow: 'hidden', backgroundColor: '#f8f6fc' },
});
