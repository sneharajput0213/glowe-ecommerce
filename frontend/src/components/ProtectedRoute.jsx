
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  let userInfo = null;

  try {
    const userInfoStr = localStorage.getItem("userInfo");
    userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

    if (
      !userInfo ||
      typeof userInfo !== "object" ||
      !userInfo.role
    ) {
      userInfo = null;
    }
  } catch (error) {
    console.error("Invalid user information:", error);
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
  }

  if (!userInfo) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
