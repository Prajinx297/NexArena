import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../../lib/firebase";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  role: "fan" | "host" | null;
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // In a full implementation, you'd fetch the user's role from Firestore here.
        // For now, we simulate role based on email context or a simple default.
        if (user.email?.includes("admin") || user.email?.includes("host")) {
          setRole("host");
        } else {
          setRole("fan");
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
    localStorage.removeItem("userEmail");
  };

  const value = {
    currentUser,
    loading,
    role,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
