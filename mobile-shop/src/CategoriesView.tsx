import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { categoryMatches, Product } from './api';
import { palette, registerShopThemeStyles } from './ShopComponents';

type Props = {
  products: Product[];
  loading: boolean;
  initialComingSoonCategory?: 'Groceries' | 'Gadgets' | null;
  onBack: () => void;
  onSelect: (category: string) => void;
};

const categories = [
  { name: 'Ebooks', filter: 'Ebooks', details: 'Books, Guides, PDFs', icon: 'book-open' },
  { name: 'Journals', filter: 'Journals', details: 'Planners, Notebooks, Trackers', icon: 'book' },
  { name: 'Digital Products', filter: 'Digital Products', details: 'Templates, Courses, Software', icon: 'file-alt' },
  { name: 'Groceries', filter: 'Groceries', details: 'Food & Beverages, Household', icon: 'shopping-basket' },
  { name: 'Gadgets', filter: 'Gadgets', details: 'Electronics, Accessories', icon: 'camera' },
  { name: 'More', filter: 'All', details: 'Deals, Bundles, Others', icon: 'tags' },
];

export function CategoriesView({ products, loading, initialComingSoonCategory = null, onBack, onSelect }: Props) {
  const [search, setSearch] = useState('');
  const [comingSoonCategory, setComingSoonCategory] = useState<'Groceries' | 'Gadgets' | null>(null);
  useEffect(() => {
    if (initialComingSoonCategory) setComingSoonCategory(initialComingSoonCategory);
  }, [initialComingSoonCategory]);

  const normalizedSearch = search.trim().toLowerCase();
  const visibleCategories = categories.filter((category) =>
    `${category.name} ${category.details}`.toLowerCase().includes(normalizedSearch)
  );

  if (comingSoonCategory) {
    const isGroceries = comingSoonCategory === 'Groceries';
    return (
      <View style={[styles.screen, { backgroundColor: palette.paper }]}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back to categories" onPress={() => setComingSoonCategory(null)} style={styles.backButton}>
            <FontAwesome5 name="arrow-left" size={16} color={palette.darkGreen} />
          </Pressable>
          <Text style={styles.title}>{comingSoonCategory}</Text>
        </View>
        <View style={styles.comingSoonContent}>
          <Image
            source={isGroceries ? require('../assets/groceries-coming-soon.gif') : require('../assets/gadgets-coming-soon.gif')}
            style={styles.illustration}
            resizeMode="contain"
            accessibilityLabel={isGroceries ? 'Animated groceries illustration' : 'Animated gadgets illustration'}
          />
          <Text style={styles.kicker}>COMING SOON</Text>
          <Text style={styles.comingSoonTitle}>{isGroceries ? 'Groceries are coming soon' : 'Gadgets are coming soon'}</Text>
          <Text style={styles.comingSoonCopy}>
            {isGroceries
              ? 'We’re preparing our grocery service. It isn’t officially available yet, but we’re working to bring it to you soon.'
              : 'We’re getting our gadget collection ready. This service isn’t officially available yet, but it’s coming soon.'}
          </Text>
          <Pressable accessibilityRole="button" onPress={() => setComingSoonCategory(null)} style={({ pressed }) => [styles.browseCategoriesButton, pressed && styles.rowPressed]}>
            <Text style={styles.browseCategoriesText}>Browse categories</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: palette.paper }]}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to home" onPress={onBack} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={16} color={palette.darkGreen} />
        </Pressable>
        <Text style={styles.title}>Categories</Text>
      </View>
      <View style={styles.searchBox}>
        <FontAwesome5 name="search" size={14} color={palette.green} />
        <TextInput
          accessibilityLabel="Search categories"
          value={search}
          onChangeText={setSearch}
          placeholder="Search categories..."
          placeholderTextColor={palette.muted}
          style={styles.searchInput}
          returnKeyType="search"
        />
        {search ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Clear category search" onPress={() => setSearch('')}>
            <FontAwesome5 name="times" size={14} color={palette.muted} />
          </Pressable>
        ) : null}
      </View>
      {loading ? <ActivityIndicator color={palette.green} size="large" style={styles.loading} /> : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
          {visibleCategories.map((category) => (
            <Pressable
              key={category.name}
              accessibilityRole="button"
              accessibilityLabel={`${category.name}. ${category.details}`}
              onPress={() => {
                if (category.name === 'Groceries' || category.name === 'Gadgets') {
                  const hasProducts = products.some((product) => categoryMatches(product.category, category.filter));
                  if (!hasProducts) {
                    setComingSoonCategory(category.name);
                    return;
                  }
                }
                onSelect(category.filter);
              }}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            >
              <View style={[styles.iconTile, { backgroundColor: category.name === 'Groceries' ? palette.orange : category.name === 'Digital Products' || category.name === 'Gadgets' ? palette.blue : palette.green }]}>
                <FontAwesome5 name={category.icon} size={16} color={palette.white} solid />
              </View>
              <View style={styles.rowCopy}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text numberOfLines={1} style={styles.categoryDetails}>{category.details}</Text>
              </View>
              <FontAwesome5 name="chevron-right" size={12} color="#8b8794" />
            </Pressable>
          ))}
          {!visibleCategories.length ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No categories found</Text>
              <Text style={styles.emptyCopy}>Try a different search.</Text>
            </View>
          ) : null}
          {!products.length && !search ? <Text style={styles.comingSoon}>More products are being added.</Text> : null}
        </ScrollView>
      )}
    </View>
  );
}

function createStyles() {
  return StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.white },
  header: { height: 48, marginHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 11 },
  backButton: { width: 28, height: 36, alignItems: 'center', justifyContent: 'center' },
  title: { color: palette.ink, fontSize: 16, fontWeight: '900' },
  searchBox: { height: 40, marginHorizontal: 16, marginTop: 1, marginBottom: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: palette.line, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: palette.white },
  searchInput: { flex: 1, paddingVertical: 7, color: palette.ink, fontSize: 11 },
  loading: { marginTop: 45 },
  comingSoonContent: { flex: 1, paddingHorizontal: 24, paddingBottom: 24, alignItems: 'center', justifyContent: 'center' },
  illustration: { width: '100%', maxWidth: 320, height: 240, marginBottom: 5 },
  kicker: { marginTop: 4, color: palette.green, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  comingSoonTitle: { maxWidth: 300, marginTop: 8, color: palette.ink, fontSize: 22, lineHeight: 28, fontWeight: '900', textAlign: 'center' },
  comingSoonCopy: { maxWidth: 300, marginTop: 8, color: palette.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  browseCategoriesButton: { minHeight: 42, marginTop: 18, paddingHorizontal: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.actionGreen },
  browseCategoriesText: { color: palette.white, fontSize: 11, fontWeight: '900' },
  list: { paddingHorizontal: 14, paddingBottom: 18, gap: 7 },
  row: { minHeight: 58, paddingHorizontal: 9, borderWidth: 1, borderColor: palette.line, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: palette.white },
  rowPressed: { opacity: 0.72 },
  iconTile: { width: 35, height: 35, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rowCopy: { flex: 1, minWidth: 0, gap: 3 },
  categoryName: { color: palette.ink, fontSize: 11, fontWeight: '900' },
  categoryDetails: { color: palette.muted, fontSize: 8, fontWeight: '600' },
  empty: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 5 },
  emptyTitle: { color: palette.ink, fontSize: 13, fontWeight: '900' },
  emptyCopy: { color: palette.muted, fontSize: 10 },
  comingSoon: { paddingVertical: 9, color: palette.muted, fontSize: 9, textAlign: 'center' },
  });
}

let styles = createStyles();
registerShopThemeStyles(() => { styles = createStyles(); });
