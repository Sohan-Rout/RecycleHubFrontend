import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, Dimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";

const RecyclePointScreen = ({ navigation }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [recyclePoints, setRecyclePoints] = useState([]);
  const [nearestPoint, setNearestPoint] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied.");
        return;
      }

      // Get user's current location
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });

      // Fetch recycle points from the server
      try {
        const response = await axios.get("https://recyclehub.onrender.com/api/recycle-points", {
          params: { lat: latitude, lng: longitude },
        });
        const points = response.data;
        if (points.length === 0) {
          setErrorMsg("No recycle points found.");
          return;
        }
        setRecyclePoints(points);

        // Find the nearest recycle point
        const nearest = findNearestRecyclePoint({ latitude, longitude }, points);
        setNearestPoint(nearest);
      } catch (error) {
        console.error("❌ Failed to fetch recycle points:", error);
        setErrorMsg("Failed to load recycle points. Please try again.");
      }
    })();
  }, []);

  // Function to calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Find the nearest recycle point
  const findNearestRecyclePoint = (userCoords, points) => {
    if (!points || points.length === 0) return null;
    return points.reduce((closest, point) => {
      const distance = calculateDistance(userCoords.latitude, userCoords.longitude, point.latitude, point.longitude);
      return distance < closest.distance ? { ...point, distance } : closest;
    }, { distance: Infinity });
  };

  // Start navigation to the nearest recycle point
  const startNavigation = () => {
    if (!nearestPoint) {
      Alert.alert("Error", "No recycle point selected yet.");
      return;
    }

    const url = Platform.select({
      ios: `maps://?daddr=${nearestPoint.latitude},${nearestPoint.longitude}&dirflg=d`,
      android: `google.navigation:q=${nearestPoint.latitude},${nearestPoint.longitude}`,
    });

    Linking.openURL(url).catch((err) => {
      Alert.alert("Error", "Unable to open maps for navigation.");
      console.error("Navigation error:", err);
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#10B981", "#059669"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nearby Recycle Points</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      {errorMsg ? (
        <View style={styles.content}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : !userLocation ? (
        <View style={styles.content}>
          <Text style={styles.placeholderText}>Loading your location...</Text>
        </View>
      ) : (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            showsUserLocation={true}
          >
            {recyclePoints.map((point) => (
              <Marker
                key={point.id}
                coordinate={{ latitude: point.latitude, longitude: point.longitude }}
                title={point.name}
                pinColor={point.id === nearestPoint?.id ? "#EF4444" : "#10B981"}
              />
            ))}
          </MapView>

          {nearestPoint ? (
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                Nearest: {nearestPoint.name} ({nearestPoint.distance.toFixed(2)} km)
              </Text>
              <TouchableOpacity style={styles.navigateButton} onPress={startNavigation}>
                <Text style={styles.navigateButtonText}>Start Navigation</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>No nearby recycle points found.</Text>
            </View>
          )}
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
    paddingTop: 50,
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
  mapContainer: {
    flex: 1,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height - 150,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: "#6B7280",
    fontFamily: "Poppins",
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    fontFamily: "Poppins",
    textAlign: "center",
  },
  infoContainer: {
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E7EF",
    alignItems: "center",
  },
  infoText: {
    fontSize: 16,
    color: "#111827",
    fontFamily: "PoppinsSemiBold",
    marginBottom: 10,
  },
  navigateButton: {
    backgroundColor: "#10B981",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  navigateButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "PoppinsBold",
  },
});

export default RecyclePointScreen;