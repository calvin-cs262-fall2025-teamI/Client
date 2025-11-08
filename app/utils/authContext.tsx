// app/utils/authContext.tsx
import { useRouter } from "expo-router";
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";



interface AuthState {
  isLoggedIn: boolean;
  role: "admin" | "user" | "";
  userId: string | null;
}

interface AuthContextType {
  authState: AuthState;
  ready: boolean; // true when AsyncStorage restore finished
  login: (params: { role: "admin" | "user" | ""; userId: string | null }) => Promise<void>;
  logout: () => Promise<void>;
}

const AUTH_KEY = "auth";

const defaultState: AuthState = { isLoggedIn: false, role: "", userId: null };

const AuthContext = createContext<AuthContextType>({
  authState: defaultState,
  ready: false,
  login: async () => {},
  logout: async () => {},
});

const storeAuthState = async (state: AuthState) => {
  try {
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to store auth state", e);
  }
};

const getAuthState = async (): Promise<AuthState> => {
  try {
    const json = await AsyncStorage.getItem(AUTH_KEY);
    if (!json) return defaultState;
    return JSON.parse(json) as AuthState;
  } catch (e) {
    console.warn("Failed to read auth state", e);
    return defaultState;
  }
};

export default function AuthProvider({ children }: PropsWithChildren<{}>) {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>(defaultState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const restored = await getAuthState();
      if (!mounted) return;
      setAuthState(restored);
      setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async ({ role, userId }: { role: "admin" | "user" | ""; userId: string | null }) => {
    const newState: AuthState = { isLoggedIn: true, role, userId };
    setAuthState(newState);
    await storeAuthState(newState);
    // navigate to protected root (or role-aware route)
    router.replace("/");
    console.log("Logged In, role:", role);
  };

  const logout = async () => {
    const newState: AuthState = { isLoggedIn: false, role: "", userId: null };
    setAuthState(newState);
    await storeAuthState(newState);
    router.replace("/signIn");
  };

  // Don't render children until we've restored auth state to avoid redirect flicker
  if (!ready) {
    return null; // or return a Loading component
  }

  return (
    <AuthContext.Provider value={{ authState, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}