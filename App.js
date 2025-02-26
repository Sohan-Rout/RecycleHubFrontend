import React, { useState, useEffect, useRef } from "react";
import { Button, View, Alert, Text, StyleSheet, StatusBar, Animated, Modal, TouchableOpacity, ScrollView, Image, FlatList } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import Collapsible from 'react-native-collapsible';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useFonts, Poppins_400Regular } from '@expo-google-fonts/poppins'; // Import Poppins font

const UploadScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showScannerOptionsModal, setShowScannerOptionsModal] = useState(false);
  const [isScannerCollapsed, setIsScannerCollapsed] = useState(true); // Open by default
  const [prediction, setPrediction] = useState(null);
  const [itemsScanned, setItemsScanned] = useState(0); // Items scanned counter
  const chatbotBounce = useRef(new Animated.Value(0)).current;
  const leafBounce = useRef(new Animated.Value(0)).current; // Bounce animation for the leaf logo
  const scrollY = useRef(new Animated.Value(0)).current;

  // Load Poppins font
  const [fontsLoaded] = useFonts({
    Poppins: Poppins_400Regular,
  });

  // Dummy data for eco-friendly products
  const ecoFriendlyProducts = [
    {
      id: 1,
      name: "Bamboo Toothbrush",
      price: "$5.00",
      image: require("./assets/bamboo-toothbrush.jpeg"),
    },
    {
      id: 2,
      name: "Reusable Water Bottle",
      price: "$15.00",
      image: require("./assets/reusable-bottle.jpeg"),
    },
    {
      id: 3,
      name: "Organic Cotton Tote Bag",
      price: "$10.00",
      image: require("./assets/tote-bag.jpeg"),
    },
    {
      id: 4,
      name: "Eco-Friendly Straws",
      price: "$8.00",
      image: require("./assets/eco-straws.jpeg"),
    },
  ];

  // Bouncing animation for the chatbot icon
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(chatbotBounce, {
          toValue: -10,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(chatbotBounce, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Bouncing animation for the leaf logo
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(leafBounce, {
          toValue: -10,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(leafBounce, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Pick image from gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      setItemsScanned((prev) => prev + 1); // Increment items scanned counter
    }
    setShowScannerOptionsModal(false); // Close the modal after picking an image
  };

  // Take photo using camera
  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      setItemsScanned((prev) => prev + 1); // Increment items scanned counter
    }
    setShowScannerOptionsModal(false); // Close the modal after taking a photo
  };

  // Remove the selected image
  const removeImage = () => {
    setImageUri(null);
  };

  // Upload image to the server
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

  // Get the current date
  const getCurrentDate = () => {
    const today = new Date();
    return today.toDateString(); // Example: "Tue Feb 26 2025"
  };

  if (!fontsLoaded) {
    return null; // Wait for fonts to load
  }

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [100, 0],
    extrapolate: 'clamp',
  });

  // Render eco-friendly product item
  const renderProductItem = ({ item }) => (
    <View style={styles.productItem}>
      <Image source={item.image} style={styles.productImage} />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price}</Text>
      <TouchableOpacity
        style={styles.buyButton}
        onPress={() => Alert.alert("Buy Now", `You clicked Buy Now for ${item.name}`)}
      >
        <Text style={styles.buyButtonText}>Buy Now</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* StatusBar */}
      <StatusBar barStyle="light-content" />

      {/* Animated Header */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>Hello</Text>
          <Animated.View
            style={[
              styles.leafLogoContainer,
              {
                transform: [
                  {
                    translateY: leafBounce,
                  },
                ],
              },
            ]}
          >
            <Image
              source={require("./assets/leaf.png")}
              style={styles.leafLogo}
            />
          </Animated.View>
        </View>
        {/* Horizontal Line */}
        <View style={styles.horizontalLine} />
      </Animated.View>

      {/* ScrollView */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Items Scanned Counter */}
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>Items Scanned</Text>
          <Text style={styles.counterTextCounting}>{itemsScanned}.00</Text>
          <Text style={styles.dateText}>Today: {getCurrentDate()}</Text>
        </View>

        {/* Collapsible Scanner Section */}
        <View style={styles.scannerSection}>
          <TouchableOpacity
            style={styles.collapsibleHeader}
            onPress={() => setIsScannerCollapsed(!isScannerCollapsed)}
          >
            <Text style={styles.collapsibleHeaderText}>Scan Here</Text>
            <MaterialIcons
              name={
                isScannerCollapsed ? "keyboard-arrow-down" : "keyboard-arrow-up"
              }
              size={24}
              color="#4CAF50"
            />
          </TouchableOpacity>

          <Collapsible collapsed={isScannerCollapsed}>
            <View style={styles.scannerContainer}>
              {/* Scanner Space */}
              <TouchableOpacity
                style={styles.scannerSpace}
                onPress={() => setShowScannerOptionsModal(true)}
              >
                <MaterialIcons name="photo-camera" size={50} color="#4CAF50" />
              </TouchableOpacity>

              {/* Image Added Confirmation */}
              {imageUri && (
                <View style={styles.imageAddedContainer}>
                  <Text style={styles.imageAddedText}>Image Added</Text>
                  <TouchableOpacity onPress={removeImage}>
                    <MaterialIcons name="delete" size={24} color="#FF0000" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Upload Image Button */}
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={uploadImage}
              >
                <Text style={styles.uploadButtonText}>Upload Image</Text>
              </TouchableOpacity>
            </View>
          </Collapsible>
        </View>

        {/* Eco-Friendly Shop Section */}
        <View style={styles.shopSection}>
          <Text style={styles.shopSectionTitle}>
            Shop Eco-Friendly Products
          </Text>
          {/* Horizontal Line */}
          <View style={styles.horizontalLineShop} />
          <FlatList
            data={ecoFriendlyProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2} // Display 2 items per row
            contentContainerStyle={styles.productGrid}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>

      {/* Chatbot Icon Fixed to Bottom-Right Corner */}
      <View style={styles.chatbotIconWrapper}>
        <Animated.View
          style={[
            styles.chatbotIconContainer,
            {
              transform: [
                {
                  translateY: chatbotBounce,
                },
              ],
            },
          ]}
        >
          <TouchableOpacity onPress={() => setShowModal(true)}>
            <MaterialIcons name="chat" size={30} color="#4CAF50" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* AI Recycler Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>AI Recycler</Text>
            {prediction && (
              <Text style={styles.modalText}>
                Prediction: {JSON.stringify(prediction)}
              </Text>
            )}
            <Button title="Close" onPress={() => setShowModal(false)} />
          </View>
        </View>
      </Modal>

      {/* Scanner Options Modal */}
      <Modal
        visible={showScannerOptionsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowScannerOptionsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.scannerOptionsModalContent}>
            <Text style={styles.modalTitle}>Choose an Option</Text>
            <View style={styles.scannerOptionsButtons}>
              <TouchableOpacity
                style={styles.scannerOptionButton}
                onPress={pickImage}
              >
                <Text style={styles.scannerOptionText}>Pick an Image</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.scannerOptionButton}
                onPress={takePhoto}
              >
                <Text style={styles.scannerOptionText}>Take Photo</Text>
              </TouchableOpacity>
            </View>
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

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000", // Black background
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000',
    justifyContent: 'center',
    paddingLeft: 20,
    zIndex: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 30,
    color: "#FFFFFF", // White color
    fontFamily: "Poppins", // Use Poppins font
    marginRight: 5,
    marginLeft: 10,
  },
  horizontalLine: {
    borderBottomColor: "#4CAF50", // Green color
    borderBottomWidth: 1,
    width: "90%",
    marginTop: 10,
  },
  leafLogoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  leafLogo: {
    width: 35,
    height: 35,
  },
  scrollContainer: {
    paddingTop: 100, // Adjust based on header height
  },
  counterContainer: {
    paddingTop: 0,
    paddingLeft: 20,
    alignItems: "flex-start",
    paddingBottom: 10,
  },
  counterText: {
    fontSize: 20,
    color: "#4CAF50", // Green color
    fontFamily: "Poppins", // Use Poppins font
  },
  counterTextCounting: {
    color: "white",
    fontSize: 30,
  },
  dateText: {
    color: "#FFFFFF", // White color
    fontSize: 16,
    marginTop: 10,
  },
  scannerSection: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: "#ffffff", // White background for the scanner section
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  collapsibleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  collapsibleHeaderText: {
    fontSize: 18,
    color: "#4CAF50",
    fontWeight: 600,
  },
  scannerContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  scannerSpace: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4CAF50",
    borderRadius: 10,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  imageAddedContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  imageAddedText: {
    fontSize: 18,
    color: "#000000", // Black color
    marginRight: 10,
  },
  uploadButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 5,
  },
  uploadButtonText: {
    color: "#ffff",
    fontSize: 16,
    fontWeight: 500,
  },
  scannerOptionsModalContent: {
    width: "80%",
    fontFamily: "poppins",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  scannerOptionsButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  scannerOptionButton: {
    padding: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 5,
    width: "45%",
    alignItems: "center",
  },
  scannerOptionText: {
    paddingTop: 5,
    fontSize: 15,
    fontWeight: 500,
    color: "#000000", // Black color
    paddingBottom: 5,
  },
  cancelButton: {
    padding: 15,
    backgroundColor: "#000000",
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 18,
    color: "#ffffff", // White color
  },
  chatbotIconWrapper: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  chatbotIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  shopSection: {
    marginTop: 20,
    marginHorizontal: 10,
  },
  shopSectionTitle: {
    fontSize: 22,
    color: "white",
    fontFamily: "Poppins",
    marginBottom: 5,
  },
  horizontalLineShop: {
    borderBottomColor: "#4CAF50", // Green color
    borderBottomWidth: 1,
    width: "100%", // full width
    marginBottom: 15, // Space below the line
  },
  productGrid: {
    justifyContent: "center", // Center the grid
    paddingHorizontal: 10, // Add padding to the sides
  },
  productItem: {
    flex: 1, // Allow items to take equal space
    margin: 5, // Add margin between items
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    width: "48%", // Ensure 2 items fit in a row
  },
  productImage: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    color: "#000000",
    fontFamily: "Poppins",
    marginBottom: 5,
    textAlign: "center",
  },
  productPrice: {
    fontSize: 14,
    color: "#4CAF50",
    fontFamily: "Poppins",
    marginBottom: 10,
  },
  buyButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 5,
    padding: 5,
    width: "100%",
    alignItems: "center",
  },
  buyButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontFamily: "Poppins",
  },
});

export default UploadScreen;