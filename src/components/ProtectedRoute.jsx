import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const userInfoStr = localStorage.getItem("userInfo");
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

  if (!userInfo) {
    alert("Please login first");
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;