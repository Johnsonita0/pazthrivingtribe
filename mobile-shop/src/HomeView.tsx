import { FontAwesome5 } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { formatPrice, Product, productAvailability, productImageUrl } from './api';
import { palette, Stars } from './ShopComponents';
import { PromoBoard } from './PromoBoard';

type Props = {
  products: Product[];
  signedIn: boolean;
  accountName?: string;
  profileImageUrl?: string | null;
  storageBaseUrl: string;
  loading: boolean;
  error: string;
  onRefresh: () => void;
  notificationCount: number;
  onNotifications: () => void;
  onProfile: () => void;
  onCreateAccount: () => void;
  onCategory: (category: string) => void;
  onMoreCategories: () => void;
  onOpen: (product: Product) => void;
  onAddToCart: (product: Product) => void;
};

const quickCategories = [
  { name: 'Ebooks', filter: 'Ebooks', icon: 'book-open', color: '#692ad2', wash: '#efe7ff' },
  { name: 'Journals', filter: 'Journals', icon: 'book', color: '#a342c9', wash: '#f7e9ff' },
  { name: 'Digital Products', filter: 'Digital Products', icon: 'camera', color: '#2679c9', wash: '#e8f2ff' },
  { name: 'Groceries', filter: 'Groceries', icon: 'shopping-basket', color: '#e87916', wash: '#fff1e2' },
  { name: 'Gadgets', filter: 'Gadgets', icon: 'camera', color: '#2679c9', wash: '#e8f2ff' },
];

function isBook(product: Product) {
  return /book|ebook|guide|workbook|journal|planner|literature|reading/i.test(`${product.category} ${product.title}`);
}

function HomeProductCard({
  product,
  storageBaseUrl,
  onOpen,
  onAdd,
}: {
  product: Product;
  storageBaseUrl: string;
  onOpen: () => void;
  onAdd: () => void;
}) {
  const cover = productImageUrl(product.cover, storageBaseUrl);
  const availability = productAvailability(product);
  const canAdd = availability.available && product.inStock && product.stockCount > 0;

  return (
    <View style={styles.productCard}>
      <Pressable accessibilityRole="button" accessibilityLabel={`View ${product.title}`} onPress={onOpen} style={styles.productCoverButton}>
        {cover ? (
          <Image source={{ uri: cover }} style={styles.productCover} resizeMode="cover" />
        ) : (
          <View style={styles.productCoverFallback}>
            <Text style={styles.coverCategory}>{product.category}</Text>
            <Text numberOfLines={3} style={styles.coverTitle}>{product.title}</Text>
            <Text style={styles.coverBrand}>PAZ THRIVING TRIBE</Text>
          </View>
        )}
      </Pressable>
      <View style={styles.productDetails}>
        <Text numberOfLines={1} style={styles.productCategory}>{product.category}</Text>
        <Pressable accessibilityRole="button" onPress={onOpen}>
          <Text numberOfLines={2} style={styles.productTitle}>{product.title}</Text>
        </Pressable>
        <Text style={styles.productPrice}>{formatPrice(product)}</Text>
        <View style={styles.ratingRow}>
          <Stars rating={product.rating} size={11} />
          <Text style={styles.ratingText}>{product.rating ? `${product.rating.toFixed(1)} (${product.reviews})` : 'New'}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={canAdd ? `Add ${product.title} to cart` : availability.message || 'Product unavailable'}
          disabled={!canAdd}
          onPress={onAdd}
          style={({ pressed }) => [styles.addButton, !canAdd && styles.addButtonDisabled, pressed && canAdd && styles.pressed]}
        >
          <Text style={[styles.addButtonText, !canAdd && styles.addButtonTextDisabled]}>{canAdd ? 'Add to Cart' : 'Unavailable'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function HomeView({
  products,
  signedIn,
  accountName,
  profileImageUrl,
  storageBaseUrl,
  loading,
  error,
  onRefresh,
  notificationCount,
  onNotifications,
  onProfile,
  onCreateAccount,
  onCategory,
  onMoreCategories,
  onOpen,
  onAddToCart,
}: Props) {
  const [search, setSearch] = useState('');
  const [profileImageError, setProfileImageError] = useState(false);
  const searchRef = useRef<TextInput>(null);
  const accountInitial = accountName?.trim().slice(0, 1).toUpperCase() || 'U';
  useEffect(() => { setProfileImageError(false); }, [profileImageUrl]);
  const recommended = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return products.filter((product) => {
      if (!isBook(product)) return false;
      return `${product.title} ${product.category} ${product.description}`.toLowerCase().includes(normalizedSearch);
    });
  }, [products, search]);

  return (
    <View style={styles.screen}>
      <FlatList
        data={loading || error ? [] : recommended}
        keyExtractor={(product) => product.id}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={palette.green} />}
        renderItem={({ item }) => (
          <HomeProductCard
            product={item}
            storageBaseUrl={storageBaseUrl}
            onOpen={() => onOpen(item)}
            onAdd={() => onAddToCart(item)}
          />
        )}
        ListHeaderComponent={(
          <>
            <View style={styles.greetingRow}>
              <View style={styles.greetingCopy}>
                <Text style={styles.greeting}>Hello, {signedIn ? accountName || 'there' : 'Guest'}</Text>
                <Text style={styles.welcomeCopy}>
                  {signedIn ? 'Good to see you again!' : 'Browsing as a guest? '}
                  {!signedIn ? <Text accessibilityRole="link" onPress={onCreateAccount} style={styles.createAccountLink}>Sign in</Text> : null}
                </Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={notificationCount ? `Open notifications, ${notificationCount} unread items` : 'Open notifications'} onPress={onNotifications} style={styles.notificationButton}>
                <FontAwesome5 name="bell" size={17} color={palette.darkGreen} />
                {notificationCount > 0 ? <View style={styles.notificationBadge}><Text style={styles.notificationBadgeText}>{notificationCount > 99 ? '99+' : notificationCount}</Text></View> : null}
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Open profile" onPress={onProfile} style={styles.profileButton}>
                {signedIn && profileImageUrl && !profileImageError
                  ? <View style={styles.profilePhotoClip}><Image source={{ uri: profileImageUrl }} style={styles.profileImage} resizeMode="cover" onError={() => setProfileImageError(true)} /></View>
                  : signedIn
                    ? <View style={styles.profileInitial}><Text style={styles.profileInitialText}>{accountInitial}</Text></View>
                    : <FontAwesome5 name="user-circle" size={22} color={palette.darkGreen} />}
              </Pressable>
            </View>
            <View style={styles.searchBox}>
              <FontAwesome5 name="search" size={13} color={palette.green} />
              <TextInput
                ref={searchRef}
                accessibilityLabel="Search books and products"
                value={search}
                onChangeText={setSearch}
                placeholder="Search for products, ebooks, etc..."
                placeholderTextColor="#8b8794"
                style={styles.searchInput}
                returnKeyType="search"
              />
              {search ? (
                <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setSearch('')}>
                  <FontAwesome5 name="times" size={14} color={palette.muted} />
                </Pressable>
              ) : null}
            </View>
            <PromoBoard
              products={products}
              storageBaseUrl={storageBaseUrl}
              onOpen={onOpen}
              onCategory={onCategory}
              compact
            />
            <View style={styles.categoryGrid}>
              {quickCategories.map((category) => (
                <Pressable
                  key={category.name}
                  accessibilityRole="button"
                  accessibilityLabel={`Browse ${category.name}`}
                  onPress={() => onCategory(category.filter)}
                  style={({ pressed }) => [styles.categoryButton, pressed && styles.pressed]}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: category.wash }]}>
                    <FontAwesome5 name={category.icon} size={15} color={category.color} solid />
                  </View>
                  <Text numberOfLines={1} style={styles.categoryLabel}>{category.name}</Text>
                </Pressable>
              ))}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="See all categories"
                onPress={onMoreCategories}
                style={({ pressed }) => [styles.categoryButton, pressed && styles.pressed]}
              >
                <View style={[styles.categoryIcon, styles.moreIcon]}>
                  <FontAwesome5 name="th-large" size={15} color={palette.green} />
                </View>
                <Text style={styles.categoryLabel}>More</Text>
              </Pressable>
            </View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{search ? 'Search results' : 'Recommended For You'}</Text>
              <Pressable accessibilityRole="button" onPress={() => onCategory('All')}>
                <Text style={styles.seeAll}>See All</Text>
              </Pressable>
            </View>
          </>
        )}
        ListEmptyComponent={(
          <View style={styles.emptyState}>
            {loading ? <ActivityIndicator color={palette.green} size="large" /> : (
              <>
                <FontAwesome5 name={error ? 'exclamation-circle' : 'book-open'} size={23} color={palette.green} />
                <Text style={styles.emptyTitle}>{error ? 'Shop unavailable' : 'No books found'}</Text>
                <Text style={styles.emptyCopy}>{error || (search ? 'Try another search.' : 'Books will appear here when available.')}</Text>
                {error ? <Pressable accessibilityRole="button" onPress={onRefresh}><Text style={styles.retry}>Try again</Text></Pressable> : null}
              </>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8f7fb' },
  listContent: { paddingBottom: 12 },
  greetingRow: { minHeight: 49, marginHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greetingCopy: { flex: 1 },
  greeting: { color: palette.ink, fontSize: 15, fontWeight: '900' },
  welcomeCopy: { marginTop: 1, color: palette.muted, fontSize: 9 },
  createAccountLink: { color: palette.green, fontWeight: '900' },
  notificationButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  profileButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  profilePhotoClip: { width: 30, height: 30, borderRadius: 15, overflow: 'hidden' },
  profileImage: { width: 30, height: 30, borderRadius: 15 },
  profileInitial: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.green },
  profileInitialText: { color: palette.white, fontSize: 13, fontWeight: '900' },
  notificationBadge: { position: 'absolute', top: 0, right: 0, minWidth: 15, height: 15, paddingHorizontal: 3, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.red },
  notificationBadgeText: { color: palette.white, fontSize: 8, fontWeight: '900' },
  searchBox: { height: 34, marginHorizontal: 14, paddingHorizontal: 11, borderWidth: 1, borderColor: '#eceaf1', borderRadius: 11, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: palette.white },
  searchInput: { flex: 1, paddingVertical: 5, color: palette.ink, fontSize: 10 },
  categoryGrid: { paddingHorizontal: 14, paddingTop: 4, paddingBottom: 3, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 4 },
  categoryButton: { width: '31.5%', minHeight: 53, alignItems: 'center', justifyContent: 'flex-start', gap: 2 },
  categoryIcon: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  moreIcon: { backgroundColor: '#f0ecf7' },
  categoryLabel: { maxWidth: '100%', color: palette.muted, fontSize: 7, fontWeight: '700' },
  sectionHeader: { minHeight: 25, marginTop: 0, marginHorizontal: 15, marginBottom: 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: palette.ink, fontSize: 10, fontWeight: '900' },
  seeAll: { color: palette.green, fontSize: 9, fontWeight: '800' },
  productRow: { paddingHorizontal: 13, justifyContent: 'space-between', gap: 8, marginBottom: 8 },
  productCard: { width: '48.5%', overflow: 'hidden', borderWidth: 1, borderColor: '#efedf3', borderRadius: 10, backgroundColor: palette.white },
  productCoverButton: { height: 95, overflow: 'hidden', backgroundColor: '#f1eef6' },
  productCover: { width: '100%', height: '100%' },
  productCoverFallback: { flex: 1, padding: 9, justifyContent: 'space-between', backgroundColor: palette.green },
  coverCategory: { color: '#e3d8fc', fontSize: 7, fontWeight: '900', textTransform: 'uppercase' },
  coverTitle: { color: palette.white, fontSize: 12, lineHeight: 15, fontWeight: '900' },
  coverBrand: { color: '#e3d8fc', fontSize: 6, fontWeight: '800', letterSpacing: 0.4 },
  productDetails: { padding: 7 },
  productCategory: { color: palette.muted, fontSize: 7, fontWeight: '700' },
  productTitle: { minHeight: 26, marginTop: 2, color: palette.ink, fontSize: 9, lineHeight: 12, fontWeight: '800' },
  productPrice: { marginTop: 2, color: palette.ink, fontSize: 9, fontWeight: '900' },
  ratingRow: { marginTop: 2, flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { color: palette.muted, fontSize: 7 },
  addButton: { minHeight: 23, marginTop: 5, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.green },
  addButtonDisabled: { backgroundColor: '#ebe8ef' },
  addButtonText: { color: palette.white, fontSize: 8, fontWeight: '900' },
  addButtonTextDisabled: { color: palette.muted },
  pressed: { opacity: 0.76 },
  emptyState: { minHeight: 100, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center', gap: 6 },
  emptyTitle: { color: palette.ink, fontSize: 12, fontWeight: '900' },
  emptyCopy: { color: palette.muted, fontSize: 9, lineHeight: 14, textAlign: 'center' },
  retry: { padding: 8, color: palette.green, fontSize: 10, fontWeight: '900' },
});
