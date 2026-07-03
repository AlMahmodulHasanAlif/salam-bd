// src/api/userApi.jsx
import axiosInstance from "../hooks/axiosInstance.jsx";

export const syncUser = (userData) => axiosInstance.post("/users", userData);

export const getUserByEmail = (email) => axiosInstance.get(`/users/${email}`);

export const getUserRole = (email) => axiosInstance.get(`/users/${email}/role`);
