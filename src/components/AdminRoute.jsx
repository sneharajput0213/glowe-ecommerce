import { Navigate } from "react-router-dom";

export default function AdminRoute({
  children,
}) {
  const userInfoStr = localStorage.getItem("userInfo");
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

  if (!userInfo) {
    return <Navigate to="/" />;
  }

  if (!userInfo.isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
}