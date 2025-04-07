import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator, Keyboard } from 'react-native';
import { Colors, Spacing, BorderRadius, Fonts } from '../constants/theme';
import { Product } from '../types/entities';
import { dummyProducts } from '../services/dummyData'; // Import dummy data directly for client-side search
import { NativeStackScreenProps } from '@react-navigation/native-stack'; // For navigation typing
import { MainTabParamList } from '../navigation/MainTabNavigator';
import { CategoryStackParamList } from '../navigation/CategoryStackNavigator'; // To navigate to ProductDetail
import { CompositeScreenProps, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // Import icons

// Define navigation props
type SearchScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Search'>;

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // To show "no results" message only after a search

  // Use hook to get navigation object strongly typed for Tab Navigator
  const navigation = useNavigation<SearchScreenNavigationProp>();

  // Basic client-side search function
  const handleSearch = () => {
    Keyboard.dismiss(); // Dismiss keyboard
    if (!query.trim()) {
        setResults([]);
        setHasSearched(true);
        return;
    }
    setIsLoading(true);
    setHasSearched(true);

    // Simulate slight delay
    setTimeout(() => {
      const lowerCaseQuery = query.toLowerCase();
      const filteredResults = dummyProducts.filter(product =>
        product.name.toLowerCase().includes(lowerCaseQuery) ||
        product.description.toLowerCase().includes(lowerCaseQuery)
      );
       // Simple sort: Available first
      filteredResults.sort((a, b) => (a.isAvailable === b.isAvailable ? 0 : a.isAvailable ? -1 : 1));

      setResults(filteredResults);
      setIsLoading(false);
    }, 300); // 300ms simulated delay
  };

 const renderProductItem = ({ item }: { item: Product }) => (
     <TouchableOpacity
       style={styles.productItem}
       // Navigate to ProductDetail within the Categories stack
       onPress={() => navigation.navigate('Categories', { screen: 'ProductDetail', params: { productId: item.id }})}
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


  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
         <TextInput
            style={styles.input}
            placeholder="Rechercher un service (ex: EDR, SOC)..."
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearch} // Search on submit
            placeholderTextColor={Colors.textSecondary}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={isLoading}>
              <Ionicons name="search" size={20} color={Colors.white} />
           </TouchableOpacity>
      </View>
      
      {/* Placeholder for Filters */} 
      {/* <View style={styles.filterPlaceholder}><Text>Filtres avancés (Prix, Caractéristiques...) - Étape suivante</Text></View> */}

      {isLoading ? (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          style={styles.resultsList}
          contentContainerStyle={{ paddingBottom: Spacing.md }}
          ListEmptyComponent={() => (
              hasSearched && !isLoading ? (
                 <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Aucun résultat trouvé pour "{query}".</Text>
                 </View>
              ) : null // Don't show anything before first search
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
      flexDirection: 'row',
      padding: Spacing.md,
      backgroundColor: Colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
  input: {
    flex: 1,
    height: 45,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    color: Colors.text,
    marginRight: Spacing.sm,
  },
   searchButton: {
      width: 45,
      height: 45,
      paddingHorizontal: 0,
      backgroundColor: Colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: BorderRadius.md,
    },
//    filterPlaceholder: {
//        padding: Spacing.md,
//        alignItems: 'center',
//        borderBottomWidth: 1,
//        borderBottomColor: Colors.border,
//    },
  loadingContainer: {
      flex: 1, // Take remaining space
      justifyContent: 'center',
      alignItems: 'center',
    },
  resultsList: {
      flex: 1, // Take remaining space
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.md,
    },
    emptyContainer: {
        flex: 1,
        marginTop: Spacing.xl * 2,
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
      },
      emptyText: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
      },
  // Reusing product item styles from CategoryDetailScreen
   productItem: {
     flexDirection: 'row',
     backgroundColor: Colors.surface,
     borderRadius: BorderRadius.md,
     marginBottom: Spacing.md,
     overflow: 'hidden',
     borderWidth: 1,
     borderColor: Colors.border,
     position: 'relative',
   },
   productImage: {
     width: 80, // Smaller image for search results
     height: 80,
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
   },
   outOfStockText: {
       fontSize: 14,
       color: Colors.error,
       // fontFamily: Fonts.bold,
       marginTop: Spacing.sm,
     },
     outOfStockOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        zIndex: 1,
      },
});

export default SearchScreen; 