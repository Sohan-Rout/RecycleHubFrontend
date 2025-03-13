import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

const CartScreen = ({ route }) => {
  const { cartItems } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cart</Text>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
            <Text style={styles.itemPrice}>Price: {item.price}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F3F4F6",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  cartItem: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  itemQuantity: {
    fontSize: 16,
    color: "#6B7280",
  },
  itemPrice: {
    fontSize: 16,
    color: "#10B981",
  },
});

export default CartScreen;