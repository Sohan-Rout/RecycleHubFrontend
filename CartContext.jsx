import React, { createContext, useState } from "react";

// Create the Cart Context
export const CartContext = createContext();

// Create the Cart Provider component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]); // Global state for cart items
  const [quantities, setQuantities] = useState({}); // Global state for item quantities

  // Function to add an item to the cart
  const addToCart = (item) => {
    setCartItems((prev) => {
      const existingItem = prev.find((cartItem) => cartItem._id === item._id); // Use _id for identification
      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  
    setQuantities((prev) => ({
      ...prev,
      [item._id]: (prev[item._id] || 0) + 1, // Use _id for quantities
    }));
  };

  // Function to update the quantity of an item in the cart
  const updateQuantity = (item, delta) => {
    const newQuantity = (quantities[item.id] || 0) + delta;

    if (newQuantity >= 0) {
      // Update the quantities state
      setQuantities((prev) => ({
        ...prev,
        [item.id]: newQuantity,
      }));

      // Update the cartItems state
      setCartItems((prev) => {
        if (newQuantity === 0) {
          // If the quantity is 0, remove the item from the cart
          return prev.filter((cartItem) => cartItem.id !== item.id);
        } else {
          // Otherwise, update the item's quantity
          return prev.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: newQuantity }
              : cartItem
          );
        }
      });
    }
  };

  // Function to remove an item from the cart
  const removeItem = (itemId) => {
    setCartItems((prev) => prev.filter((cartItem) => cartItem.id !== itemId));
    setQuantities((prev) => {
      const newQuantities = { ...prev };
      delete newQuantities[itemId]; // Remove the item from quantities
      return newQuantities;
    });
  };

  // Value to be provided by the context
  const value = {
    cartItems,
    quantities,
    addToCart,
    updateQuantity,
    removeItem, // Include the removeItem function
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};