import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors, Spacing, BorderRadius, Fonts } from '../constants/theme';
import { Category, Product } from '../types/entities';
import * as ProductService from '../services/ProductService';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CategoryStackParamList } from '../navigation/CategoryStackNavigator';
import { CompositeScreenProps } from '@react-navigation/native'; // Needed for combining nav types
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../navigation/MainTabNavigator';

// Combine navigation types: Screen is inside CategoryStack, which is inside MainTab
type CategoryDetailScreenNavigationProp = CompositeScreenProps<
  NativeStackScreenProps<CategoryStackParamList, 'CategoryDetail'>,
  BottomTabScreenProps<MainTabParamList> // Also gets props from parent Tab navigator
>;

const CategoryDetailScreen = ({ route, navigation }: CategoryDetailScreenNavigationProp) => {
  const { categoryId } = route.params;
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!categoryId) return;
      setIsLoading(true);
      try {
        const [fetchedCategory, fetchedProducts] = await Promise.all([
           ProductService.getCategoryById(categoryId),
           ProductService.getProductsByCategory(categoryId)
        ]);
        setCategory(fetchedCategory ?? null);
        setProducts(fetchedProducts);
        // Set header title dynamically
        if (fetchedCategory) {
           navigation.setOptions({ title: fetchedCategory.name });
        }
      } catch (error) {
        console.error(`Failed to load category ${categoryId} data:`, error);
        // Handle error display
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [categoryId, navigation]); // Add navigation to dependencies for setOptions

  const renderProductItem = ({ item }: { item: Product }) => (
      <TouchableOpacity
         style={styles.productItem}
         onPress={() => navigation.navigate('ProductDetail', { productId: item.id })} // Navigate within the same stack
       >
        <Image source={{ uri: item.images[0] }} style={styles.productImage} />
        <View style={styles.productInfo}>
           <Text style={styles.productName}>{item.name}</Text>
           <Text style={styles.productPrice}>{`${item.price.toFixed(2)} €`}</Text>
            {!item.isAvailable && (
              <Text style={styles.outOfStockText}>Indisponible</Text>
            )}
        </View>
        {!item.isAvailable && <View style={styles.outOfStockOverlay} />}
      </TouchableOpacity>
    );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!category) {
     return (
       <View style={styles.container}>
         <Text>Catégorie non trouvée.</Text>
       </View>
     );
   }

  return (
    <View style={styles.container}>
      {/* Category Header */}
      <View style={styles.categoryHeader}>
         <Image source={{ uri: category.image }} style={styles.categoryBannerImage} />
         <View style={styles.categoryBannerOverlay} />
         <Text style={styles.categoryBannerTitle}>{category.name}</Text>
      </View>
      <Text style={styles.categoryDescription}>{category.description}</Text>

      {/* Product List */}
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        style={styles.productList}
        contentContainerStyle={{ paddingBottom: Spacing.md }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  categoryHeader: {
     marginBottom: Spacing.md,
     position: 'relative', // Needed for overlay
   },
   categoryBannerImage: {
       width: '100%',
       height: 150, // Adjust height
       resizeMode: 'cover',
     },
    categoryBannerOverlay: {
        ...StyleSheet.absoluteFillObject, // Cover the image
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark overlay
      },
     categoryBannerTitle: {
         position: 'absolute',
         bottom: Spacing.md,
         left: Spacing.md,
         fontSize: 24,
         // fontFamily: Fonts.bold,
         color: Colors.white,
         textShadowColor: 'rgba(0, 0, 0, 0.75)',
         textShadowOffset: { width: -1, height: 1 },
         textShadowRadius: 10
       },
    categoryDescription: {
        fontSize: 16,
        // fontFamily: Fonts.regular,
        color: Colors.textSecondary,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.lg,
        textAlign: 'center',
      },
  productList: {
     paddingHorizontal: Spacing.md,
   },
  productItem: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative', // For overlay
  },
  productImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  productInfo: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    // fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  productPrice: {
    fontSize: 14,
    // fontFamily: Fonts.regular,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  outOfStockText: {
     fontSize: 14,
     color: Colors.error,
     // fontFamily: Fonts.bold,
     marginTop: Spacing.sm,
   },
   outOfStockOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(255, 255, 255, 0.7)', // White overlay for unavailable
      zIndex: 1, // Ensure overlay is on top
    },
});

export default CategoryDetailScreen; 