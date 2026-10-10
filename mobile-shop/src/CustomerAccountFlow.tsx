import { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, palette, registerShopThemeStyles } from './ShopComponents';
import { isSupabaseConfigured } from './supabaseClient';

export type AccountStep = 'notifications' | 'auth';
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

type LegalDocument = 'privacy' | 'terms';

const legalCopy: Record<LegalDocument, { title: string; paragraphs: string[] }> = {
  privacy: {
    title: 'Privacy Policy',
    paragraphs: [
      'PAZ may collect the details you provide, such as your name, email address, phone number, messages, and order information.',
      'We use this information to manage your account and orders, provide support, keep the service secure, and improve PAZ. We do not sell personal information.',
      'Payment card details are handled by the payment provider shown at checkout. PAZ receives the transaction status and reference, not your full card credentials.',
      'We keep information only as long as reasonably needed for the service, safety, operational records, and legal obligations. You may ask us to access, correct, or delete information you provided by emailing pazthrivingtribe@gmail.com.'
    ]
  },
  terms: {
    title: 'System Terms',
    paragraphs: [
      'Use accurate account details, keep your sign-in information private, and use the PAZ shop lawfully. You are responsible for activity carried out through your account.',
      'Product descriptions, prices, availability, and delivery or access details are shown with each product. Orders are subject to confirmation and successful payment where applicable.',
      'Digital materials are for personal use unless a separate licence says otherwise. Do not copy, redistribute, or resell them without permission.',
      'For customers under 18, a parent or legal guardian must be involved where required for registration, consent, or payment. For questions about these terms or an order, contact pazthrivingtribe@gmail.com.'
    ]
  }
};

type Props = {
  visible: boolean;
  step: AccountStep;
  initialAuthMode: 'signIn' | 'signUp';
  busy: boolean;
  error: string;
  notice: string;
  requireAuthentication?: boolean;
  onClose: () => void;
  onAllowNotifications: () => void;
  onSkipNotifications: () => void;
  onSubmitAuth: (mode: 'signIn' | 'signUp', name: string, identifier: string, password: string, remember: boolean, legalConsent: boolean) => void;
  onSocialSignIn: (provider: 'google' | 'facebook', remember: boolean) => void;
  onResetPassword: (identifier: string) => void;
  onBrowseAsGuest: () => void;
};

export function CustomerAccountFlow(props: Props) {
  const {
    visible, step, initialAuthMode, busy, error, notice, requireAuthentication = false, onClose,
    onAllowNotifications, onSkipNotifications,
    onSubmitAuth, onSocialSignIn, onResetPassword, onBrowseAsGuest,
  } = props;
  const [authMode, setAuthMode] = useState<'signIn' | 'signUp'>(initialAuthMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localAuthError, setLocalAuthError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [legalConsent, setLegalConsent] = useState(false);
  const [legalDocument, setLegalDocument] = useState<LegalDocument | null>(null);

  useEffect(() => {
    if (visible && step === 'auth') {
      setAuthMode(initialAuthMode);
      setLegalConsent(false);
    }
  }, [visible, step, initialAuthMode]);

  const title = step === 'notifications' ? 'Stay in the loop' :
    authMode === 'signIn' ? 'Welcome back' : 'Create your account';

  return (
    <>
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

        <ScrollView contentContainerStyle={[styles.content, step === 'auth' && styles.authPageContent]} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
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
                  <TextInput value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={palette.muted} autoCapitalize="words" maxLength={120} style={styles.authInput} />
                </View>
              ) : null}
              <View style={styles.authInputRow}>
                <Text style={styles.authInputIcon}>✉</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email or Phone Number"
                  placeholderTextColor={palette.muted}
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
                  placeholderTextColor={palette.muted}
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
                    placeholderTextColor={palette.muted}
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
              {authMode === 'signUp' ? (
                <View style={styles.legalConsent}>
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: legalConsent }}
                    accessibilityLabel="Agree to the System Terms and acknowledge the Privacy Policy"
                    onPress={() => setLegalConsent((accepted) => !accepted)}
                    style={styles.legalConsentToggle}
                  >
                    <View style={[styles.checkbox, legalConsent && styles.checkboxChecked]}>{legalConsent ? <Text style={styles.checkmark}>✓</Text> : null}</View>
                  </Pressable>
                  <Text style={styles.legalCopy}>
                    I agree to the{' '}
                    <Text accessibilityRole="link" onPress={() => setLegalDocument('terms')} style={styles.legalLink}>System Terms</Text>
                    {' '}and acknowledge the{' '}
                    <Text accessibilityRole="link" onPress={() => setLegalDocument('privacy')} style={styles.legalLink}>Privacy Policy</Text>
                    , including how PAZ uses account and order information.
                  </Text>
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
                  if (authMode === 'signUp' && !legalConsent) {
                    setLocalAuthError('Agree to the System Terms and acknowledge the Privacy Policy to create your account.');
                    return;
                  }
                  onSubmitAuth(authMode, name, email, password, rememberMe, legalConsent);
                }}
                style={({ pressed }) => [styles.loginButton, (busy || !isSupabaseConfigured || (authMode === 'signUp' && !legalConsent)) && styles.loginButtonDisabled, pressed && styles.buttonPressed]}
              >
                <Text style={styles.loginButtonText}>{busy ? 'Please wait…' : authMode === 'signIn' ? 'Login' : 'Sign Up'}</Text>
              </Pressable>
              <View style={styles.authDivider}><View style={styles.dividerLine} /><Text style={styles.dividerText}>or</Text><View style={styles.dividerLine} /></View>
              <Pressable accessibilityRole="button" disabled={busy || !isSupabaseConfigured || (authMode === 'signUp' && !legalConsent)} onPress={() => onSocialSignIn('google', rememberMe)} style={[styles.socialButton, (busy || !isSupabaseConfigured || (authMode === 'signUp' && !legalConsent)) && styles.socialButtonDisabled]}>
                <Text style={styles.googleMark}>G</Text>
                <Text style={styles.socialButtonText}>{busy ? 'Connecting…' : 'Continue with Google'}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" disabled={busy || !isSupabaseConfigured || (authMode === 'signUp' && !legalConsent)} onPress={() => onSocialSignIn('facebook', rememberMe)} style={[styles.socialButton, styles.facebookButton, (busy || !isSupabaseConfigured || (authMode === 'signUp' && !legalConsent)) && styles.socialButtonDisabled]}>
                <Text style={styles.facebookMark}>f</Text>
                <Text style={styles.socialButtonText}>{busy ? 'Connecting…' : 'Continue with Facebook'}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => { setLocalAuthError(''); setLegalConsent(false); setAuthMode((mode) => mode === 'signIn' ? 'signUp' : 'signIn'); }} style={styles.accountToggle}>
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
      <Modal visible={Boolean(legalDocument)} transparent animationType="fade" onRequestClose={() => setLegalDocument(null)}>
        <View style={styles.legalModalShade}>
          <View style={styles.legalModal}>
            <View style={styles.legalModalHeader}>
              <Text style={styles.legalModalTitle}>{legalDocument ? legalCopy[legalDocument].title : ''}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Close legal information" onPress={() => setLegalDocument(null)} style={styles.legalModalClose}><Text style={styles.legalModalCloseText}>×</Text></Pressable>
            </View>
            <ScrollView style={styles.legalModalBody}>
              {legalDocument ? legalCopy[legalDocument].paragraphs.map((paragraph) => <Text key={paragraph} style={styles.legalModalParagraph}>{paragraph}</Text>) : null}
            </ScrollView>
            <Pressable accessibilityRole="button" onPress={() => setLegalDocument(null)} style={styles.legalModalDone}><Text style={styles.legalModalDoneText}>Close</Text></Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

function createStyles() {
  return StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.paper },
  authPage: { backgroundColor: palette.paper },
  topBar: { minHeight: 78, paddingHorizontal: 19, borderBottomWidth: 1, borderBottomColor: palette.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: palette.white },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  logo: { width: 44, height: 44 },
  brandName: { color: palette.green, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  pageTitle: { marginTop: 3, color: palette.ink, fontSize: 18, fontWeight: '900' },
  close: { width: 40, height: 40, borderWidth: 1, borderColor: palette.line, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: palette.muted, fontSize: 27, lineHeight: 30 },
  content: { flexGrow: 1, width: '100%', maxWidth: 560, padding: 20, paddingBottom: 36, alignSelf: 'center' },
  authPageContent: { maxWidth: 480, paddingHorizontal: 16, paddingVertical: 18, justifyContent: 'center' },
  authCard: { width: '100%', minHeight: 610, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 19, borderWidth: 1, borderColor: palette.line, borderRadius: 24, alignItems: 'stretch', backgroundColor: palette.white, shadowColor: palette.ink, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.12, shadowRadius: 22, elevation: 5 },
  authBrand: { alignItems: 'center', marginBottom: 10 },
  authLogo: { width: 70, height: 70 },
  authBrandName: { marginTop: 0, color: palette.green, fontSize: 21, lineHeight: 24, fontWeight: '900' },
  authBrandDescriptor: { marginTop: 0, color: palette.ink, fontSize: 9, letterSpacing: 1.8, fontWeight: '900' },
  authTitle: { marginBottom: 13, color: palette.ink, fontSize: 22, lineHeight: 27, fontWeight: '900' },
  authInputRow: { minHeight: 48, marginTop: 9, paddingHorizontal: 12, borderWidth: 1, borderColor: palette.line, borderRadius: 11, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: palette.white },
  authInputIcon: { width: 17, color: palette.muted, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  authInput: { minWidth: 0, minHeight: 46, flex: 1, paddingVertical: 0, color: palette.ink, fontSize: 12 },
  passwordVisibility: { minWidth: 28, color: palette.muted, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  authOptions: { minHeight: 38, marginTop: 4, marginBottom: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  legalConsent: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 12, marginBottom: 10 },
  legalConsentToggle: { minWidth: 24, minHeight: 24, alignItems: 'center', justifyContent: 'center' },
  legalCopy: { flex: 1, color: palette.muted, fontSize: 10, lineHeight: 16 },
  legalLink: { color: palette.green, fontWeight: '900', textDecorationLine: 'underline' },
  legalModalShade: { flex: 1, justifyContent: 'center', padding: 18, backgroundColor: 'rgba(0, 0, 0, .62)' },
  legalModal: { width: '100%', maxHeight: '84%', padding: 18, borderWidth: 1, borderColor: palette.line, borderRadius: 18, backgroundColor: palette.white },
  legalModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: palette.line },
  legalModalTitle: { flex: 1, color: palette.ink, fontSize: 19, fontWeight: '900' },
  legalModalClose: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: palette.paper },
  legalModalCloseText: { color: palette.ink, fontSize: 24, lineHeight: 27 },
  legalModalBody: { marginTop: 10 },
  legalModalParagraph: { marginBottom: 13, color: palette.ink, fontSize: 13, lineHeight: 20 },
  legalModalDone: { minHeight: 42, marginTop: 6, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: palette.actionGreen },
  legalModalDoneText: { color: palette.white, fontSize: 13, fontWeight: '900' },
  rememberButton: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 7 },
  checkbox: { width: 16, height: 16, borderWidth: 1, borderColor: palette.muted, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { borderColor: palette.actionGreen, backgroundColor: palette.actionGreen },
  checkmark: { color: '#fff', fontSize: 11, lineHeight: 14, fontWeight: '900' },
  rememberLabel: { color: palette.ink, fontSize: 10, fontWeight: '700' },
  forgotLabel: { color: palette.green, fontSize: 10, fontWeight: '800' },
  loginButton: { minHeight: 50, marginTop: 4, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.actionGreen, shadowColor: palette.darkGreen, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  loginButtonDisabled: { opacity: 0.55 },
  loginButtonText: { color: palette.white, fontSize: 14, fontWeight: '900' },
  buttonPressed: { opacity: 0.78 },
  heroTitle: { color: palette.ink, fontSize: 25, lineHeight: 31, fontWeight: '900', textAlign: 'center' },
  copy: { marginTop: 9, marginBottom: 18, color: palette.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
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
  socialButton: { minHeight: 45, marginTop: 7, paddingHorizontal: 14, borderWidth: 1, borderColor: palette.line, borderRadius: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: palette.white },
  facebookButton: { marginTop: 8 },
  socialButtonDisabled: { opacity: 0.55 },
  googleMark: { color: '#4285f4', fontSize: 17, fontWeight: '900' },
  facebookMark: { color: '#1877f2', fontSize: 20, fontWeight: '900' },
  socialButtonText: { color: palette.ink, fontSize: 11, fontWeight: '800' },
  accountToggle: { minHeight: 34, marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  accountToggleText: { color: palette.muted, fontSize: 10, fontWeight: '600' },
  passwordWrap: { marginTop: 10, marginBottom: 12 },
  inputLabel: { marginBottom: 5, color: palette.ink, fontSize: 11, fontWeight: '800' },
  passwordInput: { minHeight: 47, paddingHorizontal: 12, borderWidth: 1, borderColor: palette.line, borderRadius: 8, color: palette.ink, backgroundColor: palette.white, fontSize: 13 },
  formError: { marginBottom: 12, color: palette.red, fontSize: 12, lineHeight: 18 },
  formNotice: { marginBottom: 12, color: palette.darkGreen, fontSize: 12, lineHeight: 18 },
  });
}

let styles = createStyles();
registerShopThemeStyles(() => { styles = createStyles(); });
