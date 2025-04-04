import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Colors, Spacing, BorderRadius, Fonts } from '../constants/theme';
import { Product } from '../types/entities';
import * as ProductService from '../services/ProductService';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CategoryStackParamList } from '../navigation/CategoryStackNavigator';
import { useCart } from '../context/CartContext';
// We could potentially add a simple image carousel library later like react-native-snap-carousel

type Props = NativeStackScreenProps<CategoryStackParamList, 'ProductDetail'>;

const ProductDetailScreen = ({ route, navigation }: Props) => {
  const { productId } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) return;
      setIsLoading(true);
      try {
        const fetchedProduct = await ProductService.getProductById(productId);
        setProduct(fetchedProduct ?? null);
        // Set header title dynamically
         if (fetchedProduct) {
           navigation.setOptions({ title: fetchedProduct.name });
         }
      } catch (error) {
        console.error(`Failed to load product ${productId}:`, error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProduct();
  }, [productId, navigation]); // Add navigation dependency

  const handleAddToCart = () => {
     if (product) {
       addToCart(product);
     }
   };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <Text>Produit non trouvé.</Text>
      </View>
    );
  }

  // Determine CTA button text and state
  let ctaText = "S'ABONNER MAINTENANT";
  let ctaDisabled = false;
  if (!product.isAvailable) {
     ctaText = "SERVICE INDISPONIBLE";
     ctaDisabled = true;
  }
  // Could add logic for "ESSAYER MAINTENANT" based on product properties later

  return (
    <ScrollView style={styles.container}>
      {/* Image Carousel Placeholder */}
      <View style={styles.carouselContainer}>
         {product.images.length > 0 ? (
             <Image source={{ uri: product.images[0] }} style={styles.productImage} />
           ) : (
             <View style={styles.placeholderImage}>
                <Text>Image non disponible</Text>
              </View>
           )
         }
         {/* Add carousel indicators or buttons later */}
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>{product.price.toFixed(2)} € / mois (exemple)</Text>
         {product.isAvailable ? (
           <Text style={styles.availability}><Text style={{color: Colors.success}}>●</Text> Disponible immédiatement</Text>
         ) : (
            <Text style={styles.availability}><Text style={{color: Colors.error}}>●</Text> Service momentanément indisponible</Text>
         )}

        <Text style={styles.descriptionTitle}>Description</Text>
        <Text style={styles.descriptionText}>{product.description}</Text>

        {product.features && product.features.length > 0 && (
           <View>
              <Text style={styles.descriptionTitle}>Caractéristiques Techniques</Text>
              {product.features.map((feature, index) => (
                 <Text key={index} style={styles.featureText}>• {feature}</Text>
              ))}
           </View>
        )}

        {/* CTA Button */}
        <TouchableOpacity
           style={[styles.ctaButton, ctaDisabled && styles.ctaButtonDisabled]}
           disabled={ctaDisabled}
           onPress={handleAddToCart}
         >
          <Text style={styles.ctaButtonText}>{ctaText}</Text>
        </TouchableOpacity>
      </View>

      {/* Similar Products Placeholder */}
      <View style={styles.similarContainer}>
         <Text style={styles.sectionTitle}>Services similaires</Text>
         <Text style={styles.placeholderText}>Liste de 6 produits similaires aléatoires...</Text>
          {/* Implement fetching and displaying similar products later */}
      </View>

    </ScrollView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white, // Use white for product page background
  },
  loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Colors.white,
    },
  carouselContainer: {
      height: 300, // Adjust height
      backgroundColor: Colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain', // Use contain to see the whole image
      },
      placeholderImage: {
          width: '80%',
          height: '80%',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.border,
          borderRadius: BorderRadius.sm,
        },
  infoContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  productName: {
    fontSize: 24,
    // fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  productPrice: {
    fontSize: 20,
    // fontFamily: Fonts.bold,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
   availability: {
       fontSize: 14,
       // fontFamily: Fonts.regular,
       color: Colors.textSecondary,
       marginBottom: Spacing.lg,
     },
  descriptionTitle: {
    fontSize: 18,
    // fontFamily: Fonts.bold,
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  descriptionText: {
    fontSize: 16,
    // fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
   featureText: {
       fontSize: 16,
       color: Colors.textSecondary,
       marginLeft: Spacing.md, // Indent features
       marginBottom: Spacing.xs,
       lineHeight: 22,
     },
  ctaButton: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  ctaButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  ctaButtonText: {
    color: Colors.white,
    fontSize: 18,
    // fontFamily: Fonts.bold,
  },
  similarContainer: {
     marginTop: Spacing.lg,
     paddingHorizontal: Spacing.lg,
     paddingBottom: Spacing.xl,
     borderTopWidth: 1,
     borderTopColor: Colors.border,
   },
   sectionTitle: {
       fontSize: 18,
       // fontFamily: Fonts.bold,
       color: Colors.text,
       marginBottom: Spacing.md,
       marginTop: Spacing.lg,
     },
     placeholderText: {
         color: Colors.textSecondary,
         fontSize: 14,
       },
});

export default ProductDetailScreen; 