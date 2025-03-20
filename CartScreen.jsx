import React, { useContext } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { CartContext } from "./CartContext";

const CartScreen = ({ navigation }) => {
  const { cartItems, updateQuantity, removeItem } = useContext(CartContext);

  // Calculate total price
  const totalPrice = cartItems.reduce((total, item) => {
    const price = typeof item.price === "string" ? parseFloat(item.price.replace("$", "")) : item.price;
    return total + price * item.quantity;
  }, 0);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#E0E7EF"
        translucent={true}
      />
  
      <LinearGradient colors={["#E0E7EF", "#D1DAE5"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.searchContainer}>
            <MaterialIcons
              name="search"
              size={20}
              color="#6B7280"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={requestLocationPermission}
          >
            <MaterialIcons name="location-on" size={24} color="#10B981" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
  
      {/* Non-scrollable content */}
      <View style={styles.counterContainer}>
        {(location || customAddress) && (
          <View style={styles.locationRow}>
            <MaterialIcons name="location-pin" size={18} color="#10B981" />
            {isEditingAddress ? (
              <TextInput
                style={styles.addressInput}
                value={customAddress}
                onChangeText={setCustomAddress}
                onSubmitEditing={handleSaveAddress}
                autoFocus={true}
                placeholder="Enter your address"
                placeholderTextColor="#6B7280"
              />
            ) : (
              <Text style={styles.locationText}>
                {customAddress || "Fetching..."}
              </Text>
            )}
            <TouchableOpacity
              onPress={() => setIsEditingAddress(!isEditingAddress)}
            >
              <MaterialIcons
                name={isEditingAddress ? "check" : "edit"}
                size={18}
                color="#10B981"
              />
            </TouchableOpacity>
          </View>
        )}
        <Text style={styles.greetingText}>{greeting}</Text>
        <Text style={styles.counterText}>Items Scanned</Text>
        <Text style={styles.counterNumber}>{itemsScanned}</Text>
        <Text style={styles.dateText}>{getCurrentDate()}</Text>
      </View>
  
      <View style={styles.scannerSection}>
        <TouchableOpacity
          style={styles.collapsibleHeader}
          onPress={() => setIsScannerCollapsed(!isScannerCollapsed)}
        >
          <Text style={styles.collapsibleHeaderText}>Scan Item</Text>
          <MaterialIcons
            name={isScannerCollapsed ? "expand-more" : "expand-less"}
            size={28}
            color="#10B981"
          />
        </TouchableOpacity>
        <Collapsible collapsed={isScannerCollapsed}>
          <View style={styles.scannerContainer}>
            <TouchableOpacity
              style={styles.scannerSpace}
              onPress={() => setShowScannerOptionsModal(true)}
            >
              <MaterialIcons name="camera-alt" size={48} color="#10B981" />
            </TouchableOpacity>
            {imageUri && (
              <View style={styles.imageAddedContainer}>
                <Text style={styles.imageAddedText}>Image Ready</Text>
                <TouchableOpacity onPress={removeImage}>
                  <MaterialIcons name="delete" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={uploadImage}
            >
              <Text style={styles.uploadButtonText}>Upload</Text>
            </TouchableOpacity>
          </View>
        </Collapsible>
      </View>
  
      {/* Scrollable content (products) */}
      <View style={styles.shopSection}>
        <View style={styles.shopHeader}>
          <Text style={styles.shopSectionTitle}>Eco Shop</Text>
          <TouchableOpacity onPress={navigateToCart}>
            <MaterialIcons name="shopping-cart" size={28} color="#10B981" />
            {cartItems.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        {products.length > 0 ? (
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item) => item._id.toString()}
            numColumns={3}
            contentContainerStyle={styles.productGrid}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Text style={styles.noProductsText}>No products to show here.</Text>
        )}
      </View>
  
      <Navigation />
  
      <Animated.View
        style={[
          styles.chatbotIconContainer,
          { transform: [{ translateY: chatbotBounce }] },
        ]}
      >
        <TouchableOpacity onPress={() => setShowModal(true)}>
          <MaterialIcons name="smart-toy" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
  
      <Modal visible={showModal} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>AI Recycler</Text>
              {prediction && (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                  <Text style={styles.modalText}>
                    Prediction: {JSON.stringify(prediction)}
                  </Text>
                </ScrollView>
              )}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
  
      <Modal
        visible={showScannerOptionsModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.scannerOptionsModalContent}>
            <Text style={styles.modalTitle}>Select Option</Text>
            <TouchableOpacity
              style={styles.scannerOptionButton}
              onPress={pickImage}
            >
              <Text style={styles.scannerOptionText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.scannerOptionButton}
              onPress={takePhoto}
            >
              <Text style={styles.scannerOptionText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowScannerOptionsModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
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
    color: "#6B7280",
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