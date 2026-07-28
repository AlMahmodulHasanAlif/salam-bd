// src/api/userApi.jsx
import axiosInstance from "../hooks/axiosInstance.jsx";

export const syncUser = (userData) => axiosInstance.post("/users", userData);

export const getUserByEmail = (email) => axiosInstance.get(`/users/${email}`);

export const getUserRole = (email) => axiosInstance.get(`/users/${email}/role`);

// Reading a full user doc (PII) requires auth — pass axiosSecure.
export const getMyProfile = (axiosSecure, email) =>
  axiosSecure.get(`/users/${email}`);

// Update the signed-in user's own profile fields (name, photoURL,
// shippingAddress, …). Server whitelists allowed keys. Pass axiosSecure.
export const updateMyProfile = (axiosSecure, email, payload) =>
  axiosSecure.patch(`/users/${email}`, payload);

// Upload a profile avatar (any signed-in user). Returns { url, publicId }.
export const uploadAvatar = (axiosSecure, file) => {
  const fd = new FormData();
  fd.append("image", file);
  return axiosSecure.post("/upload/avatar", fd);
};
