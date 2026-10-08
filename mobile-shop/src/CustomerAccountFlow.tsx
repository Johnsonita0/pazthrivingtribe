import { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, palette } from './ShopComponents';
import { isSupabaseConfigured } from './supabaseClient';

export type AccountStep = 'preferences' | 'notifications' | 'auth';
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
  initialAuthMode: 'signIn' | 'signUp';
  preferences: AccountPreferences;
  busy: boolean;
  error: string;
  notice: string;
  requireAuthentication?: boolean;
  onClose: () => void;
  onPreferencesChange: (value: AccountPreferences) => void;
  onContinuePreferences: () => void;
  onAllowNotifications: () => void;
  onSkipNotifications: () => void;
  onSubmitAuth: (mode: 'signIn' | 'signUp', name: string, identifier: string, password: string, remember: boolean) => void;
  onSocialSignIn: (provider: 'google' | 'facebook', remember: boolean) => void;
  onResetPassword: (identifier: string) => void;
  onBrowseAsGuest: () => void;
};

const countries = [
  { code: 'NG', name: 'Nigeria', currency: 'NGN' },
  { code: 'GH', name: 'Ghana', currency: 'GHS' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
  { code: 'US', name: 'United States', currency: 'USD' },
];
const currencies = ['NGN', 'GHS', 'GBP', 'USD'];

export function CustomerAccountFlow(props: Props) {
  const {
    visible, step, initialAuthMode, preferences, busy, error, notice, requireAuthentication = false, onClose,
    onPreferencesChange, onContinuePreferences, onAllowNotifications, onSkipNotifications,
    onSubmitAuth, onSocialSignIn, onResetPassword, onBrowseAsGuest,
  } = props;
  const [authMode, setAuthMode] = useState<'signIn' | 'signUp'>(initialAuthMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localAuthError, setLocalAuthError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (visible && step === 'auth') setAuthMode(initialAuthMode);
  }, [visible, step, initialAuthMode]);

  const updateCountry = (countryCode: string) => {
    const country = countries.find((item) => item.code === countryCode);
    if (!country) return;
    onPreferencesChange({ ...preferences, countryCode, currency: country.currency });
  };

  const title = step === 'preferences' ? 'Make PAZ yours' :
    step === 'notifications' ? 'Stay in the loop' :
        authMode === 'signIn' ? 'Welcome back' : 'Create your account';

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="fullScreen">
      <KeyboardAvoidingView style={[styles.page, step === 'auth' && styles.authPage]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {step !== 'auth' ? <View style={styles.topBar}>
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
        </View> : null}

        <ScrollView contentContainerStyle={[styles.content, step === 'auth' && styles.authPageContent]} keyboardShouldPersistTaps="handled">
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
            <View style={styles.authCard}>
              <View style={styles.authBrand}>
                <Image source={require('../assets/paz-emblem.png')} style={styles.authLogo} resizeMode="contain" />
                <Text style={styles.authBrandName}>PAZ</Text>
                <Text style={styles.authBrandDescriptor}>DIGITAL SHOP</Text>
              </View>
              <Text style={styles.authTitle}>{authMode === 'signIn' ? 'Login' : 'Create Account'}</Text>
              {!isSupabaseConfigured ? <Text style={styles.formError}>Supabase is not configured for mobile accounts yet.</Text> : null}
              {authMode === 'signUp' ? (
                <View style={styles.authInputRow}>
                  <Text style={styles.authInputIcon}>♙</Text>
                  <TextInput value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor="#8490a8" autoCapitalize="words" maxLength={120} style={styles.authInput} />
                </View>
              ) : null}
              <View style={styles.authInputRow}>
                <Text style={styles.authInputIcon}>✉</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email or Phone Number"
                  placeholderTextColor="#8490a8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={254}
                  style={styles.authInput}
                />
              </View>
              <View style={styles.authInputRow}>
                <Text style={styles.authInputIcon}>▣</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor="#8490a8"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.authInput}
                />
                <Pressable accessibilityRole="button" accessibilityLabel={showPassword ? 'Hide password' : 'Show password'} onPress={() => setShowPassword((visible) => !visible)} hitSlop={8}>
                  <Text style={styles.passwordVisibility}>{showPassword ? 'Hide' : '◉'}</Text>
                </Pressable>
              </View>
              {authMode === 'signUp' ? (
                <View style={styles.authInputRow}>
                  <Text style={styles.authInputIcon}>▣</Text>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={(value) => { setConfirmPassword(value); setLocalAuthError(''); }}
                    placeholder="Confirm Password"
                    placeholderTextColor="#8490a8"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.authInput}
                  />
                  <Pressable accessibilityRole="button" accessibilityLabel={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'} onPress={() => setShowConfirmPassword((visible) => !visible)} hitSlop={8}>
                    <Text style={styles.passwordVisibility}>{showConfirmPassword ? 'Hide' : '◉'}</Text>
                  </Pressable>
                </View>
              ) : null}
              {authMode === 'signIn' ? (
                <View style={styles.authOptions}>
                  <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: rememberMe }} onPress={() => setRememberMe((checked) => !checked)} style={styles.rememberButton}>
                    <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>{rememberMe ? <Text style={styles.checkmark}>✓</Text> : null}</View>
                    <Text style={styles.rememberLabel}>Remember me</Text>
                  </Pressable>
                  <Pressable accessibilityRole="button" onPress={() => onResetPassword(email)} hitSlop={6}>
                    <Text style={styles.forgotLabel}>Forgot Password?</Text>
                  </Pressable>
                </View>
              ) : null}
              {localAuthError || error ? <Text accessibilityRole="alert" style={styles.formError}>{localAuthError || error}</Text> : null}
              {notice ? <Text style={styles.formNotice}>{notice}</Text> : null}
              <Pressable
                accessibilityRole="button"
                disabled={busy || !isSupabaseConfigured}
                onPress={() => {
                  setLocalAuthError('');
                  if (authMode === 'signUp' && password !== confirmPassword) {
                    setLocalAuthError('Your passwords do not match.');
                    return;
                  }
                  onSubmitAuth(authMode, name, email, password, rememberMe);
                }}
                style={({ pressed }) => [styles.loginButton, (busy || !isSupabaseConfigured) && styles.loginButtonDisabled, pressed && styles.buttonPressed]}
              >
                <Text style={styles.loginButtonText}>{busy ? 'Please wait…' : authMode === 'signIn' ? 'Login' : 'Sign Up'}</Text>
              </Pressable>
              <View style={styles.authDivider}><View style={styles.dividerLine} /><Text style={styles.dividerText}>or</Text><View style={styles.dividerLine} /></View>
              <Pressable accessibilityRole="button" disabled={busy || !isSupabaseConfigured} onPress={() => onSocialSignIn('google', rememberMe)} style={[styles.socialButton, (busy || !isSupabaseConfigured) && styles.socialButtonDisabled]}>
                <Text style={styles.googleMark}>G</Text>
                <Text style={styles.socialButtonText}>{busy ? 'Connecting…' : 'Continue with Google'}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" disabled={busy || !isSupabaseConfigured} onPress={() => onSocialSignIn('facebook', rememberMe)} style={[styles.socialButton, styles.facebookButton, (busy || !isSupabaseConfigured) && styles.socialButtonDisabled]}>
                <Text style={styles.facebookMark}>f</Text>
                <Text style={styles.socialButtonText}>{busy ? 'Connecting…' : 'Continue with Facebook'}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => { setLocalAuthError(''); setAuthMode((mode) => mode === 'signIn' ? 'signUp' : 'signIn'); }} style={styles.accountToggle}>
                <Text style={styles.accountToggleText}>{authMode === 'signIn' ? "Don't have an account? " : 'Already have an account? '}</Text>
                <Text style={styles.textButtonLabel}>{authMode === 'signIn' ? 'Sign Up' : 'Login'}</Text>
              </Pressable>
              {!requireAuthentication ? (
                <Pressable accessibilityRole="button" onPress={onBrowseAsGuest} style={styles.textButton}>
                  <Text style={styles.textButtonLabel}>Continue as guest</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.paper },
  authPage: { backgroundColor: '#f5f8ff' },
  topBar: { minHeight: 78, paddingHorizontal: 19, borderBottomWidth: 1, borderBottomColor: palette.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: palette.white },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  logo: { width: 44, height: 44 },
  brandName: { color: palette.green, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  pageTitle: { marginTop: 3, color: palette.ink, fontSize: 18, fontWeight: '900' },
  close: { width: 40, height: 40, borderWidth: 1, borderColor: palette.line, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: palette.muted, fontSize: 27, lineHeight: 30 },
  content: { flexGrow: 1, width: '100%', maxWidth: 560, padding: 20, paddingBottom: 36, alignSelf: 'center' },
  authPageContent: { maxWidth: 480, paddingHorizontal: 16, paddingVertical: 18, justifyContent: 'center' },
  authCard: { width: '100%', minHeight: 610, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 19, borderWidth: 1, borderColor: '#d8e3ff', borderRadius: 24, alignItems: 'stretch', backgroundColor: '#fff', shadowColor: '#5872b5', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.12, shadowRadius: 22, elevation: 5 },
  authBrand: { alignItems: 'center', marginBottom: 10 },
  authLogo: { width: 70, height: 70 },
  authBrandName: { marginTop: 0, color: '#5120b9', fontSize: 21, lineHeight: 24, fontWeight: '900' },
  authBrandDescriptor: { marginTop: 0, color: '#21153d', fontSize: 9, letterSpacing: 1.8, fontWeight: '900' },
  authTitle: { marginBottom: 13, color: '#291450', fontSize: 22, lineHeight: 27, fontWeight: '900' },
  authInputRow: { minHeight: 48, marginTop: 9, paddingHorizontal: 12, borderWidth: 1, borderColor: '#dce3f0', borderRadius: 11, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff' },
  authInputIcon: { width: 17, color: '#68758f', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  authInput: { minWidth: 0, minHeight: 46, flex: 1, paddingVertical: 0, color: '#21153d', fontSize: 12 },
  passwordVisibility: { minWidth: 28, color: '#71809b', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  authOptions: { minHeight: 38, marginTop: 4, marginBottom: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  rememberButton: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 7 },
  checkbox: { width: 16, height: 16, borderWidth: 1, borderColor: '#8a7aa7', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { borderColor: '#4e1bb9', backgroundColor: '#4e1bb9' },
  checkmark: { color: '#fff', fontSize: 11, lineHeight: 14, fontWeight: '900' },
  rememberLabel: { color: '#46395e', fontSize: 10, fontWeight: '700' },
  forgotLabel: { color: '#5621b8', fontSize: 10, fontWeight: '800' },
  loginButton: { minHeight: 50, marginTop: 4, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#4e1bb9', shadowColor: '#3f159d', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  loginButtonDisabled: { opacity: 0.55 },
  loginButtonText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  buttonPressed: { opacity: 0.78 },
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notifyIcon: { width: 82, height: 82, marginBottom: 22, borderRadius: 41, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.greenWash },
  notifyIconText: { color: palette.green, fontSize: 42, fontWeight: '800' },
  authContent: { paddingTop: 15 },
  authDivider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 16 },
  dividerLine: { height: 1, flex: 1, backgroundColor: palette.line },
  dividerText: { color: palette.muted, fontSize: 11, fontWeight: '700' },
  socialButton: { minHeight: 45, marginTop: 7, paddingHorizontal: 14, borderWidth: 1, borderColor: '#dce3f0', borderRadius: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#fff' },
  facebookButton: { marginTop: 8 },
  socialButtonDisabled: { opacity: 0.55 },
  googleMark: { color: '#4285f4', fontSize: 17, fontWeight: '900' },
  facebookMark: { color: '#1877f2', fontSize: 20, fontWeight: '900' },
  socialButtonText: { color: '#34405b', fontSize: 11, fontWeight: '800' },
  accountToggle: { minHeight: 34, marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  accountToggleText: { color: '#66728a', fontSize: 10, fontWeight: '600' },
  passwordWrap: { marginTop: 10, marginBottom: 12 },
  inputLabel: { marginBottom: 5, color: palette.ink, fontSize: 11, fontWeight: '800' },
  passwordInput: { minHeight: 47, paddingHorizontal: 12, borderWidth: 1, borderColor: palette.line, borderRadius: 8, color: palette.ink, backgroundColor: palette.white, fontSize: 13 },
  formError: { marginBottom: 12, color: '#a12720', fontSize: 12, lineHeight: 18 },
  formNotice: { marginBottom: 12, color: palette.darkGreen, fontSize: 12, lineHeight: 18 },
});
