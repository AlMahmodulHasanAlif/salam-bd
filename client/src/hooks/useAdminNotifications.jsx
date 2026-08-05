// src/hooks/useAdminNotifications.jsx
//
// Polls the admin new-order counts and shares them across the panel, so that
// marking a section seen on the Orders page instantly clears the sidebar badge
// without waiting for the next poll.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import useAxiosSecure from "./useAxios";
import {
  getNotificationCounts,
  markNotificationsSeen,
} from "../api/notificationApi";

const POLL_MS = 30_000;

// Sections the sidebar can badge. Keep in sync with SECTIONS in the backend's
// notificationController.
const SECTIONS = ["orders", "pluginOrders", "incompleteOrders", "codingOrders"];
const EMPTY = Object.fromEntries([...SECTIONS.map((s) => [s, 0]), ["total", 0]]);

const AdminNotificationsContext = createContext({
  counts: EMPTY,
  refresh: () => {},
  markSeen: () => {},
});

export const AdminNotificationsProvider = ({ children }) => {
  const axiosSecure = useAxiosSecure();
  const [counts, setCounts] = useState(EMPTY);

  // Kept in a ref so the polling effect never re-subscribes when the instance
  // identity changes, which would restart the interval on every render.
  const axiosRef = useRef(axiosSecure);
  axiosRef.current = axiosSecure;

  const refresh = useCallback(async () => {
    try {
      const { data } = await getNotificationCounts(axiosRef.current);
      setCounts({
        ...Object.fromEntries(SECTIONS.map((s) => [s, data?.[s] || 0])),
        total: data?.total || 0,
      });
    } catch {
      // Silent: a failed badge poll must never disrupt the admin panel.
    }
  }, []);

  // Clears a section's badge optimistically, then confirms with the server.
  const markSeen = useCallback(
    async (section) => {
      setCounts((prev) => {
        if (!section) return EMPTY;
        const next = { ...prev, [section]: 0 };
        return {
          ...next,
          total: SECTIONS.reduce((sum, s) => sum + (next[s] || 0), 0),
        };
      });

      try {
        await markNotificationsSeen(axiosRef.current, section);
      } catch {
        refresh(); // roll back to server truth if the write failed
      }
    },
    [refresh],
  );

  useEffect(() => {
    refresh();
    const id = setInterval(() => {
      // Don't poll a backgrounded tab — it just burns requests.
      if (document.visibilityState === "visible") refresh();
    }, POLL_MS);

    // Catch up immediately when the admin returns to the tab.
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  return (
    <AdminNotificationsContext.Provider value={{ counts, refresh, markSeen }}>
      {children}
    </AdminNotificationsContext.Provider>
  );
};

const useAdminNotifications = () => useContext(AdminNotificationsContext);

export default useAdminNotifications;
