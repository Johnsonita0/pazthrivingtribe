import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Image, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, StatusBar as NativeStatusBar, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { CartView } from './src/CartView';
import { CatalogView } from './src/CatalogView';
import { apiRequest, CartLine, formatPrice, normalizeProduct, Product, productAvailability, productImageUrl, productSlug, Rating } from './src/api';
import { ProductDetailView, ProductMetrics } from './src/ProductDetailView';
import { Button, Field, palette } from './src/ShopComponents';
import { ensureCustomerProfile, isSupabaseConfigured, supabase } from './src/supabaseClient';
import { AccountPreferences, AccountStep, AccountUser, CustomerAccountFlow } from './src/CustomerAccountFlow';

const CART_KEY = 'paz-shop-cart-v1';
const VISITOR_KEY = 'paz-shop-visitor-id';
const ACCOUNT_PREFERENCES_KEY = 'paz-shop-account-preferences-v1';
type Screen = 'catalog' | 'detail' | 'success';
type OrderRequest = { reference: string; orderNumber: string; email: string; customerName: string; items: { id: string; quantity: number }[] };
const DEFAULT_ACCOUNT_PREFERENCES: AccountPreferences = {
  countryCode: 'NG',
  language: 'English',
  currency: 'NGN',
  notificationsEnabled: false,
  setupComplete: false,
};

function LoadingBars() {
  const bars = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;

  useEffect(() => {
    const animations = bars.map((value, index) => Animated.loop(Animated.sequence([
      Animated.delay(index * 110),
      Animated.timing(value, { toValue: 1, duration: 300, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(value, { toValue: 0, duration: 300, useNativeDriver: Platform.OS !== 'web' }),
    ])));
    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [bars]);

  const colors = [palette.green, palette.orange, palette.darkGreen, '#f3c98e'];

  return (
    <View style={styles.appLoaderBars} accessibilityElementsHidden>
      {bars.map((value, index) => (
        <Animated.View
          key={index}
          style={[
            styles.appLoaderBar,
            {
              backgroundColor: colors[index],
              opacity: value.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }),
              transform: [{ scaleY: value.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }) }],
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [storageBaseUrl, setStorageBaseUrl] = useState('');
  const [screen, setScreen] = useState<Screen>('catalog');
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);
  const [flyingProduct, setFlyingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [notice, setNotice] = useState('');
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [metrics, setMetrics] = useState<ProductMetrics | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingName, setRatingName] = useState('');
  const [ratingEmail, setRatingEmail] = useState('');
  const [ratingComment, setRatingComment] = useState('');
  const [ratingBusy, setRatingBusy] = useState(false);
  const [notifyProduct, setNotifyProduct] = useState<Product | null>(null);
  const [notifyName, setNotifyName] = useState('');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifyPhone, setNotifyPhone] = useState('');
  const [notifyBusy, setNotifyBusy] = useState(false);
  const [notifyError, setNotifyError] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [pendingCheckout, setPendingCheckout] = useState<OrderRequest | null>(null);
  const [completedOrder, setCompletedOrder] = useState<{ orderNumber: string; email: string } | null>(null);
  const [accountVisible, setAccountVisible] = useState(false);
  const [accountStep, setAccountStep] = useState<AccountStep>('auth');
  const [accountPreferences, setAccountPreferences] = useState<AccountPreferences>(DEFAULT_ACCOUNT_PREFERENCES);
  const [accountSetupLoaded, setAccountSetupLoaded] = useState(false);
  const [authNotice, setAuthNotice] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [currentUser, setCurrentUser] = useState<AccountUser>(null);
  const [chatVisible, setChatVisible] = useState(false);
  const [chatName, setChatName] = useState('');
  const [chatEmail, setChatEmail] = useState('');
  const [chatPhone, setChatPhone] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatReply, setChatReply] = useState('');
  const [chatToken, setChatToken] = useState('');
  const [chatMessages, setChatMessages] = useState<Record<string, unknown>[]>([]);
  const [chatBusy, setChatBusy] = useState(false);
  const [chatNotice, setChatNotice] = useState('');
  const pendingOrderRef = useRef<OrderRequest | null>(null);
  const completedReferencesRef = useRef(new Set<string>());
  const processPaymentRef = useRef<(reference: string) => Promise<void>>(async () => {});
  const flightProgress = useRef(new Animated.Value(0)).current;
  const { width: windowWidth } = useWindowDimensions();

  const categories = useMemo(() => ['All', ...new Set(products.map((product) => product.category).filter(Boolean))], [products]);
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const cartTotal = cart.reduce((sum, line) => sum + (line.product.isFree ? 0 : line.product.price) * line.quantity, 0);
  const cartCurrency = cart.find((line) => !line.product.isFree)?.product.currency || cart[0]?.product.currency || 'NGN';
  const allFree = cart.length > 0 && cart.every((line) => line.product.isFree);
  const totalLabel = formatPrice({ price: cartTotal, currency: cartCurrency, isFree: allFree });
  const accountLabel = currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.first_name || currentUser?.email?.split('@')[0] || 'Account';

  const loadProducts = async () => {
    setLoading(true);
    setPageError('');
    try {
      const payload = await apiRequest('/store-products-public');
      setProducts((Array.isArray(payload.data) ? payload.data : []).map(normalizeProduct).filter((product: Product) => product.id));
      setStorageBaseUrl(String(payload.storageBaseUrl || ''));
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'The shop could not be loaded.');
    } finally {
      setLoading(false);
      setInitialLoadComplete(true);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setCurrentUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;
    const loadAccountSetup = async () => {
      let preferences = DEFAULT_ACCOUNT_PREFERENCES;
      const validCountries = ['NG', 'GH', 'GB', 'US'];
      const validCurrencies = ['NGN', 'GHS', 'GBP', 'USD'];
      const stored = await AsyncStorage.getItem(ACCOUNT_PREFERENCES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AccountPreferences>;
        if (validCountries.includes(String(parsed.countryCode)) && validCurrencies.includes(String(parsed.currency))) {
          preferences = {
            ...DEFAULT_ACCOUNT_PREFERENCES,
            ...parsed,
            language: 'English',
            setupComplete: parsed.setupComplete === true,
            notificationsEnabled: parsed.notificationsEnabled === true,
          };
        }
      }

      if (isSupabaseConfigured) {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw new Error(error.message);
        if (session?.user) {
          setCurrentUser(session.user);
          const { data: profile, error: profileError } = await supabase
            .from('customer_profiles')
            .select('country_code,language,currency,notifications_enabled')
            .eq('id', session.user.id)
            .maybeSingle();
          if (profileError) {
            console.warn('Could not load PAZ account preferences from Supabase:', profileError.message);
          } else if (profile) {
            preferences = {
              ...preferences,
              countryCode: validCountries.includes(String(profile.country_code)) ? String(profile.country_code) : preferences.countryCode,
              language: 'English',
              currency: validCurrencies.includes(String(profile.currency)) ? String(profile.currency) : preferences.currency,
              notificationsEnabled: profile.notifications_enabled === true,
              setupComplete: true,
            };
            void AsyncStorage.setItem(ACCOUNT_PREFERENCES_KEY, JSON.stringify(preferences)).catch((storageError) => {
              console.warn('Could not cache PAZ account preferences:', storageError);
            });
          }
        }
      }

      if (!active) return;
      setAccountPreferences(preferences);
      if (!preferences.setupComplete) {
        setAccountStep('preferences');
        setAccountVisible(true);
      }
    };
    void loadAccountSetup().catch((error) => {
      console.warn('Could not load saved PAZ account preferences:', error);
      if (active) {
        setAccountPreferences(DEFAULT_ACCOUNT_PREFERENCES);
        setAccountStep('preferences');
        setAccountVisible(true);
      }
    }).finally(() => {
      if (active) setAccountSetupLoaded(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!currentUser || !accountPreferences.setupComplete) return;
    void ensureCustomerProfile(currentUser, {
      country_code: accountPreferences.countryCode,
      language: accountPreferences.language,
      currency: accountPreferences.currency,
      notifications_enabled: accountPreferences.notificationsEnabled,
    });
  }, [currentUser, accountPreferences]);

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.email) setCustomerEmail((current) => current || currentUser.email || '');
    const profileName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.first_name;
    if (profileName) setCustomerName((current) => current || profileName);
  }, [currentUser]);

  useEffect(() => {
    void loadProducts();
    AsyncStorage.getItem(CART_KEY).then((stored) => {
      if (stored) setCart((JSON.parse(stored) as CartLine[]).filter((line) => line?.product?.id && Number(line.quantity) > 0));
    }).catch(() => {}).finally(() => setCartLoaded(true));
  }, []);

  useEffect(() => {
    if (cartLoaded) void AsyncStorage.setItem(CART_KEY, JSON.stringify(cart)).catch(() => {});
  }, [cart, cartLoaded]);

  const finishPayment = async (reference: string) => {
    const order = pendingOrderRef.current;
    if (!order || !reference || completedReferencesRef.current.has(reference)) return;
    setCheckoutBusy(true);
    setCheckoutError('');
    try {
      await apiRequest('/complete-shop-payment', 'POST', { reference, orderNumber: order.orderNumber, email: order.email, customerName: order.customerName, items: order.items });
      completedReferencesRef.current.add(reference);
      pendingOrderRef.current = null;
      setPendingCheckout(null);
      setCart([]);
      setCartVisible(false);
      setCompletedOrder({ orderNumber: order.orderNumber, email: order.email });
      setScreen('success');
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Payment could not be verified yet.');
    } finally {
      setCheckoutBusy(false);
    }
  };
  processPaymentRef.current = finishPayment;

  useEffect(() => {
    const onUrl = ({ url }: { url: string }) => {
      try {
        const parsed = new URL(url);
        const reference = parsed.searchParams.get('reference') || parsed.searchParams.get('trxref') || '';
        if (parsed.protocol === 'pazshop:' && reference) void processPaymentRef.current(reference);
      } catch {
        return;
      }
    };
    const subscription = Linking.addEventListener('url', onUrl);
    void Linking.getInitialURL().then((url) => { if (url) onUrl({ url }); });
    return () => subscription.remove();
  }, []);

  const trackView = async (product: Product) => {
    try {
      let sessionId = await AsyncStorage.getItem(VISITOR_KEY);
      if (!sessionId) {
        sessionId = `mobile-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        await AsyncStorage.setItem(VISITOR_KEY, sessionId);
      }
      const key = `paz-mobile-view:${productSlug(product.title)}`;
      if (await AsyncStorage.getItem(key)) return;
      await AsyncStorage.setItem(key, '1');
      try {
        await apiRequest('/track-visitor', 'POST', { path: `/shop/${productSlug(product.title)}`, sessionId });
      } catch {
        await AsyncStorage.removeItem(key);
      }
    } catch {
      return;
    }
  };

  const openProduct = async (product: Product) => {
    setSelectedProduct(product);
    setRatings([]);
    setMetrics(null);
    setRatingValue(0);
    setScreen('detail');
    setDetailLoading(true);
    void trackView(product);
    const [ratingResult, metricResult] = await Promise.allSettled([
      apiRequest(`/product-ratings?productId=${encodeURIComponent(product.id)}`),
      apiRequest(`/product-metrics?productId=${encodeURIComponent(product.id)}`),
    ]);
    if (ratingResult.status === 'fulfilled') setRatings(Array.isArray(ratingResult.value.data) ? ratingResult.value.data : []);
    if (metricResult.status === 'fulfilled') setMetrics(metricResult.value);
    setDetailLoading(false);
  };

  const addToCart = (product: Product) => {
    const availability = productAvailability(product);
    if (!availability.available) {
      if (availability.reason === 'not-released') {
        setNotifyProduct(product);
        setNotifyError('');
      } else setNotice(availability.message);
      return;
    }
    if (!product.inStock || product.stockCount <= 0) return setNotice('This product is currently out of stock.');
    const conflict = cart.find((line) => !line.product.isFree && !product.isFree && line.product.currency !== product.currency);
    if (conflict) return setNotice(`Your bag uses ${conflict.product.currency}. Complete that order before adding ${product.currency} products.`);
    setCart((current) => {
      const existing = current.find((line) => line.product.id === product.id);
      return existing ? current.map((line) => line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { product, quantity: 1 }];
    });
    setFlyingProduct(product);
    flightProgress.setValue(0);
    Animated.timing(flightProgress, { toValue: 1, duration: 620, easing: Easing.inOut(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }).start(({ finished }) => {
      if (finished) setFlyingProduct(null);
    });
    setNotice(`${product.title} added to your bag.`);
  };

  const updateQuantity = (id: string, delta: number) => setCart((current) => current
    .map((line) => line.product.id === id ? { ...line, quantity: Math.min(line.product.stockCount || 100, line.quantity + delta) } : line)
    .filter((line) => line.quantity > 0));

  const submitNotify = async () => {
    if (!notifyProduct) return;
    setNotifyBusy(true);
    setNotifyError('');
    try {
      await apiRequest('/product-release-notification', 'POST', { productId: notifyProduct.id, name: notifyName, email: notifyEmail, phone: notifyPhone });
      setNotice(`You’ll get an email when ${notifyProduct.title} is available.`);
      setNotifyProduct(null);
      setNotifyName('');
      setNotifyEmail('');
      setNotifyPhone('');
    } catch (error) {
      setNotifyError(error instanceof Error ? error.message : 'Your notification could not be saved.');
    } finally {
      setNotifyBusy(false);
    }
  };

  const submitRating = async () => {
    if (!selectedProduct || !ratingName.trim() || !ratingValue) return setNotice('Choose a star rating and enter your name first.');
    setRatingBusy(true);
    try {
      const payload = await apiRequest('/product-ratings', 'POST', { productId: selectedProduct.id, reviewerName: ratingName, reviewerEmail: ratingEmail, rating: ratingValue, comment: ratingComment });
      setRatings((current) => [payload.data, ...current]);
      setRatingName(''); setRatingEmail(''); setRatingComment(''); setRatingValue(0);
      setNotice('Thanks. Your rating has been saved.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Your rating could not be saved.');
    } finally {
      setRatingBusy(false);
    }
  };

  const openChat = async () => {
    if (!selectedProduct) return;
    setChatVisible(true); setChatNotice('');
    const token = await AsyncStorage.getItem(`paz-product-chat-${selectedProduct.id}`).catch(() => null);
    if (!token) return;
    setChatToken(token); setChatBusy(true);
    try {
      const payload = await apiRequest('/product-chat', 'POST', { action: 'read', token });
      if (String(payload.conversation?.product_id) !== selectedProduct.id) throw new Error('This conversation belongs to another product.');
      setChatMessages(payload.messages || []);
    } catch (error) {
      setChatToken('');
      await AsyncStorage.removeItem(`paz-product-chat-${selectedProduct.id}`).catch(() => {});
      setChatNotice(error instanceof Error ? error.message : 'This conversation could not be opened.');
    } finally { setChatBusy(false); }
  };

  const startChat = async () => {
    if (!selectedProduct) return;
    setChatBusy(true); setChatNotice('');
    try {
      const payload = await apiRequest('/product-chat', 'POST', { action: 'start', productId: selectedProduct.id, name: chatName, email: chatEmail, phone: chatPhone, message: chatMessage, website: '' });
      setChatToken(payload.token || ''); setChatMessages(payload.messages || []);
      if (payload.token) await AsyncStorage.setItem(`paz-product-chat-${selectedProduct.id}`, payload.token);
      setChatMessage('');
      setChatNotice(payload.emailSent ? 'Message sent. A secure link was emailed to you.' : 'Message saved. You can continue this conversation here.');
    } catch (error) { setChatNotice(error instanceof Error ? error.message : 'Your message could not be sent.'); }
    finally { setChatBusy(false); }
  };

  const sendChatReply = async () => {
    if (!chatToken || !chatReply.trim()) return;
    setChatBusy(true);
    try {
      const payload = await apiRequest('/product-chat', 'POST', { action: 'send', token: chatToken, message: chatReply });
      setChatMessages((current) => [...current, payload.message]); setChatReply('');
      setChatNotice(payload.emailSent ? 'Reply sent.' : 'Reply saved.');
    } catch (error) { setChatNotice(error instanceof Error ? error.message : 'Your reply could not be sent.'); }
    finally { setChatBusy(false); }
  };

  const saveAccountPreferences = async (preferences: AccountPreferences) => {
    setAuthError('');
    try {
      await AsyncStorage.setItem(ACCOUNT_PREFERENCES_KEY, JSON.stringify(preferences));
      setAccountPreferences(preferences);
      if (currentUser) {
        const profile = await ensureCustomerProfile(currentUser, {
          country_code: preferences.countryCode,
          language: preferences.language,
          currency: preferences.currency,
          notifications_enabled: preferences.notificationsEnabled,
        });
        if (!profile) throw new Error('Your preferences were saved on this device but could not be synced to your PAZ profile.');
      }
      return true;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Your preferences could not be saved.');
      return false;
    }
  };

  const continuePreferences = async () => {
    const wasSetupComplete = accountPreferences.setupComplete;
    const nextPreferences = { ...accountPreferences, setupComplete: true };
    if (!await saveAccountPreferences(nextPreferences)) return;
    setAccountStep(wasSetupComplete ? currentUser ? 'dashboard' : 'auth' : 'notifications');
  };

  const finishNotificationStep = async (notificationsEnabled: boolean) => {
    const nextPreferences = { ...accountPreferences, setupComplete: true, notificationsEnabled };
    if (!await saveAccountPreferences(nextPreferences)) return;
    setAccountStep(currentUser ? 'dashboard' : 'auth');
  };

  const allowNotifications = async () => {
    setAuthError('');
    try {
      const permission = await Notifications.requestPermissionsAsync();
      const enabled = permission.granted || permission.status === 'granted';
      await finishNotificationStep(enabled);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Notification permission could not be requested. You can choose “Not now” to continue.');
    }
  };

  const browseAsGuest = async () => {
    if (!accountPreferences.setupComplete) {
      const guestPreferences = { ...accountPreferences, setupComplete: true, notificationsEnabled: false };
      if (!await saveAccountPreferences(guestPreferences)) return;
    }
    setAccountVisible(false);
  };

  const submitAuth = async (mode: 'signIn' | 'signUp', name: string, emailInput: string, passwordInput: string) => {
    if (!isSupabaseConfigured) {
      setAuthError('Supabase is not configured yet for mobile sign-in.');
      return;
    }
    if (!emailInput.trim() || !passwordInput.trim()) {
      setAuthError('Enter both your email and password to continue.');
      return;
    }
    if (mode === 'signUp' && !name.trim()) {
      setAuthError('Enter your name to create your account.');
      return;
    }
    setAuthBusy(true);
    setAuthError('');
    setAuthNotice('');
    try {
      const email = emailInput.trim().toLowerCase();
      const password = passwordInput;
      const result = mode === 'signIn'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: name.trim() } },
          });
      if (result.error) throw new Error(result.error.message);
      const user = result.data?.session?.user ?? (mode === 'signIn' ? result.data?.user : null);
      if (!user) {
        setAuthNotice('Your account was created. Check your email to confirm it, then sign in.');
        setAuthBusy(false);
        return;
      }
      setCurrentUser(user);
      const profile = await ensureCustomerProfile(user, {
        full_name: mode === 'signUp' ? name.trim() : user.user_metadata?.full_name || null,
        email: user.email || email,
        country_code: accountPreferences.countryCode,
        language: accountPreferences.language,
        currency: accountPreferences.currency,
        notifications_enabled: accountPreferences.notificationsEnabled,
      });
      if (!profile && isSupabaseConfigured) throw new Error('Your account is signed in, but your PAZ profile could not be saved.');
      setAccountStep('dashboard');
      setAuthNotice('');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Your account request could not be completed.');
    } finally {
      setAuthBusy(false);
    }
  };

  const signOutAccount = async () => {
    if (!isSupabaseConfigured) return;
    setAuthBusy(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
      setCurrentUser(null);
      setAccountStep('auth');
      setAuthNotice('You have signed out of your PAZ account.');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Your session could not be ended.');
    } finally {
      setAuthBusy(false);
    }
  };

  const completeFreeOrder = async () => {
    if (!customerName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) return setCheckoutError('Enter your name and a valid email address for delivery.');
    setCheckoutBusy(true); setCheckoutError('');
    const orderNumber = `PAZ-${Date.now()}`;
    try {
      await apiRequest('/complete-shop-payment', 'POST', { free: true, orderNumber, email: customerEmail.trim().toLowerCase(), customerName: customerName.trim(), items: cart.map((line) => ({ id: line.product.id, quantity: line.quantity })) });
      setCart([]); setCartVisible(false); setCompletedOrder({ orderNumber, email: customerEmail.trim() }); setScreen('success');
    } catch (error) { setCheckoutError(error instanceof Error ? error.message : 'The free product request could not be completed.'); }
    finally { setCheckoutBusy(false); }
  };

  const startPaidCheckout = async () => {
    if (!customerName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) return setCheckoutError('Enter your name and a valid email address to continue.');
    setCheckoutBusy(true); setCheckoutError('');
    const orderNumber = `PAZ-${Date.now()}`;
    const items = cart.map((line) => ({ id: line.product.id, quantity: line.quantity }));
    try {
      const payment = await apiRequest('/initialize-shop-payment', 'POST', { orderNumber, customerName: customerName.trim(), email: customerEmail.trim().toLowerCase(), items });
      const order: OrderRequest = { reference: payment.reference, orderNumber: payment.orderNumber || orderNumber, email: customerEmail.trim().toLowerCase(), customerName: customerName.trim(), items };
      pendingOrderRef.current = order; setPendingCheckout(order); setCheckoutBusy(false);
      const result = await WebBrowser.openAuthSessionAsync(payment.authorizationUrl, 'pazshop://payment-callback');
      if (result.type === 'success' && result.url) {
        const callback = new URL(result.url);
        await finishPayment(callback.searchParams.get('reference') || callback.searchParams.get('trxref') || order.reference);
      } else setCheckoutError('Payment window closed. If payment completed, tap “Check payment” to verify it.');
    } catch (error) { setCheckoutError(error instanceof Error ? error.message : 'Secure payment could not be started.'); }
    finally { setCheckoutBusy(false); }
  };

  const confirmPayment = () => { if (pendingCheckout?.reference) void finishPayment(pendingCheckout.reference); };

  return (
    <View style={styles.app}>
      <StatusBar style={screen === 'detail' ? 'light' : 'dark'} />
      {screen !== 'detail' ? <View style={styles.header}>
        <View style={styles.brandBlock}><Image source={require('./assets/paz-logo.png')} style={styles.brandLogo} resizeMode="contain" /><View><Text style={styles.brandEyebrow}>PAZ THRIVING TRIBE</Text><Text style={styles.brandTitle}>{screen === 'success' ? 'Order confirmed' : 'PAZ Shop'}</Text></View></View>
        {screen !== 'success' ? <View style={styles.headerActions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Open account" onPress={() => { setAuthError(''); setAuthNotice(''); setAccountStep(currentUser ? 'dashboard' : 'auth'); setAccountVisible(true); }} style={styles.accountButton}><Text style={styles.accountButtonText}>{currentUser ? `Hi, ${accountLabel}` : 'Account'}</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={`Open bag, ${cartCount} items`} onPress={() => setCartVisible(true)} style={styles.bagButton}><Text style={styles.bagText}>Bag</Text><View style={styles.bagCount}><Text style={styles.bagCountText}>{cartCount}</Text></View></Pressable>
        </View> : null}
      </View> : null}
      {notice && screen !== 'success' ? <Pressable onPress={() => setNotice('')} style={styles.notice}><Text style={styles.noticeText}>{notice}</Text><Text style={styles.noticeClose}>×</Text></Pressable> : null}

      {screen === 'catalog' ? <CatalogView products={products} storageBaseUrl={storageBaseUrl} categories={categories} category={category} search={search} loading={loading} error={pageError} onCategory={setCategory} onSearch={setSearch} onOpen={(product) => void openProduct(product)} onRefresh={() => void loadProducts()} /> : null}
      {screen === 'detail' && selectedProduct ? <ProductDetailView product={selectedProduct} storageBaseUrl={storageBaseUrl} metrics={metrics} ratings={ratings} loading={detailLoading} ratingValue={ratingValue} ratingName={ratingName} ratingEmail={ratingEmail} ratingComment={ratingComment} ratingBusy={ratingBusy} cartCount={cartCount} onBack={() => setScreen('catalog')} onCart={() => setCartVisible(true)} onAdd={() => addToCart(selectedProduct)} onChat={() => void openChat()} onRatingValue={setRatingValue} onRatingName={setRatingName} onRatingEmail={setRatingEmail} onRatingComment={setRatingComment} onSubmitRating={() => void submitRating()} /> : null}
      {screen === 'success' && completedOrder ? <View style={styles.success}><View style={styles.successMark}><Text style={styles.successMarkText}>✓</Text></View><Text style={styles.successKicker}>ORDER CONFIRMED</Text><Text style={styles.successTitle}>Your next chapter starts here.</Text><Text style={styles.successCopy}>We sent your product to {completedOrder.email}. Check your inbox for order {completedOrder.orderNumber}.</Text><Button title="Back to the shop" onPress={() => { setCompletedOrder(null); setScreen('catalog'); }} /></View> : null}

      {!initialLoadComplete ? <View style={styles.appLoader} accessibilityRole="progressbar" accessibilityLabel="Loading PAZ Shop">
        <Image source={require('./assets/paz-app-icon.png')} style={styles.appLoaderLogo} resizeMode="contain" />
        <LoadingBars />
        <Text style={styles.appLoaderLabel}>PAZ SHOP</Text>
      </View> : null}

      {flyingProduct ? <Animated.View style={[styles.flightToken, { transform: [{ translateX: flightProgress.interpolate({ inputRange: [0, 1], outputRange: [windowWidth * 0.62, windowWidth * 0.08] }) }, { translateY: flightProgress.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }, { scale: flightProgress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.34] }) }], opacity: flightProgress.interpolate({ inputRange: [0, 0.72, 1], outputRange: [1, 1, 0] }), pointerEvents: 'none' }]}>
        {productImageUrl(flyingProduct.cover, storageBaseUrl) ? <Image source={{ uri: productImageUrl(flyingProduct.cover, storageBaseUrl) }} style={styles.flightImage} resizeMode="cover" /> : <Text style={styles.flightLetter}>{flyingProduct.title.slice(0, 1)}</Text>}
      </Animated.View> : null}

      <CustomerAccountFlow
        visible={accountVisible && accountSetupLoaded}
        step={accountStep}
        preferences={accountPreferences}
        user={currentUser}
        busy={authBusy}
        error={authError}
        notice={authNotice}
        onClose={() => setAccountVisible(false)}
        onPreferencesChange={setAccountPreferences}
        onContinuePreferences={() => void continuePreferences()}
        onEditPreferences={() => setAccountStep('preferences')}
        onAllowNotifications={() => void allowNotifications()}
        onSkipNotifications={() => void finishNotificationStep(false)}
        onSubmitAuth={(mode, name, email, password) => void submitAuth(mode, name, email, password)}
        onSignOut={() => void signOutAccount()}
        onBrowseAsGuest={() => void browseAsGuest()}
      />

      <Modal visible={cartVisible} transparent animationType="slide" onRequestClose={() => setCartVisible(false)}>
        <View style={styles.cartModalShade}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close bag" style={styles.cartScrim} onPress={() => setCartVisible(false)} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.cartDrawer}>
            <View style={styles.drawerHandle} />
            <View style={styles.drawerHeader}>
              <View><Text style={styles.drawerEyebrow}>PAZ THRIVING TRIBE</Text><Text style={styles.drawerTitle}>Your bag</Text></View>
              <Pressable accessibilityRole="button" accessibilityLabel="Close bag" onPress={() => setCartVisible(false)} style={styles.drawerClose}><Text style={styles.drawerCloseText}>×</Text></Pressable>
            </View>
            <CartView drawer cart={cart} storageBaseUrl={storageBaseUrl} totalLabel={totalLabel} freeOrder={allFree} customerName={customerName} customerEmail={customerEmail} busy={checkoutBusy} error={checkoutError} pendingPayment={Boolean(pendingCheckout)} onName={setCustomerName} onEmail={setCustomerEmail} onQuantity={updateQuantity} onRemove={(id) => setCart((current) => current.filter((line) => line.product.id !== id))} onCheckout={() => void (allFree ? completeFreeOrder() : startPaidCheckout())} onConfirmPayment={confirmPayment} onShop={() => setCartVisible(false)} onBack={() => setCartVisible(false)} />
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={Boolean(notifyProduct)} transparent animationType="slide" onRequestClose={() => setNotifyProduct(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalShade}><View style={styles.modalSheet}><View style={styles.modalHandle} /><Pressable onPress={() => setNotifyProduct(null)} style={styles.modalClose}><Text style={styles.modalCloseText}>×</Text></Pressable><Text style={styles.modalKicker}>RELEASE ALERT</Text><Text style={styles.modalTitle}>Get notified</Text><Text style={styles.modalCopy}>{notifyProduct?.title} isn’t available yet. We’ll email you when it opens.</Text><Field label="Full name" value={notifyName} onChangeText={setNotifyName} placeholder="Your name" maxLength={120} /><Field label="Email address" value={notifyEmail} onChangeText={setNotifyEmail} placeholder="you@example.com" keyboardType="email-address" maxLength={254} /><Field label="Phone (optional)" value={notifyPhone} onChangeText={setNotifyPhone} placeholder="Phone number" keyboardType="phone-pad" maxLength={40} />{notifyError ? <Text style={styles.formError}>{notifyError}</Text> : null}<Button title={notifyBusy ? 'Saving…' : 'Notify me'} disabled={notifyBusy} onPress={() => void submitNotify()} /></View></KeyboardAvoidingView>
      </Modal>

      <Modal visible={chatVisible} transparent animationType="slide" onRequestClose={() => setChatVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalShade}><View style={styles.modalSheet}><View style={styles.modalHandle} /><Pressable onPress={() => setChatVisible(false)} style={styles.modalClose}><Text style={styles.modalCloseText}>×</Text></Pressable><Text style={styles.modalKicker}>PRODUCT QUESTIONS</Text><Text style={styles.modalTitle}>Chat with PAZ</Text><Text style={styles.modalCopy}>{selectedProduct?.title}</Text>
          {chatBusy && !chatMessages.length ? <ActivityIndicator color={palette.green} style={{ margin: 12 }} /> : null}
          {chatToken ? <><ScrollView style={styles.chatMessages} contentContainerStyle={styles.chatMessagesContent}>{chatMessages.map((message, index) => <View key={String(message.id || index)} style={[styles.chatMessage, message.sender_role === 'customer' && styles.chatMessageCustomer]}><Text style={styles.chatSender}>{message.sender_role === 'customer' ? 'You' : String(message.sender_name || 'PAZ team')}</Text><Text style={styles.chatText}>{String(message.message || '')}</Text></View>)}</ScrollView><Field label="Your reply" value={chatReply} onChangeText={setChatReply} placeholder="Write a message" multiline maxLength={4000} /><Button title={chatBusy ? 'Sending…' : 'Send reply'} disabled={chatBusy || !chatReply.trim()} onPress={() => void sendChatReply()} /></> : <><Field label="Your name" value={chatName} onChangeText={setChatName} placeholder="Name" maxLength={120} /><Field label="Email address" value={chatEmail} onChangeText={setChatEmail} placeholder="you@example.com" keyboardType="email-address" maxLength={254} /><Field label="Phone number" value={chatPhone} onChangeText={setChatPhone} placeholder="Include country code" keyboardType="phone-pad" maxLength={40} /><Field label="Message" value={chatMessage} onChangeText={setChatMessage} placeholder="What would you like to know?" multiline maxLength={4000} /><Button title={chatBusy ? 'Sending…' : 'Send message'} disabled={chatBusy} onPress={() => void startChat()} /></>}
          {chatNotice ? <Text style={styles.chatNotice}>{chatNotice}</Text> : null}
        </View></KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, paddingTop: NativeStatusBar.currentHeight || 0, backgroundColor: palette.paper },
  appLoader: { ...StyleSheet.absoluteFill, zIndex: 1000, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.paper },
  appLoaderLogo: { width: 104, height: 104 },
  appLoaderBars: { height: 24, marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  appLoaderBar: { width: 6, height: 20, borderRadius: 3 },
  appLoaderLabel: { marginTop: 14, color: palette.green, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  header: { minHeight: 76, paddingHorizontal: 18, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: palette.white, borderBottomWidth: 1, borderBottomColor: palette.line },
  brandBlock: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  brandLogo: { width: 46, height: 46, borderRadius: 23, backgroundColor: palette.white },
  brandEyebrow: { color: palette.green, fontSize: 8, fontWeight: '900', letterSpacing: 1.15 },
  brandTitle: { marginTop: 2, color: palette.ink, fontSize: 18, fontWeight: '900' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  accountButton: { minHeight: 42, paddingHorizontal: 12, borderWidth: 1, borderColor: palette.line, borderRadius: 12, justifyContent: 'center', backgroundColor: palette.greenWash },
  accountButtonText: { color: palette.darkGreen, fontSize: 11, fontWeight: '900' },
  bagButton: { minWidth: 76, minHeight: 42, paddingHorizontal: 11, borderWidth: 1, borderColor: palette.line, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: palette.white },
  bagText: { color: palette.ink, fontSize: 12, fontWeight: '800' },
  bagCount: { minWidth: 21, height: 21, paddingHorizontal: 4, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.orange },
  bagCountText: { color: palette.ink, fontSize: 10, fontWeight: '900' },
  notice: { minHeight: 40, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: palette.greenWash },
  noticeText: { flex: 1, paddingVertical: 7, color: palette.darkGreen, fontSize: 11, fontWeight: '700' },
  noticeClose: { paddingLeft: 10, color: palette.green, fontSize: 20 },
  flightToken: { position: 'absolute', left: 0, bottom: 38, zIndex: 20, width: 42, height: 48, overflow: 'hidden', borderWidth: 2, borderColor: palette.white, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.green, elevation: 8 },
  flightImage: { width: '100%', height: '100%' },
  flightLetter: { color: palette.white, fontSize: 18, fontWeight: '900' },
  cartModalShade: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', backgroundColor: '#101a14aa' },
  cartScrim: { ...StyleSheet.absoluteFill },
  cartDrawer: { width: '100%', maxWidth: 560, height: '96%', maxHeight: '96%', minHeight: 0, overflow: 'hidden', borderTopLeftRadius: 18, borderTopRightRadius: 18, backgroundColor: palette.paper },
  drawerHandle: { width: 38, height: 4, marginTop: 9, alignSelf: 'center', borderRadius: 2, backgroundColor: '#bfcac1' },
  drawerHeader: { minHeight: 58, paddingHorizontal: 18, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: palette.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  drawerEyebrow: { color: palette.green, fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  drawerTitle: { marginTop: 2, color: palette.ink, fontSize: 19, fontWeight: '900' },
  drawerClose: { width: 38, height: 38, borderWidth: 1, borderColor: palette.line, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.white },
  drawerCloseText: { color: palette.muted, fontSize: 25, lineHeight: 28 },
  success: { flex: 1, padding: 28, alignItems: 'center', justifyContent: 'center' },
  successMark: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.green },
  successMarkText: { color: palette.white, fontSize: 36, fontWeight: '700' },
  successKicker: { marginTop: 20, color: palette.green, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  successTitle: { marginTop: 8, color: palette.ink, fontSize: 26, lineHeight: 32, fontWeight: '900', textAlign: 'center' },
  successCopy: { marginTop: 10, marginBottom: 23, color: palette.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  modalShade: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#101a14aa' },
  modalSheet: { maxHeight: '92%', paddingHorizontal: 19, paddingTop: 10, paddingBottom: 23, borderTopLeftRadius: 15, borderTopRightRadius: 15, backgroundColor: palette.paper },
  modalHandle: { width: 38, height: 4, alignSelf: 'center', borderRadius: 2, backgroundColor: '#bfcac1' },
  modalClose: { position: 'absolute', top: 15, right: 17, width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  modalCloseText: { color: palette.muted, fontSize: 26 },
  modalKicker: { marginTop: 17, color: palette.green, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  modalTitle: { marginTop: 5, color: palette.ink, fontSize: 23, fontWeight: '900' },
  modalCopy: { marginTop: 5, marginBottom: 3, color: palette.muted, fontSize: 12, lineHeight: 18 },
  formError: { marginTop: 9, color: palette.red, fontSize: 11, lineHeight: 16 },
  chatMessages: { maxHeight: 210, marginTop: 8 },
  chatMessagesContent: { gap: 7, paddingVertical: 5 },
  chatMessage: { maxWidth: '88%', alignSelf: 'flex-start', padding: 9, borderWidth: 1, borderColor: palette.line, borderRadius: 7, backgroundColor: palette.white },
  chatMessageCustomer: { alignSelf: 'flex-end', borderColor: '#bdd8c4', backgroundColor: palette.greenWash },
  chatSender: { color: palette.muted, fontSize: 9, fontWeight: '800' },
  chatText: { marginTop: 3, color: palette.ink, fontSize: 11, lineHeight: 16 },
  chatNotice: { marginTop: 9, color: palette.green, fontSize: 11, lineHeight: 16 },
});
