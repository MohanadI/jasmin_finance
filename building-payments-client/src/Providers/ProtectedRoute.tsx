import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const ProtectedRoute = ({ element }:any) => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? element : <Navigate to="/admin" />;
};

export default ProtectedRoute;
