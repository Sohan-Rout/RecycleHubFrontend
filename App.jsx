import React, { useState, useEffect, useRef } from "react";
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
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Collapsible from "react-native-collapsible";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import axios from "axios";
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { LinearGradient } from "expo-linear-gradient";

const UploadScreen = () => {
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
  const chatbotBounce = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    Poppins: Poppins_400Regular,
    PoppinsSemiBold: Poppins_600SemiBold,
    PoppinsBold: Poppins_700Bold,
  });

  const ecoFriendlyProducts = [
    { id: 1, name: "Bamboo Toothbrush", price: "$5.00", image: require("./assets/bamboo-toothbrush.jpeg") },
    { id: 2, name: "Reusable Water Bottle", price: "$15.00", image: require("./assets/reusable-bottle.jpeg") },
    { id: 3, name: "Organic Cotton Tote Bag", price: "$10.00", image: require("./assets/tote-bag.jpeg") },
    { id: 4, name: "Eco-Friendly Straws", price: "$8.00", image: require("./assets/eco-straws.jpeg") },
    { id: 5, name: "Wooden Comb (Bamboo)", price: "$3.50", image: require("./assets/wooden_comb.jpeg") },
    { id: 6, name: "Wooden Razor For Men", price: "$15.00", image: require("./assets/razor.jpeg") },
    { id: 7, name: "Wooden Plate", price: "$5.00", image: require("./assets/plate.jpeg") },
    { id: 8, name: "Wooden Cup", price: "$3.00", image: require("./assets/cup.jpeg") },
  ];

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

      setPrediction(response.data.prediction);
      Alert.alert("✅ Upload Success", `Filename: ${response.data.filename}\nPrediction: ${JSON.stringify(response.data.prediction)}`);
    } catch (error) {
      console.error("❌ Upload Failed:", error.response?.data || error.message);
      Alert.alert("Upload Failed!", "Something went wrong. Try again.");
    }
  };

  const getCurrentDate = () => new Date().toDateString();

  if (!fontsLoaded) return null;

  const renderProductItem = ({ item }) => (
    <View style={styles.productItem}>
      <Image source={item.image} style={styles.productImage} />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price}</Text>
      <TouchableOpacity style={styles.buyButton}>
        <Text style={styles.buyButtonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E0E7EF" translucent={true} />

      {/* Fixed Header with Search Bar and Location Button */}
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

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        scrollEventThrottle={16}
        onScroll={({ nativeEvent }) => {
          scrollY.setValue(nativeEvent.contentOffset.y);
        }}
      >
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
          <Text style peeked={styles.greetingText}>{greeting}</Text>
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

        <View style={styles.shopSection}>
          <Text style={styles.shopSectionTitle}>Eco Shop</Text>
          <FlatList
            data={ecoFriendlyProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            contentContainerStyle={styles.productGrid}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>

      <Animated.View style={[styles.chatbotIconContainer, { transform: [{ translateY: chatbotBounce }] }]}>
        <TouchableOpacity onPress={() => setShowModal(true)}>
          <MaterialIcons name="chat-bubble" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>AI Recycler</Text>
            {prediction && <Text style={styles.modalText}>Prediction: {JSON.stringify(prediction)}</Text>}
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowModal(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingBottom: 10,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerContent: {
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
    height: 40, // Match locationButton height
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
    paddingTop: 50,
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
    fontSize: 14,
    color: "#111827",
    fontFamily: "Poppins",
    borderBottomWidth: 1,
    borderBottomColor: "#10B981",
    marginHorizontal: 5,
    flexShrink: 1,
    paddingVertical: 2,
  },
  greetingText: {
    fontSize: 24,
    color: "#111827",
    fontFamily: "PoppinsBold",
    marginBottom: 4,
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
    minHeight: 300, // Increased height to provide more space
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
    marginBottom: 20, // Added spacing below camera option
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
    marginTop: 20, // Added margin to move the button lower
  },
  uploadButtonText: {
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
  productGrid: {
    paddingBottom: 20,
  },
  productItem: {
    flex: 1,
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
  chatbotIconContainer: {
    position: "absolute",
    bottom: 20,
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
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    width: "90%",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
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
});

export default UploadScreen;