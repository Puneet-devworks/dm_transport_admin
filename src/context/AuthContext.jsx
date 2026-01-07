import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { checkTokenRoute } from "../utils/apiRoutes";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  // Validate token function
  const validateToken = useCallback(async (authToken) => {
    if (!authToken) {
      setIsTokenValid(false);
      return false;
    }

    try {
      const res = await fetch(checkTokenRoute, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await res.json();

      if (res.ok && data.valid !== false) {
        setIsTokenValid(true);
        return true;
      } else {
        // Token is invalid or expired
        setIsTokenValid(false);
        // Clear invalid token
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        setToken(null);
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error("Token validation error:", error);
      setIsTokenValid(false);
      return false;
    }
  }, []);

  // Initialize auth state from localStorage and validate token
  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem("adminUser");
      const savedToken = localStorage.getItem("adminToken");

      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error("Error parsing user data:", error);
          setUser(null);
        }
      }

      if (savedToken) {
        setToken(savedToken);
        // Validate token on mount
        await validateToken(savedToken);
      } else {
        setIsTokenValid(false);
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, [validateToken]);

  // Periodically validate token (every 5 minutes)
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(async () => {
      await validateToken(token);
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [token, validateToken]);

  // Login function
  const login = async (userData, authToken) => {
    localStorage.setItem("adminToken", authToken);
    localStorage.setItem("adminUser", JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
    // Validate the new token
    await validateToken(authToken);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setToken(null);
    setUser(null);
    setIsTokenValid(false);
  };

  // Manual token validation function
  const checkToken = useCallback(async () => {
    if (token) {
      return await validateToken(token);
    }
    return false;
  }, [token, validateToken]);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && isTokenValid,
    isTokenValid,
    login,
    logout,
    checkToken,
    validateToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

