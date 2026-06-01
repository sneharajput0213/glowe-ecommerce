import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { SlidersHorizontal, X } from "lucide-react";

function Products() {
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // FETCH PRODUCTS FROM DATABASE
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products`
        );

        const data = await response.json();

        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // DYNAMIC CATEGORIES FROM DB
  const categories = [
    ...new Set(products.map((p) => p.category)),
  ];

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const searchParam = searchParams.get("search");

    if (
      categoryParam &&
      !selectedCategories.includes(categoryParam)
    ) {
      setSelectedCategories([categoryParam]);
    }

    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) =>
        selectedCategories.includes(product.category)
      );
    }

    filtered = filtered.filter(
      (product) =>
        product.price >= priceRange[0] &&
        product.price <= priceRange[1]
    );

    if (searchQuery) {
      const query = searchQuery.toLowerCase();

      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(query) ||
          product.description
            ?.toLowerCase()
            .includes(query) ||
          product.category
            ?.toLowerCase()
            .includes(query)
      );
    }

    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;

      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;

      default:
        break;
    }

    return filtered;
  }, [
    products,
    selectedCategories,
    priceRange,
    sortBy,
    searchQuery,
  ]);

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 1000]);
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading products...
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-4xl font-serif text-foreground mb-2">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : "All Products"}
          </h1>

          <p className="text-muted-foreground">
            {filteredAndSortedProducts.length} products found
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* FILTERS */}
          <aside
            className={`${
              showFilters ? "block" : "hidden"
            } lg:block w-full lg:w-72 shrink-0`}
          >
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-24 space-y-6">

              <div className="flex items-center justify-between">
                <h3 className="text-lg text-foreground">
                  Filters
                </h3>

                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm uppercase tracking-wider">
                  Category
                </h4>

                {categories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center gap-3"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(
                        category
                      )}
                      onChange={() =>
                        toggleCategory(category)
                      }
                    />

                    <span>{category}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={clearFilters}
                className="w-full py-2 text-primary"
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* PRODUCTS */}
          <div className="flex-1">

            <div className="flex justify-between mb-6">

              <button
                onClick={() =>
                  setShowFilters(!showFilters)
                }
                className="lg:hidden flex items-center gap-2"
              >
                <SlidersHorizontal size={18} />
                Filters
              </button>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
                className="px-4 py-2 border rounded-full"
              >
                <option value="featured">
                  Featured
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>
              </select>
            </div>

            {filteredAndSortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedProducts.map(
                  (product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                    />
                  )
                )}
              </div>
            ) : (
              <div className="text-center py-20">
                <h3 className="text-2xl mb-2">
                  No products found
                </h3>

                <button
                  onClick={clearFilters}
                  className="bg-primary text-white px-6 py-3 rounded-full"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Products;