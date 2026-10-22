
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  let userInfo = null;

  try {
    const userInfoStr = localStorage.getItem("userInfo");
    userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
  } catch (error) {
    console.error("Invalid userInfo in localStorage:", error);
    localStorage.removeItem("userInfo");
  }

  if (!userInfo || userInfo.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
