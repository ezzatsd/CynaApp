import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Colors, Spacing, BorderRadius, Fonts } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { CartItem } from '../types/cart';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../navigation/MainTabNavigator';
import { useAuth } from '../context/AuthContext'; // Import useAuth to check login status
import { Ionicons } from '@expo/vector-icons';

// Define navigation props
type CartScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Cart'>;

const CartScreen = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, isLoading, itemCount } = useCart();
  const { user } = useAuth(); // Get user status
  const navigation = useNavigation<CartScreenNavigationProp>();

  const handleCheckout = () => {
      if (!user) {
          Alert.alert(
              "Connexion requise",
              "Vous devez être connecté pour passer à la caisse.",
              [
                  { text: "Annuler", style: "cancel" },
                  { 
                      text: "Se connecter", 
                      onPress: () => navigation.navigate('Account', { screen: 'Login' }) 
                  }
              ]
          );
      } else if (cartItems.length === 0) {
         Alert.alert("Panier vide", "Votre panier est vide.");
      } else {
          // Navigate to the first step of checkout (e.g., Address)
          navigation.navigate('Account', { screen: 'Address' }); // Assuming Address screen is in Account stack for now
      }
  };

  // Component for quantity adjustment
  const QuantitySelector = ({ item }: { item: CartItem }) => {
     const decreaseQuantity = () => updateQuantity(item.product.id, item.quantity - 1);
     const increaseQuantity = () => updateQuantity(item.product.id, item.quantity + 1);

     return (
         <View style={styles.quantityContainer}>
             <TouchableOpacity onPress={decreaseQuantity} style={styles.quantityButton}>
                 <Text style={styles.quantityButtonText}>-</Text>
             </TouchableOpacity>
             <Text style={styles.quantityText}>{item.quantity}</Text>
             <TouchableOpacity onPress={increaseQuantity} style={styles.quantityButton}>
                  <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
         </View>
     );
   };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItemContainer}>
      <Image source={{ uri: item.product.images[0] }} style={styles.productImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.productName}>{item.product.name}</Text>
        <Text style={styles.productPrice}>{`${(item.product.price * item.quantity).toFixed(2)} €`} ( {item.product.price.toFixed(2)} €/unité )</Text>
         <QuantitySelector item={item} />
      </View>
       <TouchableOpacity onPress={() => removeFromCart(item.product.id)} style={styles.removeButton}>
          <Ionicons name="trash-outline" size={22} color={Colors.error} />
       </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.product.id}
        style={styles.list}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Votre panier est vide.</Text>
          </View>
        )}
      />
      {cartItems.length > 0 && (
         <View style={styles.footer}>
             <View style={styles.totalContainer}>
               <Text style={styles.totalLabel}>Total ({itemCount} articles):</Text>
               <Text style={styles.totalAmount}>{`${cartTotal.toFixed(2)} €`}</Text>
             </View>
             <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
               <Text style={styles.checkoutButtonText}>Passer à la caisse</Text>
             </TouchableOpacity>
           </View>
      )}
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
   list: {
      flex: 1,
    },
   emptyContainer: {
       flex: 1,
       justifyContent: 'center',
       alignItems: 'center',
       padding: Spacing.xl,
     },
     emptyText: {
       fontSize: 18,
       color: Colors.textSecondary,
     },
  cartItemContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden', // Keep image corners rounded
  },
  productImage: {
    width: 90,
    height: 90,
    resizeMode: 'cover',
  },
  itemDetails: {
    flex: 1,
    padding: Spacing.md,
  },
  productName: {
    fontSize: 16,
    // fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  productPrice: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
   quantityContainer: {
       flexDirection: 'row',
       alignItems: 'center',
       marginTop: Spacing.sm,
     },
     quantityButton: {
       backgroundColor: Colors.border,
       paddingHorizontal: Spacing.sm + 2, 
       paddingVertical: Spacing.xs,
       borderRadius: BorderRadius.sm,
       marginHorizontal: Spacing.sm,
     },
     quantityButtonText: {
       fontSize: 18,
       color: Colors.text,
       fontWeight: 'bold',
     },
     quantityText: {
       fontSize: 16,
       color: Colors.text,
       minWidth: 20, // Ensure space for number
       textAlign: 'center',
     },
   removeButton: {
       padding: Spacing.md,
       justifyContent: 'center',
       alignItems: 'center',
       width: 50,
     },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
  },
  totalContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: Spacing.md,
    },
    totalLabel: {
      fontSize: 18,
      color: Colors.textSecondary,
      // fontFamily: Fonts.regular,
    },
    totalAmount: {
      fontSize: 18,
      color: Colors.text,
      // fontFamily: Fonts.bold,
    },
  checkoutButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: Colors.white,
    fontSize: 18,
    // fontFamily: Fonts.bold,
  },
});

export default CartScreen; 