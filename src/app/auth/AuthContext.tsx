/// <reference types="vite/client" />
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../../lib/firebase";

const ROLE_STORAGE_KEY = "userRole";
const LEGACY_ROLE_STORAGE_KEY = "nexarena-role";
const ASSIGNED_EVENTS_STORAGE_KEY = "nexarena-assigned-events";

const getStoredRole = (): "fan" | "host" => {
  const savedRole = localStorage.getItem(ROLE_STORAGE_KEY) ?? localStorage.getItem(LEGACY_ROLE_STORAGE_KEY);
  return savedRole === "host" ? "host" : "fan";
};

const getStoredAssignedEvents = (): string[] => {
  try {
    const savedEvents = localStorage.getItem(ASSIGNED_EVENTS_STORAGE_KEY);
    return savedEvents ? JSON.parse(savedEvents) : [];
  } catch {
    return [];
  }
};

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  role: "fan" | "host";
  setRole: (role: "fan" | "host") => void;
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
  const [role, setRoleState] = useState<"fan" | "host">(() => getStoredRole());
  const [assignedEvents, setAssignedEvents] = useState<string[]>(() => getStoredAssignedEvents());

  const setRole = (nextRole: "fan" | "host") => {
    setRoleState(nextRole);
    localStorage.setItem(ROLE_STORAGE_KEY, nextRole);
    localStorage.setItem(LEGACY_ROLE_STORAGE_KEY, nextRole);
  };

  const refreshUserRole = async (targetUser: User | null = currentUser, initialRole?: string): Promise<"fan" | "host"> => {
    if (!targetUser) {
      setRoleState("fan");
      setAssignedEvents([]);
      return "fan";
    }

    const nextRole: "fan" | "host" = initialRole === "host" ? "host" : getStoredRole();
    setRole(nextRole);
    setAssignedEvents(getStoredAssignedEvents());
    return nextRole;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        await refreshUserRole(user);
      } else {
        setRoleState("fan");
        setAssignedEvents([]);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
    localStorage.removeItem("userEmail");
    localStorage.removeItem(ROLE_STORAGE_KEY);
    localStorage.removeItem(LEGACY_ROLE_STORAGE_KEY);
    localStorage.removeItem(ASSIGNED_EVENTS_STORAGE_KEY);
    setRoleState("fan");
    setAssignedEvents([]);
  };

  const value = {
    currentUser,
    loading,
    role,
    setRole,
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
