
import { Link, useNavigate } from "react-router-dom";
import { Search, Heart, ShoppingCart, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearCart, setCartItems } from "../redux/cartSlice";
import {
  clearWishlist,
  setWishlistItems,
} from "../redux/wishlistSlice";
import AuthModal from "./AuthModal";
import api from "../utils/api";

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [userInfo, setUserInfo] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);

  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const wishlistCount = wishlistItems.length;

  // Load logged-in user information
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("userInfo");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);

        if (parsedUser && parsedUser.name) {
          setUserInfo(parsedUser);
        }
      }
    } catch (error) {
      console.error("Error reading user:", error.message);
      localStorage.removeItem("userInfo");
    }
  }, []);

  // Load cart and wishlist when the app starts
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      dispatch(clearCart());
      dispatch(clearWishlist());
      return;
    }

    const loadUserData = async () => {
      try {
        const [cartResponse, wishlistResponse] = await Promise.all([
          api.get("/cart"),
          api.get("/wishlist"),
        ]);

        const cartItems = (cartResponse.data.cart?.items ?? [])
          .filter((item) => item.product)
          .map((item) => ({
            product: {
              ...item.product,
              id: item.product._id,
            },
            quantity: item.quantity,
          }));

        const wishlistItems = (
          wishlistResponse.data.wishlist?.products ?? []
        ).map((product) => ({
          ...product,
          id: product._id,
        }));

        dispatch(setCartItems(cartItems));
        dispatch(setWishlistItems(wishlistItems));
      } catch (error) {
        console.error(
          "Error loading cart and wishlist:",
          error.response?.data?.message || error.message
        );
      }
    };

    loadUserData();
  }, [dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const closeDropdown = () => {
      setShowDropdown(false);
    };

    window.addEventListener("click", closeDropdown);

    return () => {
      window.removeEventListener("click", closeDropdown);
    };
  }, []);

  // Search products
  const handleSearch = (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    navigate(
      `/products?search=${encodeURIComponent(searchQuery.trim())}`
    );
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");

    setUserInfo(null);
    setShowDropdown(false);

    dispatch(clearCart());
    dispatch(clearWishlist());

    window.location.reload();
  };

  return (
    <>
      <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Main Navbar */}
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center">
              <h1 className="text-3xl font-serif text-primary italic">
                Glowé
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className="text-foreground hover:text-primary transition-colors"
              >
                Home
              </Link>

              <Link
                to="/products"
                className="text-foreground hover:text-primary transition-colors"
              >
                Shop
              </Link>

              <Link
                to="/products?category=Cleanser"
                className="text-foreground hover:text-primary transition-colors"
              >
                Cleanser
              </Link>

              <Link
                to="/products?category=Serum"
                className="text-foreground hover:text-primary transition-colors"
              >
                Serum
              </Link>

              <Link
                to="/products?category=Moisturizer"
                className="text-foreground hover:text-primary transition-colors"
              >
                Moisturizer
              </Link>
            </div>

            {/* Desktop Search Bar */}
            <form
              onSubmit={handleSearch}
              className="hidden lg:flex items-center flex-1 max-w-md mx-8"
            >
              <div className="relative w-full">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                />

                <input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-input-background border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </form>

            {/* Right Icons */}
            <div className="flex items-center space-x-5">

              {/* Wishlist */}
              <Link
                to="/wishlist"
                aria-label="Wishlist"
                className="relative text-foreground hover:text-primary transition-colors"
              >
                <Heart className="w-6 h-6" />

                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                aria-label="Cart"
                className="relative text-foreground hover:text-primary transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />

                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Profile */}
              <div className="relative">
                {userInfo ? (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDropdown(!showDropdown);
                      }}
                      aria-label="Profile menu"
                      className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center"
                    >
                      {userInfo.name?.charAt(0).toUpperCase()}
                    </button>

                    {showDropdown && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 mt-3 w-56 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-border">
                          <p className="font-medium text-foreground">
                            {userInfo.name}
                          </p>

                          <p className="text-sm text-muted-foreground truncate">
                            {userInfo.email}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => navigate("/profile")}
                          className="w-full text-left px-4 py-3 hover:bg-accent transition-colors"
                        >
                          My Profile
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate("/my-orders")}
                          className="w-full text-left px-4 py-3 hover:bg-accent transition-colors"
                        >
                          My Orders
                        </button>

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-red-500 hover:bg-accent transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(true)}
                    aria-label="Login or register"
                    className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                  >
                    <User className="w-5 h-5 text-primary" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile and Tablet Search Bar */}
          <form
            onSubmit={handleSearch}
            className="lg:hidden pb-4"
          >
            <div className="relative w-full">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              />

              <input
                type="search"
                placeholder="Search products..."
                aria-label="Search products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-input-background border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </form>

        </div>
      </nav>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}

export default Navbar;
