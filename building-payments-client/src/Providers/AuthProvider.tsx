import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  loginCallback: () => void;
  logoutCallback: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const token = localStorage.getItem("token");
  const [isAuthenticated, setIsAuthenticated] = useState(token ? true : false);

  
  const loginCallback = () => setIsAuthenticated(true);
  const logoutCallback = () => setIsAuthenticated(false);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, loginCallback, logoutCallback }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
