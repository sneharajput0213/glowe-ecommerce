import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useState, useEffect } from "react";

import {
  addToCart,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
} from "../utils/cart";

function ProductCard({ product }) {
  const [isWishlisted, setIsWishlisted] =
    useState(false);

  useEffect(() => {
    setIsWishlisted(
      isInWishlist(product._id)
    );
  }, [product._id]);

  const handleAddToCart = (e) => {
    e.preventDefault();

    addToCart(product, 1);

    window.dispatchEvent(
      new Event("cartUpdated")
    );
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();

    if (isWishlisted) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }

    setIsWishlisted(!isWishlisted);

    window.dispatchEvent(
      new Event("wishlistUpdated")
    );
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
          />

          <button
            onClick={handleToggleWishlist}
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

          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-primary text-primary" />

            <span className="text-sm text-foreground">
              4.8
            </span>

            <span className="text-sm text-muted-foreground">
              (124)
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xl text-primary">
              ₹{product.price}
            </div>

            <button
              onClick={handleAddToCart}
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