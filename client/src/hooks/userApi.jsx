import axiosInstance from "../hooks/axiosInstance";

export const syncUser = (userData) => axiosInstance.post("/users", userData);
export const getUserByEmail = (email) => axiosInstance.get(`/users/${email}`);
export const getUserRole = (email) => axiosInstance.get(`/users/${email}/role`);
