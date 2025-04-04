import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors, Spacing, BorderRadius, Fonts } from '../constants/theme';
import { Category } from '../types/entities';
import * as ProductService from '../services/ProductService';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CategoryStackParamList } from '../navigation/CategoryStackNavigator';

// Type for the navigation props of this specific screen
type Props = NativeStackScreenProps<CategoryStackParamList, 'CategoryList'>;

const CategoryListScreen = ({ navigation }: Props) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      try {
        const fetchedCategories = await ProductService.getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Failed to load categories:", error);
        // Handle error display
      } finally {
        setIsLoading(false);
      }
    };
    loadCategories();
  }, []);

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => navigation.navigate('CategoryDetail', { categoryId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.categoryImage} />
      <View style={styles.textContainer}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryDescription} numberOfLines={2}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={categories}
      renderItem={renderCategoryItem}
      keyExtractor={(item) => item.id}
      style={styles.container}
      contentContainerStyle={styles.listContentContainer}
    />
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
  listContentContainer: {
    padding: Spacing.md,
  },
  categoryItem: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center', // Align items vertically
  },
  categoryImage: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
  },
  textContainer: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  categoryName: {
    fontSize: 16,
    // fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  categoryDescription: {
    fontSize: 14,
    // fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
});

export default CategoryListScreen; 