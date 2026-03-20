import { Navigate } from "react-router-dom";

// Simple guard — redirect to login if no token in storage
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("talent_token");
  return token ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
