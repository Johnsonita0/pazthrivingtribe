import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { categoryMatches, Product } from './api';
import { palette } from './ShopComponents';

type Props = {
  categories: string[];
  products: Product[];
  loading: boolean;
  onSelect: (category: string) => void;
};

const accents = ['#692ad2', '#118f7b', '#ec9a17', '#e84b8b', '#2679c9', '#db533e'];

function categoryMark(category: string) {
  const normalized = category.toLowerCase();
  if (normalized.includes('book') || normalized.includes('stationery') || normalized.includes('ebook')) return '▤';
  if (normalized.includes('grocer') || normalized.includes('grocery') || normalized.includes('food')) return '▤';
  if (normalized.includes('gadget') || normalized.includes('elect') || normalized.includes('tech')) return '▣';
  if (normalized.includes('fashion') || normalized.includes('cloth')) return '✧';
  if (normalized.includes('elect')) return '▣';
  if (normalized.includes('home')) return '⌂';
  if (normalized.includes('beauty') || normalized.includes('health')) return '✿';
  if (normalized.includes('sport')) return '◉';
  if (normalized.includes('toy') || normalized.includes('game')) return '☆';
  return '✦';
}

export function CategoriesView({ categories, products, loading, onSelect }: Props) {
  const visibleCategories = categories.filter((category) => category && category !== 'All');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>BROWSE THE SHOP</Text>
      <Text style={styles.title}>Find your next favourite.</Text>
      <Text style={styles.copy}>Browse books, groceries, gadgets and more from PAZ.</Text>
      {loading ? <ActivityIndicator color={palette.green} size="large" style={styles.loading} /> : null}
      {!loading && visibleCategories.length ? (
        <View style={styles.grid}>
          {visibleCategories.map((category, index) => {
            const color = accents[index % accents.length];
            const productCount = products.filter((product) => categoryMatches(product.category, category)).length;
            return (
              <Pressable
                key={category}
                accessibilityRole="button"
                onPress={() => onSelect(category)}
                style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
              >
                <View style={[styles.icon, { backgroundColor: `${color}18` }]}>
                  <Text style={[styles.iconText, { color }]}>{categoryMark(category)}</Text>
                </View>
                <View style={styles.tileCopy}>
                  <Text numberOfLines={2} style={styles.categoryName}>{category}</Text>
                  <Text style={styles.browse}>{productCount ? `${productCount} ${productCount === 1 ? 'item' : 'items'}` : 'Coming soon'} <Text style={{ color }}>›</Text></Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      {!loading && !visibleCategories.length ? (
        <View style={styles.empty}>
          <Text style={styles.emptyMark}>✦</Text>
          <Text style={styles.emptyTitle}>Categories are on the way</Text>
          <Text style={styles.emptyCopy}>Check back soon for more from the PAZ shop.</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 21, paddingBottom: 32 },
  eyebrow: { color: palette.green, fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  title: { marginTop: 6, color: palette.ink, fontSize: 25, lineHeight: 31, fontWeight: '900' },
  copy: { maxWidth: 330, marginTop: 5, color: palette.muted, fontSize: 12, lineHeight: 18 },
  grid: { marginTop: 21, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 11 },
  tile: { width: '48.4%', minHeight: 112, padding: 13, borderWidth: 1, borderColor: palette.line, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: palette.white },
  tilePressed: { opacity: 0.78 },
  icon: { width: 42, height: 42, flexShrink: 0, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 23, fontWeight: '900' },
  tileCopy: { flex: 1, minWidth: 0 },
  categoryName: { color: palette.ink, fontSize: 11, lineHeight: 15, fontWeight: '800' },
  browse: { marginTop: 6, color: palette.muted, fontSize: 9, fontWeight: '700' },
  loading: { marginTop: 48 },
  empty: { minHeight: 280, alignItems: 'center', justifyContent: 'center' },
  emptyMark: { color: palette.green, fontSize: 34 },
  emptyTitle: { marginTop: 10, color: palette.ink, fontSize: 15, fontWeight: '900' },
  emptyCopy: { marginTop: 6, color: palette.muted, fontSize: 11, textAlign: 'center' },
});