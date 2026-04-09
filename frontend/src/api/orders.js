import API from "./axios";

export const createOrder    = (data)       => API.post("/orders/create", data);
export const verifyPayment  = (data)       => API.post("/orders/verify", data);
export const getMyOrders    = (params)     => API.get("/orders/my-orders", { params });
export const getOrderById   = (id)         => API.get(`/orders/${id}`);
export const getOrderStats  = ()           => API.get("/orders/admin/stats");
export const getAllOrders    = (params)     => API.get("/orders", { params });
export const updateOrderStatus = (id, data)=> API.put(`/orders/${id}/status`, data);
export const getInvoice     = (id)         => `/api/orders/${id}/invoice`;