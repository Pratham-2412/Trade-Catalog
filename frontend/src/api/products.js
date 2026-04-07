import API from "./axios";

export const fetchProducts = (params) =>
  API.get("/products", { params });

export const fetchProductById = (id) =>
  API.get(`/products/${id}`);

export const createProduct = (data) =>
  API.post("/products", data);

export const updateProduct = (id, data) =>
  API.put(`/products/${id}`, data);

export const deleteProduct = (id) =>
  API.delete(`/products/${id}`);

export const fetchCategories = () =>
  API.get("/categories");

export const createInquiry = (productId, data) =>
  API.post(`/inquiries/products/${productId}`, data);

export const fetchInquiries = (params) =>
  API.get("/inquiries", { params });

export const updateInquiryStatus = (id, status) =>
  API.put(`/inquiries/${id}/status`, { status });

export const deleteInquiry = (id) =>
  API.delete(`/inquiries/${id}`);