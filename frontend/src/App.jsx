import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Footer from "./components/Footer";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import ProtectedRoute from "./components/ProtectedRoute";
import MyOrders from "./pages/MyOrders";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import AdminAddProduct from "./pages/admin/AdminAddProduct";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminEditProduct from "./pages/admin/AdminEditProduct";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import NotFound from "./pages/NotFound";
import SellerRoute from "./components/SellerRoute";
import SellerLayout from "./pages/seller/SellerLayout";
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerProducts from "./pages/seller/SellerProducts";
import SellerAddProduct from "./pages/seller/SellerAddProduct";
import SellerEditProduct from "./pages/seller/SellerEditProduct";
import SellerInventory from "./pages/seller/SellerInventory";
import SellerOrders from "./pages/seller/SellerOrders";
import SellerProfile from "./pages/seller/SellerProfile";
import { useLocation } from "react-router-dom";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSellers from "./pages/admin/AdminSellers";
import AdminProfile from "./pages/admin/AdminProfile";
import SellerRegister from "./pages/SellerRegister";

function App() {
  const location = useLocation();

  const isPortal =
    location.pathname.startsWith("/admin/") ||
    location.pathname === "/admin" ||
    location.pathname.startsWith("/seller/") ||
    location.pathname === "/seller";

  return (
    <div className="min-h-screen">
      {!isPortal && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/become-a-seller" element={<SellerRegister />} />
        <Route path="/products" element={<Products />} />
        <Route
          path="/wishlist"
          element={
        <ProtectedRoute>
          <Wishlist />
        </ProtectedRoute>
        }
        />
        <Route
          path="/cart"
          element={
        <ProtectedRoute>
          <Cart />
        </ProtectedRoute>
        }
        />
        <Route
          path="/checkout"
          element={
        <ProtectedRoute>
          <Checkout />
        </ProtectedRoute>
        }
        /> 
        <Route
          path="/my-orders"
          element={
        <ProtectedRoute>
          <MyOrders />
        </ProtectedRoute>
        }
        />
        <Route
          path="/profile"
          element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
        }
        />
        
<Route
  path="/admin"
  element={
    <AdminRoute>
      <AdminLayout />
    </AdminRoute>
  }
>
  <Route index element={<AdminDashboard />} />

  <Route
    path="products"
    element={<AdminProducts />}
  />

  <Route
    path="products/add"
    element={<AdminAddProduct />}
  />

  <Route
    path="products/:id"
    element={<AdminEditProduct />}
  />

  <Route
    path="orders"
    element={<AdminOrders />}
  />

  <Route
    path="users"
    element={<AdminUsers />}
  />

  <Route path="analytics" element={<AdminAnalytics />} /> 
  <Route path="sellers" element={<AdminSellers />} />
  <Route path="profile" element={<AdminProfile />} />
</Route>

        <Route path="/product/:id" element={<ProductDetails />} />
        <Route
          path="/seller"
          element={
            <SellerRoute>
              <SellerLayout />
            </SellerRoute>
          }
        >
          <Route index element={<SellerDashboard />} />
          <Route path="/seller/products" element={<SellerProducts />} />
          <Route path="products/add" element={<SellerAddProduct />} />
          <Route path="products/:id/edit" element={<SellerEditProduct />} />
          <Route path="inventory" element={<SellerInventory />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="profile" element={<SellerProfile />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isPortal && <Footer />}
    </div>
  );
}

export default App;