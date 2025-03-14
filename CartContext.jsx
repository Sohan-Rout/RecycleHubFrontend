import React, { createContext, useState } from "react";

// Create the Cart Context
export const CartContext = createContext();

// Create the Cart Provider component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]); // Global state for cart items
  const [quantities, setQuantities] = useState({}); // Global state for item quantities

  // Function to add an item to the cart
  const addToCart = (item) => {
    setQuantities((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1,
    }));
    setCartItems((prev) => {
      const existingItem = prev.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  // Function to update the quantity of an item in the cart
  const updateQuantity = (item, delta) => {
    const newQuantity = (quantities[item.id] || 0) + delta;
    if (newQuantity >= 0) {
      setQuantities((prev) => ({
        ...prev,
        [item.id]: newQuantity,
      }));
      setCartItems((prev) => {
        if (newQuantity === 0) {
          return prev.filter((cartItem) => cartItem.id !== item.id);
        }
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        );
      });
    }
  };

  // Value to be provided by the context
  const value = {
    cartItems, // Ensure this is included
    quantities, // Ensure this is included
    addToCart,
    updateQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};