import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  TextInput,
  Alert,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Collapsible from "react-native-collapsible";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import axios from "axios";
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { LinearGradient } from "expo-linear-gradient";
import { CartContext } from "./CartContext";
import Navigation from "./Navigation";

const HomeScreen = ({ navigation }) => {
  const { cartItems, quantities, addToCart, updateQuantity } = useContext(CartContext);
  const [imageUri, setImageUri] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showScannerOptionsModal, setShowScannerOptionsModal] = useState(false);
  const [isScannerCollapsed, setIsScannerCollapsed] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [itemsScanned, setItemsScanned] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [greeting, setGreeting] = useState("");
  const [location, setLocation] = useState(null);
  const [customAddress, setCustomAddress] = useState("");
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [products, setProducts] = useState([]);
  const [showPickupModal, setShowPickupModal] = useState(false); // New state for pickup modal
  const chatbotBounce = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    Poppins: Poppins_400Regular,
    PoppinsSemiBold: Poppins_600SemiBold,
    PoppinsBold: Poppins_700Bold,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("https://recyclehub.onrender.com/api/products");
      setProducts(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch products:", error);
      Alert.alert("Error", "Failed to fetch products. Please try again later.");
    }
  };

  const handleAddToCart = (item) => {
    addToCart(item);
  };

  const handleQuantityChange = (item, delta) => {
    updateQuantity(item, delta);
  };

  const navigateToCart = () => {
    navigation.navigate("CartScreen");
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    Animated.loop(
      Animated.sequence([
        Animated.timing(chatbotBounce, { toValue: -10, duration: 500, useNativeDriver: true }),
        Animated.timing(chatbotBounce, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const requestLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location permission is required to use this feature.");
      return;
    }
    let locationData = await Location.getCurrentPositionAsync({});
    setLocation(locationData);
    let address = await Location.reverseGeocodeAsync({
      latitude: locationData.coords.latitude,
      longitude: locationData.coords.longitude,
    });
    if (address.length > 0) {
      const { city, region, country } = address[0];
      setCustomAddress(`${city}, ${region}, ${country}`);
    }
  };

  const handleSaveAddress = () => {
    setIsEditingAddress(false);
    Alert.alert("Address Saved", `New address: ${customAddress}`);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      setItemsScanned((prev) => prev + 1);
    }
    setShowScannerOptionsModal(false);
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      setItemsScanned((prev) => prev + 1);
    }
    setShowScannerOptionsModal(false);
  };

  const removeImage = () => setImageUri(null);

  const uploadImage = async () => {
    if (!imageUri) {
      Alert.alert("Error", "Please select an image first!");
      return;
    }

    let formData = new FormData();
    formData.append("image", {
      uri: imageUri,
      type: "image/jpeg",
      name: "upload.jpg",
    });

    try {
      const response = await axios.post(
        "https://recyclehub.onrender.com/api/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { filename, classification, waste_material, recyclable, guidelines } = response.data;

      setPrediction({
        classification,
        waste_material,
        recyclable,
        guidelines,
      });

      Alert.alert(
        "Result",
        `Filename: ${filename}\n\nClassification: ${classification}\nWaste Material: ${waste_material}\nRecyclable: ${recyclable}\nGuidelines: ${guidelines}`
      );
    } catch (error) {
      console.error("❌ Upload Failed:", error.response?.data || error.message);
      Alert.alert("Upload Failed!", "Something went wrong. Try again.");
    }
  };

  const getCurrentDate = () => new Date().toDateString();

  if (!fontsLoaded) return null;

  const renderProductItem = ({ item }) => {
    const itemQuantity = quantities[item._id] || 0;

    return (
      <View style={styles.productItem}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>${item.price}</Text>
        {itemQuantity > 0 ? (
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(item, -1)}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{itemQuantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(item, 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.buyButton}
            onPress={() => handleAddToCart(item)}
          >
            <Text style={styles.buyButtonText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

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
            <MaterialIcons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.locationButton} onPress={requestLocationPermission}>
            <MaterialIcons name="location-on" size={24} color="#10B981" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
                <Text style={styles.locationText}>{customAddress || "Fetching..."}</Text>
              )}
              <TouchableOpacity onPress={() => setIsEditingAddress(!isEditingAddress)}>
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
              <TouchableOpacity style={styles.uploadButton} onPress={uploadImage}>
                <Text style={styles.uploadButtonText}>Upload</Text>
              </TouchableOpacity>
            </View>
          </Collapsible>
        </View>

        <View style={styles.pickupSection}>
          <TouchableOpacity
            style={styles.schedulePickupButton}
            onPress={() => setShowPickupModal(true)}
          >
            <Text style={styles.schedulePickupButtonText}>Schedule a Pickup</Text>
          </TouchableOpacity>
        </View>

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
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.noProductsText}>No products to show here.</Text>
          )}
        </View>
      </ScrollView>

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
                  <Text style={styles.modalText}>Prediction: {JSON.stringify(prediction)}</Text>
                </ScrollView>
              )}
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowModal(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal visible={showScannerOptionsModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.scannerOptionsModalContent}>
            <Text style={styles.modalTitle}>Select Option</Text>
            <TouchableOpacity style={styles.scannerOptionButton} onPress={pickImage}>
              <Text style={styles.scannerOptionText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.scannerOptionButton} onPress={takePhoto}>
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

      <Modal visible={showPickupModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.pickupModalContent}>
            <Text style={styles.modalTitle}>Schedule a Pickup</Text>
            <Text style={styles.modalText}>
              Placeholder: Add your scheduling logic here (e.g., date picker, address input).
            </Text>
            <TouchableOpacity
              style={styles.scheduleButton}
              onPress={() => {
                Alert.alert("Pickup Scheduled", "This is a placeholder. Implement your scheduling logic!");
                setShowPickupModal(false);
              }}
            >
              <Text style={styles.scheduleButtonText}>Confirm Pickup</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowPickupModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 30,
    paddingBottom: 10,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerContent: {
    paddingTop: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 45,
    marginRight: 15,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    fontFamily: "Poppins",
  },
  locationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  scrollContainer: {
    paddingTop: 20,
    paddingBottom: 80,
  },
  counterContainer: {
    paddingHorizontal: 20,
    paddingTop: 0,
    marginBottom: 15,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Poppins",
    marginHorizontal: 5,
    flexShrink: 1,
  },
  addressInput: {
    fontSize: 15,
    color: "#111827",
    fontFamily: "Poppins",
    borderBottomWidth: 1,
    borderBottomColor: "#10B981",
    marginHorizontal: 5,
    flexShrink: 1,
    paddingVertical: 2,
  },
  greetingText: {
    fontSize: 25,
    color: "#000000",
    fontFamily: "Poppins",
    marginBottom: 0,
  },
  counterText: {
    fontSize: 18,
    color: "#10B981",
    fontFamily: "PoppinsSemiBold",
  },
  counterNumber: {
    fontSize: 40,
    color: "#111827",
    fontFamily: "PoppinsBold",
    marginVertical: 4,
  },
  dateText: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Poppins",
  },
  scannerSection: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 5,
    backgroundColor: "#FFFFFF",
  },
  collapsibleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    backgroundColor: "#FFFFFF",
  },
  collapsibleHeaderText: {
    fontSize: 18,
    color: "#10B981",
    fontFamily: "PoppinsBold",
  },
  scannerContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    minHeight: 300,
  },
  scannerSpace: {
    width: 180,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#10B981",
    elevation: 3,
    marginBottom: 20,
  },
  imageAddedContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },
  imageAddedText: {
    fontSize: 16,
    color: "#111827",
    fontFamily: "PoppinsSemiBold",
    marginRight: 10,
  },
  uploadButton: {
    backgroundColor: "#10B981",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginTop: 20,
  },
  uploadButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "PoppinsBold",
  },
  pickupSection: {
    marginHorizontal: 20,
    marginTop: 15,
    alignItems: "center",
  },
  schedulePickupButton: {
    backgroundColor: "#10B981",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 40,
    elevation: 5,
  },
  schedulePickupButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "PoppinsBold",
  },
  shopSection: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  shopSectionTitle: {
    fontSize: 24,
    color: "#111827",
    fontFamily: "PoppinsBold",
    marginBottom: 12,
  },
  shopHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
  },
  quantityButton: {
    backgroundColor: "#10B981",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "PoppinsBold",
  },
  quantityText: {
    fontSize: 16,
    color: "#111827",
    fontFamily: "PoppinsSemiBold",
  },
  productGrid: {
    paddingBottom: 20,
  },
  productItem: {
    flex: 1,
    flexGrow: 1,
    margin: 5,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 10,
    alignItems: "center",
    elevation: 3,
    maxWidth: "31%",
  },
  productImage: {
    width: "100%",
    height: 80,
    borderRadius: 10,
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    color: "#111827",
    fontFamily: "Poppins",
    textAlign: "center",
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    color: "#10B981",
    fontFamily: "PoppinsSemiBold",
    marginBottom: 8,
  },
  buyButton: {
    backgroundColor: "#10B981",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  buyButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontFamily: "PoppinsSemiBold",
  },
  noProductsText: {
    fontSize: 18,
    color: "#EF4444",
    fontFamily: "PoppinsSemiBold",
    textAlign: "center",
  },
  chatbotIconContainer: {
    position: "absolute",
    bottom: 80,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    color: "#111827",
    fontFamily: "PoppinsBold",
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    color: "#6B7280",
    fontFamily: "Poppins",
    textAlign: "center",
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#10B981",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 20,
  },
  closeButtonText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontFamily: "PoppinsBold",
  },
  scannerOptionsModalContent: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
  },
  scannerOptionButton: {
    backgroundColor: "#10B981",
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 30,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  scannerOptionText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontFamily: "PoppinsBold",
  },
  cancelButton: {
    backgroundColor: "#EF4444",
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 30,
    marginTop: 10,
    width: "80%",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontFamily: "PoppinsBold",
  },
  pickupModalContent: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
  },
  scheduleButton: {
    backgroundColor: "#10B981",
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 30,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  scheduleButtonText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontFamily: "PoppinsBold",
  },
});

export default HomeScreen;