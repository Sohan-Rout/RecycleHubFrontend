import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';

const CarbonEstimate = () => {
  const [distance, setDistance] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const [fontsLoaded] = useFonts({
    Poppins: Poppins_400Regular,
    PoppinsSemiBold: Poppins_600SemiBold,
    PoppinsBold: Poppins_700Bold,
  });

  const handleEstimate = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await axios.post('https://recyclehub-production.up.railway.app/api/carbon', {
        cluster_name: 'VE-Oct-2022',
        vehicle_type: 'Car-Type-Supermini',
        fuel_type: 'petrol',
        distance_value: Number(distance),
        distance_unit: 'km',
        include_wtt: 'N',
      });

      setResult(res.data.data);
    } catch (err) {
      console.log(err);
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carbon Emission Estimator</Text>

      <View style={styles.inputContainer}>
        <MaterialIcons name="directions-car" size={20} color="#6B7280" style={styles.inputIcon} />
        <TextInput
          placeholder="Enter Distance (km)"
          placeholderTextColor="#6B7280"
          value={distance}
          onChangeText={setDistance}
          keyboardType="numeric"
          style={styles.input}
        />
      </View>

      <TouchableOpacity style={styles.estimateButton} onPress={handleEstimate}>
        <Text style={styles.estimateButtonText}>Estimate</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#10B981" style={styles.loader} />}

      {error && <Text style={styles.error}>{error}</Text>}

      {result && (
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Estimated CO2 Emission:</Text>
          <Text style={styles.resultValue}>{result.co2e_kg} KG CO2</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    elevation: 5,
    minHeight: 300, // Matches scannerContainer in HomeScreen
  },
  title: {
    fontSize: 20,
    color: '#111827',
    fontFamily: 'PoppinsBold',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#10B981',
    paddingHorizontal: 12,
    marginBottom: 20,
    width: '100%',
    elevation: 3,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Poppins',
    paddingVertical: 10,
  },
  estimateButton: {
    backgroundColor: '#10B981',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    elevation: 3,
  },
  estimateButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'PoppinsBold',
  },
  loader: {
    marginVertical: 20,
  },
  error: {
    fontSize: 14,
    color: '#EF4444',
    fontFamily: 'PoppinsSemiBold',
    marginTop: 10,
    textAlign: 'center',
  },
  resultBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    elevation: 2,
  },
  resultLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Poppins',
    marginBottom: 5,
  },
  resultValue: {
    fontSize: 18,
    color: '#10B981',
    fontFamily: 'PoppinsBold',
  },
});

export default CarbonEstimate;