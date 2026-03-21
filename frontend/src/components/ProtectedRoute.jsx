import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("dtms_token");
  return token ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;