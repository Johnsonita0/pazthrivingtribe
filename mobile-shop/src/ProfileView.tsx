import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Switch, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { apiRequest, DeliveryAddress } from './api';
import { AccountUser } from './CustomerAccountFlow';
import { supabase } from './supabaseClient';
import { palette } from './ShopComponents';

type Props = {
  user: AccountUser;
  notificationsEnabled: boolean;
  openChatsRequest: number;
  openNotificationsRequest: number;
  openAddressRequest: number;
  deliveryAddress: DeliveryAddress | null;
  onUnreadChange: (count: number) => void;
  onNotificationUnreadChange: (count: number) => void;
  onDeliveryAddressChange: (address: DeliveryAddress | null) => void;
  onWishlist: () => void;
  onCheckout: () => void;
  onToggleNotifications: (enabled: boolean) => void;
  onSignIn: () => void;
  onCreateAccount: () => void;
  onSignOut: () => void;
  onAvatarChange: (avatarUrl: string | null) => void;
};

type Profile = {
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  delivery_address: DeliveryAddress | null;
};

type Order = {
  id: string;
  order_number: string;
  total: number | null;
  currency: string | null;
  status: string | null;
  created_at: string;
  shop_order_items?: { title: string | null; quantity: number | null }[];
};

type Conversation = {
  id: string;
  product_id: string;
  product_title: string;
  customer_name: string;
  status: string;
  assigned_to: 'vendor' | 'admin';
  vendor_name: string | null;
  last_message_at: string;
  last_message?: string | null;
  unread_count: number;
  token: string;
  messages?: ChatMessage[];
};

type ChatMessage = {
  id?: string;
  sender_role: string;
  sender_name: string;
  message: string;
  created_at: string;
};

type CustomerNotification = {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read_at: string | null;
};

type ModalPage = 'orders' | 'chats' | 'notifications' | 'about' | 'address' | 'payments' | 'support' | null;

const menuRows = [
  { key: 'orders', title: 'My Orders', subtitle: 'View your order history', icon: 'receipt', color: '#6227c8' },
  { key: 'wishlist', title: 'My Wishlist', subtitle: 'Your saved books and guides', icon: 'heart', color: '#dc4c87' },
  { key: 'chats', title: 'Messages', subtitle: 'Your conversations with PAZ', icon: 'comments', color: '#3682c5' },
  { key: 'notices', title: 'In-app notifications', subtitle: 'Updates from PAZ', icon: 'bell', color: '#e09b38' },
  { key: 'address', title: 'Address Book', subtitle: 'Digital delivery details', icon: 'map-marker-alt', color: '#348c70' },
  { key: 'payments', title: 'Payment Methods', subtitle: 'Secure payment options', icon: 'credit-card', color: '#3682c5' },
  { key: 'notifications', title: 'Notifications', subtitle: 'Manage device notifications', icon: 'bell', color: '#e09b38' },
  { key: 'support', title: 'Help & Support', subtitle: 'Contact PAZ customer care', icon: 'question-circle', color: '#7b55c3' },
  { key: 'about', title: 'About PAZ', subtitle: 'PAZ Thriving Tribe', icon: 'info-circle', color: '#7b55c3' },
] as const;

function Row({
  icon,
  color,
  title,
  subtitle,
  onPress,
  trailing,
}: {
  icon: ComponentProps<typeof FontAwesome5>['name'];
  color: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  trailing?: ReactNode;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <View style={[styles.rowIcon, { backgroundColor: `${color}16` }]}>
        <FontAwesome5 name={icon} size={15} color={color} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      {trailing || <FontAwesome5 name="chevron-right" size={11} color="#938ba0" />}
    </Pressable>
  );
}

export function ProfileView({
  user,
  notificationsEnabled,
  openChatsRequest,
  openNotificationsRequest,
  openAddressRequest,
  deliveryAddress,
  onUnreadChange,
  onNotificationUnreadChange,
  onDeliveryAddressChange,
  onWishlist,
  onCheckout,
  onToggleNotifications,
  onSignIn,
  onCreateAccount,
  onSignOut,
  onAvatarChange,
}: Props) {
  const [page, setPage] = useState<ModalPage>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [avatarCropAsset, setAvatarCropAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [avatarCropZoom, setAvatarCropZoom] = useState(1.12);
  const [avatarCropX, setAvatarCropX] = useState(0);
  const [avatarCropY, setAvatarCropY] = useState(0.8);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersBusy, setOrdersBusy] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chatsBusy, setChatsBusy] = useState(false);
  const [chatsError, setChatsError] = useState('');
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [notificationsBusy, setNotificationsBusy] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [reply, setReply] = useState('');
  const [chatBusy, setChatBusy] = useState(false);
  const [chatError, setChatError] = useState('');
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [expiredConversationIds, setExpiredConversationIds] = useState<Set<string>>(() => new Set());
  const [newMessageName, setNewMessageName] = useState('');
  const [newMessagePhone, setNewMessagePhone] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [addressDraft, setAddressDraft] = useState<DeliveryAddress>({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Nigeria',
  });
  const [addressBusy, setAddressBusy] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactBusy, setContactBusy] = useState(false);
  const [contactNotice, setContactNotice] = useState('');
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const { width: windowWidth } = useWindowDimensions();
  const cropFrameSize = Math.max(220, Math.min(280, windowWidth - 48));
  const cropAspect = avatarCropAsset ? avatarCropAsset.width / avatarCropAsset.height : 1;
  const cropImageWidth = Math.max(cropFrameSize, cropFrameSize * cropAspect) * avatarCropZoom;
  const cropImageHeight = cropImageWidth / cropAspect;
  const cropImageLeft = (cropFrameSize - cropImageWidth) / 2 + avatarCropX * (cropImageWidth - cropFrameSize) / 2;
  const cropImageTop = (cropFrameSize - cropImageHeight) / 2 + avatarCropY * (cropImageHeight - cropFrameSize) / 2;

  const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset, croppedBlob?: Blob) => {
    if (!user) throw new Error('Sign in before changing your profile photo.');
    setProfileBusy(true);
    try {
      const contentType = croppedBlob ? 'image/jpeg' : asset.mimeType || 'image/jpeg';
      const extension = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : contentType === 'image/heic' ? 'heic' : 'jpg';
      const path = `${user.id}/avatar-${Date.now()}.${extension}`;
      const bytes = new Uint8Array(croppedBlob
        ? await croppedBlob.arrayBuffer()
        : await (await fetch(asset.uri)).arrayBuffer());
      const { error: uploadError } = await supabase.storage.from('customer-avatars').upload(path, bytes, {
        contentType,
        upsert: false,
      });
      if (uploadError) throw new Error(`Profile photo upload failed: ${uploadError.message}. Run the latest customer-account-setup.sql migration in Supabase.`);
      const { data: publicUrl } = supabase.storage.from('customer-avatars').getPublicUrl(path);
      const { data: updatedProfile, error: profileError } = await supabase.from('customer_profiles')
        .update({ avatar_url: publicUrl.publicUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select('id')
        .maybeSingle();
      if (profileError) throw new Error(`The photo uploaded but your customer profile could not be updated: ${profileError.message}`);
      if (!updatedProfile) throw new Error('Your PAZ customer profile was not found. Sign in again and retry.');
      setProfile((current) => ({
        first_name: current?.first_name || null,
        last_name: current?.last_name || null,
        full_name: current?.full_name || null,
        email: current?.email || user.email || null,
        phone: current?.phone || null,
        delivery_address: current?.delivery_address || null,
        avatar_url: publicUrl.publicUrl,
      }));
      onAvatarChange(publicUrl.publicUrl);
      setAvatarCropAsset(null);
    } finally {
      setProfileBusy(false);
    }
  };

  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    setProfileBusy(true);
    setProfileError('');
    try {
      const { data, error } = await supabase.from('customer_profiles')
        .select('first_name,last_name,full_name,email,phone,avatar_url,delivery_address')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      setProfile(data as Profile | null);
      onAvatarChange(data?.avatar_url || null);
      const savedAddress = data?.delivery_address;
      if (savedAddress && typeof savedAddress === 'object') {
        onDeliveryAddressChange(savedAddress as DeliveryAddress);
      }
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Your customer profile could not be loaded.');
    } finally {
      setProfileBusy(false);
    }
  }, [onAvatarChange, onDeliveryAddressChange, user?.id]);

  useEffect(() => {
    setAddressDraft(deliveryAddress || {
      fullName: profile?.full_name || [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || user?.user_metadata?.full_name || user?.user_metadata?.name || '',
      phone: profile?.phone || user?.user_metadata?.phone || '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Nigeria',
    });
  }, [deliveryAddress, profile?.first_name, profile?.full_name, profile?.last_name, profile?.phone, user?.id]);

  useEffect(() => {
    if (!user) return;
    setNewMessageName(profile?.full_name || [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || user.user_metadata?.full_name || user.user_metadata?.name || '');
    setNewMessagePhone(profile?.phone || user.user_metadata?.phone || '');
  }, [
    profile?.first_name,
    profile?.full_name,
    profile?.last_name,
    profile?.phone,
    user?.id,
    user?.user_metadata?.full_name,
    user?.user_metadata?.name,
    user?.user_metadata?.phone,
  ]);
  useEffect(() => {
    setContactName(profile?.full_name || [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || user?.user_metadata?.full_name || user?.user_metadata?.name || '');
    setContactEmail(profile?.email || user?.email || '');
  }, [profile?.email, profile?.first_name, profile?.full_name, profile?.last_name, user?.email]);

  const loadOrders = useCallback(async () => {
    if (!user) return;
    setOrdersBusy(true);
    setOrdersError('');
    try {
      const queryOrders = () => supabase.from('shop_orders')
        .select('id,order_number,total,currency,status,created_at,shop_order_items(title,quantity)')
        .order('created_at', { ascending: false })
        .limit(50);
      const [byCustomer, byEmail] = await Promise.all([
        queryOrders().eq('customer_id', user.id),
        user.email ? queryOrders().eq('email', user.email.toLowerCase()) : Promise.resolve({ data: [], error: null }),
      ]);
      if (byCustomer.error) throw new Error(byCustomer.error.message);
      if (byEmail.error) throw new Error(byEmail.error.message);
      setOrders([...new Map([...(byCustomer.data || []), ...(byEmail.data || [])].map((order) => [order.id, order])).values()] as Order[]);
    } catch (error) {
      setOrdersError(error instanceof Error ? error.message : 'Order history could not be loaded.');
    } finally {
      setOrdersBusy(false);
    }
  }, [user?.id]);

  const loadChats = useCallback(async () => {
    if (!user) {
      setConversations([]);
      onUnreadChange(0);
      return;
    }
    setChatsBusy(true);
    setChatsError('');
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw new Error(error.message);
      if (!data.session?.access_token) throw new Error('Sign in again to view your messages.');
      const payload = await apiRequest('/product-chat', 'POST', { action: 'list-account' }, data.session.access_token);
      const threads = Array.isArray(payload.data) ? payload.data as Conversation[] : [];
      setConversations(threads);
      onUnreadChange(threads.reduce((sum, thread) => sum + (thread.unread_count || 0), 0));
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      setChatsError(
        /failed to fetch|network request failed|load failed/i.test(message)
          ? 'Unable to connect to PAZ Messages. Check your connection and try again.'
          : message || 'Your conversations could not be loaded.',
      );
    } finally {
      setChatsBusy(false);
    }
  }, [onUnreadChange, user?.id]);

  const loadNotifications = useCallback(async (silent = false) => {
    if (!user) {
      setNotifications([]);
      setNotificationUnreadCount(0);
      onNotificationUnreadChange(0);
      return;
    }
    if (!silent) setNotificationsBusy(true);
    setNotificationsError('');
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw new Error(error.message);
      if (!data.session?.access_token) throw new Error('Sign in again to view your notifications.');
      const payload = await apiRequest('/customer-notifications', 'POST', { action: 'list' }, data.session.access_token);
      const items = Array.isArray(payload.notifications) ? payload.notifications as CustomerNotification[] : [];
      const unread = Number(payload.unreadCount) || 0;
      setNotifications(items);
      setNotificationUnreadCount(unread);
      onNotificationUnreadChange(unread);
    } catch (error) {
      setNotificationsError(error instanceof Error ? error.message : 'Your notifications could not be loaded.');
    } finally {
      if (!silent) setNotificationsBusy(false);
    }
  }, [onNotificationUnreadChange, user?.id]);

  const markNotificationRead = async (notification?: CustomerNotification) => {
    if (!user || (notification && notification.read_at)) return;
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw new Error(error.message);
      if (!data.session?.access_token) throw new Error('Sign in again to update your notifications.');
      await apiRequest('/customer-notifications', 'POST', {
        action: 'mark_read',
        ...(notification ? { id: notification.id } : {}),
      }, data.session.access_token);
      setNotifications((current) => current.map((item) => !notification || item.id === notification.id
        ? { ...item, read_at: item.read_at || new Date().toISOString() }
        : item));
      const nextCount = notification
        ? Math.max(0, notificationUnreadCount - 1)
        : 0;
      setNotificationUnreadCount(nextCount);
      onNotificationUnreadChange(nextCount);
    } catch (error) {
      setNotificationsError(error instanceof Error ? error.message : 'Your notification could not be marked as read.');
    }
  };

  useEffect(() => { void loadProfile(); }, [loadProfile]);
  useEffect(() => {
    if (!user) {
      setConversations([]);
      onUnreadChange(0);
      return;
    }
    void loadChats();
    const timer = setInterval(() => void loadChats(), 20000);
    return () => clearInterval(timer);
  }, [loadChats, onUnreadChange, user?.id]);
  useEffect(() => {
    if (page === 'notifications') void loadNotifications();
  }, [loadNotifications, page]);
  useEffect(() => {
    if (page !== 'notifications' || !user) return;
    const timer = setInterval(() => void loadNotifications(true), 20000);
    return () => clearInterval(timer);
  }, [loadNotifications, page, user?.id]);
  useEffect(() => {
    if (openNotificationsRequest > 0) setPage('notifications');
  }, [openNotificationsRequest]);
  useEffect(() => {
    if (!activeChat?.token) return;
    let active = true;
    const lastMessage = activeChat.messages?.[activeChat.messages.length - 1];
    const since = lastMessage ? new Date(Date.parse(lastMessage.created_at) - 1).toISOString() : undefined;
    const timer = setInterval(() => {
      void apiRequest('/product-chat', 'POST', { action: 'read', token: activeChat.token, since })
        .then((payload) => {
          if (active) setActiveChat((current) => {
            if (current?.token !== activeChat.token) return current;
            const existing = new Set((current.messages || []).map((message) => message.id).filter(Boolean));
            const incoming = (payload.messages || []).filter((message: ChatMessage) => !message.id || !existing.has(message.id));
            return incoming.length ? { ...current, messages: [...(current.messages || []), ...incoming] } : current;
          });
        })
        .catch((error) => {
          if (active) setChatError(error instanceof Error ? error.message : 'The conversation could not be refreshed.');
        });
    }, 20000);
    return () => { active = false; clearInterval(timer); };
  }, [activeChat?.token, activeChat?.messages?.[activeChat.messages.length - 1]?.created_at]);
  useEffect(() => {
    if (openChatsRequest > 0) setPage('chats');
  }, [openChatsRequest]);
  useEffect(() => {
    if (openAddressRequest > 0) setPage('address');
  }, [openAddressRequest]);

  const openConversation = async (conversation: Conversation) => {
    setChatBusy(true);
    setChatError('');
    try {
      const payload = await apiRequest('/product-chat', 'POST', { action: 'read', token: conversation.token });
      const opened = { ...conversation, messages: payload.messages || [], unread_count: 0 };
      setActiveChat(opened);
      setConversations((current) => current.map((thread) => thread.id === opened.id ? opened : thread));
      await loadChats();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'This conversation could not be opened.';
      if (message.includes('invalid or expired')) {
        setExpiredConversationIds((current) => new Set(current).add(conversation.id));
        setNewMessageOpen(true);
        setChatError('This conversation link is no longer active. Start a new message below to continue with PAZ Customer Care.');
      } else {
        setChatError(message);
      }
    } finally {
      setChatBusy(false);
    }
  };

  const sendReply = async () => {
    if (!activeChat || !reply.trim()) return;
    setChatBusy(true);
    setChatError('');
    try {
      const payload = await apiRequest('/product-chat', 'POST', { action: 'send', token: activeChat.token, message: reply.trim() });
      setActiveChat((current) => current ? { ...current, messages: [...(current.messages || []), payload.message] } : current);
      setReply('');
      await loadChats();
    } catch (error) {
      setChatError(error instanceof Error ? error.message : 'Your reply could not be sent.');
    } finally {
      setChatBusy(false);
    }
  };

  const changeAvatar = async () => {
    if (!user) return;
    setProfileError('');
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) throw new Error('Allow photo-library access to choose a profile picture.');
      const selection = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: Platform.OS !== 'web',
        ...(Platform.OS !== 'web' ? { aspect: [1, 1] as [number, number] } : {}),
        quality: 0.82,
      });
      if (selection.canceled || !selection.assets[0]) return;
      const asset = selection.assets[0];
      if (Platform.OS === 'web') {
        setAvatarCropZoom(1.12);
        setAvatarCropX(0);
        setAvatarCropY(0.8);
        setAvatarCropAsset(asset);
      } else {
        await uploadAvatar(asset);
      }
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Your profile picture could not be updated.');
    }
  };

  const saveWebAvatarCrop = async () => {
    if (!avatarCropAsset) return;
    setProfileBusy(true);
    setProfileError('');
    try {
      const response = await fetch(avatarCropAsset.uri);
      if (!response.ok) throw new Error('The selected photo could not be read for cropping.');
      const sourceImage = await createImageBitmap(await response.blob());
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('The photo crop tool could not start. Please try another browser.');
      const aspect = avatarCropAsset.width / avatarCropAsset.height;
      const baseWidth = Math.max(cropFrameSize, cropFrameSize * aspect);
      const baseHeight = baseWidth / aspect;
      const imageWidth = baseWidth * avatarCropZoom;
      const imageHeight = baseHeight * avatarCropZoom;
      const left = (cropFrameSize - imageWidth) / 2 + avatarCropX * (imageWidth - cropFrameSize) / 2;
      const top = (cropFrameSize - imageHeight) / 2 + avatarCropY * (imageHeight - cropFrameSize) / 2;
      const sourceWidth = avatarCropAsset.width * cropFrameSize / imageWidth;
      const sourceHeight = avatarCropAsset.height * cropFrameSize / imageHeight;
      const sourceX = Math.max(0, Math.min(avatarCropAsset.width - sourceWidth, -left * avatarCropAsset.width / imageWidth));
      const sourceY = Math.max(0, Math.min(avatarCropAsset.height - sourceHeight, -top * avatarCropAsset.height / imageHeight));
      context.drawImage(sourceImage, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
      sourceImage.close();
      const croppedBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('The cropped photo could not be prepared. Please try again.')), 'image/jpeg', 0.9);
      });
      await uploadAvatar(avatarCropAsset, croppedBlob);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Your cropped profile picture could not be saved.');
      setProfileBusy(false);
    }
  };

  const createSupportConversation = async () => {
    if (!user || !newMessage.trim()) return;
    setChatBusy(true);
    setChatError('');
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw new Error(error.message);
      if (!data.session?.access_token || !data.session.user.email_confirmed_at) {
        throw new Error('Confirm your account email and sign in again before sending a message.');
      }
      const payload = await apiRequest('/product-chat', 'POST', {
        action: 'start',
        productId: 'paz-customer-support',
        name: newMessageName.trim(),
        email: data.session.user.email,
        phone: newMessagePhone.trim(),
        message: newMessage.trim(),
      }, data.session.access_token);
      const opened: Conversation = {
        id: payload.conversation.id,
        product_id: 'paz-customer-support',
        product_title: 'PAZ Customer Care',
        customer_name: newMessageName.trim(),
        status: 'open',
        assigned_to: 'admin',
        vendor_name: null,
        last_message_at: payload.conversation.last_message_at || new Date().toISOString(),
        last_message: newMessage.trim(),
        unread_count: 0,
        token: payload.token,
        messages: payload.messages || [],
      };
      setConversations((current) => [opened, ...current]);
      setActiveChat(opened);
      setNewMessage('');
      setNewMessageOpen(false);
      void loadChats();
    } catch (error) {
      setChatError(error instanceof Error ? error.message : 'Your message could not be sent.');
    } finally {
      setChatBusy(false);
    }
  };

  const saveAddress = async () => {
    if (!user) {
      setAddressError('Sign in to save a delivery address to your PAZ profile.');
      return;
    }
    const normalized = {
      ...addressDraft,
      fullName: addressDraft.fullName.trim(),
      phone: addressDraft.phone.trim(),
      addressLine1: addressDraft.addressLine1.trim(),
      addressLine2: addressDraft.addressLine2.trim(),
      city: addressDraft.city.trim(),
      state: addressDraft.state.trim(),
      postalCode: addressDraft.postalCode.trim(),
      country: addressDraft.country.trim(),
    };
    if (!normalized.fullName || !normalized.phone || !normalized.addressLine1 || !normalized.city || !normalized.state || !normalized.country) {
      setAddressError('Enter your name, phone, street address, city, state, and country.');
      return;
    }
    setAddressBusy(true);
    setAddressError('');
    try {
      const { error } = await supabase.from('customer_profiles').upsert({
        id: user.id,
        email: user.email || null,
        full_name: normalized.fullName,
        phone: normalized.phone,
        delivery_address: normalized,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
      if (error) throw new Error(`Your address could not be saved: ${error.message}`);
      setAddressDraft(normalized);
      setProfile((current) => ({
        first_name: current?.first_name || null,
        last_name: current?.last_name || null,
        full_name: normalized.fullName,
        email: user.email || current?.email || null,
        phone: normalized.phone,
        avatar_url: current?.avatar_url || null,
        delivery_address: normalized,
      }));
      onDeliveryAddressChange(normalized);
      setAddressError('');
      setPage(null);
    } catch (error) {
      setAddressError(error instanceof Error ? error.message : 'Your address could not be saved.');
    } finally {
      setAddressBusy(false);
    }
  };

  const submitContactMessage = async () => {
    if (!contactName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim()) || !contactSubject.trim() || !contactMessage.trim()) {
      setContactNotice('Enter your name, a valid email, a subject, and a message.');
      return;
    }
    setContactBusy(true);
    setContactNotice('');
    try {
      await apiRequest('/customer-support', 'POST', {
        name: contactName.trim(),
        email: contactEmail.trim(),
        subject: contactSubject.trim(),
        message: contactMessage.trim(),
      });
      setContactNotice('Your message has been received. PAZ Customer Care will get back to you.');
      setContactSubject('');
      setContactMessage('');
    } catch (error) {
      setContactNotice(error instanceof Error ? error.message : 'Your message could not be sent. Please try again.');
    } finally {
      setContactBusy(false);
    }
  };

  const openContactLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      setContactNotice(error instanceof Error ? error.message : 'This contact link could not be opened.');
    }
  };

  const accountName = profile?.full_name
    || [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')
    || user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split('@')[0];
  const fullName = typeof accountName === 'string' && accountName.trim() ? accountName : 'Guest';
  const email = profile?.email || user?.email || 'Browsing without an account';
  const initials = fullName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'G';
  const avatarUrl = [
    profile?.avatar_url,
    user?.user_metadata?.avatar_url,
    user?.user_metadata?.picture,
    user?.user_metadata?.photo_url,
  ].find((value): value is string => typeof value === 'string' && value.trim().length > 0);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const unreadCount = conversations.reduce((sum, thread) => sum + (thread.unread_count || 0), 0);

  useEffect(() => { setAvatarLoadError(false); }, [avatarUrl]);

  const handleRow = (key: (typeof menuRows)[number]['key']) => {
    if (key === 'orders') {
      setPage('orders');
      if (user) void loadOrders();
    } else if (key === 'wishlist') onWishlist();
    else if (key === 'chats') setPage('chats');
    else if (key === 'notices') setPage('notifications');
    else if (key === 'address') setPage('address');
    else if (key === 'payments') setPage('payments');
    else if (key === 'notifications') onToggleNotifications(!notificationsEnabled);
    else if (key === 'support') setPage('support');
    else if (key === 'about') setPage('about');
  };

  const pageTitle = activeChat ? activeChat.product_title : page === 'orders' ? 'My Orders' : page === 'chats' ? 'Messages' : page === 'notifications' ? 'PAZ Notifications' : page === 'about' ? 'About PAZ' : page === 'address' ? 'Digital delivery' : page === 'support' ? 'Contact Us' : 'Secure payments';

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <Pressable accessibilityRole="button" accessibilityLabel="Change profile picture" disabled={!user || profileBusy} onPress={() => void changeAvatar()} style={styles.avatarButton}>
            {avatarUrl && !avatarLoadError
              ? <View style={styles.avatarPhotoClip}><Image source={{ uri: avatarUrl }} style={styles.avatarImage} resizeMode="cover" onError={() => setAvatarLoadError(true)} /></View>
              : <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>}
            {user ? <View style={styles.cameraBadge}><FontAwesome5 name="camera" size={10} color={palette.white} /></View> : null}
          </Pressable>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.email}>{email}</Text>
          {profileBusy ? <ActivityIndicator color={palette.green} style={styles.inlineLoader} /> : null}
          {profileError ? <Text accessibilityRole="alert" style={styles.error}>{profileError}</Text> : null}
          {!user ? (
            <View style={styles.guestActions}>
              <Pressable accessibilityRole="button" onPress={onSignIn} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Sign in</Text></Pressable>
              <Pressable accessibilityRole="button" onPress={onCreateAccount} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Create account</Text></Pressable>
            </View>
          ) : null}
        </View>

        <View style={styles.menuCard}>
          {menuRows.map((row) => (
            <Row key={row.key} icon={row.icon} color={row.color} title={row.title}
              subtitle={row.key === 'chats' && unreadCount ? `${unreadCount} unread message${unreadCount === 1 ? '' : 's'}` : row.key === 'notices' && notificationUnreadCount ? `${notificationUnreadCount} unread update${notificationUnreadCount === 1 ? '' : 's'}` : row.subtitle}
              onPress={() => handleRow(row.key)}
              trailing={row.key === 'notifications' ? (
                <Switch accessibilityLabel="Enable PAZ notifications" value={notificationsEnabled} onValueChange={onToggleNotifications}
                  trackColor={{ false: '#d8d2e0', true: '#c5afea' }} thumbColor={notificationsEnabled ? palette.green : '#fff'} />
              ) : row.key === 'chats' && unreadCount > 0 ? (
                <View style={styles.unreadBadge}><Text style={styles.unreadBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text></View>
              ) : row.key === 'notices' && notificationUnreadCount > 0 ? (
                <View style={styles.unreadBadge}><Text style={styles.unreadBadgeText}>{notificationUnreadCount > 99 ? '99+' : notificationUnreadCount}</Text></View>
              ) : undefined}
            />
          ))}
        </View>

        {user ? <Pressable accessibilityRole="button" onPress={onSignOut} style={styles.signOut}>
          <FontAwesome5 name="sign-out-alt" size={14} color={palette.red} /><Text style={styles.signOutText}>Sign out</Text>
        </Pressable> : null}
        <Text style={styles.version}>PAZ Thriving Shop</Text>
      </ScrollView>

      <Modal visible={Boolean(page)} animationType="slide" onRequestClose={() => { setPage(null); setActiveChat(null); }}>
        <View style={styles.modalPage}>
          <View style={styles.modalHeader}>
            <Pressable accessibilityRole="button" accessibilityLabel={activeChat ? 'Back to messages' : 'Close'} onPress={() => activeChat ? setActiveChat(null) : setPage(null)} style={styles.modalBack}>
              <FontAwesome5 name={activeChat ? 'arrow-left' : 'times'} size={17} color={palette.ink} />
            </Pressable>
            <Text numberOfLines={1} style={styles.modalTitle}>{pageTitle}</Text>
            {page === 'orders' ? <Pressable accessibilityRole="button" accessibilityLabel="Refresh orders" disabled={ordersBusy} onPress={() => void loadOrders()}><FontAwesome5 name="sync-alt" size={15} color={palette.green} /></Pressable> : <View style={styles.headerSpacer} />}
          </View>

          {page === 'notifications' ? (
            <ScrollView contentContainerStyle={styles.modalContent}>
              {!user ? <Text style={styles.emptyText}>Sign in to view PAZ updates.</Text> : null}
              {notificationsBusy ? <ActivityIndicator color={palette.green} style={styles.largeLoader} /> : null}
              {notificationsError ? <Text accessibilityRole="alert" style={styles.error}>{notificationsError}</Text> : null}
              {user && notificationUnreadCount > 0 ? (
                <Pressable accessibilityRole="button" onPress={() => void markNotificationRead()} style={styles.markAllReadButton}>
                  <Text style={styles.markAllReadText}>Mark all as read</Text>
                </Pressable>
              ) : null}
              {!notificationsBusy && !notificationsError && user && notifications.length === 0 ? <Text style={styles.emptyText}>You’re all caught up. PAZ updates will appear here.</Text> : null}
              {notifications.map((item) => (
                <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`${item.read_at ? 'Read' : 'Unread'} notification: ${item.title}`} onPress={() => void markNotificationRead(item)} style={[styles.notificationCard, !item.read_at && styles.unreadNotificationCard]}>
                  <View style={styles.notificationHeading}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    {!item.read_at ? <View style={styles.notificationDot} /> : null}
                  </View>
                  <Text style={styles.notificationMessage}>{item.message}</Text>
                  <Text style={styles.notificationTime}>{new Date(item.created_at).toLocaleString()}</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}

          {page === 'orders' ? (
            <ScrollView contentContainerStyle={styles.modalContent}>
              {!user ? <Text style={styles.emptyText}>Sign in to view your order history.</Text> : null}
              {ordersBusy ? <ActivityIndicator color={palette.green} style={styles.largeLoader} /> : null}
              {ordersError ? <Text accessibilityRole="alert" style={styles.error}>{ordersError}</Text> : null}
              {!ordersBusy && !ordersError && user && orders.length === 0 ? <Text style={styles.emptyText}>No orders yet. Your completed purchases will appear here.</Text> : null}
              {orders.map((order) => <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeading}><Text style={styles.orderNumber}>{order.order_number}</Text><Text style={styles.orderStatus}>{order.status || 'processing'}</Text></View>
                <Text style={styles.rowSubtitle}>{new Date(order.created_at).toLocaleDateString()} · {order.currency || 'NGN'} {Number(order.total || 0).toLocaleString()}</Text>
                {order.shop_order_items?.map((item, index) => <Text key={`${order.id}-${index}`} style={styles.orderItem}>{item.title || 'PAZ product'} ×{item.quantity || 1}</Text>)}
              </View>)}
            </ScrollView>
          ) : null}

          {page === 'chats' ? activeChat ? (
            <KeyboardAvoidingView style={styles.chatPage} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <ScrollView contentContainerStyle={styles.chatMessages}>
                <Text style={styles.roomParticipant}>
                  {activeChat.assigned_to === 'vendor'
                    ? `This conversation includes ${activeChat.vendor_name || 'the product vendor'} and PAZ Customer Care.`
                    : 'This conversation is with PAZ Customer Care.'}
                </Text>
                {(activeChat.messages || []).map((message, index) => {
                  const own = message.sender_role === 'customer';
                  const senderLabel = own ? 'You' : message.sender_role === 'vendor' ? `${message.sender_name} · Vendor` : `${message.sender_name} · PAZ Customer Care`;
                  return <View key={message.id || `${message.created_at}-${index}`} style={[styles.messageBubble, own ? styles.ownMessage : styles.replyMessage]}>
                    <Text style={[styles.messageSender, own && styles.ownMessageText]}>{senderLabel}</Text>
                    <Text style={[styles.messageText, own && styles.ownMessageText]}>{message.message}</Text>
                    <Text style={[styles.messageTime, own && styles.ownMessageText]}>{new Date(message.created_at).toLocaleString()}</Text>
                  </View>;
                })}
                {chatBusy && !activeChat.messages?.length ? <ActivityIndicator color={palette.green} style={styles.largeLoader} /> : null}
              </ScrollView>
              {chatError ? <Text accessibilityRole="alert" style={styles.error}>{chatError}</Text> : null}
              <View style={styles.replyBar}>
                <TextInput accessibilityLabel="Message PAZ support" multiline value={reply} onChangeText={setReply} placeholder="Write a reply..." style={styles.replyInput} />
                <Pressable accessibilityRole="button" accessibilityLabel="Send reply" disabled={chatBusy || !reply.trim()} onPress={() => void sendReply()} style={[styles.sendButton, (chatBusy || !reply.trim()) && styles.sendButtonDisabled]}>
                  {chatBusy ? <ActivityIndicator color={palette.white} size="small" /> : <FontAwesome5 name="paper-plane" size={14} color={palette.white} />}
                </Pressable>
              </View>
            </KeyboardAvoidingView>
          ) : <ScrollView contentContainerStyle={styles.modalContent}>
            {!user ? <Text style={styles.emptyText}>Sign in to see all your conversations.</Text> : null}
            {chatsBusy ? <ActivityIndicator color={palette.green} style={styles.largeLoader} /> : null}
            {chatsError ? <Text accessibilityRole="alert" style={styles.error}>{chatsError}</Text> : null}
            {chatError ? <Text accessibilityRole="alert" style={styles.error}>{chatError}</Text> : null}
            {user && !newMessageOpen ? (
              <Pressable accessibilityRole="button" onPress={() => { setChatError(''); setNewMessageOpen(true); }} style={styles.newMessageButton}>
                <FontAwesome5 name="plus" size={12} color={palette.white} />
                <Text style={styles.primaryButtonText}>New message</Text>
              </Pressable>
            ) : null}
            {user && newMessageOpen ? (
              <View style={styles.newConversationCard}>
                <FontAwesome5 name="comments" size={24} color={palette.green} />
                <Text style={styles.infoHeading}>Start a conversation</Text>
                <Text style={styles.emptyText}>Send a message to PAZ Customer Care. Your conversation will appear here so you can continue it later.</Text>
                <View style={styles.newConversationForm}>
                    <Text style={styles.rowSubtitle}>Reply email: {email}</Text>
                    <TextInput accessibilityLabel="Your name" value={newMessageName} onChangeText={setNewMessageName} placeholder="Your name" style={styles.replyInput} />
                    <TextInput accessibilityLabel="Phone number with country code" value={newMessagePhone} onChangeText={setNewMessagePhone} placeholder="Phone number, e.g. +234..." keyboardType="phone-pad" style={styles.replyInput} />
                    <TextInput accessibilityLabel="Your message to PAZ" value={newMessage} onChangeText={setNewMessage} placeholder="How can PAZ help you?" multiline maxLength={4000} style={[styles.replyInput, styles.newMessageInput]} />
                    <View style={styles.newMessageActions}>
                      <Pressable accessibilityRole="button" onPress={() => { setNewMessageOpen(false); setChatError(''); }} style={styles.secondaryButton}>
                        <Text style={styles.secondaryButtonText}>Cancel</Text>
                      </Pressable>
                      <Pressable accessibilityRole="button" disabled={chatBusy || !newMessageName.trim() || !newMessagePhone.trim() || !newMessage.trim()} onPress={() => void createSupportConversation()} style={[styles.primaryButton, (chatBusy || !newMessageName.trim() || !newMessagePhone.trim() || !newMessage.trim()) && styles.sendButtonDisabled]}>
                        {chatBusy ? <ActivityIndicator color={palette.white} /> : <Text style={styles.primaryButtonText}>Send message</Text>}
                      </Pressable>
                    </View>
                </View>
              </View>
            ) : null}
            {!chatsBusy && !chatsError && user && !conversations.length && !newMessageOpen ? <Text style={styles.emptyText}>No conversations yet. Start a new message whenever you need help.</Text> : null}
            {conversations.map((conversation) => <Pressable key={conversation.id} accessibilityRole="button" disabled={expiredConversationIds.has(conversation.id)} onPress={() => void openConversation(conversation)} style={[styles.conversationCard, expiredConversationIds.has(conversation.id) && styles.expiredConversationCard]}>
              <View style={styles.conversationIcon}><FontAwesome5 name="book" size={15} color={palette.green} /></View>
              <View style={styles.conversationCopy}>
                <Text numberOfLines={1} style={styles.orderNumber}>{conversation.product_title}</Text>
                <Text style={styles.rowSubtitle}>{expiredConversationIds.has(conversation.id) ? 'This link is no longer active · Start a new message' : `${conversation.assigned_to === 'vendor' ? `${conversation.vendor_name || 'Product vendor'} · Vendor` : 'PAZ Customer Care'} · ${new Date(conversation.last_message_at).toLocaleString()}`}</Text>
                {conversation.last_message ? <Text numberOfLines={1} style={styles.conversationPreview}>{conversation.last_message}</Text> : null}
              </View>
              {conversation.unread_count > 0 ? <View style={styles.unreadBadge}><Text style={styles.unreadBadgeText}>{conversation.unread_count}</Text></View> : <FontAwesome5 name="chevron-right" size={11} color={palette.muted} />}
            </Pressable>)}
          </ScrollView> : null}

          {page === 'about' ? <ScrollView contentContainerStyle={styles.aboutContent}>
            <Image accessibilityLabel="PAZ Thriving Tribe logo" source={require('../assets/paz-logo.png')} style={styles.aboutLogo} resizeMode="contain" />
            <Text style={styles.aboutEyebrow}>PAZ THRIVING TRIBE</Text>
            <Text style={styles.aboutHeading}>Helping you grow, one page at a time.</Text>
            <Text style={styles.aboutCopy}>PAZ Thriving Tribe is a community-centered digital bookstore offering books, guides, journals, and resources designed to encourage learning, personal growth, and thriving.</Text>
            <Text style={styles.aboutCopy}>We believe the right resource can help people gain confidence, build practical skills, and take meaningful steps toward their goals. Every purchase supports that mission and is delivered digitally for convenient access.</Text>
            <Text style={styles.aboutCopy}>Thank you for choosing PAZ and being part of the tribe.</Text>
            <Text style={styles.aboutSite}>pazthrivingtribe.org</Text>
            <Pressable accessibilityRole="button" onPress={() => setPage(null)} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Close</Text></Pressable>
          </ScrollView> : null}

          {page === 'address' ? <ScrollView contentContainerStyle={styles.addressContent} keyboardShouldPersistTaps="handled">
            <View style={styles.addressIntro}>
              <View style={styles.aboutMark}><FontAwesome5 name="map-marker-alt" size={22} color={palette.white} /></View>
              <Text style={styles.infoHeading}>{deliveryAddress ? 'Your saved address' : 'Add a delivery address'}</Text>
              <Text style={styles.infoCopy}>Save your contact and delivery details here. PAZ will prefill them at checkout.</Text>
            </View>
            {!user ? <Text style={styles.error}>Sign in to save an address to your profile.</Text> : null}
            <View style={styles.addressField}><Text style={styles.addressLabel}>Full name</Text><TextInput accessibilityLabel="Address full name" autoCapitalize="words" value={addressDraft.fullName} onChangeText={(value) => setAddressDraft((current) => ({ ...current, fullName: value }))} placeholder="Enter your full name" placeholderTextColor="#858091" style={styles.addressInput} /></View>
            <View style={styles.addressField}><Text style={styles.addressLabel}>Phone number</Text><TextInput accessibilityLabel="Address phone number" value={addressDraft.phone} onChangeText={(value) => setAddressDraft((current) => ({ ...current, phone: value }))} placeholder="e.g. +234 800 000 0000" placeholderTextColor="#858091" keyboardType="phone-pad" style={styles.addressInput} /></View>
            <View style={styles.addressField}><Text style={styles.addressLabel}>Street address</Text><TextInput accessibilityLabel="Street address" value={addressDraft.addressLine1} onChangeText={(value) => setAddressDraft((current) => ({ ...current, addressLine1: value }))} placeholder="House number and street name" placeholderTextColor="#858091" style={styles.addressInput} /></View>
            <View style={styles.addressField}><Text style={styles.addressLabel}>Apartment or landmark <Text style={styles.optionalLabel}>(optional)</Text></Text><TextInput accessibilityLabel="Apartment or landmark" value={addressDraft.addressLine2} onChangeText={(value) => setAddressDraft((current) => ({ ...current, addressLine2: value }))} placeholder="Apartment, suite or nearby landmark" placeholderTextColor="#858091" style={styles.addressInput} /></View>
            <View style={styles.addressField}><Text style={styles.addressLabel}>City</Text><TextInput accessibilityLabel="City" value={addressDraft.city} onChangeText={(value) => setAddressDraft((current) => ({ ...current, city: value }))} placeholder="Enter your city" placeholderTextColor="#858091" style={styles.addressInput} /></View>
            <View style={styles.addressField}><Text style={styles.addressLabel}>State or region</Text><TextInput accessibilityLabel="State or region" value={addressDraft.state} onChangeText={(value) => setAddressDraft((current) => ({ ...current, state: value }))} placeholder="Enter your state or region" placeholderTextColor="#858091" style={styles.addressInput} /></View>
            <View style={styles.addressField}><Text style={styles.addressLabel}>Postal code <Text style={styles.optionalLabel}>(optional)</Text></Text><TextInput accessibilityLabel="Postal code" value={addressDraft.postalCode} onChangeText={(value) => setAddressDraft((current) => ({ ...current, postalCode: value }))} placeholder="Enter postal code" placeholderTextColor="#858091" style={styles.addressInput} /></View>
            <View style={styles.addressField}><Text style={styles.addressLabel}>Country</Text><TextInput accessibilityLabel="Country" value={addressDraft.country} onChangeText={(value) => setAddressDraft((current) => ({ ...current, country: value }))} placeholder="Enter your country" placeholderTextColor="#858091" style={styles.addressInput} /></View>
            {addressError ? <Text accessibilityRole="alert" style={styles.error}>{addressError}</Text> : null}
            <Pressable accessibilityRole="button" disabled={!user || addressBusy} onPress={() => void saveAddress()} style={[styles.primaryButton, (!user || addressBusy) && styles.sendButtonDisabled]}>
              {addressBusy ? <ActivityIndicator color={palette.white} /> : <Text style={styles.primaryButtonText}>{deliveryAddress ? 'Save address' : 'Add address'}</Text>}
            </Pressable>
            {deliveryAddress ? <Pressable accessibilityRole="button" onPress={() => { setPage(null); onCheckout(); }} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Continue to checkout</Text></Pressable> : null}
          </ScrollView> : null}

          {page === 'support' ? <ScrollView contentContainerStyle={styles.supportContent} keyboardShouldPersistTaps="handled">
            <View style={styles.contactIntro}>
              <Text style={styles.contactHeading}>Contact Us</Text>
              <Text style={styles.contactIntroCopy}>Have questions or ready to start your journey? We're here to help. Reach out to our team and we'll get back to you as soon as possible.</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={() => void openContactLink('tel:+2348037383820')} style={styles.contactDetail}>
              <View style={styles.contactIcon}><FontAwesome5 name="phone" size={16} color={palette.green} /></View>
              <View style={styles.rowCopy}><Text style={styles.rowTitle}>Phone</Text><Text style={styles.contactValue}>+234 (0) 803 738 3820</Text></View>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => void openContactLink('mailto:pazthrivingtribe@gmail.com')} style={styles.contactDetail}>
              <View style={styles.contactIcon}><FontAwesome5 name="envelope" size={16} color={palette.green} /></View>
              <View style={styles.rowCopy}><Text style={styles.rowTitle}>Email</Text><Text style={styles.contactValue}>pazthrivingtribe@gmail.com</Text></View>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => void openContactLink('https://maps.google.com/?q=5+Muyibat+Ashani+Street,+Peaceville+Estate,+Badore,+Ajah,+Lagos')} style={styles.contactDetail}>
              <View style={styles.contactIcon}><FontAwesome5 name="map-marker-alt" size={16} color={palette.green} /></View>
              <View style={styles.rowCopy}><Text style={styles.rowTitle}>Address</Text><Text style={styles.contactValue}>#5 Muyibat Ashani Street, Peaceville Estate, Badore, Ajah, Lagos</Text></View>
            </Pressable>
            <View style={styles.contactDetail}>
              <View style={styles.contactIcon}><FontAwesome5 name="clock" size={16} color={palette.green} /></View>
              <View style={styles.rowCopy}><Text style={styles.rowTitle}>Hours</Text><Text style={styles.contactValue}>Mon - Fri: 9:00 AM - 6:00 PM</Text></View>
            </View>
            <View style={styles.contactForm}>
              <Text style={styles.contactFormTitle}>Send us a message</Text>
              <TextInput accessibilityLabel="Contact name" value={contactName} onChangeText={setContactName} placeholder="Your name" style={styles.addressInput} />
              <TextInput accessibilityLabel="Contact email" value={contactEmail} onChangeText={setContactEmail} placeholder="Email address" keyboardType="email-address" autoCapitalize="none" style={styles.addressInput} />
              <TextInput accessibilityLabel="Contact subject" value={contactSubject} onChangeText={setContactSubject} placeholder="Subject" style={styles.addressInput} />
              <TextInput accessibilityLabel="Contact message" value={contactMessage} onChangeText={setContactMessage} placeholder="Tell us how we can help..." multiline maxLength={4000} style={[styles.addressInput, styles.contactMessage]} />
              {contactNotice ? <Text accessibilityRole="alert" style={contactNotice.startsWith('Your message has been received') ? styles.successNotice : styles.error}>{contactNotice}</Text> : null}
              <Pressable accessibilityRole="button" disabled={contactBusy} onPress={() => void submitContactMessage()} style={[styles.primaryButton, contactBusy && styles.sendButtonDisabled]}>
                {contactBusy ? <ActivityIndicator color={palette.white} /> : <Text style={styles.primaryButtonText}>Send message</Text>}
              </Pressable>
            </View>
          </ScrollView> : null}

          {page === 'payments' ? <View style={styles.infoContent}>
            <FontAwesome5 name="lock" size={26} color={palette.green} />
            <Text style={styles.infoHeading}>Secure payments</Text>
            <Text style={styles.infoCopy}>Card and bank-transfer payments are securely completed through Paystack. PAZ does not store your card details.</Text>
            <Pressable accessibilityRole="button" onPress={() => setPage(null)} style={styles.dismissButton}><Text style={styles.dismissText}>Close</Text></Pressable>
          </View> : null}
        </View>
      </Modal>
      <Modal visible={Platform.OS === 'web' && Boolean(avatarCropAsset)} animationType="slide" onRequestClose={() => setAvatarCropAsset(null)}>
        <View style={styles.cropPage}>
          <View style={styles.modalHeader}>
            <Pressable accessibilityRole="button" accessibilityLabel="Cancel photo crop" onPress={() => setAvatarCropAsset(null)} style={styles.modalBack}>
              <FontAwesome5 name="times" size={17} color={palette.ink} />
            </Pressable>
            <Text style={styles.modalTitle}>Crop profile photo</Text>
            <View style={styles.headerSpacer} />
          </View>
          {avatarCropAsset ? <ScrollView contentContainerStyle={styles.cropContent}>
            <Text style={styles.cropInstructions}>Position your face inside the circle. Zoom and use the arrows to adjust the crop.</Text>
            <View style={[styles.cropFrame, { width: cropFrameSize, height: cropFrameSize, borderRadius: cropFrameSize / 2 }]}>
              <Image source={{ uri: avatarCropAsset.uri }} resizeMode="stretch"
                style={[styles.cropPreviewImage, { width: cropImageWidth, height: cropImageHeight, left: cropImageLeft, top: cropImageTop }]} />
              <View pointerEvents="none" style={[styles.cropCircleGuide, { width: cropFrameSize - 4, height: cropFrameSize - 4, borderRadius: (cropFrameSize - 4) / 2 }]} />
            </View>
            <Text style={styles.cropControlTitle}>Zoom</Text>
            <View style={styles.cropZoomControls}>
              <Pressable accessibilityRole="button" accessibilityLabel="Zoom out" disabled={avatarCropZoom <= 1} onPress={() => setAvatarCropZoom((zoom) => Math.max(1, Math.round((zoom - 0.08) * 100) / 100))} style={styles.cropControlButton}>
                <FontAwesome5 name="minus" size={13} color={palette.green} />
              </Pressable>
              <Text style={styles.cropZoomValue}>{Math.round(avatarCropZoom * 100)}%</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Zoom in" disabled={avatarCropZoom >= 2} onPress={() => setAvatarCropZoom((zoom) => Math.min(2, Math.round((zoom + 0.08) * 100) / 100))} style={styles.cropControlButton}>
                <FontAwesome5 name="plus" size={13} color={palette.green} />
              </Pressable>
            </View>
            <Text style={styles.cropControlTitle}>Adjust position</Text>
            <View style={styles.cropMoveControls}>
              <View style={styles.cropMoveSpacer} />
              <Pressable accessibilityRole="button" accessibilityLabel="Move crop up" onPress={() => setAvatarCropY((position) => Math.max(-1, position - 0.12))} style={styles.cropControlButton}>
                <FontAwesome5 name="chevron-up" size={13} color={palette.green} />
              </Pressable>
              <View style={styles.cropMoveSpacer} />
              <Pressable accessibilityRole="button" accessibilityLabel="Move crop left" onPress={() => setAvatarCropX((position) => Math.max(-1, position - 0.12))} style={styles.cropControlButton}>
                <FontAwesome5 name="chevron-left" size={13} color={palette.green} />
              </Pressable>
              <View style={styles.cropMoveSpacer} />
              <Pressable accessibilityRole="button" accessibilityLabel="Move crop right" onPress={() => setAvatarCropX((position) => Math.min(1, position + 0.12))} style={styles.cropControlButton}>
                <FontAwesome5 name="chevron-right" size={13} color={palette.green} />
              </Pressable>
              <View style={styles.cropMoveSpacer} />
              <Pressable accessibilityRole="button" accessibilityLabel="Move crop down" onPress={() => setAvatarCropY((position) => Math.min(1, position + 0.12))} style={styles.cropControlButton}>
                <FontAwesome5 name="chevron-down" size={13} color={palette.green} />
              </Pressable>
              <View style={styles.cropMoveSpacer} />
            </View>
            {profileError ? <Text accessibilityRole="alert" style={styles.error}>{profileError}</Text> : null}
            <View style={styles.cropActions}>
              <Pressable accessibilityRole="button" disabled={profileBusy} onPress={() => setAvatarCropAsset(null)} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
              <Pressable accessibilityRole="button" disabled={profileBusy} onPress={() => void saveWebAvatarCrop()} style={[styles.primaryButton, profileBusy && styles.sendButtonDisabled]}>
                {profileBusy ? <ActivityIndicator color={palette.white} /> : <Text style={styles.primaryButtonText}>Use photo</Text>}
              </Pressable>
            </View>
          </ScrollView> : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f7f5fc' },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 15, paddingTop: 15, paddingBottom: 22 },
  profileCard: { alignItems: 'center', paddingTop: 11, paddingBottom: 17 },
  avatarButton: { width: 100, height: 100, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 94, height: 94, borderRadius: 47, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.green, shadowColor: palette.green, shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  avatarPhotoClip: { width: 94, height: 94, borderRadius: 47, overflow: 'hidden', backgroundColor: palette.white },
  avatarImage: { width: 94, height: 94, borderRadius: 47, backgroundColor: palette.white },
  avatarText: { color: palette.white, fontSize: 24, fontWeight: '900' },
  cameraBadge: { position: 'absolute', right: 0, bottom: 0, width: 23, height: 23, borderRadius: 12, borderWidth: 2, borderColor: '#f7f5fc', alignItems: 'center', justifyContent: 'center', backgroundColor: palette.green },
  name: { marginTop: 8, color: palette.ink, fontSize: 17, fontWeight: '900' },
  email: { marginTop: 3, color: palette.muted, fontSize: 10 },
  inlineLoader: { marginTop: 5 },
  error: { marginVertical: 9, color: palette.red, fontSize: 11, lineHeight: 16 },
  guestActions: { flexDirection: 'row', gap: 9, marginTop: 12 },
  primaryButton: { minHeight: 40, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.green },
  primaryButtonText: { color: palette.white, fontSize: 11, fontWeight: '900' },
  secondaryButton: { minHeight: 40, paddingHorizontal: 16, borderWidth: 1, borderColor: palette.green, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.white },
  secondaryButtonText: { color: palette.green, fontSize: 11, fontWeight: '900' },
  menuCard: { paddingHorizontal: 11, borderWidth: 1, borderColor: '#ebe7f1', borderRadius: 14, backgroundColor: palette.white },
  row: { minHeight: 51, flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowPressed: { opacity: 0.65 },
  rowIcon: { width: 27, height: 27, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rowCopy: { flex: 1 },
  rowTitle: { color: palette.ink, fontSize: 10, fontWeight: '800' },
  rowSubtitle: { marginTop: 2, color: palette.muted, fontSize: 8 },
  unreadBadge: { minWidth: 20, height: 20, paddingHorizontal: 5, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.red },
  unreadBadgeText: { color: palette.white, fontSize: 9, fontWeight: '900' },
  markAllReadButton: { alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 12, marginBottom: 8, borderRadius: 9, backgroundColor: '#e9f4ee' },
  markAllReadText: { color: palette.green, fontSize: 10, fontWeight: '900' },
  notificationCard: { marginBottom: 10, padding: 13, borderWidth: 1, borderColor: '#ebe7f1', borderRadius: 12, backgroundColor: palette.white },
  unreadNotificationCard: { borderColor: '#b7d9c5', backgroundColor: '#f3faf5' },
  notificationHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  notificationTitle: { flex: 1, color: palette.ink, fontSize: 12, fontWeight: '900' },
  notificationDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.green },
  notificationMessage: { marginTop: 7, color: palette.ink, fontSize: 11, lineHeight: 17 },
  notificationTime: { marginTop: 8, color: palette.muted, fontSize: 9 },
  signOut: { minHeight: 42, marginTop: 13, borderWidth: 1, borderColor: '#f0dce4', borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: palette.white },
  signOutText: { color: palette.red, fontSize: 10, fontWeight: '900' },
  version: { marginTop: 15, color: '#9b94a6', fontSize: 8, textAlign: 'center' },
  modalPage: { flex: 1, backgroundColor: '#f8f6fc' },
  cropPage: { flex: 1, backgroundColor: '#f8f6fc' },
  cropContent: { width: '100%', maxWidth: 440, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 36, alignSelf: 'center', alignItems: 'center' },
  cropInstructions: { maxWidth: 330, marginBottom: 18, color: palette.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  cropFrame: { overflow: 'hidden', alignSelf: 'center', backgroundColor: '#e9e5ef' },
  cropPreviewImage: { position: 'absolute' },
  cropCircleGuide: { position: 'absolute', left: 2, top: 2, borderWidth: 2, borderColor: palette.white },
  cropControlTitle: { marginTop: 20, marginBottom: 8, color: palette.ink, fontSize: 12, fontWeight: '900' },
  cropZoomControls: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  cropZoomValue: { minWidth: 48, color: palette.ink, fontSize: 12, fontWeight: '800', textAlign: 'center' },
  cropControlButton: { width: 42, height: 42, borderWidth: 1, borderColor: '#e7e1ee', borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.white },
  cropMoveControls: { width: 142, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 4 },
  cropMoveSpacer: { width: 42, height: 42 },
  cropActions: { width: '100%', marginTop: 22, flexDirection: 'row', justifyContent: 'center', gap: 10 },
  modalHeader: { minHeight: 58, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#ebe7f1', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: palette.white },
  modalBack: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  modalTitle: { flex: 1, marginHorizontal: 10, color: palette.ink, fontSize: 15, fontWeight: '900' },
  headerSpacer: { width: 34 },
  modalContent: { width: '100%', maxWidth: 560, padding: 16, paddingBottom: 36, alignSelf: 'center' },
  largeLoader: { marginVertical: 24 },
  emptyText: { padding: 20, color: palette.muted, fontSize: 12, lineHeight: 19, textAlign: 'center' },
  orderCard: { marginBottom: 10, padding: 13, borderWidth: 1, borderColor: '#ebe7f1', borderRadius: 12, backgroundColor: palette.white },
  orderHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderNumber: { color: palette.ink, fontSize: 11, fontWeight: '900' },
  orderStatus: { color: palette.green, fontSize: 9, fontWeight: '800', textTransform: 'capitalize' },
  orderItem: { marginTop: 5, color: palette.muted, fontSize: 10 },
  conversationCard: { minHeight: 62, marginBottom: 8, padding: 11, borderWidth: 1, borderColor: '#ebe7f1', borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: palette.white },
  expiredConversationCard: { opacity: 0.65 },
  conversationIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eaf4ef' },
  conversationCopy: { flex: 1 },
  conversationPreview: { marginTop: 4, color: palette.ink, fontSize: 10 },
  newMessageButton: { minHeight: 42, marginBottom: 12, paddingHorizontal: 15, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: palette.green },
  newConversationCard: { marginTop: 10, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#ebe7f1', borderRadius: 14, backgroundColor: palette.white },
  newConversationForm: { width: '100%', gap: 9 },
  newMessageInput: { minHeight: 86, textAlignVertical: 'top' },
  newMessageActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 9 },
  chatPage: { flex: 1 },
  chatMessages: { flexGrow: 1, padding: 14, gap: 10 },
  messageBubble: { maxWidth: '84%', padding: 11, borderRadius: 13 },
  ownMessage: { alignSelf: 'flex-end', backgroundColor: palette.green },
  replyMessage: { alignSelf: 'flex-start', backgroundColor: palette.white, borderWidth: 1, borderColor: '#ebe7f1' },
  messageSender: { marginBottom: 4, color: palette.green, fontSize: 9, fontWeight: '900' },
  messageText: { color: palette.ink, fontSize: 12, lineHeight: 18 },
  messageTime: { marginTop: 5, color: palette.muted, fontSize: 8 },
  ownMessageText: { color: palette.white },
  replyBar: { padding: 11, borderTopWidth: 1, borderTopColor: '#ebe7f1', flexDirection: 'row', alignItems: 'flex-end', gap: 8, backgroundColor: palette.white },
  roomParticipant: { alignSelf: 'center', maxWidth: '92%', marginBottom: 4, color: palette.muted, fontSize: 10, lineHeight: 15, textAlign: 'center' },
  replyInput: { flex: 1, maxHeight: 100, minHeight: 42, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#ebe7f1', borderRadius: 12, color: palette.ink, fontSize: 12 },
  sendButton: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.green },
  sendButtonDisabled: { opacity: 0.5 },
  aboutContent: { width: '100%', maxWidth: 520, padding: 22, paddingBottom: 40, alignSelf: 'center', alignItems: 'center' },
  aboutMark: { width: 64, height: 64, marginTop: 12, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.green },
  aboutLogo: { width: 82, height: 82, marginTop: 5, borderRadius: 41, backgroundColor: palette.white },
  aboutEyebrow: { marginTop: 16, color: palette.green, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  aboutHeading: { marginTop: 8, color: palette.ink, fontSize: 22, fontWeight: '900', lineHeight: 29, textAlign: 'center' },
  aboutCopy: { marginTop: 15, color: palette.muted, fontSize: 13, lineHeight: 21, textAlign: 'center' },
  aboutSite: { marginTop: 17, marginBottom: 20, color: palette.green, fontSize: 12, fontWeight: '800' },
  infoContent: { flex: 1, padding: 26, alignItems: 'center', justifyContent: 'center' },
  infoHeading: { marginTop: 13, color: palette.ink, fontSize: 18, fontWeight: '900' },
  infoCopy: { marginTop: 8, marginBottom: 17, color: palette.muted, fontSize: 12, lineHeight: 19, textAlign: 'center' },
  addressContent: { width: '100%', maxWidth: 520, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 36, alignSelf: 'center', gap: 12 },
  addressIntro: { alignItems: 'center', marginBottom: 8 },
  addressField: { width: '100%', gap: 5 },
  addressLabel: { color: palette.ink, fontSize: 11, fontWeight: '800' },
  optionalLabel: { color: palette.muted, fontWeight: '400' },
  addressInput: { width: '100%', minWidth: 0, minHeight: 46, paddingHorizontal: 12, paddingVertical: 11, borderWidth: 1, borderColor: '#d9d3e3', borderRadius: 10, color: palette.ink, backgroundColor: palette.white, fontSize: 14 },
  supportContent: { width: '100%', maxWidth: 520, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 38, alignSelf: 'center', gap: 13 },
  contactIntro: { alignItems: 'center', paddingHorizontal: 2, paddingBottom: 8 },
  contactHeading: { color: palette.ink, fontSize: 22, fontWeight: '900' },
  contactIntroCopy: { marginTop: 12, color: palette.muted, fontSize: 14, lineHeight: 22, textAlign: 'center' },
  contactDetail: { minHeight: 61, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 14 },
  contactIcon: { width: 50, height: 50, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e0f6eb' },
  contactValue: { marginTop: 4, color: palette.muted, fontSize: 13, lineHeight: 19 },
  contactForm: { width: '100%', minWidth: 0, marginTop: 8, padding: 14, borderWidth: 1, borderColor: '#ebe7f1', borderRadius: 14, gap: 9, backgroundColor: palette.white },
  contactFormTitle: { marginBottom: 2, color: palette.ink, fontSize: 14, fontWeight: '900' },
  contactMessage: { minHeight: 110, textAlignVertical: 'top' },
  successNotice: { color: palette.green, fontSize: 11, lineHeight: 16 },
  dismissButton: { minHeight: 40, marginTop: 5, paddingHorizontal: 15, alignItems: 'center', justifyContent: 'center' },
  dismissText: { color: palette.green, fontSize: 11, fontWeight: '900' },
});
