import React, { useContext } from "react";
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { CartContext } from "./CartContext";

const CartScreen = ({ navigation }) => {
  const { cartItems, updateQuantity, removeItem } = useContext(CartContext);

  // Calculate total price
  const totalPrice = cartItems.reduce((total, item) => {
    const price = parseFloat(item.price.replace("$",""))
    return total + price * item.quantity;
  }, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#10B981", "#34D399"]} // Modern gradient: dark blue to light blue
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={25} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Cart</Text>
        </View>
      </LinearGradient>

      {/* Cart Items */}
      {cartItems.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <MaterialIcons name="shopping-cart" size={80} color="#9CA3AF" />
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Image source={item.image} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{item.price}</Text>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item, -1)}
                    >
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item, 1)}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => removeItem(item.id)}
                  >
                    <MaterialIcons name="delete" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          {/* Total Price and Checkout */}
          <View style={styles.totalContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalText}>Total</Text>
              <Text style={styles.totalPrice}>${totalPrice.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutButton}>
              <LinearGradient
                colors={["#10B981", "#34D399"]} // Green gradient for checkout
                style={styles.checkoutGradient}
              >
                <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Fixed Navigation Bar */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Home")}>
          <MaterialIcons name="home" size={26} color="#6B7280" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("CartScreen")}>
          <MaterialIcons name="shopping-cart" size={26} color="#10B981" />
          <Text style={styles.navText}>Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="person" size={26} color="#6B7280" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6", // Light gray for a clean, modern look
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "PoppinsBold",
    color: "#FFFFFF",
    marginLeft: 15,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 15,
    paddingBottom: 120, // Space for navigation bar and total container
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3, // Subtle shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 16,
    fontFamily: "PoppinsSemiBold",
    color: "#1F2937", // Darker text for contrast
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: "PoppinsRegular",
    color: "#10B981", // Green for price
    marginVertical: 5,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    padding: 5,
    width: 100,
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    borderRadius: 15,
  },
  quantityButtonText: {
    fontSize: 18,
    color: "#1F2937",
    fontFamily: "PoppinsBold",
  },
  quantityText: {
    fontSize: 16,
    fontFamily: "PoppinsSemiBold",
    color: "#1F2937",
    marginHorizontal: 10,
  },
  deleteButton: {
    position: "absolute",
    right: 0,
    top: 0,
  },
  totalContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    elevation: 3,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  totalText: {
    fontSize: 18,
    fontFamily: "PoppinsSemiBold",
    color: "#1F2937",
  },
  totalPrice: {
    fontSize: 20,
    fontFamily: "PoppinsBold",
    color: "#10B981",
  },
  checkoutButton: {
    borderRadius: 15,
    overflow: "hidden",
  },
  checkoutGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  checkoutText: {
    fontSize: 16,
    fontFamily: "PoppinsBold",
    color: "#FFFFFF",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 70,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    fontFamily: "PoppinsSemiBold",
    color: "#6B7280", // Neutral gray for inactive items
    marginTop: 5,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCartText: {
    fontSize: 18,
    fontFamily: "PoppinsRegular",
    color: "#9CA3AF",
    marginTop: 20,
  },
});

export default CartScreen;