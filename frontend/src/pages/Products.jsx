
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../utils/api";

const PRODUCTS_PER_PAGE = 9;

function Products() {
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Sync category and search from URL
  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "");
    setSearchQuery(searchParams.get("search") || "");
    setCurrentPage(1);
  }, [searchParams]);

  // Fetch product categories from backend product data.
  // This fetches all active products in batches so category
  // options are not limited to the current page.
  useEffect(() => {
    let active = true;

    const fetchCategories = async () => {
      try {
        const allCategories = new Set();
        let page = 1;
        let total = 1;

        do {
          const { data } = await api.get("/products", {
            params: {
              page,
              limit: 50
            },
          });

          if (!active) return;

          (data.products || []).forEach((product) => {
            if (product.category) {
              allCategories.add(product.category);
            }
          });

          total = data.totalPages || 1;
          page += 1;
        } while (page <= total);

        if (active) {
          setCategories(
            [...allCategories].sort((a, b) =>
              a.localeCompare(b)
            )
          );
        }
      } catch (err) {
        console.error(
          "Error fetching categories:",
          err.response?.data?.message || err.message
        );
      }
    };

    fetchCategories();

    return () => {
      active = false;
    };
  }, []);

  // Fetch paginated products
  useEffect(() => {
    let active = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {
          page: currentPage,
          limit: PRODUCTS_PER_PAGE,
        };

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        if (selectedCategory) {
          params.category = selectedCategory;
        }

        if (sortBy === "price-low") {
          params.sort = "price_asc";
        } else if (sortBy === "price-high") {
          params.sort = "price_desc";
        } else {
          params.sort = "newest";
        }

        const { data } = await api.get("/products", {
          params,
        });

        if (!active) return;

        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
        setTotalProducts(data.totalProducts || 0);
      } catch (err) {
        if (!active) return;

        console.error(
          "Error fetching products:",
          err.response?.data?.message || err.message
        );

        setError(
          err.response?.data?.message ||
            "Unable to load products. Please try again."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      active = false;
    };
  }, [
    currentPage,
    searchQuery,
    selectedCategory,
    sortBy,
  ]);

  const toggleCategory = (category) => {
    setSelectedCategory((prev) =>
      prev === category ? "" : category
    );
    setCurrentPage(1);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSearchQuery("");
    setSortBy("featured");
    setCurrentPage(1);
  };

  const changePage = (page) => {
    if (
      page < 1 ||
      page > totalPages ||
      page === currentPage
    ) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-foreground mb-2">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : "All Products"}
          </h1>

          <p className="text-muted-foreground">
            {loading
              ? "Loading products..."
              : `${totalProducts} products found`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Filters Sidebar */}
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
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category Filter */}
              <div className="space-y-3">
                <h4 className="text-sm uppercase tracking-wider">
                  Category
                </h4>

                {categories.length > 0 ? (
                  categories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategory === category}
                        onChange={() =>
                          toggleCategory(category)
                        }
                        className="accent-primary"
                      />

                      <span className="text-sm">
                        {category}
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No categories available.
                  </p>
                )}
              </div>

              {/* Clear Filters */}
              <button
                type="button"
                onClick={clearFilters}
                className="w-full py-2 text-primary hover:underline"
              >
                Clear All Filters
              </button>

            </div>
          </aside>

          {/* Products Section */}
          <div className="flex-1 min-w-0">

            {/* Sorting and Mobile Filter Button */}
            <div className="flex items-center justify-between gap-4 mb-6">

              <button
                type="button"
                onClick={() =>
                  setShowFilters((prev) => !prev)
                }
                className="lg:hidden flex items-center gap-2"
              >
                <SlidersHorizontal size={18} />
                Filters
              </button>

              <div className="ml-auto">
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="px-4 py-2 border border-border bg-background rounded-full outline-none"
                  aria-label="Sort products"
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
            </div>

            {/* Loading */}
            {loading ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">
                  Loading products...
                </p>
              </div>

            ) : error ? (

              /* Error */
              <div className="text-center py-20">
                <p className="text-red-500">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-primary text-primary-foreground px-6 py-3 rounded-full"
                >
                  Try Again
                </button>
              </div>

            ) : products.length > 0 ? (

              /* Product Grid */
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 space-y-4">

                    <p className="text-center text-sm text-muted-foreground">
                      Showing{" "}
                      {(currentPage - 1) * PRODUCTS_PER_PAGE + 1}
                      {" - "}
                      {Math.min(
                        currentPage * PRODUCTS_PER_PAGE,
                        totalProducts
                      )}
                      {" of "}
                      {totalProducts} products
                    </p>

                    <nav
                      aria-label="Product pagination"
                      className="flex flex-wrap items-center justify-center gap-2"
                    >

                      {/* Previous */}
                      <button
                        type="button"
                        onClick={() =>
                          changePage(currentPage - 1)
                        }
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-3 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={18} />
                        <span>Previous</span>
                      </button>

                      {/* Page Numbers */}
                      {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1
                      ).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => changePage(page)}
                          aria-label={`Go to page ${page}`}
                          aria-current={
                            currentPage === page
                              ? "page"
                              : undefined
                          }
                          className={`min-w-10 px-3 py-2 rounded-lg transition-colors ${
                            currentPage === page
                              ? "bg-primary text-primary-foreground"
                              : "border border-border hover:bg-muted"
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      {/* Next */}
                      <button
                        type="button"
                        onClick={() =>
                          changePage(currentPage + 1)
                        }
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-3 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <span>Next</span>
                        <ChevronRight size={18} />
                      </button>

                    </nav>
                  </div>
                )}
              </>

            ) : (

              /* No Products */
              <div className="text-center py-20">
                <h3 className="text-2xl mb-2">
                  No products found
                </h3>

                <p className="text-muted-foreground mb-6">
                  Try changing your search or category filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-full"
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
