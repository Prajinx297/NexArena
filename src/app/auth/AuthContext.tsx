/// <reference types="vite/client" />
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  role: "fan" | "host" | null;
  assignedEvents: string[];
  refreshUserRole: (user?: User | null, initialRole?: string) => Promise<"fan" | "host">;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  return useContext(AuthContext);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"fan" | "host" | null>(null);
  const [assignedEvents, setAssignedEvents] = useState<string[]>([]);

  const refreshUserRole = async (targetUser: User | null = currentUser, initialRole?: string): Promise<"fan" | "host"> => {
    if (!targetUser) {
      setRole(null);
      setAssignedEvents([]);
      return "fan";
    }

    try {
      const token = await targetUser.getIdToken(true);
      const response = await axios.get(`${API_BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
        params: initialRole ? { role: initialRole } : {},
      });
      const nextRole = response.data.role === "host" ? "host" : "fan";
      setRole(nextRole);
      setAssignedEvents(Array.isArray(response.data.assignedEvents) ? response.data.assignedEvents : []);
      localStorage.setItem("nexarena-role", nextRole);
      localStorage.setItem("nexarena-assigned-events", JSON.stringify(Array.isArray(response.data.assignedEvents) ? response.data.assignedEvents : []));
      return nextRole;
    } catch (err) {
      console.warn("Backend /me call failed, using fallback role:", err);
      // Fallback to local state / provided role
      const fallbackRole: "fan" | "host" = initialRole === "host" 
        ? "host" 
        : (localStorage.getItem("nexarena-role") === "host" ? "host" : "fan");
      
      setRole(fallbackRole);
      localStorage.setItem("nexarena-role", fallbackRole);
      return fallbackRole;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          await refreshUserRole(user);
        } catch {
          const cachedRole = localStorage.getItem("nexarena-role");
          const cachedEvents = localStorage.getItem("nexarena-assigned-events");
          setRole(cachedRole === "host" ? "host" : "fan");
          try {
            setAssignedEvents(cachedEvents ? JSON.parse(cachedEvents) : []);
          } catch {
            setAssignedEvents([]);
          }
        }
      } else {
        setRole(null);
        setAssignedEvents([]);
        localStorage.removeItem("nexarena-role");
        localStorage.removeItem("nexarena-assigned-events");
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
    localStorage.removeItem("userEmail");
    localStorage.removeItem("nexarena-role");
    localStorage.removeItem("nexarena-assigned-events");
  };

  const value = {
    currentUser,
    loading,
    role,
    assignedEvents,
    refreshUserRole,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
