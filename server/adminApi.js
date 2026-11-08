const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");

module.exports = function registerAdminApi(app) {
  const serverDir = __dirname;
  const dataDir = path.join(serverDir, "data");
  const uploadsDir = path.join(serverDir, "uploads");
  const usersFile = path.join(dataDir, "users.json");
  const categoriesFile = path.join(dataDir, "categories.json");
  const designsFile = path.join(dataDir, "designs.json");
  const jwtSecret = process.env.JWT_SECRET;

  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(uploadsDir, { recursive: true });

  function ensureJson(file, initialValue) {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(initialValue, null, 2), "utf8");
    }
  }

  ensureJson(usersFile, []);
  ensureJson(categoriesFile, [
    { id: "saree-border", name: "Saree Border", createdAt: new Date().toISOString() },
    { id: "saree-pallu", name: "Saree Pallu", createdAt: new Date().toISOString() },
    { id: "saree-butta", name: "Saree Butta", createdAt: new Date().toISOString() },
    { id: "sleeve-design", name: "Sleeve Design", createdAt: new Date().toISOString() },
    { id: "neckline-design", name: "Neckline Design", createdAt: new Date().toISOString() },
    { id: "blouse-design", name: "Blouse Design", createdAt: new Date().toISOString() },
    { id: "reference", name: "Reference", createdAt: new Date().toISOString() },
  ]);
  ensureJson(designsFile, []);

  function readJson(file) {
    const value = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!Array.isArray(value)) throw new Error(`${path.basename(file)} must contain a JSON array.`);
    return value;
  }

  function writeJson(file, value) {
    const temp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(value, null, 2), "utf8");
    fs.renameSync(temp, file);
  }

  function safeUser(user) {
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }

  function createToken(user) {
    if (!jwtSecret || jwtSecret.length < 32) {
      throw new Error("JWT_SECRET must be configured with at least 32 characters in server/.env");
    }
    return jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: "8h" }
    );
  }

  function requireAuth(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) {
      return res.status(401).json({ success: false, message: "Please log in first." });
    }
    if (!jwtSecret || jwtSecret.length < 32) {
      return res.status(500).json({ success: false, message: "Server authentication is not configured correctly." });
    }
    try {
      req.user = jwt.verify(token, jwtSecret);
      return next();
    } catch {
      return res.status(401).json({ success: false, message: "Your session is invalid or expired. Please log in again." });
    }
  }

  function requireAdmin(req, res, next) {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required." });
    }
    return next();
  }

  function publicDesign(design, categories = readJson(categoriesFile)) {
    const category = categories.find((item) => item.id === design.categoryId);
    const port = process.env.PORT || 5000;
    return {
      id: design.id,
      name: design.name,
      description: design.description || "",
      categoryId: design.categoryId,
      category: category?.name || "Uncategorized",
      categoryName: category?.name || "Uncategorized",
      filename: design.originalName,
      format: design.format,
      type: design.format,
      price: Number(design.price || 0),
      downloadable: true,
      previewUrl: `/api/designs/${encodeURIComponent(design.id)}/preview`,
      image: `http://localhost:${port}/api/designs/${encodeURIComponent(design.id)}/preview`,
      createdAt: design.createdAt,
    };
  }

  const storage = multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadsDir),
    filename: (_req, file, callback) => {
      const ext = path.extname(file.originalname).toLowerCase();
      callback(null, `${crypto.randomUUID()}${ext}`);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024, files: 50 },
    fileFilter: (_req, file, callback) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (![".svg", ".png"].includes(ext)) {
        return callback(new Error("Only SVG and PNG files are allowed."));
      }
      return callback(null, true);
    },
  });

  function runUpload(middleware) {
    return (req, res, next) => {
      middleware(req, res, (error) => {
        if (error) {
          const message = error instanceof multer.MulterError
            ? error.message
            : error.message || "File upload failed.";
          return res.status(400).json({ success: false, message });
        }
        return next();
      });
    };
  }

  function validateUploadedFile(file) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".svg") {
      const svgText = fs.readFileSync(file.path, "utf8");
      if (/<script\b|<foreignObject\b|\bon\w+\s*=|javascript:/i.test(svgText)) {
        throw new Error(`${path.basename(file.originalname)} contains potentially unsafe SVG content.`);
      }
    } else if (ext === ".png") {
      const fd = fs.openSync(file.path, "r");
      try {
        const signature = Buffer.alloc(8);
        const bytesRead = fs.readSync(fd, signature, 0, 8, 0);
        const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
        if (bytesRead !== 8 || !signature.equals(pngSignature)) {
          throw new Error(`${path.basename(file.originalname)} is not a valid PNG file.`);
        }
      } finally {
        fs.closeSync(fd);
      }
    }
  }

  function makeDesign(file, fields, categoryId, createdBy, batchCount) {
    const ext = path.extname(file.originalname).toLowerCase();
    const originalName = path.basename(file.originalname).replace(/[\r\n]/g, "").slice(0, 180);
    const baseName = path.basename(originalName, ext);
    return {
      id: crypto.randomUUID(),
      name: batchCount === 1 ? fields.name : `${fields.name} - ${baseName}`,
      description: fields.description || "",
      categoryId,
      price: fields.price,
      format: ext.slice(1),
      originalName,
      storedName: file.filename,
      createdAt: new Date().toISOString(),
      createdBy,
    };
  }

  function cleanupFiles(files) {
    for (const file of files || []) {
      try {
        if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      } catch (error) {
        console.error("Upload cleanup error:", error.message);
      }
    }
  }

  function getOrCreateCategory(categoryName) {
    if (!categoryName || categoryName.length > 60) {
      throw new Error("Category must be between 1 and 60 characters.");
    }
    const categories = readJson(categoriesFile);
    let category = categories.find((item) => item.name.toLowerCase() === categoryName.toLowerCase());
    if (!category) {
      const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "category";
      category = {
        id: `${slug}-${crypto.randomBytes(3).toString("hex")}`,
        name: categoryName,
        createdAt: new Date().toISOString(),
      };
      categories.push(category);
      writeJson(categoriesFile, categories);
    }
    return { category, categories };
  }

  function saveUploadedDesigns(files, fields, categoryId, createdBy) {
    const designs = readJson(designsFile);
    const newDesigns = files.map((file) => makeDesign(file, fields, categoryId, createdBy, files.length));
    writeJson(designsFile, [...newDesigns, ...designs]);
    return newDesigns;
  }

  // Register user. Public registration can never create an admin account.
  app.post("/api/auth/register", async (req, res) => {
    try {
      const name = String(req.body.name || "").trim();
      const email = String(req.body.email || "").trim().toLowerCase();
      const password = String(req.body.password || "");
      if (name.length < 2) return res.status(400).json({ success: false, message: "Enter your name (at least 2 characters)." });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: "Enter a valid email address." });
      if (password.length < 8) return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });

      const users = readJson(usersFile);
      const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
      if (users.some((user) => user.email === email) || email === adminEmail) {
        return res.status(409).json({ success: false, message: "An account with this email already exists." });
      }
      const user = {
        id: crypto.randomUUID(), name, email,
        passwordHash: await bcrypt.hash(password, 12),
        role: "user", createdAt: new Date().toISOString(),
      };
      users.push(user);
      writeJson(usersFile, users);
      return res.status(201).json({ success: true, message: "Account created. You can now log in.", user: safeUser(user) });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ success: false, message: "Unable to create account." });
    }
  });

  // Login for administrator or regular user.
  app.post("/api/auth/login", async (req, res) => {
    try {
      const email = String(req.body.email || "").trim().toLowerCase();
      const password = String(req.body.password || "");
      if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required." });

      const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
      const adminPassword = String(process.env.ADMIN_PASSWORD || "");
      if (adminEmail && adminPassword && email === adminEmail && password === adminPassword) {
        const admin = { id: "admin", name: "Administrator", email: adminEmail, role: "admin" };
        return res.json({ success: true, token: createToken(admin), user: safeUser(admin) });
      }

      const user = readJson(usersFile).find((item) => item.email === email);
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ success: false, message: "Invalid email or password." });
      }
      return res.json({ success: true, token: createToken(user), user: safeUser(user) });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ success: false, message: "Unable to log in. Check your server configuration." });
    }
  });

  app.get("/api/auth/me", requireAuth, (req, res) => {
    res.json({ success: true, user: { id: req.user.sub, email: req.user.email, role: req.user.role } });
  });

  // Categories.
  app.get("/api/categories", (_req, res) => {
    res.json({ success: true, categories: readJson(categoriesFile) });
  });

  app.post("/api/categories", requireAuth, requireAdmin, (req, res) => {
    const name = String(req.body.name || "").trim();
    if (name.length < 2 || name.length > 60) return res.status(400).json({ success: false, message: "Category name must be between 2 and 60 characters." });
    const categories = readJson(categoriesFile);
    if (categories.some((item) => item.name.toLowerCase() === name.toLowerCase())) return res.status(409).json({ success: false, message: "That category already exists." });
    const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${crypto.randomBytes(3).toString("hex")}`;
    const category = { id, name, createdAt: new Date().toISOString() };
    categories.push(category);
    writeJson(categoriesFile, categories);
    res.status(201).json({ success: true, category });
  });

  app.delete("/api/categories/:id", requireAuth, requireAdmin, (req, res) => {
    const designs = readJson(designsFile);
    if (designs.some((item) => item.categoryId === req.params.id)) return res.status(409).json({ success: false, message: "Move or delete designs in this category before deleting it." });
    const categories = readJson(categoriesFile);
    const next = categories.filter((item) => item.id !== req.params.id);
    if (next.length === categories.length) return res.status(404).json({ success: false, message: "Category not found." });
    writeJson(categoriesFile, next);
    res.json({ success: true, message: "Category deleted." });
  });

  // List uploaded designs. Supports ?categoryId=... and ?format=svg|png.
  app.get("/api/designs", (req, res) => {
    const categories = readJson(categoriesFile);
    let designs = readJson(designsFile);
    if (req.query.categoryId) designs = designs.filter((item) => item.categoryId === String(req.query.categoryId));
    if (req.query.format) designs = designs.filter((item) => item.format === String(req.query.format).toLowerCase());
    res.json({ success: true, count: designs.length, designs: designs.map((item) => publicDesign(item, categories)) });
  });

  // Existing single-file upload endpoint. Kept for compatibility.
  app.post("/api/designs", requireAuth, requireAdmin, runUpload(upload.single("file")), (req, res) => {
    const files = req.file ? [req.file] : [];
    try {
      const name = String(req.body.name || "").trim();
      const categoryId = String(req.body.categoryId || "");
      const description = String(req.body.description || "").trim().slice(0, 500);
      const price = Number(req.body.price);
      const categories = readJson(categoriesFile);

      if (!req.file) return res.status(400).json({ success: false, message: "Choose an SVG or PNG file." });
      if (name.length < 2 || name.length > 100) throw new Error("Design name must be between 2 and 100 characters.");
      if (!categories.some((item) => item.id === categoryId)) throw new Error("Select a valid category.");
      if (!Number.isFinite(price) || price < 0 || price > 1000000) throw new Error("Enter a valid price between ₹0 and ₹1,000,000.");
      validateUploadedFile(req.file);

      const design = makeDesign(req.file, { name, description, price }, categoryId, req.user.sub, 1);
      const designs = readJson(designsFile);
      designs.unshift(design);
      writeJson(designsFile, designs);
      return res.status(201).json({ success: true, design: publicDesign(design, categories) });
    } catch (error) {
      cleanupFiles(files);
      console.error("Design upload error:", error);
      return res.status(400).json({ success: false, message: error.message || "Unable to save design." });
    }
  });

  // NEW: Multiple SVG/PNG upload endpoint used by src/pages/UploadDesign.jsx.
  // Form fields: name, category, price; file field: files (multiple).
  app.post("/api/admin/designs", requireAuth, requireAdmin, runUpload(upload.array("files", 50)), (req, res) => {
    const files = req.files || [];
    try {
      const name = String(req.body.name || "").trim();
      const categoryName = String(req.body.category || "").trim();
      const price = Number(req.body.price);
      if (name.length < 2 || name.length > 100) throw new Error("Design name must be between 2 and 100 characters.");
      if (!Number.isFinite(price) || price <= 0 || price > 1000000) throw new Error("Enter a valid price greater than zero.");
      if (files.length === 0) throw new Error("Please select at least one SVG or PNG file.");

      for (const file of files) validateUploadedFile(file);
      const { category, categories } = getOrCreateCategory(categoryName);
      const description = String(req.body.description || "").trim().slice(0, 500);
      const newDesigns = files.map((file) => makeDesign(file, { name, description, price }, category.id, req.user.sub, files.length));
      const existingDesigns = readJson(designsFile);
      writeJson(designsFile, [...newDesigns, ...existingDesigns]);

      return res.status(201).json({
        success: true,
        message: `${newDesigns.length} design(s) uploaded successfully.`,
        count: newDesigns.length,
        designs: newDesigns.map((design) => publicDesign(design, categories)),
      });
    } catch (error) {
      cleanupFiles(files);
      console.error("Multiple design upload error:", error);
      return res.status(400).json({ success: false, message: error.message || "Unable to upload designs." });
    }
  });

  // Serve uploaded previews safely with a restrictive policy for SVG files.
  app.get("/api/designs/:id/preview", (req, res) => {
    const design = readJson(designsFile).find((item) => item.id === req.params.id);
    if (!design) return res.status(404).json({ success: false, message: "Design not found." });
    const filePath = path.join(uploadsDir, path.basename(design.storedName));
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: "Design file not found." });
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox");
    res.type(design.format === "svg" ? "image/svg+xml" : "image/png");
    return res.sendFile(filePath);
  });

  // Delete an uploaded design.
  app.delete("/api/designs/:id", requireAuth, requireAdmin, (req, res) => {
    const designs = readJson(designsFile);
    const design = designs.find((item) => item.id === req.params.id);
    if (!design) return res.status(404).json({ success: false, message: "Design not found." });
    writeJson(designsFile, designs.filter((item) => item.id !== req.params.id));
    const filePath = path.join(uploadsDir, path.basename(design.storedName));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return res.json({ success: true, message: "Design deleted." });
  });

  // Existing server.js product listing and payment integrations use these methods.
  app.locals.getUploadedDesignById = (id) => {
    const design = readJson(designsFile).find((item) => item.id === id);
    if (!design) return null;
    const category = readJson(categoriesFile).find((item) => item.id === design.categoryId);
    return {
      ...design,
      filename: design.originalName,
      filePath: path.join(uploadsDir, path.basename(design.storedName)),
      category: category?.name || "Uncategorized",
    };
  };

  app.locals.getAllUploadedDesigns = () =>
    readJson(designsFile).map((design) => publicDesign(design));
};
