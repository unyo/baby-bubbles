import { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { buyFriends, inExpoGo, restoreFriends, storeAvailable } from './store';

// Short in-app copy of docs/privacy.html (Apple wants the policy reachable inside the app).
const PRIVACY = [
  "Chloe's Bubbles does not collect, store, or share any personal information. No accounts, ads, analytics, or tracking, and it doesn't need the internet to play.",
  'Motion sensors move the bubbles on this device only. Nothing is recorded or sent anywhere, and the app never uses the camera or microphone.',
  "The optional animal unlock is processed by Apple. We never see your name, Apple ID, or payment details.",
  'Because nothing is collected, there is nothing to delete. Removing the app removes everything it stored. The full policy is on the App Store page.',
];

function makeQuestion() {
  const a = 3 + Math.floor(Math.random() * 7);
  const b = 3 + Math.floor(Math.random() * 7);
  const answer = a * b;
  const choices = new Set([answer]);
  while (choices.size < 4) {
    const wrong = answer + (Math.floor(Math.random() * 9) - 4) * (1 + Math.floor(Math.random() * 3));
    if (wrong > 0 && wrong !== answer) choices.add(wrong);
  }
  return { text: `${a} × ${b}`, answer, choices: [...choices].sort(() => Math.random() - 0.5) };
}

// Parental gate, then the unlock / restore screen.
export default function GrownUps({ visible, onClose, unlocked, price, setUnlocked, error }) {
  const [passed, setPassed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [showPrivacy, setShowPrivacy] = useState(false);
  const q = useMemo(makeQuestion, [visible]);

  const close = () => {
    setPassed(false);
    setNote('');
    setShowPrivacy(false);
    onClose();
  };
  const answer = n => {
    if (n === q.answer) setPassed(true);
    else close();
  };
  const run = async fn => {
    setBusy(true);
    setNote('');
    try {
      await fn();
    } catch (e) {
      setNote(e?.message || 'Something went wrong. Please try again.');
    }
    setBusy(false);
  };

  let body;
  if (passed && showPrivacy) {
    body = (
      <ScrollView style={{ maxHeight: 420 }}>
        <Text style={styles.title}>Privacy</Text>
        {PRIVACY.map(p => (
          <Text key={p} style={styles.small}>{p}</Text>
        ))}
        <Pressable accessibilityRole="button" style={styles.secondary} onPress={() => setShowPrivacy(false)}>
          <Text style={styles.secondaryText}>Back</Text>
        </Pressable>
      </ScrollView>
    );
  } else if (!passed) {
    body = (
      <>
        <Text style={styles.title}>Ask a grown-up</Text>
        <Text style={styles.text} accessibilityRole="header">What is {q.text}?</Text>
        <View style={styles.row}>
          {q.choices.map(n => (
            <Pressable accessibilityRole="button" key={n} style={styles.choice} onPress={() => answer(n)}>
              <Text style={styles.choiceText}>{n}</Text>
            </Pressable>
          ))}
        </View>
      </>
    );
  } else if (unlocked) {
    body = (
      <>
        <Text style={styles.title}>Thank you! 💜</Text>
        <Text style={styles.text}>The cat, bunny, frog, pig and chick are unlocked.</Text>
        {inExpoGo && (
          <Pressable accessibilityRole="button" style={styles.secondary} onPress={() => setUnlocked(false)}>
            <Text style={styles.secondaryText}>Lock again (Expo Go preview)</Text>
          </Pressable>
        )}
      </>
    );
  } else {
    body = (
      <>
        <Text style={styles.title}>More animal friends</Text>
        <Text style={styles.text}>
          Add a cat, bunny, frog, pig and chick to the bubbles. It's a one-time purchase that
          helps cover the cost of making the app.
        </Text>
        {inExpoGo ? (
          <Pressable accessibilityRole="button" style={styles.primary} onPress={() => setUnlocked(true)}>
            <Text style={styles.primaryText}>Preview animals (Expo Go only)</Text>
          </Pressable>
        ) : storeAvailable() ? (
          <>
            <Pressable accessibilityRole="button" style={styles.primary} disabled={busy} onPress={() => run(buyFriends)}>
              <Text style={styles.primaryText}>Unlock{price ? ` for ${price}` : ''}</Text>
            </Pressable>
            <Pressable
              style={styles.secondary}
              disabled={busy}
              onPress={() =>
                run(async () => {
                  if (await restoreFriends()) setUnlocked(true);
                  else setNote('No previous purchase found.');
                })
              }
            >
              <Text style={styles.secondaryText}>Restore purchase</Text>
            </Pressable>
          </>
        ) : (
          <Text style={styles.text}>The store isn't available right now.</Text>
        )}
        {busy && <ActivityIndicator color="#fff" style={{ marginTop: 12 }} />}
      </>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {body}
          {!!(note || error) && <Text style={styles.note}>{note || error}</Text>}
          {passed && !showPrivacy && (
            <Pressable accessibilityRole="button" style={styles.secondary} onPress={() => setShowPrivacy(true)}>
              <Text style={styles.secondaryText}>Privacy policy</Text>
            </Pressable>
          )}
          <Pressable accessibilityRole="button" style={styles.close} onPress={close}>
            <Text style={styles.secondaryText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 380, backgroundColor: '#2b1f7a', borderRadius: 24, padding: 24, alignItems: 'center' },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  text: { color: '#e6e0ff', fontSize: 16, lineHeight: 22, textAlign: 'center', marginBottom: 16 },
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  choice: { backgroundColor: 'rgba(255,255,255,.15)', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18 },
  choiceText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  primary: { backgroundColor: '#ffd35e', borderRadius: 999, paddingVertical: 14, paddingHorizontal: 28 },
  primaryText: { color: '#1b1464', fontSize: 17, fontWeight: '700' },
  secondary: { marginTop: 12, padding: 8 },
  secondaryText: { color: '#cfc6ff', fontSize: 15, fontWeight: '600' },
  close: { marginTop: 16, padding: 8 },
  small: { color: '#e6e0ff', fontSize: 15, lineHeight: 21, marginBottom: 10 },
  note: { color: '#ffb3b3', marginTop: 12, textAlign: 'center' },
});
