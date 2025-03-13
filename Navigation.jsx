import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const Navigation = ({ navigation }) => {
  return (
    <View style={styles.navigationContainer}>
      <TouchableOpacity style={styles.navItem}>
        <MaterialIcons name="home" size={24} color="#10B981" />
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("CartScreen", { cartItems })}
      >
        <MaterialIcons name="shopping-cart" size={24} color="#10B981" />
        <Text style={styles.navText}>Cart</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <MaterialIcons name="person" size={24} color="#10B981" />
        <Text style={styles.navText}>Profile</Text>
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
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    color: "#10B981",
    fontFamily: "PoppinsSemiBold",
  },
});

export default Navigation;