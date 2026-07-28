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

// Steadfast courier — send a single order to the courier (admin only)
export const sendOrderToSteadfast = (axiosSecure, orderId, force = false) =>
  axiosSecure.post(`/admin/orders/${orderId}/steadfast`, { force });

// Steadfast courier — send many selected orders at once (admin only)
export const bulkSendToSteadfast = (axiosSecure, ids, force = false) =>
  axiosSecure.post(`/admin/orders/steadfast/send`, { ids, force });

// Block an order's IP / phone / email (admin only)
// payload: { type: "ip" | "phone" | "email", value, reason? }
export const blockEntity = (axiosSecure, payload) =>
  axiosSecure.post("/admin/blocks", payload);

// Lift a block (admin only) — payload: { type, value }
// DELETE carries a body, so it goes under axios's `data` key.
export const unblockEntity = (axiosSecure, payload) =>
  axiosSecure.delete("/admin/blocks", { data: payload });

export const getAllUsers = (axiosSecure, searchText = "") =>
  axiosSecure.get("/admin/users", { params: searchText ? { searchText } : {} });

export const updateUserRole = (axiosSecure, email, role) =>
  axiosSecure.patch(`/admin/users/${email}/role`, { role });

export const deleteAdminUser = (axiosSecure, email) =>
  axiosSecure.delete(`/admin/users/${email}`);
