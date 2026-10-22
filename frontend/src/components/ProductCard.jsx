import { useDispatch } from "react-redux";
import { setCartItems } from "../redux/cartSlice";
import { useSelector } from "react-redux";
import { setWishlistItems } from "../redux/wishlistSlice";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../utils/api";

function ProductCard({ product }) {
  const dispatch = useDispatch();
  const wishlistItems = useSelector(
  (state) => state.wishlist.items
);

const isWishlisted = wishlistItems.some(
  (item) => (item._id ?? item.id) === product._id
);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Fetch the product's average rating and review count
  useEffect(() => {
    let isMounted = true;

    const fetchRating = async () => {
      setReviewsLoading(true);

      try {
        const { data } = await api.get(
          `/reviews/product/${product._id}`
        );

        if (isMounted) {
          setAverageRating(
            Number(data.averageRating) || 0
          );
          setTotalReviews(
            Number(data.totalReviews) || 0
          );
        }
      } catch (error) {
        console.error(
          "Error fetching product rating:",
          error.response?.data?.message || error.message
        );

        if (isMounted) {
          setAverageRating(0);
          setTotalReviews(0);
        }
      } finally {
        if (isMounted) {
          setReviewsLoading(false);
        }
      }
    };

    fetchRating();

    return () => {
      isMounted = false;
    };
  }, [product._id]);

  // Add this product to the cart
  const handleAddToCart = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (!localStorage.getItem("token")) {
    alert("Please log in to add products to your cart.");
    return;
  }

  try {
    // Save product to backend
    await api.post("/cart", {
      product: product._id,
      quantity: 1,
    });

    // Fetch updated cart from backend
    const { data } = await api.get("/cart");

    const formattedItems = (data.cart?.items ?? [])
      .filter((item) => item.product)
      .map((item) => ({
        product: {
          ...item.product,
          id: item.product._id,
        },
        quantity: item.quantity,
      }));

    // Update Redux
    dispatch(setCartItems(formattedItems));

    alert("Product added to cart!");
  } catch (error) {
    alert(
      error.response?.data?.message ||
        "Could not add product to cart. Please try again."
    );
  }
};

  // Add or remove this product from the wishlist
  const handleToggleWishlist = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (!localStorage.getItem("token")) {
    alert("Please log in to use your wishlist.");
    return;
  }

  try {
    if (isWishlisted) {
      await api.delete(`/wishlist/${product._id}`);
    } else {
      await api.post("/wishlist", {
        product: product._id,
      });
    }

    // Fetch the updated wishlist
    const { data } = await api.get("/wishlist");

    const formattedItems = (
      data.wishlist?.products ?? []
    ).map((item) => ({
      ...item,
      id: item._id,
    }));

    // Update Redux
    dispatch(setWishlistItems(formattedItems));
  } catch (error) {
    alert(
      error.response?.data?.message ||
        "Could not update wishlist. Please try again."
    );
  }
};

  return (
    <Link
      to={`/product/${product._id}`}
      className="group"
    >
      <div className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-border">
        <div className="relative aspect-square overflow-hidden bg-accent">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.style.visibility = "hidden";
            }}
          />

          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label={
              isWishlisted
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
            aria-pressed={isWishlisted}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isWishlisted
                  ? "fill-primary text-primary"
                  : "text-foreground"
              }`}
            />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            {product.category}
          </div>

          <h3 className="text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>

          <div
            className="flex items-center space-x-1"
            aria-label={
              reviewsLoading
                ? "Loading product rating"
                : `${averageRating.toFixed(1)} out of 5, ${totalReviews} reviews`
            }
          >
            <Star className="w-4 h-4 fill-primary text-primary" />

            <span className="text-sm text-foreground">
              {reviewsLoading
                ? "..."
                : averageRating.toFixed(1)}
            </span>

            <span className="text-sm text-muted-foreground">
              ({reviewsLoading ? "..." : totalReviews})
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xl text-primary">
              ₹{product.price}
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              aria-label={`Add ${product.name} to cart`}
              className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors shadow-sm"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
