import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setWishlistItems,
  setWishlistLoading,
  setWishlistError,
} from "../redux/wishlistSlice";
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import api from "../utils/api";
import { toast } from "sonner";
  
function Wishlist() {
  const dispatch = useDispatch();

const {
  items: wishlistItems,
  loading,
  error,
} = useSelector((state) => state.wishlist);

  
const loadWishlist = useCallback(async () => {
  dispatch(setWishlistLoading(true));
  dispatch(setWishlistError(null));

  try {
    const { data } = await api.get("/wishlist");

    const items = data.wishlist?.products ?? [];

    const formattedItems = items.map((product) => ({
      ...product,
      id: product._id,
    }));

    dispatch(setWishlistItems(formattedItems));
  } catch (error) {
    const message =
      error.response?.data?.message || error.message;

    dispatch(setWishlistError(message));

    console.error("Error fetching wishlist:", message);
  } finally {
    dispatch(setWishlistLoading(false));
  }
}, [dispatch]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

const handleRemove = (productId) => {
  toast("Remove from wishlist?", {
    description: "This product will be removed from your wishlist.",
    duration: 10000,

    action: {
      label: "Remove",
      onClick: async () => {
        try {
          await api.delete(`/wishlist/${productId}`);

          await loadWishlist();
          window.dispatchEvent(new Event("wishlistUpdated"));

          toast.success("Product removed from wishlist.");
        } catch (error) {
          toast.error(
            error.response?.data?.message ||
              "Could not remove product from wishlist."
          );
        }
      },
    },

    cancel: {
      label: "Keep",
      onClick: () => {},
    },
  });
};

  
const handleMoveToCart = async (product) => {
  try {
    await api.post("/cart", {
      product: product.id,
      quantity: 1,
    });

    await api.delete(`/wishlist/${product.id}`);

    await loadWishlist();

    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("wishlistUpdated"));

    toast.success("Moved to cart!", {
      description: `${product.name} has been moved to your cart.`,
    });
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
        "Could not move product to cart."
    );
  }
};

if (loading && wishlistItems.length === 0) {
  return (
    <div className="min-h-screen py-20 text-center">
      <p className="text-muted-foreground">
        Loading your wishlist...
      </p>
    </div>
  );
}

    if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen py-20">
        <div className="max-w-md mx-auto px-4 text-center space-y-6">
          <div className="w-32 h-32 mx-auto bg-accent rounded-full flex items-center justify-center">
            <Heart className="w-16 h-16 text-muted-foreground" />
          </div>
          <h2 className="text-3xl font-serif text-foreground">Your Wishlist is Empty</h2>
          <p className="text-muted-foreground">
            Save your favorite products to your wishlist and shop them later.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-8 py-4 rounded-full hover:bg-primary/90 transition-colors"
          >
            <span>Discover Products</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-foreground mb-2">My Wishlist</h1>
          <p className="text-muted-foreground">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <div
              key={product.id}
              className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border"
            >
              {/* Image */}
              <Link
                to={`/product/${product.id}`}
                className="relative block aspect-square overflow-hidden bg-accent group"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemove(product.id);
                  }}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-destructive" />
                </button>
              </Link>

              {/* Content */}
              <div className="p-5 space-y-3">
                {/* Category */}
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  {product.category}
                </div>

                {/* Name */}
                <Link to={`/product/${product.id}`}>
                  <h3 className="text-foreground hover:text-primary transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                </Link>

                {/* Price */}
                <div className="text-xl text-primary">₹{product.price}</div>

                {/* Move to Cart Button */}
                <button
                  onClick={() => handleMoveToCart(product)}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-full hover:bg-primary/90 transition-colors inline-flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Move to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Wishlist;