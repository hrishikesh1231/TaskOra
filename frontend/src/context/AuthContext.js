import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // ✅ Check localStorage for logged-in user
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Get logged-in user on mount (for session persistence)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:3002/current-user", {
          withCredentials: true,
        });
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } catch (err) {
        setUser(null);
        localStorage.removeItem("user");
      }
    };
    fetchUser();
  }, []);

  // Logout Function
  const logout = async () => {
    try {
      await axios.get("http://localhost:3002/logout", { withCredentials: true });
      setUser(null);
      localStorage.removeItem("user");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
