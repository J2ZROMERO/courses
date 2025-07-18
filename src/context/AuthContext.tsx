// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// 1) Definimos la interfaz para el usuario
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  // añade aquí otros campos que guarde tu userData
}

// 2) Interfaz para el valor del contexto
export interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  userCan: (ability: string) => boolean;
  userIs: (role: string | string[]) => boolean;
}

// 3) Creamos el contexto con valor por defecto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 4) Props del provider
interface AuthProviderProps {
  children: ReactNode;
}

// 5) Provider que envuelve la app
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  // Cargar usuario de localStorage al iniciar
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const userCan = (ability: string) => Boolean(user && user.role === ability);

  const userIs = (role: string | string[]) => {
    if (!user) return false;
    if (Array.isArray(role)) return role.includes(user.role);
    return user.role === role;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, userCan, userIs }}>
      {children}
    </AuthContext.Provider>
  );
}

// 6) Hook para consumir el contexto
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
