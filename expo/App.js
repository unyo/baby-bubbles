import { StatusBar } from 'expo-status-bar';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import html from './webapp.generated';

const { ImpactFeedbackStyle: Impact, NotificationFeedbackType: Notify } = Haptics;

// One native haptic per event kind sent from the page's buzz().
const HAPTICS = {
  tap: () => Haptics.impactAsync(Impact.Light),
  trail: () => Haptics.selectionAsync(),
  pop: () => Haptics.impactAsync(Impact.Medium),
  shake: () => Haptics.impactAsync(Impact.Heavy),
  start: () => Haptics.notificationAsync(Notify.Success),
};

function onMessage(e) {
  let msg;
  try {
    msg = JSON.parse(e.nativeEvent.data);
  } catch {
    return;
  }
  if (!msg || msg.type !== 'haptic') return;
  const fire = HAPTICS[msg.kind] || HAPTICS.tap;
  const count = Math.max(1, Math.min(6, msg.count | 0));
  const gap = Math.max(30, Math.min(300, msg.gap | 0 || 70));
  for (let i = 0; i < count; i++) {
    setTimeout(() => fire().catch(() => {}), i * gap);
  }
}

export default function App() {
  useKeepAwake();
  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <WebView
        style={styles.root}
        source={{ html, baseUrl: 'https://localhost/' }}
        originWhitelist={['*']}
        onMessage={onMessage}
        javaScriptEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        setSupportMultipleWindows={false}
        allowsLinkPreview={false}
        textInteractionEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1b1464' },
});
