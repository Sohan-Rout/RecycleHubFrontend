import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, Dimensions, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";

const API_BASE_URL = "https://recyclehub-production.up.railway.app/api";

const RecyclePointScreen = ({ navigation }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [recyclePoints, setRecyclePoints] = useState([]);
  const [nearestPoint, setNearestPoint] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied.");
        return;
      }
  
      let location = await Location.getCurrentPositionAsync({});
      if (!location || !location.coords) {
        setErrorMsg("Failed to fetch location. Try again.");
        return;
      }
  
      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });
  
      try {
        const response = await axios.get(`${API_BASE_URL}/recycle-points`, {
          params: { lat: latitude, lng: longitude },
        });
        setRecyclePoints(response.data);
        const nearest = findNearestRecyclePoint({ latitude, longitude }, response.data);
        setNearestPoint(nearest);
      } catch (error) {
        setErrorMsg("Failed to load recycle points. Please try again.");
      }
    })();
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const findNearestRecyclePoint = (userCoords, points) => {
    if (!points || points.length === 0) return null;
    return points.reduce((closest, point) => {
      const distance = calculateDistance(userCoords.latitude, userCoords.longitude, point.latitude, point.longitude);
      return distance < closest.distance ? { ...point, distance } : closest;
    }, { distance: Infinity });
  };

  const openMaps = (latitude, longitude) => {
    const url = Platform.select({
      ios: `maps://?daddr=${latitude},${longitude}&dirflg=d`,
      android: `google.navigation:q=${latitude},${longitude}`,
    });
    Linking.openURL(url).catch(() => Alert.alert("Error", "Unable to open maps for navigation."));
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#10B981", "#059669"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nearby Recycle Points</Text>
          <View style={{ width: 24 }} /> {/* Spacer for symmetry */}
        </View>
      </LinearGradient>

      {errorMsg ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : !userLocation ? (
        <View style={styles.loadingContainer}>
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
                onPress={() => openMaps(point.latitude, point.longitude)}
              />
            ))}
          </MapView>

          <View style={styles.infoContainer}>
            {nearestPoint ? (
              <>
                <Text style={styles.infoText}>
                  Nearest: {nearestPoint.name} ({nearestPoint.distance.toFixed(2)} km)
                </Text>
                <TouchableOpacity
                  style={styles.navigateButton}
                  onPress={() => openMaps(nearestPoint.latitude, nearestPoint.longitude)}
                >
                  <Text style={styles.navigateButtonText}>Start Navigation</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.infoText}>No nearby recycle points found.</Text>
            )}
          </View>
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
    paddingTop: 50, // Original header padding
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
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    justifyContent: "flex-end", // Push infoContainer to the bottom
  },
  map: {
    width: Dimensions.get("window").width,
    height: "70%", // Map takes 70% of the screen height
  },
  infoContainer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    height: "30%", // Info section takes 30% of the screen height
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  infoText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 15, // Space between text and button
  },
  navigateButton: {
    backgroundColor: "#10B981",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 40,
    elevation: 2,
  },
  navigateButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
});

export default RecyclePointScreen;