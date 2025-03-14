import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { CartProvider } from "./CartContext"; // Import the CartProvider
import HomeScreen from "./HomeScreen"; // Import the HomeScreen
import CartScreen from "./CartScreen"; // Import the CartScreen

// Create the stack navigator
const Stack = createStackNavigator();

const App = () => {
  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CartScreen"
            component={CartScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
};

export default App;