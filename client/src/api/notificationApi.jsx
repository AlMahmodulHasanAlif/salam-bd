// src/api/notificationApi.jsx
// ADMIN — unseen new-order counts for the sidebar badges.

export const getNotificationCounts = (axiosSecure) =>
  axiosSecure.get("/admin/notifications");

// Omit `section` to clear both counters at once.
export const markNotificationsSeen = (axiosSecure, section) =>
  axiosSecure.post("/admin/notifications/seen", section ? { section } : {});
