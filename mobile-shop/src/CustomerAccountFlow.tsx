import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Field, palette } from './ShopComponents';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export type AccountStep = 'preferences' | 'notifications' | 'auth' | 'dashboard';
export type AccountPreferences = {
  countryCode: string;
  language: string;
  currency: string;
  notificationsEnabled: boolean;
  setupComplete: boolean;
};
export type AccountUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, any>;
} | null;

type Props = {
  visible: boolean;
  step: AccountStep;
  preferences: AccountPreferences;
  user: AccountUser;
  busy: boolean;
  error: string;
  notice: string;
  onClose: () => void;
  onPreferencesChange: (value: AccountPreferences) => void;
  onContinuePreferences: () => void;
  onEditPreferences: () => void;
  onAllowNotifications: () => void;
  onSkipNotifications: () => void;
  onSubmitAuth: (mode: 'signIn' | 'signUp', name: string, email: string, password: string) => void;
  onSignOut: () => void;
  onBrowseAsGuest: () => void;
};

const countries = [
  { code: 'NG', name: 'Nigeria', currency: 'NGN' },
  { code: 'GH', name: 'Ghana', currency: 'GHS' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
  { code: 'US', name: 'United States', currency: 'USD' },
];
const currencies = ['NGN', 'GHS', 'GBP', 'USD'];

type CustomerOrder = {
  id: string;
  order_number: string;
  total: number | null;
  currency: string | null;
  status: string | null;
  created_at: string;
  shop_order_items?: { title: string | null; quantity: number | null }[];
};

export function CustomerAccountFlow(props: Props) {
  const {
    visible, step, preferences, user, busy, error, notice, onClose,
    onPreferencesChange, onContinuePreferences, onEditPreferences, onAllowNotifications, onSkipNotifications,
    onSubmitAuth, onSignOut, onBrowseAsGuest,
  } = props;
  const [authMode, setAuthMode] = useState<'signIn' | 'signUp'>('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    if (step !== 'dashboard' || !user?.email || !isSupabaseConfigured) {
      setOrders([]);
      setOrdersError('');
      return;
    }
    let active = true;
    setOrdersLoading(true);
    setOrdersError('');
    void supabase
      .from('shop_orders')
      .select('id,order_number,total,currency,status,created_at,shop_order_items(title,quantity)')
      .ilike('email', user.email)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data, error: queryError }: { data: CustomerOrder[] | null; error: { message: string } | null }) => {
        if (!active) return;
        if (queryError) throw new Error(queryError.message);
        setOrders(data || []);
      })
      .catch((loadError: unknown) => {
        if (active) setOrdersError(loadError instanceof Error ? loadError.message : 'Order history could not be loaded.');
      })
      .finally(() => {
        if (active) setOrdersLoading(false);
      });
    return () => { active = false; };
  }, [step, user?.id, user?.email]);

  const updateCountry = (countryCode: string) => {
    const country = countries.find((item) => item.code === countryCode);
    if (!country) return;
    onPreferencesChange({ ...preferences, countryCode, currency: country.currency });
  };

  const title = step === 'preferences' ? 'Make PAZ yours' :
    step === 'notifications' ? 'Stay in the loop' :
      step === 'dashboard' ? 'Your account' :
        authMode === 'signIn' ? 'Welcome back' : 'Create your account';

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="fullScreen">
      <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          <View style={styles.brand}>
            <Image source={require('../assets/paz-logo.png')} style={styles.logo} resizeMode="contain" />
            <View>
              <Text style={styles.brandName}>PAZ THRIVING TRIBE</Text>
              <Text style={styles.pageTitle}>{title}</Text>
            </View>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Close account" onPress={onClose} style={styles.close}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {step === 'preferences' ? (
            <>
              <View style={styles.hero}>
                <Text style={styles.heroIcon}>🌍</Text>
                <Text style={styles.heroTitle}>A shop that feels closer.</Text>
                <Text style={styles.copy}>Choose your region and currency. You can change these preferences later.</Text>
              </View>
              <Text style={styles.sectionTitle}>Country or region</Text>
              {countries.map((country) => (
                <Pressable
                  key={country.code}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: preferences.countryCode === country.code }}
                  onPress={() => updateCountry(country.code)}
                  style={[styles.option, preferences.countryCode === country.code && styles.optionSelected]}
                >
                  <View><Text style={styles.optionTitle}>{country.name}</Text><Text style={styles.optionCopy}>{country.code}</Text></View>
                  <Text style={styles.optionCurrency}>{country.currency}</Text>
                </Pressable>
              ))}
              <Text style={[styles.sectionTitle, styles.currencyTitle]}>Currency</Text>
              <Text style={styles.currencyHint}>Choose a preferred currency. Product prices stay in their listed currency.</Text>
              <View style={styles.currencyRow}>
                {currencies.map((currency) => (
                  <Pressable
                    key={currency}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: preferences.currency === currency }}
                    onPress={() => onPreferencesChange({ ...preferences, currency })}
                    style={[styles.currencyOption, preferences.currency === currency && styles.currencySelected]}
                  >
                    <Text style={[styles.currencyText, preferences.currency === currency && styles.currencyTextSelected]}>{currency}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.languageCard}>
                <Text style={styles.sectionTitle}>Language</Text>
                <Text style={styles.optionTitle}>English</Text>
                <Text style={styles.optionCopy}>Currently available language</Text>
              </View>
              {error ? <Text accessibilityRole="alert" style={styles.formError}>{error}</Text> : null}
              <Button title="Continue" onPress={onContinuePreferences} />
              <Pressable accessibilityRole="button" onPress={onBrowseAsGuest} style={styles.textButton}>
                <Text style={styles.textButtonLabel}>Browse as guest</Text>
              </Pressable>
            </>
          ) : null}

          {step === 'notifications' ? (
            <View style={styles.centered}>
              <View style={styles.notifyIcon}><Text style={styles.notifyIconText}>✦</Text></View>
              <Text style={styles.heroTitle}>Only if you want them.</Text>
              <Text style={styles.copy}>You can allow optional PAZ app notifications now, or skip and keep shopping. You can change notification access in your device settings.</Text>
              {error ? <Text accessibilityRole="alert" style={styles.formError}>{error}</Text> : null}
              <Button title="Allow notifications" onPress={onAllowNotifications} />
              <Pressable accessibilityRole="button" onPress={onSkipNotifications} style={styles.textButton}>
                <Text style={styles.textButtonLabel}>Not now</Text>
              </Pressable>
            </View>
          ) : null}

          {step === 'auth' ? (
            <View style={styles.authContent}>
              <Text style={styles.copy}>{authMode === 'signIn' ? 'Sign in to see your profile and order history.' : 'Create an account to keep your PAZ details and purchases together.'}</Text>
              {!isSupabaseConfigured ? <Text style={styles.formError}>Supabase is not configured for mobile accounts yet.</Text> : null}
              {authMode === 'signUp' ? <Field label="Full name" value={name} onChangeText={setName} placeholder="Your name" maxLength={120} /> : null}
              <Field label="Email address" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" maxLength={254} />
              <View style={styles.passwordWrap}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput value={password} onChangeText={setPassword} placeholder="Enter your password" placeholderTextColor="#87948a" secureTextEntry autoCapitalize="none" autoCorrect={false} style={styles.passwordInput} />
              </View>
              {error ? <Text accessibilityRole="alert" style={styles.formError}>{error}</Text> : null}
              {notice ? <Text style={styles.formNotice}>{notice}</Text> : null}
              <Button title={busy ? 'Please wait…' : authMode === 'signIn' ? 'Sign in' : 'Create account'} disabled={busy || !isSupabaseConfigured} onPress={() => onSubmitAuth(authMode, name, email, password)} />
              <Pressable accessibilityRole="button" onPress={() => setAuthMode((mode) => mode === 'signIn' ? 'signUp' : 'signIn')} style={styles.textButton}>
                <Text style={styles.textButtonLabel}>{authMode === 'signIn' ? 'New to PAZ? Create an account' : 'Already have an account? Sign in'}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={onBrowseAsGuest} style={styles.textButton}>
                <Text style={styles.mutedButtonLabel}>Continue shopping as a guest</Text>
              </Pressable>
            </View>
          ) : null}

          {step === 'dashboard' ? (
            <View>
              <View style={styles.profileCard}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{(user?.user_metadata?.full_name || user?.email || 'P').slice(0, 1).toUpperCase()}</Text></View>
                <View style={styles.profileText}>
                  <Text style={styles.profileName}>{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'PAZ customer'}</Text>
                  <Text style={styles.optionCopy}>{user?.email}</Text>
                </View>
              </View>
              <View style={styles.preferenceSummary}>
                <View><Text style={styles.sectionTitle}>Shopping preferences</Text><Text style={styles.optionCopy}>{countries.find((country) => country.code === preferences.countryCode)?.name || preferences.countryCode} · {preferences.language} · {preferences.currency}</Text></View>
                <Pressable accessibilityRole="button" onPress={onEditPreferences} style={styles.editButton}><Text style={styles.editButtonText}>Edit</Text></Pressable>
              </View>
              <View style={styles.ordersHeading}><Text style={styles.sectionTitle}>Your orders</Text><Text style={styles.optionCopy}>Most recent first</Text></View>
              {!isSupabaseConfigured ? <Text style={styles.formError}>Connect Supabase to view account data.</Text> : null}
              {ordersLoading ? <ActivityIndicator color={palette.green} style={styles.spinner} /> : null}
              {ordersError ? <Text accessibilityRole="alert" style={styles.formError}>{ordersError}</Text> : null}
              {!ordersLoading && !ordersError && isSupabaseConfigured && orders.length === 0 ? (
                <View style={styles.emptyOrders}><Text style={styles.emptyTitle}>No orders yet</Text><Text style={styles.optionCopy}>Your completed purchases will appear here.</Text></View>
              ) : null}
              {orders.map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderHeader}><Text style={styles.orderNumber}>{order.order_number}</Text><Text style={styles.orderStatus}>{order.status || 'processing'}</Text></View>
                  <Text style={styles.optionCopy}>{new Date(order.created_at).toLocaleDateString()} · {order.currency || '—'} {Number(order.total || 0).toLocaleString()}</Text>
                  {order.shop_order_items?.length ? <Text style={styles.orderItems}>{order.shop_order_items.map((item) => `${item.title || 'PAZ product'} ×${item.quantity || 1}`).join(' · ')}</Text> : null}
                </View>
              ))}
              {notice ? <Text style={styles.formNotice}>{notice}</Text> : null}
              <Button title="Sign out" secondary onPress={onSignOut} />
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.paper },
  topBar: { minHeight: 78, paddingHorizontal: 19, borderBottomWidth: 1, borderBottomColor: palette.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: palette.white },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  logo: { width: 44, height: 44 },
  brandName: { color: palette.green, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  pageTitle: { marginTop: 3, color: palette.ink, fontSize: 18, fontWeight: '900' },
  close: { width: 40, height: 40, borderWidth: 1, borderColor: palette.line, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: palette.muted, fontSize: 27, lineHeight: 30 },
  content: { flexGrow: 1, width: '100%', maxWidth: 560, padding: 20, paddingBottom: 36, alignSelf: 'center' },
  hero: { alignItems: 'center', paddingTop: 8, paddingBottom: 22 },
  heroIcon: { fontSize: 42, marginBottom: 9 },
  heroTitle: { color: palette.ink, fontSize: 25, lineHeight: 31, fontWeight: '900', textAlign: 'center' },
  copy: { marginTop: 9, marginBottom: 18, color: palette.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  sectionTitle: { color: palette.ink, fontSize: 14, fontWeight: '900' },
  option: { minHeight: 59, marginTop: 8, paddingHorizontal: 14, borderWidth: 1, borderColor: palette.line, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: palette.white },
  optionSelected: { borderColor: palette.green, backgroundColor: palette.greenWash },
  optionTitle: { color: palette.ink, fontSize: 13, fontWeight: '800' },
  optionCopy: { marginTop: 3, color: palette.muted, fontSize: 11 },
  optionCurrency: { color: palette.darkGreen, fontSize: 12, fontWeight: '900' },
  currencyTitle: { marginTop: 18 },
  currencyHint: { marginTop: 5, color: palette.muted, fontSize: 10, lineHeight: 15 },
  currencyRow: { flexDirection: 'row', gap: 8, marginTop: 9 },
  currencyOption: { flex: 1, minHeight: 41, borderWidth: 1, borderColor: palette.line, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.white },
  currencySelected: { borderColor: palette.green, backgroundColor: palette.green },
  currencyText: { color: palette.ink, fontSize: 11, fontWeight: '900' },
  currencyTextSelected: { color: palette.white },
  languageCard: { marginTop: 18, marginBottom: 22, padding: 14, borderWidth: 1, borderColor: palette.line, borderRadius: 12, backgroundColor: palette.white },
  textButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: 13 },
  textButtonLabel: { color: palette.green, fontSize: 12, fontWeight: '900', textAlign: 'center' },
  mutedButtonLabel: { color: palette.muted, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  centered: { flex: 1, minHeight: 500, justifyContent: 'center', alignItems: 'center' },
  notifyIcon: { width: 82, height: 82, marginBottom: 22, borderRadius: 41, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.greenWash },
  notifyIconText: { color: palette.green, fontSize: 42, fontWeight: '800' },
  authContent: { paddingTop: 15 },
  passwordWrap: { marginTop: 10, marginBottom: 12 },
  inputLabel: { marginBottom: 5, color: palette.ink, fontSize: 11, fontWeight: '800' },
  passwordInput: { minHeight: 47, paddingHorizontal: 12, borderWidth: 1, borderColor: palette.line, borderRadius: 8, color: palette.ink, backgroundColor: palette.white, fontSize: 13 },
  formError: { marginBottom: 12, color: '#a12720', fontSize: 12, lineHeight: 18 },
  formNotice: { marginBottom: 12, color: palette.darkGreen, fontSize: 12, lineHeight: 18 },
  profileCard: { minHeight: 88, padding: 16, borderWidth: 1, borderColor: palette.line, borderRadius: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: palette.white },
  avatar: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.greenWash },
  avatarText: { color: palette.darkGreen, fontSize: 20, fontWeight: '900' },
  profileText: { flex: 1, marginLeft: 13 },
  profileName: { color: palette.ink, fontSize: 15, fontWeight: '900' },
  preferenceSummary: { marginTop: 17, padding: 14, borderWidth: 1, borderColor: palette.line, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: palette.white },
  editButton: { padding: 8 },
  editButtonText: { color: palette.green, fontSize: 12, fontWeight: '900' },
  ordersHeading: { marginTop: 24, marginBottom: 10 },
  spinner: { marginVertical: 18 },
  emptyOrders: { padding: 18, borderWidth: 1, borderColor: palette.line, borderRadius: 12, alignItems: 'center', backgroundColor: palette.white },
  emptyTitle: { color: palette.ink, fontSize: 13, fontWeight: '900' },
  orderCard: { marginBottom: 9, padding: 14, borderWidth: 1, borderColor: palette.line, borderRadius: 12, backgroundColor: palette.white },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  orderNumber: { color: palette.ink, fontSize: 12, fontWeight: '900' },
  orderStatus: { color: palette.darkGreen, fontSize: 10, fontWeight: '900', textTransform: 'capitalize' },
  orderItems: { marginTop: 8, color: palette.ink, fontSize: 11, lineHeight: 16 },
});
