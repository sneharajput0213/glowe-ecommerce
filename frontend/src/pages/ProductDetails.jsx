import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Check,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import api from "../utils/api";

export default function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");


  
useEffect(() => {
  let isMounted = true;

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/products/${id}`);

      // Handle either a direct product response
      // or a response wrapped in { product: ... }.
      const fetchedProduct = data.product ?? data;

      if (isMounted) {
        setProduct(fetchedProduct);
        setSelectedImage(0);
      }
    } catch (error) {
      console.error(
        "Error fetching product:",
        error.response?.data?.message || error.message
      );

      if (isMounted) {
        setProduct(null);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  setLoading(true);
  fetchProduct();

  return () => {
    isMounted = false;
  };
}, [id]);


useEffect(() => {
  let isMounted = true;

  const checkWishlist = async () => {
    if (!localStorage.getItem("token")) {
      setIsWishlisted(false);
      return;
    }

    try {
      const { data } = await api.get("/wishlist");
      const products = data.wishlist?.products ?? [];

      if (isMounted) {
        setIsWishlisted(
          products.some((item) => item._id === id)
        );
      }
    } catch (error) {
      console.error(
        "Error checking wishlist:",
        error.response?.data?.message || error.message
      );
    }
  };

  checkWishlist();

  return () => {
    isMounted = false;
  };
}, [id]);


useEffect(() => {
  let isMounted = true;

  const fetchReviews = async () => {
    setReviewsLoading(true);

    try {
      const { data } = await api.get(
        `/reviews/product/${id}`
      );

      if (isMounted) {
        setReviews(data.reviews ?? []);
        setAverageRating(data.averageRating ?? 0);
        setTotalReviews(data.totalReviews ?? 0);
      }
    } catch (error) {
      console.error(
        "Error fetching reviews:",
        error.response?.data?.message || error.message
      );

      if (isMounted) {
        setReviews([]);
        setAverageRating(0);
        setTotalReviews(0);
      }
    } finally {
      if (isMounted) {
        setReviewsLoading(false);
      }
    }
  };

  fetchReviews();

  return () => {
    isMounted = false;
  };
}, [id]);


const handleSubmitReview = async () => {
  setReviewError("");
  setReviewMessage("");

  if (!localStorage.getItem("token")) {
    setReviewError("Please log in to submit a review.");
    return;
  }

  if (newRating < 1 || newRating > 5) {
    setReviewError("Please select a rating from 1 to 5 stars.");
    return;
  }

  try {
    setReviewSubmitting(true);

    await api.post("/reviews", {
      product: product._id,
      rating: newRating,
      comment: newComment.trim(),
    });

    setReviewMessage("Thank you! Your review has been submitted.");
    setNewRating(0);
    setNewComment("");

    const { data } = await api.get(`/reviews/product/${id}`);
    setReviews(data.reviews ?? []);
    setAverageRating(data.averageRating ?? 0);
    setTotalReviews(data.totalReviews ?? 0);
  } catch (error) {
    setReviewError(
      error.response?.data?.message ||
        "Unable to submit your review. Please try again."
    );
  } finally {
    setReviewSubmitting(false);
  }
};
  
const handleAddToCart = async () => {
  if (product.countInStock <= 0) return;
  
  try {
    await api.post("/cart", {
      product: product._id,
      quantity,
    });

    setAddedToCart(true);

    window.dispatchEvent(new Event("cartUpdated"));

    setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
      "Could not add product to cart. Please try again."
    );
  }
};


  
const handleToggleWishlist = async () => {
  try {
    if (isWishlisted) {
      await api.delete(`/wishlist/${product._id}`);
      setIsWishlisted(false);
    } else {
      await api.post("/wishlist", {
        product: product._id,
      });
      setIsWishlisted(true);
    }

    window.dispatchEvent(new Event("wishlistUpdated"));
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
      "Could not update wishlist. Please try again."
    );
  }
};


  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <h2 className="text-2xl">
          Loading Product...
        </h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">
            Product not found
          </h2>

          <Link
            to="/products"
            className="text-primary"
          >
            Browse all products
          </Link>
        </div>
      </div>
    );
  }

  const productImages =
  Array.isArray(product.images) && product.images.length > 0
    ? product.images.map((item) => item.url).filter(Boolean)
    : product.image
      ? [product.image]
      : [];

  const activeImage =
    productImages[selectedImage] || productImages[0];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">

        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-8 text-sm text-muted-foreground">
          <Link to="/">Home</Link>

          <span>/</span>

          <Link to="/products">
            Products
          </Link>

          <span>/</span>

          <span>{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">

          
{/* Product Image Gallery */}
<div className="space-y-4">

  {/* Main Image */}
  <div className="aspect-square rounded-3xl overflow-hidden border border-border bg-card">
    {activeImage ? (
      <img
        src={activeImage}
        alt={`${product.name} - Image ${selectedImage + 1}`}
        className="w-full h-full object-cover"
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        No image available
      </div>
    )}
  </div>

  {/* Image Thumbnails */}
  {productImages.length > 1 && (
    <div className="grid grid-cols-5 gap-3">
      {productImages.map((imageUrl, index) => (
        <button
          key={`${imageUrl}-${index}`}
          type="button"
          onClick={() => setSelectedImage(index)}
          aria-label={`View product image ${index + 1}`}
          aria-pressed={selectedImage === index}
          className={`aspect-square overflow-hidden rounded-xl border-2 transition-all ${
            selectedImage === index
              ? "border-primary ring-2 ring-primary/20"
              : "border-border hover:border-primary/50"
          }`}
        >
          <img
            src={imageUrl}
            alt={`${product.name} thumbnail ${index + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </button>
      ))}
    </div>
  )}

  {productImages.length > 1 && (
    <p className="text-center text-sm text-muted-foreground">
      {selectedImage + 1} of {productImages.length} images
    </p>
  )}

</div>

          {/* Details */}
          <div className="space-y-6">

            <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full">
              {product.category}
            </div>

            <h1 className="text-4xl font-serif">
              {product.name}
            </h1>

            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-amber-500">
                <Star size={20} fill="currentColor" />
                <span className="font-semibold">
                  {averageRating.toFixed(1)}
                </span>
              </div>

              <span className="text-muted-foreground text-sm">
                ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
              </span>
            </div>

            <p className="text-4xl text-primary">
              ₹{product.price}
            </p>

            <p className="text-muted-foreground">
              {product.description}
            </p>

            <div>
              <h3 className="font-medium mb-2">
                Brand
              </h3>

              <p>{product.brand}</p>
            </div>

            <div>
              <h3 className="font-medium mb-2">
                Availability
              </h3>

              {product.countInStock > 0 ? (
                <p className="text-green-600 font-medium flex items-center gap-2">
                  In Stock
                </p>
              ) : (
                <p className="text-red-500 font-medium">
                  Out of Stock
                </p>
              )}
            </div>


            {/* Quantity */}
            <div>
              <h3 className="font-medium mb-3">
                Quantity
              </h3>

              <div className="flex items-center border rounded-full w-fit">

                <button
                  onClick={() =>
                    setQuantity(
                      Math.max(
                        1,
                        quantity - 1
                      )
                    )
                  }
                  className="px-4 py-2"
                >
                  <Minus size={18} />
                </button>

                <span className="px-6">
                  {quantity}
                </span>

                
                <button
                  onClick={() =>
                    setQuantity((current) =>
                      Math.min(current + 1, product.countInStock)
                    )
                  }
                  disabled={quantity >= product.countInStock}
                  className="px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus size={18} />
                </button>


              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">

              
            <button
              onClick={handleAddToCart}
              disabled={product.countInStock <= 0}
              className="flex-1 bg-primary text-white py-4 rounded-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >

                {addedToCart ? (
                  <>
                    <Check size={20} />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={
                  handleToggleWishlist
                }
                className="border rounded-full px-5"
              >
                <Heart
                  className={
                    isWishlisted
                      ? "fill-primary text-primary"
                      : ""
                  }
                />
              </button>

            </div>

          </div>
        </div>
        
{/* Customer Reviews */}
<section className="mt-16 border-t pt-10">
  <h2 className="text-3xl font-serif mb-6">
    Customer Reviews
  </h2>

  
{/* Write a Review - Star Rating */}
<div className="mb-8">
  <h3 className="text-lg font-medium mb-3">
    Rate this product
  </h3>

  <div className="flex items-center gap-2">
    {Array.from({ length: 5 }, (_, index) => {
      const ratingValue = index + 1;

      return (
        <button
          key={ratingValue}
          type="button"
          onClick={() => setNewRating(ratingValue)}
          aria-label={`Rate ${ratingValue} out of 5 stars`}
          className="text-amber-500 transition-transform hover:scale-110"
        >
          <Star
            size={28}
            fill={ratingValue <= newRating ? "currentColor" : "none"}
          />
        </button>
      );
    })}

    <span className="text-sm text-muted-foreground ml-2">
      {newRating > 0 ? `${newRating} out of 5` : "Select a rating"}
    </span>
  </div>
</div>


{/* Review Comment Form */}
<div className="mb-10">
  <h3 className="text-lg font-medium mb-3">
    Write your review
  </h3>

  <textarea
    value={newComment}
    onChange={(e) => setNewComment(e.target.value)}
    placeholder="Share your experience with this product..."
    rows={4}
    className="w-full rounded-lg border border-gray-300 bg-transparent p-4 outline-none focus:ring-2 focus:ring-pink-300"
  />

  {reviewError && (
    <p className="mt-2 text-sm text-red-500">
      {reviewError}
    </p>
  )}

  {reviewMessage && (
    <p className="mt-2 text-sm text-green-600">
      {reviewMessage}
    </p>
  )}

  <button
    type="button"
    onClick={handleSubmitReview}
    disabled={reviewSubmitting}
    className="mt-4 rounded-lg bg-pink-500 px-6 py-3 text-white transition hover:bg-pink-600 disabled:opacity-50"
  >
    {reviewSubmitting ? "Submitting..." : "Submit Review"}
  </button>
</div>

  {reviewsLoading ? (
    <p className="text-muted-foreground">
      Loading reviews...
    </p>
  ) : reviews.length === 0 ? (
    <p className="text-muted-foreground">
      No reviews yet. Be the first to review this product!
    </p>
  ) : (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div
          key={review._id}
          className="border-b pb-6"
        >
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-medium">
              {review.user?.name || "Customer"}
            </h3>

            <div className="flex items-center gap-1 text-amber-500">
              {Array.from(
                { length: 5 },
                (_, index) => (
                  <Star
                    key={index}
                    size={16}
                    fill={
                      index < review.rating
                        ? "currentColor"
                        : "none"
                    }
                  />
                )
              )}
            </div>
          </div>

          <p className="text-muted-foreground mt-3">
            {review.comment}
          </p>

          {review.createdAt && (
            <p className="text-xs text-muted-foreground mt-3">
              {new Date(
                review.createdAt
              ).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      ))}
    </div>
  )}
</section>

      </div>
    </div>
  );
}