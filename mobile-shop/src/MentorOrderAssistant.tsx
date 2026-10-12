import { FontAwesome5 } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { formatPrice, Product, productImageUrl } from './api';
import { palette } from './ShopComponents';

type Recommendation = { productId: string; quantity: number };
type ChatMessage = { role: 'user' | 'assistant'; text: string; recommendations?: Recommendation[] };

type Props = {
  visible: boolean;
  initialRequest?: string;
  products: Product[];
  storageBaseUrl: string;
  signedIn: boolean;
  cartCount: number;
  onClose: () => void;
  onSignIn: () => void;
  onAsk: (message: string, history: { role: 'user' | 'assistant'; content: string }[]) => Promise<{
    message: string;
    recommendations: Recommendation[];
  }>;
  onAddToOrder: (product: Product, quantity: number) => boolean;
  onCheckout: () => void;
};

export function MentorOrderAssistant({
  visible,
  initialRequest,
  products,
  storageBaseUrl,
  signedIn,
  cartCount,
  onClose,
  onSignIn,
  onAsk,
  onAddToOrder,
  onCheckout,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'assistant',
    text: 'Hi, I’m Mentor Charles. Tell me what you’re looking for and I’ll help you choose from the products currently in the PAZ shop.',
  }]);
  const [draft, setDraft] = useState('');
  const [replyBusy, setReplyBusy] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!visible) return;
    setDraft(initialRequest || '');
    setError('');
  }, [initialRequest, visible]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, replyBusy]);

  const sendMessage = async () => {
    const message = draft.trim();
    if (!message || replyBusy) return;
    if (!signedIn) {
      setError('Sign in or create an account to order with Mentor Charles.');
      return;
    }
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', text: message }];
    setMessages(nextMessages);
    setDraft('');
    setError('');
    setReplyBusy(true);
    try {
      const response = await onAsk(message, nextMessages.slice(-8).map((item) => ({
        role: item.role,
        content: item.text,
      })));
      setMessages((current) => [...current, {
        role: 'assistant',
        text: response.message,
        recommendations: response.recommendations,
      }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Mentor Charles could not reply. Please try again.');
    } finally {
      setReplyBusy(false);
    }
  };

  const addRecommendation = (recommendation: Recommendation) => {
    const product = products.find((item) => item.id === recommendation.productId);
    if (!product) {
      setError('That product is no longer in the shop. Refresh the catalogue and ask Mentor Charles again.');
      return;
    }
    if (onAddToOrder(product, recommendation.quantity)) {
      setError('');
      setMessages((current) => [...current, {
        role: 'assistant',
        text: `${product.title} has been added to your order. You can ask me to add another item or review your order when you’re ready.`,
      }]);
    } else {
      setError('That item could not be added. It may be out of stock or use a different currency from the rest of your order.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.shade} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.robot}><FontAwesome5 name="robot" size={18} color={palette.white} /></View>
            <View style={styles.headerCopy}>
              <Text style={styles.name}>Mentor Charles</Text>
              <Text style={styles.subtitle}>PAZ shop ordering assistant</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Close Mentor Charles" onPress={onClose} style={styles.close}>
              <FontAwesome5 name="times" size={17} color={palette.muted} />
            </Pressable>
          </View>

          <ScrollView ref={scrollRef} contentContainerStyle={styles.messages} keyboardShouldPersistTaps="handled">
            {messages.map((item, index) => (
              <View key={`${item.role}-${index}`} style={[styles.messageRow, item.role === 'user' && styles.userRow]}>
                <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
                  <Text style={[styles.messageText, item.role === 'user' && styles.userMessageText]}>{item.text}</Text>
                  {item.recommendations?.map((recommendation) => {
                    const product = products.find((entry) => entry.id === recommendation.productId);
                    if (!product) return null;
                    const image = productImageUrl(product.cover, storageBaseUrl);
                    return (
                      <View key={recommendation.productId} style={styles.recommendation}>
                        {image ? <Image source={{ uri: image }} style={styles.productImage} resizeMode="cover" /> : <View style={[styles.productImage, styles.imageFallback]}><FontAwesome5 name="book-open" size={16} color={palette.green} /></View>}
                        <View style={styles.productCopy}>
                          <Text numberOfLines={2} style={styles.productTitle}>{product.title}</Text>
                          <Text style={styles.productPrice}>{formatPrice(product)}</Text>
                          <Text style={styles.quantity}>Suggested quantity: {recommendation.quantity}</Text>
                        </View>
                        <Pressable accessibilityRole="button" accessibilityLabel={`Add ${product.title} to your order`} onPress={() => addRecommendation(recommendation)} style={styles.addButton}>
                          <Text style={styles.addButtonText}>Add</Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
            {replyBusy ? <View style={styles.loading}><ActivityIndicator color={palette.green} /><Text style={styles.loadingText}>Mentor Charles is checking the shop…</Text></View> : null}
          </ScrollView>

          {!signedIn ? <View style={styles.signInNotice}>
            <Text style={styles.signInText}>Sign in to ask Mentor Charles to build your order.</Text>
            <Pressable accessibilityRole="button" onPress={onSignIn}><Text style={styles.signInAction}>Sign in</Text></Pressable>
          </View> : null}
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          {cartCount > 0 ? <Pressable accessibilityRole="button" onPress={onCheckout} style={styles.checkoutButton}>
            <FontAwesome5 name="shopping-bag" size={14} color={palette.white} />
            <Text style={styles.checkoutText}>Review order & checkout ({cartCount})</Text>
          </Pressable> : null}
          <View style={styles.composer}>
            <TextInput
              accessibilityLabel="Message Mentor Charles"
              value={draft}
              onChangeText={setDraft}
              editable={!replyBusy && signedIn}
              maxLength={600}
              multiline
              onSubmitEditing={() => void sendMessage()}
              placeholder="What would you like to order?"
              placeholderTextColor={palette.muted}
              style={styles.input}
            />
            <Pressable accessibilityRole="button" accessibilityLabel="Send message" disabled={!draft.trim() || replyBusy || !signedIn} onPress={() => void sendMessage()} style={[styles.sendButton, (!draft.trim() || replyBusy || !signedIn) && styles.disabledButton]}>
              {replyBusy ? <ActivityIndicator size="small" color={palette.white} /> : <FontAwesome5 name="paper-plane" size={15} color={palette.white} />}
            </Pressable>
          </View>
          <Text style={styles.disclaimer}>Mentor Charles can recommend and add shop items. You review your order and complete payment securely at checkout.</Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  shade: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#101a1488' },
  sheet: { height: '88%', maxHeight: 760, minHeight: 460, borderTopLeftRadius: 22, borderTopRightRadius: 22, backgroundColor: palette.paper, overflow: 'hidden' },
  header: { minHeight: 68, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: 1, borderColor: palette.line, backgroundColor: palette.white },
  robot: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.green },
  headerCopy: { flex: 1 },
  name: { color: palette.ink, fontSize: 16, fontWeight: '900' },
  subtitle: { marginTop: 2, color: palette.muted, fontSize: 10 },
  close: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  messages: { padding: 14, gap: 12 },
  messageRow: { flexDirection: 'row', justifyContent: 'flex-start' },
  userRow: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '92%', padding: 12, borderRadius: 15 },
  assistantBubble: { backgroundColor: palette.white, borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: palette.green, borderBottomRightRadius: 4 },
  messageText: { color: palette.ink, fontSize: 13, lineHeight: 19 },
  userMessageText: { color: palette.white },
  recommendation: { marginTop: 11, padding: 9, flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderColor: palette.line, borderRadius: 11, backgroundColor: palette.paper },
  productImage: { width: 44, height: 56, borderRadius: 6 },
  imageFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: palette.greenWash },
  productCopy: { flex: 1 },
  productTitle: { color: palette.ink, fontSize: 11, fontWeight: '800' },
  productPrice: { marginTop: 3, color: palette.green, fontSize: 11, fontWeight: '900' },
  quantity: { marginTop: 2, color: palette.muted, fontSize: 9 },
  addButton: { minWidth: 48, minHeight: 34, paddingHorizontal: 9, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: palette.green },
  addButtonText: { color: palette.white, fontSize: 11, fontWeight: '900' },
  loading: { padding: 12, flexDirection: 'row', alignItems: 'center', gap: 9 },
  loadingText: { color: palette.muted, fontSize: 11 },
  signInNotice: { paddingHorizontal: 15, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: palette.greenWash },
  signInText: { flex: 1, color: palette.darkGreen, fontSize: 11, fontWeight: '700' },
  signInAction: { paddingLeft: 10, color: palette.green, fontSize: 12, fontWeight: '900' },
  error: { marginHorizontal: 14, marginBottom: 8, color: palette.red, fontSize: 11, lineHeight: 16 },
  checkoutButton: { minHeight: 44, marginHorizontal: 14, marginBottom: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderRadius: 11, backgroundColor: palette.actionGreen },
  checkoutText: { color: palette.white, fontSize: 12, fontWeight: '900' },
  composer: { marginHorizontal: 12, marginTop: 4, padding: 7, flexDirection: 'row', alignItems: 'flex-end', gap: 8, borderWidth: 1, borderColor: palette.line, borderRadius: 14, backgroundColor: palette.white },
  input: { flex: 1, maxHeight: 90, minHeight: 40, paddingHorizontal: 8, paddingTop: 10, color: palette.ink, fontSize: 13 },
  sendButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: palette.green },
  disabledButton: { opacity: 0.45 },
  disclaimer: { paddingHorizontal: 15, paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 20 : 10, color: palette.muted, fontSize: 9, lineHeight: 13, textAlign: 'center' },
});
