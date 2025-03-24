import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { CartContext } from "./CartContext";

const CartScreen = ({ navigation }) => {
  const { cartItems, updateQuantity, removeItem } = useContext(CartContext);

  const totalPrice = cartItems
    .reduce((total, item) => {
      const price = typeof item.price === "string" ? parseFloat(item.price.replace("$", "")) : item.price;
      return total + price * (item.quantity || 0);
    }, 0)
    .toFixed(2);

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>${item.price}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item, -1)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity || 0}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item, 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => removeItem(item)}
      >
        <MaterialIcons name="delete" size={24} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#10B981"
        translucent={true}
      />
      <LinearGradient colors={["#10B981", "#059669"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Cart</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      {cartItems.length > 0 ? (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item._id.toString()}
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          />
          <View style={styles.totalContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalText}>Total</Text>
              <Text style={styles.totalPrice}>${totalPrice}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutButton}>
              <LinearGradient
                colors={["#10B981", "#059669"]}
                style={styles.checkoutGradient}
              >
                <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyCartContainer}>
          <MaterialIcons name="shopping-cart" size={80} color="#9CA3AF" />
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <Text style={[styles.checkoutText, { color: "#10B981" }]}>
              Start Shopping
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "PoppinsBold",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 15,
    paddingBottom: 120,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
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
    color: "#1F2937",
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: "PoppinsRegular",
    color: "#10B981",
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
    right: 15,
    top: 15,
  },
  totalContainer: {
    position: "absolute",
    bottom: 20,
    left: 15,
    right: 15,
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