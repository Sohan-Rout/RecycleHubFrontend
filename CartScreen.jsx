import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

const CartScreen = ({ route }) => {
  const { cartItems } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
            <Text style={styles.itemPrice}>{item.price}</Text>
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
    fontFamily: "PoppinsBold",
    color: "#111827",
    marginBottom: 20,
  },
  cartItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 3,
  },
  itemName: {
    fontSize: 16,
    fontFamily: "PoppinsSemiBold",
    color: "#111827",
  },
  itemQuantity: {
    fontSize: 14,
    fontFamily: "Poppins",
    color: "#6B7280",
  },
  itemPrice: {
    fontSize: 16,
    fontFamily: "PoppinsSemiBold",
    color: "#10B981",
  },
});

export default CartScreen;