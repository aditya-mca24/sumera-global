import "dotenv/config";
import express from "express";
import cors from "cors";
import initDatabase from "./config/db.js";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import categoryRoutes from "./routes/categories.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/orders.js";
import wishlistRoutes from "./routes/wishlist.js";
import addressRoutes from "./routes/addresses.js";
import reviewRoutes from "./routes/reviews.js";
import bannerRoutes from "./routes/banners.js";
import couponRoutes from "./routes/coupons.js";
import bulkOrderRoutes from "./routes/bulkOrders.js";
import profileRoutes from "./routes/profiles.js";
import newsletterRoutes from "./routes/newsletter.js";
import paymentRoutes from "./routes/payments.js";

const app = express();
const PORT = process.env.PORT || 3001;
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api/payments", paymentRoutes);

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() }),
);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.get("/api/banners", async (req, res) => {
  const { query } = await import("./config/database.js");
  const banners = await query(
    "SELECT * FROM banners WHERE is_active = TRUE ORDER BY display_order",
  );
  res.json({ banners });
});
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/bulk-orders", bulkOrderRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/profiles", profileRoutes);

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

async function start() {
  try {
    console.log("Initializing database...");
    await initDatabase();
    console.log("Database initialized");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
