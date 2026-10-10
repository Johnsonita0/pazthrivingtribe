import { FontAwesome5 } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { categoryMatches, formatPrice, Product, productAvailability, productImageUrl } from './api';
import { getTapPoint, palette, registerShopThemeStyles, Stars, TapPoint } from './ShopComponents';
import { PromoBoard } from './PromoBoard';

type Props = {
  products: Product[];
  loading: boolean;
  error: string;
  storageBaseUrl: string;
  category: string;
  favoriteIds: Set<string>;
  favoritesOnly?: boolean;
  onCategory: (category: string) => void;
  onToggleFavorite: (product: Product) => void;
  onBack: () => void;
  onRefresh: () => void;
  onOpen: (product: Product) => void;
  onAddToCart: (product: Product, point: TapPoint) => void;
};

function isBook(product: Product) {
  return /book|ebook|guide|workbook|journal|planner|literature|reading/i.test(`${product.category} ${product.title}`);
}

function bookCategoryName(category: string) {
  return category.trim().toLowerCase() === 'ebook' ? 'Ebooks' : category;
}

export function BooksListingView({
  products,
  loading,
  error,
  storageBaseUrl,
  category,
  favoriteIds,
  favoritesOnly = false,
  onCategory,
  onToggleFavorite,
  onBack,
  onRefresh,
  onOpen,
  onAddToCart,
}: Props) {
  const [search, setSearch] = useState('');
  const searchRef = useRef<TextInput>(null);
  const bookProducts = useMemo(() => products.filter(isBook), [products]);
  const isBookListing = category === 'All' || /book|ebook|guide|workbook|journal|planner|reading/i.test(category);
  const categoryProducts = favoritesOnly
    ? products.filter((product) => favoriteIds.has(product.id))
    : isBookListing
      ? bookProducts.filter((product) => category === 'All' || categoryMatches(product.category, category))
      : products.filter((product) => categoryMatches(product.category, category));
  const categories = useMemo(() => {
    const categoryProductsForChips = isBookListing ? bookProducts : categoryProducts;
    const categoryNames = Array.from(new Set(categoryProductsForChips.map((product) => bookCategoryName(product.category))))
      .sort((a, b) => a.localeCompare(b));
    if (!isBookListing && !categoryNames.length && category !== 'All') categoryNames.push(category);
    return [
      'All',
      ...categoryNames,
    ];
  }, [bookProducts, category, categoryProducts, isBookListing]);
  const title = favoritesOnly ? 'Favorites' : category === 'All' ? 'Books' : category;
  const categoryUnavailable = !favoritesOnly
    && ['groceries', 'grocery', 'gadgets', 'gadget'].includes(category.trim().toLowerCase())
    && categoryProducts.length === 0;
  const visibleProducts = categoryProducts.filter((product) => {
    if (favoritesOnly && !favoriteIds.has(product.id)) return false;
    const matchesCategory = isBookListing && category !== 'All'
      ? categoryMatches(product.category, category)
      : true;
    const searchText = `${product.title} ${product.category} ${product.description}`.toLowerCase();
    return matchesCategory && searchText.includes(search.trim().toLowerCase());
  });

  return (
    <View style={[styles.screen, { backgroundColor: palette.paper }]}>
      <ScrollView
        contentContainerStyle={styles.pageContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={palette.green} />}
      >
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back to home" onPress={onBack} style={styles.backButton}>
            <FontAwesome5 name="arrow-left" size={15} color={palette.darkGreen} />
          </Pressable>
          <Text style={styles.title}>{title}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Focus ${title.toLowerCase()} search`}
            onPress={() => searchRef.current?.focus()}
            style={styles.searchAction}
          >
            <FontAwesome5 name="search" size={17} color={palette.darkGreen} />
          </Pressable>
        </View>
        <View style={styles.searchBox}>
          <FontAwesome5 name="search" size={13} color={palette.green} />
          <TextInput
            ref={searchRef}
            accessibilityLabel={`Search ${title.toLowerCase()}`}
            value={search}
            onChangeText={setSearch}
            placeholder={`Search ${title.toLowerCase()}...`}
            placeholderTextColor={palette.muted}
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
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryRail}
          accessibilityLabel={`${title} categories`}
        >
          {categories.map((categoryChip) => {
            const selected = category === categoryChip
              || (category === 'All' && categoryChip === 'All')
              || (category !== 'All' && categoryChip !== 'All' && categoryMatches(categoryChip, category));
            const selection = categoryChip === 'All' ? 'All' : categoryChip;
            return (
              <Pressable
                key={categoryChip}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onCategory(selection)}
                style={[styles.categoryChip, selected && styles.categoryChipSelected]}
              >
                <Text style={[styles.categoryChipText, selected && styles.categoryChipTextSelected]}>{categoryChip}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {loading ? (
          <ActivityIndicator color={palette.green} size="large" style={styles.loading} />
        ) : error ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Books are unavailable</Text>
            <Text style={styles.emptyCopy}>{error}</Text>
            <Pressable accessibilityRole="button" onPress={onRefresh} style={styles.retryButton}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : visibleProducts.length ? visibleProducts.map((product) => {
          const cover = productImageUrl(product.cover, storageBaseUrl);
          const availability = productAvailability(product);
          const canAdd = availability.available && product.inStock && product.stockCount > 0;
          return (
            <View key={product.id} style={styles.productRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`View ${product.title}`}
                onPress={() => onOpen(product)}
                style={styles.coverButton}
              >
                {cover ? (
                  <Image source={{ uri: cover }} style={styles.coverImage} resizeMode="cover" />
                ) : (
                  <View style={styles.coverFallback}>
                    <FontAwesome5 name="book-open" size={20} color={palette.white} />
                    <Text numberOfLines={3} style={styles.coverFallbackTitle}>{product.title}</Text>
                  </View>
                )}
              </Pressable>
              <View style={styles.productCopy}>
                <Text numberOfLines={1} style={styles.productCategory}>{bookCategoryName(product.category)}</Text>
                <Pressable accessibilityRole="button" onPress={() => onOpen(product)}>
                  <Text numberOfLines={2} style={styles.productTitle}>{product.title}</Text>
                </Pressable>
                <Text style={styles.productPrice}>{formatPrice(product)}</Text>
                <View style={styles.ratingRow}>
                  <Stars rating={product.rating} size={11} />
                  <Text style={styles.ratingText}>{product.rating ? `${product.rating.toFixed(1)} (${product.reviews})` : 'New'}</Text>
                </View>
              </View>
              <View style={styles.productActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={favoriteIds.has(product.id) ? `Remove ${product.title} from favorites` : `Add ${product.title} to favorites`}
                  accessibilityState={{ selected: favoriteIds.has(product.id) }}
                  onPress={() => onToggleFavorite(product)}
                  style={styles.favoriteButton}
                >
                  <FontAwesome5 name="heart" size={16} color={favoriteIds.has(product.id) ? palette.orange : '#a9a5b0'} solid={favoriteIds.has(product.id)} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={canAdd ? `Add ${product.title} to cart` : availability.message || 'Book unavailable'}
                  disabled={!canAdd}
                  onPress={(event) => onAddToCart(product, getTapPoint(event))}
                  style={({ pressed }) => [styles.addButton, !canAdd && styles.addButtonDisabled, pressed && canAdd && styles.addButtonPressed]}
                >
                  <Text numberOfLines={1} style={[styles.addButtonText, !canAdd && styles.addButtonTextDisabled]}>{canAdd ? 'Add to Cart' : 'Unavailable'}</Text>
                </Pressable>
              </View>
            </View>
          );
        }) : (
          <View style={styles.emptyState}>
            <FontAwesome5 name={favoritesOnly ? 'heart' : categoryUnavailable ? 'clock' : 'book-open'} size={25} color={palette.green} />
            <Text style={styles.emptyTitle}>{favoritesOnly ? 'No saved books yet' : categoryUnavailable ? `${title} coming soon` : `No ${title.toLowerCase()} found`}</Text>
            <Text style={styles.emptyCopy}>
              {favoritesOnly
                ? 'Tap the heart on a product to save it here.'
                : categoryUnavailable
                  ? 'We are preparing this category. Browse available ebooks and guides in the meantime.'
                  : 'Try another search or category.'}
            </Text>
            {categoryUnavailable ? (
              <Pressable accessibilityRole="button" onPress={() => onCategory('All')} style={styles.retryButton}>
                <Text style={styles.retryText}>Browse available books</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function createStyles() {
  return StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper },
  header: { height: 42, marginHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  backButton: { width: 24, height: 34, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, color: palette.ink, fontSize: 16, fontWeight: '900' },
  searchAction: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  searchBox: { height: 36, marginHorizontal: 14, marginTop: 1, paddingHorizontal: 11, borderWidth: 1, borderColor: palette.line, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: palette.white },
  searchInput: { flex: 1, paddingVertical: 6, color: palette.ink, fontSize: 11 },
  categoryScroll: { height: 45, flexGrow: 0, flexShrink: 0 },
  categoryRail: { height: 45, flexGrow: 0, paddingHorizontal: 14, alignItems: 'center', gap: 7 },
  categoryChip: { minHeight: 26, paddingHorizontal: 13, borderWidth: 1, borderColor: palette.line, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.white },
  categoryChipSelected: { borderColor: palette.green, backgroundColor: palette.actionGreen },
  categoryChipText: { color: palette.ink, fontSize: 9, fontWeight: '700' },
  categoryChipTextSelected: { color: palette.white, fontWeight: '900' },
  pageContent: { paddingBottom: 18 },
  productRow: { minHeight: 79, marginHorizontal: 13, marginBottom: 8, padding: 7, borderWidth: 1, borderColor: palette.line, borderRadius: 11, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: palette.white },
  coverButton: { width: 43, height: 57, overflow: 'hidden', borderRadius: 5, backgroundColor: palette.greenWash },
  coverImage: { width: '100%', height: '100%' },
  coverFallback: { flex: 1, padding: 4, alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: palette.actionGreen },
  coverFallbackTitle: { color: palette.white, fontSize: 6, lineHeight: 8, fontWeight: '800', textAlign: 'center' },
  productCopy: { flex: 1, minWidth: 0, justifyContent: 'center' },
  productCategory: { color: palette.muted, fontSize: 8, fontWeight: '700' },
  productTitle: { marginTop: 2, color: palette.ink, fontSize: 10, lineHeight: 13, fontWeight: '800' },
  productPrice: { marginTop: 3, color: palette.green, fontSize: 10, fontWeight: '900' },
  ratingRow: { marginTop: 2, flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: palette.muted, fontSize: 8 },
  productActions: { width: 66, height: 61, alignItems: 'flex-end', justifyContent: 'space-between' },
  favoriteButton: { width: 25, height: 24, alignItems: 'center', justifyContent: 'center' },
  addButton: { minWidth: 62, minHeight: 22, paddingHorizontal: 6, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.actionGreen },
  addButtonDisabled: { backgroundColor: palette.line },
  addButtonPressed: { opacity: 0.75 },
  addButtonText: { color: palette.white, fontSize: 7, fontWeight: '900' },
  addButtonTextDisabled: { color: palette.muted },
  loading: { marginTop: 46 },
  emptyState: { minHeight: 180, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyTitle: { color: palette.ink, fontSize: 15, fontWeight: '900', textAlign: 'center' },
  emptyCopy: { color: palette.muted, fontSize: 10, lineHeight: 15, textAlign: 'center' },
  retryButton: { minHeight: 31, marginTop: 4, paddingHorizontal: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.actionGreen },
  retryText: { color: palette.white, fontSize: 9, fontWeight: '900' },
  });
}

let styles = createStyles();
registerShopThemeStyles(() => { styles = createStyles(); });
