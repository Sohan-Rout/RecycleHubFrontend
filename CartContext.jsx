import React, { createContext, useState } from "react";

// Create the Cart Context
export const CartContext = createContext();

// Create the Cart Provider component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]); // Single source of truth for cart items

  // Function to add an item to the cart
  const addToCart = (item) => {
    setCartItems((prev) => {
      const existingItem = prev.find((cartItem) => cartItem._id === item._id);
      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: (cartItem.quantity || 0) + 1 }
            : cartItem
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  // Function to update the quantity of an item in the cart
  const updateQuantity = (item, delta) => {
    setCartItems((prev) => {
      const currentItem = prev.find((cartItem) => cartItem._id === item._id);
      const newQuantity = (currentItem?.quantity || 0) + delta;

      if (newQuantity <= 0) {
        // Remove the item if quantity becomes 0 or negative
        return prev.filter((cartItem) => cartItem._id !== item._id);
      } else {
        // Update the item's quantity
        return prev.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        );
      }
    });
  };

  // Function to remove an item from the cart
  const removeItem = (item) => {
    console.log("Removing item with _id:", item._id); // Debug log
    setCartItems((prev) => prev.filter((cartItem) => cartItem._id !== item._id));
  };

  // Derive quantities from cartItems for compatibility with HomeScreen
  const quantities = cartItems.reduce((acc, item) => {
    acc[item._id] = item.quantity || 0;
    return acc;
  }, {});

  // Value to be provided by the context
  const value = {
    cartItems,
    quantities, // Kept for HomeScreen compatibility
    addToCart,
    updateQuantity,
    removeItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartProvider;