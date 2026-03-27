import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [ready, setReady] = useState(false);
  const hasToken = !!localStorage.getItem("dtms_token");

  useEffect(() => {
    // Wait one frame for all module-level styles to inject before rendering
    const t = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(t);
  }, []);

  if (!hasToken) return <Navigate to="/" replace />;

  // Show dark background while styles load - prevents white/green flash
  if (!ready) return (
    <div style={{
      minHeight: "100vh",
      background: "#0c0f1a",
      display: "flex"
    }}/>
  );

  return children;
}