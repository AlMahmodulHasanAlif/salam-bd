import axiosInstance from "../hooks/axiosInstance";

// PUBLIC API (guest + user)
export const getCart = (userEmail) =>
  axiosInstance.get(`/cart/${userEmail}`);

export const addToCart = (cartItem) =>
  axiosInstance.post("/cart", cartItem);

export const updateCartItem = (cartItemId, quantity) =>
  axiosInstance.patch(`/cart/${cartItemId}`, { quantity });

export const removeCartItem = (cartItemId) =>
  axiosInstance.delete(`/cart/${cartItemId}`);

export const clearCart = (userEmail) =>
  axiosInstance.delete(`/cart/clear/${userEmail}`);


