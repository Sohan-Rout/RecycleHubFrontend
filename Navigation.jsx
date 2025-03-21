import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { CartContext } from "./CartContext";
import { useNavigation } from "@react-navigation/native";

const Navigation = () => {
  const { cartItems } = useContext(CartContext);
  const navigation = useNavigation();

  return (
    <View style={styles.navigationContainer}>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("HomeScreen")}>
        <MaterialIcons name="home" size={24} color="#10B981" />
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("CartScreen")}>
        <MaterialIcons name="shopping-cart" size={24} color="#6B7280" />
        <Text style={styles.navTextInactive}>Cart</Text>
        {cartItems.length > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("RecyclePointScreen")}>
        <MaterialIcons name="location-pin" size={24} color="#6B7280" />
        <Text style={styles.navTextInactive}>Recycle Points</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem}>
        <MaterialIcons name="person" size={24} color="#6B7280" />
        <Text style={styles.navTextInactive}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E7EF",
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
    color: "#10B981",
    fontFamily: "PoppinsSemiBold",
  },
  navTextInactive: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "PoppinsSemiBold",
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "PoppinsSemiBold",
  },
});

export default Navigation;