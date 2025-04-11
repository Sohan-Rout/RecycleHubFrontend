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
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const [fontsLoaded] = useFonts({
    Poppins: Poppins_400Regular,
    PoppinsSemiBold: Poppins_600SemiBold,
    PoppinsBold: Poppins_700Bold,
  });

  const handleEstimate = async () => {
    if (!distance || isNaN(Number(distance)) || Number(distance) <= 0) {
      setError('Please enter a valid distance');
      return;
    }
    if (!make.trim()) {
      setError('Please enter a vehicle make');
      return;
    }
    if (!model.trim()) {
      setError('Please enter a vehicle model');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await axios.post('https://recyclehub-production.up.railway.app/api/carbon', {
        cluster_name: 'VE-Oct-2022',
        distance_unit: 'km',
        distance_value: Number(distance),
        vehicle_make: make,
        vehicle_model: model,
      });

      setResult(res.data.data);
    } catch (err) {
      console.log(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carbon Emission</Text>

      <View style={styles.inputContainer}>
        <MaterialIcons name="directions-car" size={20} color="#6B7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Vehicle Make"
          placeholderTextColor="#6B7280"
          value={make}
          onChangeText={setMake}
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons name="directions-car-filled" size={20} color="#6B7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Vehicle Model"
          placeholderTextColor="#6B7280"
          value={model}
          onChangeText={setModel}
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons name="speed" size={20} color="#6B7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Distance in KM"
          placeholderTextColor="#6B7280"
          keyboardType="numeric"
          value={distance}
          onChangeText={setDistance}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleEstimate} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Estimating...' : 'Estimate'}</Text>
      </TouchableOpacity>

      {error && <Text style={styles.error}>{error}</Text>}

      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>CO2 Emission:</Text>
          <Text style={styles.resultValue}>{result.co2e_kg} KG CO2</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
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
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#10B981',
    paddingHorizontal: 12,
    marginBottom: 15,
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
  button: {
    backgroundColor: '#10B981',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    elevation: 3,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'PoppinsBold',
  },
  error: {
    fontSize: 14,
    color: '#EF4444',
    fontFamily: 'PoppinsSemiBold',
    marginTop: 15,
    textAlign: 'center',
  },
  resultContainer: {
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