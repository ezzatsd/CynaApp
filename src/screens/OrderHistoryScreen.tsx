import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Colors, Spacing, BorderRadius, Fonts } from '../constants/theme';
import { Order, OrderItem } from '../types/entities';
import * as OrderService from '../services/OrderService';
import { useAuth } from '../context/AuthContext'; // To get userId
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AccountStackParamList } from '../navigation/AccountNavigator';

type Props = NativeStackScreenProps<AccountStackParamList, 'OrderHistory'>;

// Helper function to format date
const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Group orders by year
interface SectionData {
  title: string; // Year as title
  data: Order[];
}

const OrderHistoryScreen = ({ navigation }: Props) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState<string | null>(null); // Track which invoice is downloading

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      try {
        const fetchedOrders = await OrderService.getOrderHistory(user?.id);
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Failed to load order history:", error);
        Alert.alert("Erreur", "Impossible de charger l'historique des commandes.");
      } finally {
        setIsLoading(false);
      }
    };
    if (user) {
       loadOrders();
    }
  }, [user]);

  const handleDownloadInvoice = async (orderId: string) => {
     setIsDownloading(orderId);
     try {
       const success = await OrderService.downloadInvoice(orderId);
       if (success) {
         Alert.alert("Téléchargement", `Facture pour la commande ${orderId} simulée.`);
       } else {
         Alert.alert("Erreur", "Impossible de télécharger la facture.");
       }
     } catch (error) {
       console.error("Invoice download error:", error);
       Alert.alert("Erreur", "Une erreur est survenue lors du téléchargement.");
     } finally {
        setIsDownloading(null);
     }
   };

  // Memoize the grouped data to avoid recalculation on every render
  const sections = useMemo(() => {
    const grouped: { [year: string]: Order[] } = {};
    orders.forEach(order => {
      const year = new Date(order.orderDate).getFullYear().toString();
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(order);
    });
    // Convert to SectionList format, sorting years descending
    return Object.keys(grouped)
      .sort((a, b) => parseInt(b) - parseInt(a)) // Sort years descending
      .map(year => ({
        title: year,
        data: grouped[year],
      }));
  }, [orders]);

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderItemContainer}>
       <View style={styles.orderHeader}>
          <Text style={styles.orderDate}>{formatDate(item.orderDate)}</Text>
          <Text style={[styles.orderStatus, styles[`status${item.status}`]]}>{item.status}</Text>
       </View>
       <Text style={styles.orderId}>Commande #{item.id}</Text>
       {item.items.map((orderItem, index) => (
          <Text key={index} style={styles.orderProduct}>- {orderItem.productName} (x{orderItem.quantity})</Text>
       ))}
       <Text style={styles.orderTotal}>Total: {item.totalAmount.toFixed(2)} €</Text>
       <Text style={styles.orderPayment}>Payé avec: {item.paymentMethodSummary}</Text>
       
       <TouchableOpacity 
          style={styles.invoiceButton} 
          onPress={() => handleDownloadInvoice(item.id)}
          disabled={isDownloading === item.id}
        >
          {isDownloading === item.id ? (
             <ActivityIndicator size="small" color={Colors.primary} />
           ) : (
            <Text style={styles.invoiceButtonText}>Télécharger la facture (PDF)</Text>
           )
          }
        </TouchableOpacity>
       {/* Add navigation to order details later if needed */}
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
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={renderOrderItem}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.sectionHeader}>{title}</Text>
      )}
      style={styles.container}
      contentContainerStyle={styles.listContentContainer}
      ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune commande trouvée.</Text>
          </View>
        )}
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
      paddingBottom: Spacing.lg, // Add padding at the bottom
    },
    emptyContainer: {
        flex: 1,
        paddingTop: Spacing.xl * 2,
        alignItems: 'center',
      },
      emptyText: {
        fontSize: 18,
        color: Colors.textSecondary,
      },
  sectionHeader: {
    fontSize: 20,
    // fontFamily: Fonts.bold,
    color: Colors.text,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md, // Space between years
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  orderItemContainer: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
   orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: Spacing.sm,
    },
  orderDate: {
    fontSize: 16,
    // fontFamily: Fonts.bold,
    color: Colors.text,
  },
   orderStatus: {
      fontSize: 14,
      // fontFamily: Fonts.bold,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs / 2,
      borderRadius: BorderRadius.sm,
      overflow: 'hidden', // Ensure background color respects border radius
    },
    statusActive: { // Match status names
        backgroundColor: Colors.success + '30', // Light green background
        color: Colors.success,
      },
      statusCompleted: {
        backgroundColor: Colors.primary + '30', // Light blue background
        color: Colors.primary,
      },
      statusProcessing: {
        backgroundColor: Colors.secondary + '30', // Light orange background
        color: Colors.secondary,
      },
      statusCancelled: {
        backgroundColor: Colors.error + '30', // Light red background
        color: Colors.error,
      },
   orderId: {
      fontSize: 14,
      color: Colors.textSecondary,
      marginBottom: Spacing.md,
    },
    orderProduct: {
       fontSize: 15,
       color: Colors.text,
       marginBottom: Spacing.xs,
       marginLeft: Spacing.sm,
     },
  orderTotal: {
    fontSize: 16,
    // fontFamily: Fonts.bold,
    color: Colors.text,
    marginTop: Spacing.sm,
  },
   orderPayment: {
      fontSize: 14,
      color: Colors.textSecondary,
      marginTop: Spacing.xs,
      marginBottom: Spacing.md,
    },
    invoiceButton: {
       marginTop: Spacing.sm,
       paddingVertical: Spacing.sm,
       paddingHorizontal: Spacing.md,
       borderColor: Colors.primary,
       borderWidth: 1,
       borderRadius: BorderRadius.sm,
       alignSelf: 'flex-start', // Button only takes needed width
       minHeight: 30, // Ensure height for ActivityIndicator
       justifyContent: 'center',
     },
     invoiceButtonText: {
       color: Colors.primary,
       fontSize: 14,
       // fontFamily: Fonts.bold,
     },
});

export default OrderHistoryScreen; 