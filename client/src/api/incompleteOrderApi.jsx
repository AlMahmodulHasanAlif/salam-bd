// src/api/incompleteOrderApi.jsx
//
// Admin-side reads/writes for abandoned order forms. All admin — pass
// axiosSecure. The public *save* path lives in hooks/useIncompleteOrder.jsx,
// which posts directly so it can also use sendBeacon on page-hide.

export const getIncompleteOrders = (axiosSecure, opts = {}) => {
  const { status, source, search, page, limit } = opts;

  const params = {};
  if (status && status !== "all") params.status = status;
  if (source && source !== "all") params.source = source;
  if (search) params.search = search;
  if (page) params.page = page;
  if (limit) params.limit = limit;

  return axiosSecure.get("/incomplete-orders", { params });
};

export const getIncompleteOrderStats = (axiosSecure) =>
  axiosSecure.get("/incomplete-orders/stats");

export const updateIncompleteOrderStatus = (axiosSecure, id, status) =>
  axiosSecure.patch(`/incomplete-orders/${id}/status`, { status });

export const deleteIncompleteOrder = (axiosSecure, id) =>
  axiosSecure.delete(`/incomplete-orders/${id}`);

// DELETE carries a body, so it goes under axios's `data` key.
export const bulkDeleteIncompleteOrders = (axiosSecure, ids) =>
  axiosSecure.delete("/incomplete-orders/bulk", { data: { ids } });
