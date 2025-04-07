import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { Colors, Spacing, Fonts, BorderRadius } from '../constants/theme';
import { Category, Product } from '../types/entities';
import * as ProductService from '../services/ProductService';
import { NativeStackScreenProps } from '@react-navigation/native-stack'; // Needed for navigation prop type
import { MainTabParamList } from '../navigation/MainTabNavigator'; // Import MainTabParamList
import { useTranslation } from 'react-i18next'; // Import useTranslation

// Define Carousel Slide type
interface CarouselSlide {
   id: string;
   title: string;
   description: string;
   image: string; // URL
}

// Dummy Carousel Data (replace with data from backoffice later)
const dummyCarouselData: CarouselSlide[] = [
  { id: 'slide1', title: 'Nouvelle Protection EDR Pro', description: 'Découvrez notre solution EDR améliorée pour PME.', image: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200' },
  { id: 'slide2', title: 'Offre Spéciale SOC Managé', description: 'Sécurité 24/7 à un prix compétitif.', image: 'https://images.unsplash.com/photo-1618004912476-29818d81ae2e?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200' },
  { id: 'slide3', title: 'Migration XDR Simplifiée', description: 'Passez à une sécurité unifiée sans effort.', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200' },
];

// Define navigation props using MainTabParamList
type HomeScreenProps = NativeStackScreenProps<MainTabParamList, 'Home'>;

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { t } = useTranslation(); // Initialize translation hook
  const [categories, setCategories] = useState<Category[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0); // State for pagination dots
  const flatListRef = React.useRef<FlatList>(null); // Ref for FlatList

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [fetchedCategories, fetchedTopProducts] = await Promise.all([
          ProductService.getCategories(),
          ProductService.getTopProducts(),
        ]);
        setCategories(fetchedCategories);
        setTopProducts(fetchedTopProducts);
      } catch (error) {
        console.error("Failed to load home screen data:", error);
        // Handle error display
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Render Carousel Item
   const renderCarouselItem = ({ item }: { item: CarouselSlide }) => (
     <TouchableOpacity 
       style={styles.carouselItem}
       activeOpacity={0.9}
       // onPress={() => { /* Navigate based on slide later */ }}
     >
       <Image source={{ uri: item.image }} style={styles.carouselImage} />
       <View style={styles.carouselTextContainer}>
          <Text style={styles.carouselTitle}>{item.title}</Text>
          <Text style={styles.carouselDescription}>{item.description}</Text>
        </View>
     </TouchableOpacity>
   );

  // Handle scroll to update active slide index
  const onViewableItemsChanged = React.useCallback(({ viewableItems }: any) => {
     if (viewableItems.length > 0) {
       setActiveSlideIndex(viewableItems[0].index);
     }
   }, []);
   
   const viewabilityConfig = React.useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
       style={styles.categoryItem}
       onPress={() => navigation.navigate('Categories', { screen: 'CategoryDetail', params: { categoryId: item.id }})} // Navigate to Category stack
     >
      <Image source={{ uri: item.image }} style={styles.categoryImage} />
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderTopProductItem = ({ item }: { item: Product }) => (
      <TouchableOpacity
         style={styles.topProductItem}
         onPress={() => navigation.navigate('Categories', { screen: 'ProductDetail', params: { productId: item.id }})} // Navigate to Product Detail via Category stack
       >
        <Image source={{ uri: item.images[0] }} style={styles.topProductImage} />
        <Text style={styles.topProductName}>{item.name}</Text>
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
       {/* --- Carousel --- */}
        <View style={styles.carouselContainer}>
           <FlatList
             ref={flatListRef}
             data={dummyCarouselData}
             renderItem={renderCarouselItem}
             keyExtractor={(item) => item.id}
             horizontal
             pagingEnabled
             showsHorizontalScrollIndicator={false}
             onViewableItemsChanged={onViewableItemsChanged}
             viewabilityConfig={viewabilityConfig}
             style={styles.carouselFlatList}
           />
            {/* Pagination Dots */}
            <View style={styles.paginationContainer}>
              {dummyCarouselData.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === activeSlideIndex && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
        </View>

       {/* Placeholder for Fixed Text */}
       <View style={styles.fixedTextBox}>
         <Text style={styles.fixedText}>Texte fixe modifiable via back-office.</Text>
       </View>

      {/* Categories Grid */}
      <Text style={styles.sectionTitle}>{t('home.categoriesTitle')}</Text>
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        numColumns={2} // Adjust number of columns as needed
        columnWrapperStyle={styles.categoryRow}
        scrollEnabled={false} // Disable scroll for inner FlatList
      />

      {/* Top Products */}
      <Text style={styles.sectionTitle}>{t('home.topProductsTitle')}</Text>
       <FlatList
         data={topProducts}
         renderItem={renderTopProductItem}
         keyExtractor={(item) => item.id}
         horizontal // Make this list horizontal
         showsHorizontalScrollIndicator={false}
         contentContainerStyle={styles.topProductListContainer}
       />

        {/* Add some bottom padding */}
        <View style={{ height: Spacing.xl }} />
    </ScrollView>
  );
};

const screenWidth = Dimensions.get('window').width;
const carouselItemWidth = screenWidth; // Full width slides
const categoryItemWidth = (screenWidth - Spacing.md * 3) / 2; // Padding: left, right, middle
const topProductItemWidth = screenWidth * 0.4; // Adjust width for horizontal items

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
  carouselContainer: {
     height: 200, // Adjust height as needed
     marginBottom: Spacing.lg,
   },
   carouselFlatList: {
     height: '100%',
   },
   carouselItem: {
      width: carouselItemWidth,
      height: '100%',
      justifyContent: 'flex-end', // Text at the bottom
    },
   carouselImage: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    carouselTextContainer: {
        backgroundColor: Colors.overlay,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
      },
     carouselTitle: {
        color: Colors.white,
        fontSize: 18,
        // fontFamily: Fonts.bold,
        marginBottom: Spacing.xs,
      },
     carouselDescription: {
        color: Colors.white,
        fontSize: 14,
        // fontFamily: Fonts.regular,
      },
    paginationContainer: {
        position: 'absolute',
        bottom: Spacing.sm,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
      },
      paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.white + '80', // Semi-transparent white
        marginHorizontal: Spacing.xs,
      },
      paginationDotActive: {
        backgroundColor: Colors.white,
      },
  placeholderBox: {
     height: 150,
     backgroundColor: Colors.surface,
     justifyContent: 'center',
     alignItems: 'center',
     margin: Spacing.md,
     borderRadius: BorderRadius.md,
     borderWidth: 1,
     borderColor: Colors.border,
   },
   placeholderText: {
     color: Colors.textSecondary,
     fontSize: 16,
   },
   fixedTextBox: {
       padding: Spacing.md,
       marginHorizontal: Spacing.md,
       backgroundColor: Colors.surface,
       borderRadius: BorderRadius.sm,
       marginBottom: Spacing.lg,
     },
     fixedText: {
       fontSize: 14,
       // fontFamily: Fonts.regular,
       color: Colors.text,
       textAlign: 'center',
     },
  sectionTitle: {
    fontSize: 20,
    // fontFamily: Fonts.bold,
    color: Colors.text,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  categoryRow: {
    justifyContent: 'space-between',
    marginHorizontal: Spacing.md,
  },
  categoryItem: {
    width: categoryItemWidth,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    overflow: 'hidden', // Clip image to rounded corners
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryImage: {
    width: '100%',
    height: 100, // Adjust height as needed
    resizeMode: 'cover',
  },
  categoryName: {
    fontSize: 14,
    // fontFamily: Fonts.bold,
    color: Colors.text,
    padding: Spacing.sm,
    textAlign: 'center',
  },
   topProductListContainer: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
    },
  topProductItem: {
     width: topProductItemWidth,
     marginRight: Spacing.md,
     backgroundColor: Colors.surface,
     borderRadius: BorderRadius.md,
     overflow: 'hidden',
     borderWidth: 1,
     borderColor: Colors.border,
  },
  topProductImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  topProductName: {
    fontSize: 14,
    // fontFamily: Fonts.regular,
    color: Colors.text,
    padding: Spacing.sm,
    textAlign: 'center',
  },
});

export default HomeScreen; 