// src/api/productApi.jsx
import axiosInstance from "../hooks/axiosInstance";

export const getProducts = (params = {}) =>
  axiosInstance.get("/products", { params });

export const searchProducts = (query) => {
  if (!query?.trim()) return Promise.resolve({ data: [] });
  return axiosInstance.get("/products/search", { params: { q: query.trim() } });
};

export const getProductById = (id) => axiosInstance.get(`/products/${id}`);
export const getRecommendations = (id) =>
  axiosInstance.get(`/products/${id}/recommendations`);
