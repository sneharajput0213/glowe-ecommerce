import { Navigate } from "react-router-dom";

export default function AdminRoute({
  children,
}) {
  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );

  if (!userInfo) {
    return <Navigate to="/" />;
  }

  if (!userInfo.isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
}