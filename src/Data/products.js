// src/data/products.js

// Automatically load all SVG files
const svgFiles = import.meta.glob(
  "../assets/*.svg",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

// Automatically load all PNG files
const pngFiles = import.meta.glob(
  "../assets/*.png",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);


// Convert filename into a nice product name
function formatName(filename) {
  return filename
    .replace(/\.(svg|png)$/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}


// Create URL-friendly ID
function createId(filename) {
  return filename
    .replace(/\.(svg|png)$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}


// ========================================
// SVG PRODUCTS
// ========================================

const svgProducts = Object.entries(svgFiles)
  .filter(([path]) => {
    const filename = path.split("/").pop();

    // Ignore default Vite / React files
    return (
      filename !== "vite.svg" &&
      filename !== "react.svg"
    );
  })
  .map(([path, image]) => {
    const filename = path.split("/").pop();

    return {
      id: createId(filename),

      name: formatName(filename),

      filename,

      image,

      type: "svg",

      category: "Sleeve Design",

      price: 500,

      downloadable: true,
    };
  });


// ========================================
// PNG REFERENCE IMAGES
// ========================================

const pngReferences = Object.entries(pngFiles)
  .map(([path, image]) => {
    const filename = path.split("/").pop();

    return {
      id: createId(filename),

      name: formatName(filename),

      filename,

      image,

      type: "png",

      category: "Reference",

      downloadable: false,
    };
  });


// Export paid products
export const products = svgProducts;


// Export PNG references
export const references = pngReferences;