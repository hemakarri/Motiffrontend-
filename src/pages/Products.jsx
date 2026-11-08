import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { products } from "../Data/products";
// import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";

function Products() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [format, setFormat] = useState("all");
  const [category, setCategory] = useState("all");
  const [productsData, setProductsData] = useState(products);
  const [apiCategories, setApiCategories] = useState([]);

  // ==============================
  // CATEGORIES
  // ==============================

  const categories = [
    { value: "all", label: "All Designs" },
    { value: "small buttas", label: "Small Buttas" },
    { value: "big buttas", label: "Big Buttas" },
    { value: "geometrical design", label: "Geometrical Design" },
    { value: "strips", label: "Strips" },
    { value: "small borders", label: "Small Borders" },
    { value: "big borders", label: "Big Borders" },
    { value: "checks", label: "Checks" },
    { value: "checks with butta", label: "Checks With Butta" },
    { value: "zari checks", label: "Zari Checks" },
    { value: "temple design", label: "Temple Designs" },
    { value: "kolam design", label: "Kolam Designs" },
    { value: "floral design", label: "Floral Designs" },
    { value: "statement design", label: "Statement Designs" },
  ];

  // ==============================
  // LOAD DESIGNS AND CATEGORIES
  // ==============================

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch("http://localhost:5000/api/designs").then((response) =>
        response.ok
          ? response.json()
          : Promise.reject(new Error("Design API unavailable"))
      ),
      fetch("http://localhost:5000/api/categories").then((response) =>
        response.ok
          ? response.json()
          : Promise.reject(new Error("Category API unavailable"))
      ),
    ])
      .then(([designData, categoryData]) => {
        if (cancelled) return;

        const uploaded = (designData.designs || []).map((design) => ({
          ...design,
          image: `http://localhost:5000${design.previewUrl}`,
          format: design.format,
          type: design.format,
          category: design.categoryName || design.category,
          downloadable: true,
        }));

        setProductsData([...products, ...uploaded]);
        setApiCategories(categoryData.categories || []);
      })
      .catch((error) => {
        // Existing bundled designs remain available if the API is stopped.
        console.warn(
          "Could not load uploaded designs from API:",
          error.message
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ==============================
  // GET FILE FORMAT
  // ==============================

  const getFormat = (product) => {
    if (product.format) {
      return product.format.toLowerCase();
    }

    const filePath = product.image || product.file || "";

    const extension = filePath
      .split("?")[0]
      .split(".")
      .pop()
      .toLowerCase();

    if (extension === "svg") return "svg";
    if (extension === "png") return "png";

    return "";
  };

  // ==============================
  // PROTECTION HANDLERS
  // ==============================

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    const handleDragStart = (e) => {
      e.preventDefault();
    };

    const handleCopy = (e) => {
      e.preventDefault();
    };

    const handleCut = (e) => {
      e.preventDefault();
    };

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      if (e.key === "PrintScreen") {
        e.preventDefault();

        if (navigator.clipboard) {
          navigator.clipboard.writeText("").catch(() => {});
        }

        alert("Screenshots are not allowed.");
        return;
      }

      if (
        (e.ctrlKey && ["c", "x", "u"].includes(key)) ||
        (e.ctrlKey && key === "s") ||
        (e.ctrlKey && key === "p") ||
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(key))
      ) {
        e.preventDefault();

        if (key === "s") {
          alert("Saving this page is not allowed.");
        }

        if (key === "p") {
          alert("Printing this page is not allowed.");
        }

        return;
      }

      if (e.metaKey && e.shiftKey && key === "s") {
        e.preventDefault();
        alert("Screenshots are not allowed.");
      }
    };

    const handleBeforePrint = () => {
      document.body.classList.add("no-print");
    };

    const handleAfterPrint = () => {
      document.body.classList.remove("no-print");
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
      document.body.classList.remove("no-print");
    };
  }, []);

  // ==============================
  // SEARCH + CATEGORY + FORMAT + SORT
  // ==============================

  const filteredProducts = useMemo(() => {
    let result = productsData.filter((product) => {
      const productName = product.name || "";
      const productCategory = product.category || "";

      const matchesSearch =
        productName.toLowerCase().includes(search.toLowerCase()) ||
        productCategory.toLowerCase().includes(search.toLowerCase());

      const productFormat = getFormat(product);

      const matchesFormat =
        format === "all" || productFormat === format;

      const matchesCategory =
        category === "all" ||
        productCategory.toLowerCase() === category.toLowerCase();

      return matchesSearch && matchesFormat && matchesCategory;
    });

    if (sort === "low") {
      result.sort(
        (a, b) => Number(a.price || 0) - Number(b.price || 0)
      );
    }

    if (sort === "high") {
      result.sort(
        (a, b) => Number(b.price || 0) - Number(a.price || 0)
      );
    }

    if (sort === "name") {
      result.sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
    }

    return result;
  }, [search, sort, format, category, productsData]);

  // ==============================
  // CLEAR FILTERS
  // ==============================

  const handleClearFilters = () => {
    setSearch("");
    setSort("default");
    setFormat("all");
    setCategory("all");
  };

  // ==============================
  // MERGE CATEGORY OPTIONS
  // ==============================

  const categoryOptions = [
    ...categories,
    ...apiCategories
      .filter(
        (item) =>
          !categories.some(
            (existing) =>
              existing.value.toLowerCase() ===
              (item.name || "").toLowerCase()
          )
      )
      .map((item) => ({
        value: item.name,
        label: item.name,
      })),
  ];

  const selectedCategoryLabel =
    categoryOptions.find(
      (item) =>
        item.value.toLowerCase() === category.toLowerCase()
    )?.label || category;

  // ==============================
  // PAGE
  // ==============================

  return (
    <>
      <Navbar />

      <main className="products-page">
        {/* HEADER */}

        <section className="products-header">
          <span className="eyebrow">
            DIGITAL DESIGN COLLECTION
          </span>

          <h1>Explore Our Designs</h1>

          <p>
            Premium SVG and PNG designs for fashion, textile and creative
            professionals.
          </p>
        </section>

        {/* CATEGORY DROPDOWN */}

        <section className="category-section">
          <div className="category-title">
            <label htmlFor="category-select">
              Browse Categories
            </label>
          </div>

          <select
            id="category-select"
            className="category-dropdown"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categoryOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </section>

        {/* FILTER BAR */}

        <section className="filter-bar">
          {/* SEARCH */}

          <div className="search-box">
            <span aria-hidden="true">🔍</span>

            <input
              type="text"
              placeholder="Search designs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search designs"
            />
          </div>

          {/* FORMAT FILTER */}

          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            aria-label="Filter by file format"
          >
            <option value="all">All Formats</option>
            <option value="svg">SVG Designs</option>
            <option value="png">PNG Designs</option>
          </select>

          {/* SORT */}

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort designs"
          >
            <option value="default">Sort By</option>
            <option value="name">Name</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>
        </section>

        {/* FORMAT TABS */}

        <div className="format-tabs">
          <button
            type="button"
            className={format === "all" ? "active" : ""}
            onClick={() => setFormat("all")}
          >
            All Designs
          </button>

          <button
            type="button"
            className={format === "svg" ? "active" : ""}
            onClick={() => setFormat("svg")}
          >
            SVG
          </button>

          <button
            type="button"
            className={format === "png" ? "active" : ""}
            onClick={() => setFormat("png")}
          >
            PNG
          </button>
        </div>

        {/* RESULTS COUNT */}

        <div className="results-count">
          Showing <strong>{filteredProducts.length}</strong> designs

          {category !== "all" && (
            <>
              {" "}in{" "}
              <strong>{selectedCategoryLabel}</strong>
            </>
          )}

          {format !== "all" && (
            <>
              {" "}•{" "}
              <strong>{format.toUpperCase()}</strong>
            </>
          )}
        </div>

        {/* PRODUCTS */}

        {filteredProducts.length > 0 ? (
          <section className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </section>
        ) : (
          /* EMPTY STATE */

          <div className="empty-products">
            <div aria-hidden="true">🔍</div>

            <h2>No designs found</h2>

            <p>
              Try another search, category or format.
            </p>

            <button
              type="button"
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

export default Products;