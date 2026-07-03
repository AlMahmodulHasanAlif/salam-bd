// src/hooks/useRole.jsx
import { useState, useEffect } from "react";
import useAuth from "./useAuth";
import { getUserRole } from "../api/userApi";

const useRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState("user");
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) {
      setRoleLoading(false);
      return;
    }

    const fetchRole = async () => {
      try {
        setRoleLoading(true);
        const res = await getUserRole(user.email);
        setRole(res.data?.role || "user");
      } catch (error) {
        console.error("Failed to fetch role:", error);
        setRole("user");
      } finally {
        setRoleLoading(false);
      }
    };

    fetchRole();
  }, [user?.email]);

  return { role, roleLoading };
};

export default useRole;