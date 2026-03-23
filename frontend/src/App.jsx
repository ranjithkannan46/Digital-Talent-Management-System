import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth           from "./pages/Auth";
import Dashboard      from "./pages/Dashboard";
import Tasks          from "./pages/Tasks";
import Profile        from "./pages/Profile";
import Layout         from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

const Protected = ({ children }) => (
  <ProtectedRoute>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/"          element={<Auth />} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/tasks"     element={<Protected><Tasks /></Protected>} />
      <Route path="/profile"   element={<Protected><Profile /></Protected>} />
      <Route path="*"          element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;