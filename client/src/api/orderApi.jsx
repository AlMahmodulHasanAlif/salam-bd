// src/api/orderApi.jsx
import axiosInstance from "../hooks/axiosInstance";

// PUBLIC — guests and users
export const placeOrder = (orderData) =>
  axiosInstance.post("/orders", orderData);

// PROTECTED — logged-in users only (pass axiosSecure)
export const getUserOrders = (axiosSecure, email) =>
  axiosSecure.get(`/orders/user/${email}`);

export const getOrderById = (axiosSecure, orderId) =>
  axiosSecure.get(`/orders/${orderId}`);

// ADMIN
export const getAllOrders = (axiosSecure, status = "all") =>
  axiosSecure.get("/admin/orders", {
    params: status !== "all" ? { status } : {},
  });

export const updateOrderStatus = (axiosSecure, orderId, status) =>
  axiosSecure.patch(`/admin/orders/${orderId}/status`, { status });

export const getAllUsers = (axiosSecure, searchText = "") =>
  axiosSecure.get("/admin/users", { params: searchText ? { searchText } : {} });

export const updateUserRole = (axiosSecure, email, role) =>
  axiosSecure.patch(`/admin/users/${email}/role`, { role });

export const deleteAdminUser = (axiosSecure, email) =>
  axiosSecure.delete(`/admin/users/${email}`);
