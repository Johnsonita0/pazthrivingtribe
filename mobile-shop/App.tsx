import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Image, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, Share, StatusBar as NativeStatusBar, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { CheckoutPaymentMethod, CheckoutView } from './src/CheckoutView';
import { BooksListingView } from './src/BooksListingView';
import { CategoriesView } from './src/CategoriesView';
import { HomeView } from './src/HomeView';
import { ProfileView } from './src/ProfileView';
import { apiRequest, CartLine, categoryMatches, DeliveryAddress, formatPrice, normalizeProduct, Product, productAvailability, productImageUrl, productSlug, Rating, SITE_ROOT } from './src/api';
import { ProductDetailView, ProductMetrics } from './src/ProductDetailView';
import { Button, Field, palette } from './src/ShopComponents';
import { ensureCustomerProfile, isSupabaseConfigured, supabase } from './src/supabaseClient';
import { AccountPreferences, AccountStep, AccountUser, CustomerAccountFlow } from './src/CustomerAccountFlow';
import { OnboardingFlow } from './src/OnboardingFlow';
import { SplashScreen } from './src/SplashScreen';

if (Platform.OS === 'web') WebBrowser.maybeCompleteAuthSession();
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const CART_KEY = 'paz-shop-cart-v1';
const FAVORITES_KEY = 'paz-shop-favorite-books-v1';
const VISITOR_KEY = 'paz-shop-visitor-id';
const ACCOUNT_PREFERENCES_KEY = 'paz-shop-account-preferences-v1';
const ONBOARDING_KEY = 'paz-shop-onboarding-v2';
const REMEMBER_ACCOUNT_KEY = 'paz-shop-remember-account-v1';
type Screen = 'home' | 'listing' | 'categories' | 'favorites' | 'profile' | 'detail' | 'checkout' | 'success';
type OrderRequest = { reference: string; orderNumber: string; email: string; customerName: string; customerId: string; deliveryAddress: DeliveryAddress | null; items: { id: string; quantity: number }[] };
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

function TabButton({ icon, label, active, badge, onPress }: { icon: 'home' | 'th-large' | 'shopping-bag' | 'shopping-cart' | 'user-circle' | 'heart'; label: string; active: boolean; badge?: number; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={badge ? `${label}, ${badge} items` : label} accessibilityState={{ selected: active }} onPress={onPress} style={({ pressed }) => [styles.tabButton, pressed && styles.tabButtonPressed]}>
      <View style={[styles.tabIconWrap, active && styles.tabIconWrapActive]}>
        <FontAwesome5 name={icon} size={17} solid color={active ? palette.green : palette.muted} />
        {badge ? <View style={styles.tabBadge}><Text style={styles.tabBadgeText}>{badge > 99 ? '99+' : badge}</Text></View> : null}
      </View>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [storageBaseUrl, setStorageBaseUrl] = useState('');
  const [screen, setScreen] = useState<Screen>('home');
  const [splashElapsed, setSplashElapsed] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState<'loading' | 'pending' | 'done'>('loading');
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [flyingProduct, setFlyingProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState('All');
  const [initialComingSoonCategory, setInitialComingSoonCategory] = useState<'Groceries' | 'Gadgets' | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
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
  const [accountAuthMode, setAccountAuthMode] = useState<'signIn' | 'signUp'>('signIn');
  const [accountStep, setAccountStep] = useState<AccountStep>('auth');
  const [accountPreferences, setAccountPreferences] = useState<AccountPreferences>(DEFAULT_ACCOUNT_PREFERENCES);
  const [accountSetupLoaded, setAccountSetupLoaded] = useState(false);
  const [authNotice, setAuthNotice] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [currentUser, setCurrentUser] = useState<AccountUser>(null);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(null);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [openChatsRequest, setOpenChatsRequest] = useState(0);
  const [openAddressRequest, setOpenAddressRequest] = useState(0);
  const unreadChatErrorReportedRef = useRef(false);
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
  const previousScreenRef = useRef<Screen>('home');
  const checkoutReturnScreenRef = useRef<Screen>('home');
  const checkoutAuthRequiredRef = useRef(false);
  const completedReferencesRef = useRef(new Set<string>());
  const processPaymentRef = useRef<(reference: string) => Promise<void>>(async () => {});
  const flightProgress = useRef(new Animated.Value(0)).current;
  const { width: windowWidth } = useWindowDimensions();

  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const cartTotal = cart.reduce((sum, line) => sum + (line.product.isFree ? 0 : line.product.price) * line.quantity, 0);
  const cartCurrency = cart.find((line) => !line.product.isFree)?.product.currency || cart[0]?.product.currency || 'NGN';
  const allFree = cart.length > 0 && cart.every((line) => line.product.isFree);
  const totalLabel = formatPrice({ price: cartTotal, currency: cartCurrency, isFree: allFree });
  const accountLabel = currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.first_name || currentUser?.email?.split('@')[0] || 'Account';
  const metadataAvatar = currentUser?.user_metadata?.avatar_url
    || currentUser?.user_metadata?.picture
    || currentUser?.user_metadata?.photo_url
    || null;

  useEffect(() => {
    setProfileAvatarUrl(typeof metadataAvatar === 'string' ? metadataAvatar : null);
    if (!currentUser) return;
    let active = true;
    void (async () => {
      try {
        const { data, error } = await supabase.from('customer_profiles')
          .select('avatar_url')
          .eq('id', currentUser.id)
          .maybeSingle();
        if (error) throw new Error(error.message);
        if (active && data?.avatar_url) setProfileAvatarUrl(data.avatar_url);
      } catch (error) {
        console.warn('Could not load the PAZ profile photo:', error);
      }
    })();
    return () => { active = false; };
  }, [currentUser?.id, metadataAvatar]);

  useEffect(() => {
    if (!currentUser) {
      setDeliveryAddress(null);
      return;
    }
    let active = true;
    void (async () => {
      const { data, error } = await supabase.from('customer_profiles')
        .select('delivery_address')
        .eq('id', currentUser.id)
        .maybeSingle();
      if (error) {
        console.warn('Could not load the saved PAZ delivery address:', error.message);
        return;
      }
      if (active && data?.delivery_address && typeof data.delivery_address === 'object') {
        const saved = data.delivery_address as DeliveryAddress;
        setDeliveryAddress(saved);
        setCustomerName(saved.fullName);
      }
    })().catch((error) => console.warn('Could not load the saved PAZ delivery address:', error));
    return () => { active = false; };
  }, [currentUser?.id]);

  const openCheckout = () => {
    checkoutReturnScreenRef.current = screen === 'checkout' ? checkoutReturnScreenRef.current : screen;
    setCheckoutError('');
    setNotice('');
    setScreen('checkout');
  };

  const getCheckoutSession = async (): Promise<{ accessToken: string; user: SupabaseUser } | null> => {
    if (!isSupabaseConfigured) {
      setCheckoutError('Customer sign-in is not configured. Add the Expo Supabase URL and publishable key, then restart the app.');
      return null;
    }
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw new Error(error.message);
      const session = data.session;
      if (!session?.user || !session.access_token) {
        checkoutAuthRequiredRef.current = true;
        setAccountAuthMode('signUp');
        setAccountStep('auth');
        setAuthError('');
        setAuthNotice('Create an account or sign in to complete your order.');
        setAccountVisible(true);
        return null;
      }
      if (!session.user.email || !session.user.email_confirmed_at) {
        setCheckoutError('Confirm your account email before placing an order. Check your inbox, then sign in again.');
        checkoutAuthRequiredRef.current = true;
        setAccountAuthMode('signIn');
        setAccountStep('auth');
        setAuthError('');
        setAuthNotice('Email confirmation is required for checkout.');
        setAccountVisible(true);
        return null;
      }
      if (session.user.email.toLowerCase() !== customerEmail.trim().toLowerCase()) {
        setCheckoutError(`For account security, use your signed-in email (${session.user.email}) for digital delivery.`);
        return null;
      }
      setCurrentUser(session.user);
      return { accessToken: session.access_token, user: session.user };
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Your account could not be verified. Please sign in again.');
      return null;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setSplashElapsed(true), 7000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const openChatFromNotification = (response: Notifications.NotificationResponse | null) => {
      if (response?.notification.request.content.data?.type !== 'product-chat') return;
      setOpenChatsRequest((request) => request + 1);
      setScreen('profile');
    };
    const subscription = Notifications.addNotificationResponseReceivedListener(openChatFromNotification);
    void Notifications.getLastNotificationResponseAsync()
      .then(openChatFromNotification)
      .catch((error) => console.warn('Could not read the last PAZ notification:', error));
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!currentUser || screen === 'profile') {
      if (!currentUser) setUnreadChatCount(0);
      return;
    }
    let active = true;
    const refreshUnreadChats = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw new Error(error.message);
        if (!data.session?.access_token) throw new Error('The customer session is no longer available.');
        const payload = await apiRequest('/product-chat', 'POST', { action: 'list-account' }, data.session.access_token);
        const threads = Array.isArray(payload.data) ? payload.data : [];
        if (active) {
          unreadChatErrorReportedRef.current = false;
          setUnreadChatCount(threads.reduce((total: number, chat: { unread_count?: number }) => total + (chat.unread_count || 0), 0));
        }
      } catch (error) {
        if (active && !unreadChatErrorReportedRef.current) {
          unreadChatErrorReportedRef.current = true;
          console.warn('Could not refresh PAZ unread chat count:', error);
        }
      }
    };
    void refreshUnreadChats();
    const timer = setInterval(() => void refreshUnreadChats(), 20000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [currentUser?.id, screen]);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(ONBOARDING_KEY)
      .then((value) => {
        if (active) setOnboardingStatus(value === 'complete' ? 'done' : 'pending');
      })
      .catch((error) => {
        console.warn('Could not load PAZ onboarding state:', error);
        if (active) setOnboardingStatus('pending');
      });
    return () => { active = false; };
  }, []);

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
        if (await AsyncStorage.getItem(REMEMBER_ACCOUNT_KEY) === 'false') {
          await supabase.auth.signOut();
        }
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw new Error(error.message);
        if (session?.user) {
          setCurrentUser(session.user);
          const { data: profile, error: profileError } = await supabase
            .from('customer_profiles')
            .select('country_code,language,currency,notifications_enabled')
            .eq('id', session.user.id)
            .maybeSingle();
          if (profileError) throw new Error(`Could not load your PAZ customer profile: ${profileError.message}`);
          if (profile) {
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
          } else {
            const syncedProfile = await ensureCustomerProfile(session.user, {
              country_code: preferences.countryCode,
              language: preferences.language,
              currency: preferences.currency,
              notifications_enabled: preferences.notificationsEnabled,
            });
            if (!syncedProfile) throw new Error('Your signed-in account could not be initialized as a PAZ customer profile.');
          }
        }
      }

      if (!active) return;
      setAccountPreferences(preferences);
      if (!preferences.setupComplete) {
        setAccountStep('preferences');
      }
    };
    void loadAccountSetup().catch((error) => {
      console.warn('Could not load saved PAZ account preferences:', error);
      if (active) {
        setAccountPreferences(DEFAULT_ACCOUNT_PREFERENCES);
        setAccountStep('preferences');
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
    void AsyncStorage.getItem(FAVORITES_KEY).then((stored) => {
      if (!stored) return;
      const ids: unknown = JSON.parse(stored);
      if (!Array.isArray(ids) || !ids.every((id) => typeof id === 'string')) {
        throw new Error('Saved favorites have an invalid format.');
      }
      setFavoriteIds(new Set(ids));
    }).catch((error) => {
      console.warn('Could not load saved PAZ shop favorites:', error);
    });
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
      const authenticated = await getCheckoutSession();
      if (!authenticated || authenticated.user.id !== order.customerId) {
        if (authenticated) setCheckoutError('Sign in to the account used to start this payment, then check payment again.');
        return;
      }
      await apiRequest('/complete-shop-payment', 'POST', {
        reference,
        source: 'paz-shop-mobile-app',
        orderNumber: order.orderNumber,
        email: order.email,
        customerName: order.customerName,
        deliveryAddress: order.deliveryAddress,
        items: order.items,
      }, authenticated.accessToken);
      completedReferencesRef.current.add(reference);
      pendingOrderRef.current = null;
      setPendingCheckout(null);
      setCart([]);
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
    previousScreenRef.current = screen === 'detail' ? previousScreenRef.current : screen;
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

  const addToCart = (product: Product): boolean => {
    const availability = productAvailability(product);
    if (!availability.available) {
      if (availability.reason === 'not-released') {
        setNotifyProduct(product);
        setNotifyError('');
      } else setNotice(availability.message);
      return false;
    }
    if (!product.inStock || product.stockCount <= 0) {
      setNotice('This product is currently out of stock.');
      return false;
    }
    const conflict = cart.find((line) => !line.product.isFree && !product.isFree && line.product.currency !== product.currency);
    if (conflict) {
      setNotice(`Your bag uses ${conflict.product.currency}. Complete that order before adding ${product.currency} products.`);
      return false;
    }
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
    return true;
  };

  const buyNow = (product: Product) => {
    if (addToCart(product)) openCheckout();
  };

  const toggleFavorite = (product: Product) => {
    const next = new Set(favoriteIds);
    if (next.has(product.id)) next.delete(product.id);
    else next.add(product.id);
    setFavoriteIds(next);
    void AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify([...next])).catch((error) => {
      console.warn('Could not save PAZ shop favorites:', error);
      setNotice('Your favorite could not be saved on this device.');
    });
  };

  const shareProduct = async (product: Product) => {
    const url = `${SITE_ROOT}/shop?product=${encodeURIComponent(productSlug(product.title))}&app=1`;
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
        if (navigator.share) {
          await navigator.share({ title: product.title, text: `Take a look at ${product.title}.`, url });
          return;
        }
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(url);
          setNotice('Product link copied to clipboard.');
          return;
        }
        throw new Error('Sharing is not available in this browser.');
      }
      await Share.share({ message: `${product.title}\n${url}` });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setNotice(error instanceof Error ? error.message : 'This product could not be shared.');
    }
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
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error(sessionError.message);
      const payload = await apiRequest(
        '/product-chat',
        'POST',
        { action: 'start', productId: selectedProduct.id, name: chatName, email: chatEmail, phone: chatPhone, message: chatMessage, website: '' },
        sessionData.session?.user.email_confirmed_at ? sessionData.session.access_token : undefined,
      );
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
    if (wasSetupComplete && currentUser) {
      setAccountVisible(false);
      setScreen('profile');
      return;
    }
    setAccountStep(wasSetupComplete ? 'auth' : 'notifications');
  };

  const finishNotificationStep = async (notificationsEnabled: boolean) => {
    const nextPreferences = { ...accountPreferences, setupComplete: true, notificationsEnabled };
    if (!await saveAccountPreferences(nextPreferences)) return;
    if (currentUser) {
      setAccountVisible(false);
      setScreen('profile');
    } else setAccountStep('auth');
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
      if (!await saveAccountPreferences(guestPreferences)) return false;
    }
    setAccountVisible(false);
    return true;
  };

  const markOnboardingComplete = () => {
    setOnboardingStatus('done');
    void AsyncStorage.setItem(ONBOARDING_KEY, 'complete').catch((error) => {
      console.warn('Could not save PAZ onboarding state:', error);
    });
  };

  const openAccount = (authMode: 'signIn' | 'signUp' = 'signIn') => {
    if (currentUser) {
      setScreen('profile');
      return;
    }
    setAuthError('');
    setAuthNotice('');
    setAccountAuthMode(authMode);
    setAccountStep('auth');
    setAccountVisible(true);
  };

  const completeOnboarding = async () => {
    markOnboardingComplete();
    openAccount();
  };

  const continueOnboardingAsGuest = async () => {
    if (!await browseAsGuest()) return;
    markOnboardingComplete();
  };

  const submitAuth = async (mode: 'signIn' | 'signUp', name: string, identifierInput: string, passwordInput: string, remember: boolean) => {
    if (!isSupabaseConfigured) {
      setAuthError('Supabase is not configured yet for mobile sign-in.');
      return;
    }
    if (!identifierInput.trim() || !passwordInput.trim()) {
      setAuthError('Enter your email or phone number and password to continue.');
      return;
    }
    if (mode === 'signUp' && !name.trim()) {
      setAuthError('Enter your name to create your account.');
      return;
    }
    if (checkoutAuthRequiredRef.current && !identifierInput.includes('@')) {
      setAuthError('Use an email address for your account so PAZ can deliver your digital books.');
      return;
    }
    setAuthBusy(true);
    setAuthError('');
    setAuthNotice('');
    try {
      const identifier = identifierInput.trim();
      const isPhone = !identifier.includes('@');
      const email = identifier.toLowerCase();
      const password = passwordInput;
      const result = mode === 'signIn'
        ? await supabase.auth.signInWithPassword(isPhone ? { phone: identifier.replace(/[\s()-]/g, ''), password } : { email, password })
        : isPhone
          ? await supabase.auth.signUp({ phone: identifier.replace(/[\s()-]/g, ''), password, options: { data: { full_name: name.trim() } } })
          : await supabase.auth.signUp({ email, password, options: { data: { full_name: name.trim() } } });
      if (result.error) throw new Error(result.error.message);
      const user = result.data?.session?.user ?? (mode === 'signIn' ? result.data?.user : null);
      if (!user) {
        await AsyncStorage.setItem(REMEMBER_ACCOUNT_KEY, String(remember));
        setAuthNotice(isPhone ? 'Your account was created. Check your phone for a verification code, then sign in.' : 'Your account was created. Check your email to confirm it, then sign in.');
        setAuthBusy(false);
        return;
      }
      await AsyncStorage.setItem(REMEMBER_ACCOUNT_KEY, String(remember));
      setCurrentUser(user);
      const profile = await ensureCustomerProfile(user, {
        full_name: mode === 'signUp' ? name.trim() : user.user_metadata?.full_name || null,
        email: user.email || identifier,
        country_code: accountPreferences.countryCode,
        language: accountPreferences.language,
        currency: accountPreferences.currency,
        notifications_enabled: accountPreferences.notificationsEnabled,
      });
      if (!profile && isSupabaseConfigured) throw new Error('Your account is signed in, but your PAZ profile could not be saved.');
      setAuthNotice('');
      if (checkoutAuthRequiredRef.current) {
        checkoutAuthRequiredRef.current = false;
        setCustomerEmail(user.email || identifier);
        const profileName = user.user_metadata?.full_name || (mode === 'signUp' ? name.trim() : '');
        if (profileName) setCustomerName(profileName);
        setAccountVisible(false);
        setScreen('checkout');
        setCheckoutError('Account verified. Review your order and tap Place order to continue.');
      } else {
        setAccountVisible(false);
        setScreen('profile');
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Your account request could not be completed.');
    } finally {
      setAuthBusy(false);
    }
  };

  const signInWithSocialProvider = async (provider: 'google' | 'facebook', remember: boolean) => {
    if (!isSupabaseConfigured) {
      setAuthError('Supabase is not configured yet for mobile sign-in.');
      return;
    }

    setAuthBusy(true);
    setAuthError('');
    setAuthNotice('');
    try {
      const redirectTo = Platform.OS === 'web' && typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : 'pazshop://auth/callback';
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error) throw new Error(error.message);
      if (!data.url) throw new Error(`${provider} sign-in could not be started.`);

      const browserResult = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (browserResult.type === 'cancel' || browserResult.type === 'dismiss') return;
      if (browserResult.type !== 'success') throw new Error(`${provider} sign-in did not complete.`);

      const callbackUrl = new URL(browserResult.url);
      const callbackError = callbackUrl.searchParams.get('error_description') || callbackUrl.searchParams.get('error');
      if (callbackError) throw new Error(callbackError);

      const code = callbackUrl.searchParams.get('code');
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) throw new Error(exchangeError.message);
      } else {
        const callbackParams = new URLSearchParams(`${callbackUrl.search.slice(1)}&${callbackUrl.hash.slice(1)}`);
        const accessToken = callbackParams.get('access_token');
        const refreshToken = callbackParams.get('refresh_token');
        if (!accessToken || !refreshToken) throw new Error('Google returned without a PAZ session. Check the Supabase redirect URL configuration.');
        const { error: sessionError } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        if (sessionError) throw new Error(sessionError.message);
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error(sessionError.message);
      const user = sessionData.session?.user;
      if (!user) throw new Error(`${provider} sign-in completed without a user session.`);

      await AsyncStorage.setItem(REMEMBER_ACCOUNT_KEY, String(remember));
      setCurrentUser(user);
      const profile = await ensureCustomerProfile(user, {
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        email: user.email || null,
        country_code: accountPreferences.countryCode,
        language: accountPreferences.language,
        currency: accountPreferences.currency,
        notifications_enabled: accountPreferences.notificationsEnabled,
      });
      if (!profile) throw new Error('You are signed in, but your PAZ profile could not be saved.');
      if (checkoutAuthRequiredRef.current) {
        checkoutAuthRequiredRef.current = false;
        setCustomerEmail(user.email || '');
        const profileName = user.user_metadata?.full_name || user.user_metadata?.name || '';
        if (profileName) setCustomerName(profileName);
        setAccountVisible(false);
        setScreen('checkout');
        setCheckoutError('Account verified. Review your order and tap Place order to continue.');
      } else {
        setAccountVisible(false);
        setScreen('profile');
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : `${provider} sign-in could not be completed.`);
    } finally {
      setAuthBusy(false);
    }
  };

  const resetPassword = async (identifier: string) => {
    const email = identifier.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAuthError('Enter the email address for your account to reset your password.');
      return;
    }
    setAuthBusy(true);
    setAuthError('');
    setAuthNotice('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw new Error(error.message);
      setAuthNotice('If an account exists for that email, password reset instructions have been sent.');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Password reset could not be started.');
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
      setAccountVisible(false);
      setUnreadChatCount(0);
      setAuthNotice('You have signed out of your PAZ account.');
      setScreen('profile');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Your session could not be ended.');
    } finally {
      setAuthBusy(false);
    }
  };

  const toggleProfileNotifications = async (enabled: boolean) => {
    if (enabled) {
      await allowNotifications();
      return;
    }
    const nextPreferences = { ...accountPreferences, notificationsEnabled: false };
    if (await saveAccountPreferences(nextPreferences)) {
      if (currentUser) {
        const { error } = await supabase.from('customer_profiles')
          .update({ expo_push_token: null, updated_at: new Date().toISOString() })
          .eq('id', currentUser.id);
        if (error) {
          setNotice(`Notifications were turned off on this device, but the saved device token could not be removed: ${error.message}`);
          return;
        }
      }
      setNotice('PAZ notifications are turned off.');
    }
  };

  const registerCustomerPushToken = async (user: NonNullable<AccountUser>) => {
    if (Platform.OS === 'web' || !Device.isDevice) {
      setNotice('Native push notifications require PAZ Shop installed on a physical phone.');
      return;
    }
    const projectId = Constants.easConfig?.projectId || Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) throw new Error('Set the EAS project ID before registering phone notifications.');
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'PAZ updates',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#145c3d',
      });
    }
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    const { data: updatedProfile, error } = await supabase.from('customer_profiles')
      .update({ expo_push_token: token.data, notifications_enabled: true, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select('id')
      .maybeSingle();
    if (error) throw new Error(`Push notifications could not be registered: ${error.message}`);
    if (!updatedProfile) throw new Error('Your PAZ profile could not save the phone notification token.');
  };

  useEffect(() => {
    if (!currentUser || !accountPreferences.notificationsEnabled) return;
    void registerCustomerPushToken(currentUser).catch((error) => {
      setNotice(error instanceof Error ? error.message : 'Phone notifications could not be registered.');
    });
  }, [currentUser?.id, accountPreferences.notificationsEnabled]);

  const openProfileLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'This PAZ page could not be opened.');
    }
  };

  const completeFreeOrder = async () => {
    const authenticated = await getCheckoutSession();
    if (!authenticated) return;
    if (!cart.length) return setCheckoutError('Your cart is empty. Add a book before placing an order.');
    if (!customerName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) return setCheckoutError('Enter your name and a valid email address for delivery.');
    setCheckoutBusy(true); setCheckoutError('');
    const orderNumber = `PAZ-${Date.now()}`;
    try {
      await apiRequest('/complete-shop-payment', 'POST', {
        free: true,
        source: 'paz-shop-mobile-app',
        orderNumber,
        email: customerEmail.trim().toLowerCase(),
        customerName: customerName.trim(),
        deliveryAddress,
        items: cart.map((line) => ({ id: line.product.id, quantity: line.quantity })),
      }, authenticated.accessToken);
      setCart([]); setCompletedOrder({ orderNumber, email: customerEmail.trim() }); setScreen('success');
    } catch (error) { setCheckoutError(error instanceof Error ? error.message : 'The free product request could not be completed.'); }
    finally { setCheckoutBusy(false); }
  };

  const startPaidCheckout = async (paymentMethod: CheckoutPaymentMethod) => {
    const authenticated = await getCheckoutSession();
    if (!authenticated) return;
    if (!cart.length) return setCheckoutError('Your cart is empty. Add a book before placing an order.');
    if (!customerName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) return setCheckoutError('Enter your name and a valid email address to continue.');
    setCheckoutBusy(true); setCheckoutError('');
    const orderNumber = `PAZ-${Date.now()}`;
    const items = cart.map((line) => ({ id: line.product.id, quantity: line.quantity }));
    try {
      const payment = await apiRequest('/initialize-shop-payment', 'POST', { orderNumber, customerName: customerName.trim(), email: customerEmail.trim().toLowerCase(), deliveryAddress, items, paymentMethod }, authenticated.accessToken);
      const order: OrderRequest = { reference: payment.reference, orderNumber: payment.orderNumber || orderNumber, email: customerEmail.trim().toLowerCase(), customerName: customerName.trim(), customerId: authenticated.user.id, deliveryAddress, items };
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

  if (!splashElapsed || !initialLoadComplete || onboardingStatus === 'loading' || !accountSetupLoaded) {
    return <SplashScreen />;
  }

  return (
    <View style={styles.app}>
      <StatusBar style="dark" />
      {screen !== 'detail' && screen !== 'checkout' && screen !== 'home' && screen !== 'listing' && screen !== 'categories' && screen !== 'favorites' && screen !== 'profile' ? <View style={styles.header}>
        <View style={styles.brandBlock}><Image source={require('./assets/paz-logo.png')} style={styles.brandLogo} resizeMode="contain" /><View><Text style={styles.brandEyebrow}>PAZ THRIVING TRIBE</Text><Text style={styles.brandTitle}>{screen === 'success' ? 'Order confirmed' : 'PAZ Shop'}</Text></View></View>
        {screen !== 'success' ? <View style={styles.headerActions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Open account" onPress={() => openAccount()} style={styles.accountButton}><Text style={styles.accountButtonText}>{currentUser ? `Hi, ${accountLabel}` : 'Account'}</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={`Open bag, ${cartCount} items`} onPress={openCheckout} style={styles.bagButton}><Text style={styles.bagText}>Bag</Text><View style={styles.bagCount}><Text style={styles.bagCountText}>{cartCount}</Text></View></Pressable>
        </View> : null}
      </View> : null}
      {notice && screen !== 'success' ? <Pressable onPress={() => setNotice('')} style={styles.notice}><Text style={styles.noticeText}>{notice}</Text><Text style={styles.noticeClose}>×</Text></Pressable> : null}

      {screen === 'home' ? <HomeView products={products} signedIn={Boolean(currentUser)} accountName={currentUser?.user_metadata?.first_name || currentUser?.user_metadata?.full_name?.split(' ')[0] || currentUser?.email?.split('@')[0]} profileImageUrl={profileAvatarUrl} storageBaseUrl={storageBaseUrl} loading={loading} error={pageError} notificationCount={unreadChatCount} onRefresh={() => void loadProducts()} onNotifications={() => { setOpenChatsRequest((request) => request + 1); setScreen('profile'); }} onProfile={() => setScreen('profile')} onCreateAccount={() => openAccount('signUp')} onCategory={(selectedCategory) => {
        if (/^grocer(?:y|ies)$/i.test(selectedCategory)) {
          setInitialComingSoonCategory('Groceries');
          setScreen('categories');
          return;
        }
        if (/^gadgets?$/i.test(selectedCategory)) {
          setInitialComingSoonCategory('Gadgets');
          setScreen('categories');
          return;
        }
        setInitialComingSoonCategory(null);
        setCategory(selectedCategory);
        setScreen('listing');
      }} onMoreCategories={() => { setInitialComingSoonCategory(null); setScreen('categories'); }} onOpen={(product) => void openProduct(product)} onAddToCart={addToCart} /> : null}
      {screen === 'listing' || screen === 'favorites' ? <BooksListingView products={products} loading={loading} error={pageError} storageBaseUrl={storageBaseUrl} category={category} favoriteIds={favoriteIds} favoritesOnly={screen === 'favorites'} onCategory={setCategory} onToggleFavorite={toggleFavorite} onBack={() => { setCategory('All'); setScreen('home'); }} onRefresh={() => void loadProducts()} onOpen={(product) => void openProduct(product)} onAddToCart={addToCart} /> : null}
      {screen === 'categories' ? <CategoriesView products={products} loading={loading} initialComingSoonCategory={initialComingSoonCategory} onBack={() => { setInitialComingSoonCategory(null); setScreen('home'); }} onSelect={(selectedCategory) => { setInitialComingSoonCategory(null); setCategory(selectedCategory); setScreen('listing'); }} /> : null}
      {screen === 'profile' ? <ProfileView user={currentUser} notificationsEnabled={accountPreferences.notificationsEnabled} openChatsRequest={openChatsRequest} openAddressRequest={openAddressRequest} deliveryAddress={deliveryAddress} onUnreadChange={setUnreadChatCount} onDeliveryAddressChange={(address) => { setDeliveryAddress(address); if (address?.fullName) setCustomerName(address.fullName); }} onWishlist={() => setScreen('favorites')} onCheckout={openCheckout} onToggleNotifications={(enabled) => void toggleProfileNotifications(enabled)} onSignIn={() => openAccount('signIn')} onCreateAccount={() => openAccount('signUp')} onSignOut={() => void signOutAccount()} onAvatarChange={setProfileAvatarUrl} /> : null}
      {screen === 'detail' && selectedProduct ? <ProductDetailView product={selectedProduct} storageBaseUrl={storageBaseUrl} metrics={metrics} ratings={ratings} loading={detailLoading} ratingValue={ratingValue} ratingName={ratingName} ratingEmail={ratingEmail} ratingComment={ratingComment} ratingBusy={ratingBusy} cartCount={cartCount} isFavorite={favoriteIds.has(selectedProduct.id)} onBack={() => setScreen(previousScreenRef.current)} onCart={openCheckout} onAdd={() => addToCart(selectedProduct)} onBuyNow={() => buyNow(selectedProduct)} onShare={() => void shareProduct(selectedProduct)} onToggleFavorite={() => toggleFavorite(selectedProduct)} onChat={() => void openChat()} onRatingValue={setRatingValue} onRatingName={setRatingName} onRatingEmail={setRatingEmail} onRatingComment={setRatingComment} onSubmitRating={() => void submitRating()} /> : null}
      {screen === 'checkout' ? <CheckoutView cart={cart} storageBaseUrl={storageBaseUrl} totalLabel={totalLabel} freeOrder={allFree} customerName={customerName} customerEmail={customerEmail} deliveryAddress={deliveryAddress} busy={checkoutBusy} error={checkoutError} pendingPayment={Boolean(pendingCheckout)} onName={setCustomerName} onEmail={setCustomerEmail} onManageAddress={() => { setOpenAddressRequest((request) => request + 1); setScreen('profile'); }} onQuantity={updateQuantity} onRemove={(id) => setCart((current) => current.filter((line) => line.product.id !== id))} onBack={() => setScreen(checkoutReturnScreenRef.current)} onPlaceOrder={(method) => void startPaidCheckout(method)} onRequestFreeProduct={() => void completeFreeOrder()} onConfirmPayment={confirmPayment} onContinueShopping={() => { setCategory('All'); setScreen('home'); }} /> : null}
      {screen === 'success' && completedOrder ? <View style={styles.success}><View style={styles.successMark}><Text style={styles.successMarkText}>✓</Text></View><Text style={styles.successKicker}>ORDER CONFIRMED</Text><Text style={styles.successTitle}>Your next chapter starts here.</Text><Text style={styles.successCopy}>We sent your product to {completedOrder.email}. Check your inbox for order {completedOrder.orderNumber}.</Text><Button title="Back to the shop" onPress={() => { setCompletedOrder(null); setCategory('All'); setScreen('home'); }} /></View> : null}

      {screen !== 'detail' && screen !== 'checkout' && screen !== 'success' ? <View style={styles.tabBar}>
        <TabButton icon="home" label="Home" active={screen === 'home'} onPress={() => { setCategory('All'); setScreen('home'); }} />
        <TabButton icon="th-large" label="Categories" active={screen === 'categories' || screen === 'listing'} onPress={() => setScreen('categories')} />
        <TabButton icon="shopping-cart" label="Cart" active={false} badge={cartCount} onPress={openCheckout} />
        <TabButton icon="heart" label="Favorites" active={screen === 'favorites'} onPress={() => { setCategory('All'); setScreen('favorites'); }} />
        <TabButton icon="user-circle" label="Profile" active={screen === 'profile'} onPress={() => setScreen('profile')} />
      </View> : null}

      {flyingProduct ? <Animated.View style={[styles.flightToken, { transform: [{ translateX: flightProgress.interpolate({ inputRange: [0, 1], outputRange: [windowWidth * 0.62, windowWidth * 0.08] }) }, { translateY: flightProgress.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }, { scale: flightProgress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.34] }) }], opacity: flightProgress.interpolate({ inputRange: [0, 0.72, 1], outputRange: [1, 1, 0] }), pointerEvents: 'none' }]}>
        {productImageUrl(flyingProduct.cover, storageBaseUrl) ? <Image source={{ uri: productImageUrl(flyingProduct.cover, storageBaseUrl) }} style={styles.flightImage} resizeMode="cover" /> : <Text style={styles.flightLetter}>{flyingProduct.title.slice(0, 1)}</Text>}
      </Animated.View> : null}

      <CustomerAccountFlow
        visible={accountVisible && accountSetupLoaded}
        step={accountStep}
        initialAuthMode={accountAuthMode}
        preferences={accountPreferences}
        busy={authBusy}
        error={authError}
        notice={authNotice}
        requireAuthentication={checkoutAuthRequiredRef.current}
        onClose={() => {
          if (checkoutAuthRequiredRef.current) {
            setAuthError('Sign in or create an account to continue checkout.');
            return;
          }
          setAccountVisible(false);
        }}
        onPreferencesChange={setAccountPreferences}
        onContinuePreferences={() => void continuePreferences()}
        onAllowNotifications={() => void allowNotifications()}
        onSkipNotifications={() => void finishNotificationStep(false)}
        onSubmitAuth={(mode, name, identifier, password, remember) => void submitAuth(mode, name, identifier, password, remember)}
        onSocialSignIn={(provider, remember) => void signInWithSocialProvider(provider, remember)}
        onResetPassword={(identifier) => void resetPassword(identifier)}
        onBrowseAsGuest={() => void browseAsGuest()}
      />

      <OnboardingFlow
        visible={initialLoadComplete && onboardingStatus === 'pending'}
        onGetStarted={() => void completeOnboarding()}
        onContinueAsGuest={() => void continueOnboardingAsGuest()}
      />

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
  tabBar: { minHeight: 68, paddingTop: 6, paddingBottom: Platform.OS === 'ios' ? 18 : 5, borderTopWidth: 1, borderColor: palette.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: palette.white },
  tabButton: { flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabButtonPressed: { opacity: 0.68 },
  tabIconWrap: { width: 42, height: 27, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tabIconWrapActive: { backgroundColor: palette.greenWash },
  tabBadge: { position: 'absolute', top: -3, right: 1, minWidth: 16, height: 16, paddingHorizontal: 3, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.orange, borderWidth: 1, borderColor: palette.white },
  tabBadgeText: { color: palette.white, fontSize: 8, lineHeight: 10, fontWeight: '900' },
  tabLabel: { color: palette.muted, fontSize: 10, fontWeight: '700' },
  tabLabelActive: { color: palette.green, fontWeight: '900' },
  flightToken: { position: 'absolute', left: 0, bottom: 38, zIndex: 20, width: 42, height: 48, overflow: 'hidden', borderWidth: 2, borderColor: palette.white, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.green, elevation: 8 },
  flightImage: { width: '100%', height: '100%' },
  flightLetter: { color: palette.white, fontSize: 18, fontWeight: '900' },
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
