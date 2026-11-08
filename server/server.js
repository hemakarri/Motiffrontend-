const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;


// MIDDLEWARE


app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));

// Admin/user auth, categories and SVG/PNG upload APIs (local JSON storage).
require("./adminApi")(app);


// SVG ASSETS LOCATION


const assetsFolder = path.join(
  __dirname,
  "..",
  "src",
  "assets"
);


// CHECK ASSETS FOLDER


if (!fs.existsSync(assetsFolder)) {
  console.error("❌ SVG assets folder not found:");
  console.error(assetsFolder);
} else {
  console.log("✅ SVG assets folder:");
  console.log(assetsFolder);
}


// EMAIL CONFIGURATION


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// EMAIL CONNECTION CHECK


transporter.verify((error, success) => {
  if (error) {
    console.error("");
    console.error("❌ EMAIL CONFIGURATION ERROR");
    console.error(error.message);
    console.error("");
  } else {
    console.log("✅ Gmail transporter is ready");
    console.log("");
  }
});


// FORMAT PRODUCT NAME


function formatProductName(filename) {
  return filename
    .replace(/\.svg$/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}


// CREATE PRODUCT ID


function createProductId(filename) {
  return filename
    .replace(/\.svg$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}


// GET ALL SVG PRODUCTS


function getSvgProducts() {
  if (!fs.existsSync(assetsFolder)) {
    return [];
  }

  const files = fs
    .readdirSync(assetsFolder)
    .filter((file) => file.toLowerCase().endsWith(".svg"))
    .filter(
      (file) =>
        file.toLowerCase() !== "vite.svg" &&
        file.toLowerCase() !== "react.svg"
    );

  return files.map((file) => {
    return {
      id: createProductId(file),
      name: formatProductName(file),
      filename: file,
      price: 500,
    };
  });
}


// FIND PRODUCT


function findProduct(productId) {
  const products = getSvgProducts();

  const legacy = products.find((product) => product.id === productId);
  if (legacy) return { ...legacy, filePath: path.join(assetsFolder, legacy.filename), format: "svg" };
  return app.locals.getUploadedDesignById?.(productId) || undefined;
}


// CREATE SHA-256 FILE HASH


function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);

  return crypto
    .createHash("sha256")
    .update(fileBuffer)
    .digest("hex");
}


// EMAIL VALIDATION


function isValidEmail(email) {
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
}


// HEALTH CHECK


app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "SVG Design Store backend is running",
    port: PORT,
  });
});


// GET PRODUCTS


app.get("/api/products", (req, res) => {
  try {
    const legacyProducts = getSvgProducts().map((product) => ({ ...product, format: "svg", type: "svg", category: "Sleeve Design", image: `/src/assets/${encodeURIComponent(product.filename)}` }));
    const uploadedProducts = (app.locals.getAllUploadedDesigns?.() || []).map((product) => ({ ...product, image: product.image }));
    const products = [...legacyProducts, ...uploadedProducts];

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("PRODUCT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load SVG products",
      error: error.message,
    });
  }
});


// MOCK PAYMENT


app.post("/api/mock-payment", async (req, res) => {
  try {
    const { productId, email } = req.body;

    console.log("");
    console.log("");
    console.log("NEW PAYMENT REQUEST");
    console.log("");
    console.log("Product ID:", productId);
    console.log("Customer Email:", email);

    
    // VALIDATE EMAIL
    

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Customer email is required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    
    // VALIDATE PRODUCT ID
    

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    
    // FIND EXACT PRODUCT
    

    const product = findProduct(productId);

    if (!product) {
      console.error(
        "❌ Product not found:",
        productId
      );

      return res.status(404).json({
        success: false,
        message: "Product not found",
        productId,
      });
    }

    console.log("Product Found:", product.name);
    console.log("Exact SVG:", product.filename);

    
    // CREATE EXACT SVG PATH
    

    const svgPath = product.filePath || path.join(assetsFolder, product.filename);

    console.log("SVG Path:", svgPath);

    
    // CHECK SVG EXISTS
    

    if (!fs.existsSync(svgPath)) {
      console.error(
        "❌ SVG file does not exist:",
        svgPath
      );

      return res.status(404).json({
        success: false,
        message: "SVG file not found",
        filename: product.filename,
      });
    }

    
    // CALCULATE FILE HASH
    

    const fileHash = getFileHash(svgPath);

    console.log("SHA-256:", fileHash);

    
    // CREATE ORDER ID
    

    const orderId =
      `ORD-${Date.now()}-${crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase()}`;

    console.log("Order ID:", orderId);
    console.log("Amount: ₹500");

    
    // EMAIL CONTENT
    

    const mailOptions = {
      from: `"Motifora Digital Design Studio" <${process.env.EMAIL_USER}>`,

      to: email,

      subject:
        `Your Digital Design - ${product.name}`,

      text: `
Hello,

Thank you for your purchase from Motifora Digital Design Studio.

Your SVG design is attached to this email.


ORDER DETAILS


Order ID:
${orderId}

Design:
${product.name}

File:
${product.filename}

Amount:
₹${product.price}

File Verification SHA-256:
${fileHash}



The attached SVG file is the exact design selected during your purchase.

Thank you for shopping with Motifora.

Motifora
Digital Design Studio
      `,

      html: `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>Your SVG Design</title>

</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f4f1ec;
    font-family:Arial,Helvetica,sans-serif;
  "
>

<div
  style="
    max-width:650px;
    margin:40px auto;
    background:#ffffff;
    padding:40px;
    border-radius:8px;
  "
>

<h1
  style="
    font-family:Georgia,serif;
    font-weight:400;
    color:#292621;
    margin-bottom:10px;
  "
>
  Thank You For Your Purchase
</h1>

<p
  style="
    color:#555;
    font-size:16px;
  "
>
  Your digital SVG design is ready.
</p>

<hr
  style="
    border:none;
    border-top:1px solid #ddd;
    margin:30px 0;
  "
>

<h2
  style="
    font-family:Georgia,serif;
    font-weight:400;
    color:#292621;
  "
>
  Order Details
</h2>

<p>
  <strong>Order ID:</strong>
  ${orderId}
</p>

<p>
  <strong>Design:</strong>
  ${product.name}
</p>

<p>
  <strong>File:</strong>
  ${product.filename}
</p>

<p>
  <strong>Amount:</strong>
  ₹${product.price}
</p>

<div
  style="
    background:#f5f0e9;
    padding:20px;
    margin-top:25px;
    border-radius:6px;
  "
>

<p
  style="
    margin-top:0;
    font-weight:bold;
  "
>
  SVG File Verification
</p>

<p
  style="
    font-size:11px;
    line-height:1.6;
    word-break:break-all;
    color:#555;
  "
>
${fileHash}
</p>

</div>

<p
  style="
    margin-top:30px;
    color:#555;
  "
>
The exact SVG file selected during your purchase
is attached to this email.
</p>

<p
  style="
    margin-top:30px;
    color:#777;
  "
>
Thank you for shopping with Motifora.
</p>

</div>

</body>

</html>
      `,

      // =
      // EXACT SVG ATTACHMENT
      // =

      attachments: [
        {
          filename: product.filename,
          path: svgPath,
          contentType: product.format === "png" ? "image/png" : "image/svg+xml",
        },
      ],
    };

    
    // SEND EMAIL
    

    console.log("");
    console.log("Sending email...");
    console.log("To:", email);
    console.log("Attachment:", product.filename);

    const info =
      await transporter.sendMail(
        mailOptions
      );

    console.log("");
    console.log("✅ EMAIL SENT SUCCESSFULLY");
    console.log("Message ID:", info.messageId);

    
    // FINAL RESPONSE
    

    res.json({
      success: true,

      message:
        "Mock payment successful and design emailed successfully.",

      orderId,

      product: {
        id: product.id,
        name: product.name,
        filename: product.filename,
        price: product.price,
      },

      email,

      fileHash,

      fileVerified: true,

      emailMessageId:
        info.messageId,
    });

  } catch (error) {
    console.error("");
    console.error("");
    console.error("❌ PAYMENT / EMAIL ERROR");
    console.error("");
    console.error(error);
    console.error("");

    res.status(500).json({
      success: false,

      message:
        "Payment request failed. Email could not be sent.",

      error: error.message,
    });
  }
});

// Convert malformed JSON errors into a clean API response.
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ success: false, message: "Invalid JSON request body." });
  }
  return next(error);
});


// 404 HANDLER


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});


// START SERVER


app.listen(PORT, () => {
  console.log("");
  console.log("");
  console.log(
    `Server running on http://localhost:${PORT}`
  );
  console.log("SVG Design Store Backend");
  console.log("");
  console.log("");
  console.log(
    "Health:",
    `http://localhost:${PORT}/api/health`
  );
  console.log(
    "Products:",
    `http://localhost:${PORT}/api/products`
  );
  console.log("");
});