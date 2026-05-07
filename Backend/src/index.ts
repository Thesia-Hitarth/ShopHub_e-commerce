import crypto from "crypto";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "shophub-dev-secret";

app.use(cors());
app.use(express.json());

type UserRole = "customer" | "admin";

type ProductRecord = {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  gallery: string[];
  description: string;
  stock: number;
  sizes: string[];
  colors: string[];
};

type ReviewRecord = {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  rating: number;
  text: string;
  createdAt: string;
};

type UserRecord = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
};

type OrderItemRecord = {
  productId: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
};

type AddressRecord = {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type AppliedCouponRecord = {
  code: string;
  type: "percent" | "flat";
  value: number;
  discount: number;
};

type OrderRecord = {
  id: number;
  userId: number;
  status: "pending" | "shipped" | "delivered";
  createdAt: string;
  items: OrderItemRecord[];
  address: AddressRecord;
  subtotal: number;
  discount: number;
  total: number;
  coupon?: AppliedCouponRecord;
};

type CouponRecord = {
  code: string;
  type: "percent" | "flat";
  value: number;
  label: string;
};

type AuthenticatedRequest = express.Request & {
  user?: {
    id: number;
    email: string;
    name: string;
    role: UserRole;
  };
};

const coupons: CouponRecord[] = [
  { code: "SAVE10", type: "percent", value: 10, label: "10% off your order" },
  { code: "WELCOME15", type: "flat", value: 15, label: "$15 off first checkout" },
  { code: "FREESHIP", type: "flat", value: 5, label: "Small shipping credit" },
];

const baseProducts: ProductRecord[] = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 99.99,
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Immersive over-ear headphones with clear sound, padded comfort, and all-day battery life.",
    stock: 12,
    sizes: ["Standard"],
    colors: ["Midnight", "Silver", "Sand"],
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 199.99,
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "A sleek smartwatch with fitness tracking, message previews, and a bright display for daily use.",
    stock: 8,
    sizes: ["40mm", "44mm"],
    colors: ["Graphite", "Rose", "Cloud"],
  },
  {
    id: 3,
    name: "Running Shoes",
    price: 79.99,
    category: "Sports",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Breathable running shoes with responsive cushioning and lightweight grip for everyday miles.",
    stock: 16,
    sizes: ["7", "8", "9", "10", "11"],
    colors: ["Volt", "Slate", "White"],
  },
  {
    id: 4,
    name: "Laptop Stand",
    price: 49.99,
    category: "Accessories",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "An ergonomic aluminum stand that lifts your laptop for a cleaner desk and better posture.",
    stock: 20,
    sizes: ["Standard"],
    colors: ["Silver", "Black"],
  },
  {
    id: 5,
    name: "USB-C Hub",
    price: 39.99,
    category: "Accessories",
    image:
      "https://images.unsplash.com/photo-1580894908361-967195033215?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1580894908361-967195033215?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1593642634524-b40b5baae6bb?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Compact USB-C hub with HDMI, charging passthrough, and fast data ports for flexible setups.",
    stock: 14,
    sizes: ["6 Port", "8 Port"],
    colors: ["Space Gray", "Silver"],
  },
  {
    id: 6,
    name: "Mechanical Keyboard",
    price: 129.99,
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1541140532154-b024d705b90a?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Tactile mechanical keyboard with solid construction, compact layout, and satisfying key feel.",
    stock: 6,
    sizes: ["75%", "Full Size"],
    colors: ["Charcoal", "Ice"],
  },
  {
    id: 7,
    name: "Linen Lounge Set",
    price: 84.99,
    category: "Apparel",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Relaxed two-piece linen set designed for warm days, easy layering, and polished comfort.",
    stock: 18,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Sand", "Olive", "Clay"],
  },
  {
    id: 8,
    name: "Ceramic Aroma Diffuser",
    price: 59.99,
    category: "Home Decor",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Minimal ceramic diffuser with soft ambient light and quiet misting for evening reset rituals.",
    stock: 22,
    sizes: ["120 ml"],
    colors: ["Porcelain", "Stone"],
  },
  {
    id: 9,
    name: "Travel Weekender Bag",
    price: 109.99,
    category: "Travel",
    image:
      "https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1523779105320-d1cd346ff52b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1473445361085-b9a07f55608b?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Structured weekender with shoe compartment, padded straps, and enough room for quick escapes.",
    stock: 11,
    sizes: ["35L"],
    colors: ["Espresso", "Black", "Moss"],
  },
  {
    id: 10,
    name: "Vitamin C Glow Serum",
    price: 34.99,
    category: "Beauty",
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Daily brightening serum with a lightweight finish to support glow, hydration, and smoother texture.",
    stock: 30,
    sizes: ["30 ml"],
    colors: ["Amber"],
  },
  {
    id: 11,
    name: "Cold Brew Coffee Kit",
    price: 44.99,
    category: "Kitchen",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1455470956270-4cbb357f4a56?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Glass brewer kit with reusable mesh filter for smooth concentrate and easy morning routines.",
    stock: 15,
    sizes: ["1 Liter"],
    colors: ["Clear", "Smoke"],
  },
  {
    id: 12,
    name: "Desk Lamp Pro",
    price: 72.99,
    category: "Home Office",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Adjustable task lamp with warm-to-cool lighting, touch controls, and a compact weighted base.",
    stock: 13,
    sizes: ["Standard"],
    colors: ["Matte Black", "Soft White"],
  },
  {
    id: 13,
    name: "Noise Cancelling Earbuds",
    price: 149.99,
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1606220838315-056192d5e927?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Pocket-sized earbuds with active noise cancellation, punchy sound, and a compact charging case.",
    stock: 21,
    sizes: ["Standard"],
    colors: ["Onyx", "Pearl", "Navy"],
  },
  {
    id: 14,
    name: "Performance Training Tee",
    price: 36.99,
    category: "Sports",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1506629905607-d9dbff2c8d98?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Moisture-managing training tee with a smooth handfeel and a cut built for full-range movement.",
    stock: 28,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Graphite", "Mist", "Blue Steel"],
  },
  {
    id: 15,
    name: "Leather Desk Mat",
    price: 54.99,
    category: "Accessories",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Large vegan-leather desk mat that anchors keyboards, notebooks, and a calmer workspace layout.",
    stock: 17,
    sizes: ["Medium", "Large"],
    colors: ["Tan", "Black", "Forest"],
  },
  {
    id: 16,
    name: "Oversized Utility Jacket",
    price: 119.99,
    category: "Apparel",
    image:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Relaxed utility jacket with structured pockets, lightweight insulation, and easy everyday layering.",
    stock: 12,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Khaki", "Coal", "Stone"],
  },
  {
    id: 17,
    name: "Marble Side Tray",
    price: 42.99,
    category: "Home Decor",
    image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Low-profile marble tray for candles, keys, skincare, and small objects that deserve a proper place.",
    stock: 24,
    sizes: ["Standard"],
    colors: ["Ivory", "Charcoal"],
  },
  {
    id: 18,
    name: "Carry-On Organizer Set",
    price: 64.99,
    category: "Travel",
    image:
      "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1523779105320-d1cd346ff52b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1473445361085-b9a07f55608b?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Structured packing cubes and pouches that help you move from airport to hotel without the chaos.",
    stock: 19,
    sizes: ["4 Piece Set"],
    colors: ["Sand", "Charcoal", "Navy"],
  },
  {
    id: 19,
    name: "Barrier Repair Cream",
    price: 28.99,
    category: "Beauty",
    image:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Rich but breathable face cream designed to support the skin barrier and lock in overnight hydration.",
    stock: 32,
    sizes: ["50 ml"],
    colors: ["Cream"],
  },
  {
    id: 20,
    name: "Chef Knife Essentials",
    price: 89.99,
    category: "Kitchen",
    image:
      "https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1514986888952-8cd320577b68?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "A balanced stainless steel chef knife that feels precise for prep work and confident in daily cooking.",
    stock: 9,
    sizes: ["8 Inch"],
    colors: ["Steel", "Walnut"],
  },
  {
    id: 21,
    name: "Ergo Mesh Task Chair",
    price: 249.99,
    category: "Home Office",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Breathable mesh chair with lumbar support, adjustable tilt, and the kind of comfort long workdays need.",
    stock: 7,
    sizes: ["Standard"],
    colors: ["Graphite", "Slate"],
  },
  {
    id: 22,
    name: "Cashmere Travel Wrap",
    price: 94.99,
    category: "Travel",
    image:
      "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Soft oversized wrap that works as a travel layer, plane blanket, or quick polish for cold evenings.",
    stock: 16,
    sizes: ["One Size"],
    colors: ["Camel", "Oat", "Black"],
  },
];

let nextUserId = 3;
let nextOrderId = 2;
let nextReviewId = 5;
let nextProductId = 23;

const users: UserRecord[] = [
  {
    id: 1,
    name: "Demo User",
    email: "demo@shophub.com",
    passwordHash: hashPassword("demo1234"),
    role: "customer",
  },
  {
    id: 2,
    name: "Admin User",
    email: "admin@shophub.com",
    passwordHash: hashPassword("admin1234"),
    role: "admin",
  },
];

const reviews: ReviewRecord[] = [
  {
    id: 1,
    productId: 1,
    userId: 1,
    userName: "Demo User",
    rating: 5,
    text: "Super comfortable for long listening sessions and the battery life has been great.",
    createdAt: "2026-04-17T10:30:00.000Z",
  },
  {
    id: 2,
    productId: 2,
    userId: 1,
    userName: "Demo User",
    rating: 4,
    text: "Clean design and reliable notifications. I wish the charger were a little faster.",
    createdAt: "2026-04-18T12:00:00.000Z",
  },
  {
    id: 3,
    productId: 3,
    userId: 1,
    userName: "Demo User",
    rating: 5,
    text: "Very light and easy on the knees. Great daily trainer.",
    createdAt: "2026-04-19T09:15:00.000Z",
  },
  {
    id: 4,
    productId: 6,
    userId: 1,
    userName: "Demo User",
    rating: 5,
    text: "Typing on this has been a joy. Nicely built and sounds excellent.",
    createdAt: "2026-04-20T14:45:00.000Z",
  },
];

const orders: OrderRecord[] = [
  {
    id: 1,
    userId: 1,
    status: "delivered",
    createdAt: "2026-04-12T08:00:00.000Z",
    subtotal: 149.98,
    discount: 0,
    total: 149.98,
    address: {
      fullName: "Demo User",
      email: "demo@shophub.com",
      phone: "+1 555 0100",
      line1: "221 Market Street",
      city: "San Francisco",
      state: "CA",
      postalCode: "94103",
      country: "United States",
    },
    items: [
      {
        productId: 4,
        name: "Laptop Stand",
        image:
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
        price: 49.99,
        quantity: 1,
        selectedSize: "Standard",
        selectedColor: "Silver",
      },
      {
        productId: 1,
        name: "Wireless Headphones",
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
        price: 99.99,
        quantity: 1,
        selectedSize: "Standard",
        selectedColor: "Midnight",
      },
    ],
  },
];

function hashPassword(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function base64UrlEncode(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const remainder = padded.length % 4;
  const normalized = remainder === 0 ? padded : padded + "=".repeat(4 - remainder);
  return Buffer.from(normalized, "base64").toString("utf8");
}

function signJwt(payload: Record<string, unknown>) {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${body}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${header}.${body}.${signature}`;
}

function verifyJwt(token: string) {
  const [header, body, signature] = token.split(".");

  if (!header || !body || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${body}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  if (expectedSignature !== signature) {
    return null;
  }

  const payload = JSON.parse(base64UrlDecode(body)) as {
    userId: number;
    email: string;
    name: string;
    role: UserRole;
    exp: number;
  };

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

function createToken(user: UserRecord) {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
  return signJwt({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp,
  });
}

function getProductReviews(productId: number) {
  return reviews
    .filter((review) => review.productId === productId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function getProductRating(productId: number) {
  const productReviews = getProductReviews(productId);

  if (productReviews.length === 0) {
    return { rating: 4.5, reviews: 0 };
  }

  const total = productReviews.reduce((sum, review) => sum + review.rating, 0);
  return {
    rating: Number((total / productReviews.length).toFixed(1)),
    reviews: productReviews.length,
  };
}

function serializeProduct(product: ProductRecord) {
  const aggregate = getProductRating(product.id);

  return {
    ...product,
    ...aggregate,
    gallery: product.gallery,
  };
}

function serializeUser(user: UserRecord) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function serializeAdminOrder(order: OrderRecord) {
  const user = users.find((entry) => entry.id === order.userId);

  return {
    ...order,
    user: user ? serializeUser(user) : null,
  };
}

function getCouponResult(code: string, subtotal: number) {
  const coupon = coupons.find((entry) => entry.code === code.trim().toUpperCase());

  if (!coupon) {
    return null;
  }

  const rawDiscount =
    coupon.type === "percent" ? (subtotal * coupon.value) / 100 : coupon.value;
  const discount = Number(Math.min(subtotal, rawDiscount).toFixed(2));

  return {
    ...coupon,
    discount,
  };
}

function requireAuth(
  req: AuthenticatedRequest,
  res: express.Response,
  next: express.NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const payload = verifyJwt(authHeader.slice(7));

  if (!payload) {
    return res.status(401).json({ error: "Invalid token" });
  }

  req.user = {
    id: payload.userId,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  };

  next();
}

function requireAdmin(
  req: AuthenticatedRequest,
  res: express.Response,
  next: express.NextFunction,
) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
}

function toPositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function filterProducts({
  category,
  search,
  minPrice,
  maxPrice,
}: {
  category?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
}) {
  const normalizedCategory = category?.trim().toLowerCase();
  const normalizedSearch = search?.trim().toLowerCase();
  const min = minPrice ? Number(minPrice) : undefined;
  const max = maxPrice ? Number(maxPrice) : undefined;

  return baseProducts
    .filter((product) => {
      const matchesCategory =
        !normalizedCategory || product.category.toLowerCase() === normalizedCategory;0
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch);
      const matchesMin = min === undefined || product.price >= min;
      const matchesMax = max === undefined || product.price <= max;

      return matchesCategory && matchesSearch && matchesMin && matchesMax;
    })
    .map(serializeProduct);
}

function buildOrdersPerDay() {
  const totals = new Map<string, { date: string; orders: number; revenue: number }>();

  for (const order of orders) {
    const date = order.createdAt.slice(0, 10);
    const existing = totals.get(date) ?? { date, orders: 0, revenue: 0 };
    existing.orders += 1;
    existing.revenue = Number((existing.revenue + order.total).toFixed(2));
    totals.set(date, existing);
  }

  return [...totals.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function buildTopProducts() {
  const quantities = new Map<number, { productId: number; name: string; quantity: number; revenue: number }>();

  for (const order of orders) {
    for (const item of order.items) {
      const existing = quantities.get(item.productId) ?? {
        productId: item.productId,
        name: item.name,
        quantity: 0,
        revenue: 0,
      };
      existing.quantity += item.quantity;
      existing.revenue = Number((existing.revenue + item.quantity * item.price).toFixed(2));
      quantities.set(item.productId, existing);
    }
  }

  return [...quantities.values()]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: "An account with that email already exists" });
  }

  const user: UserRecord = {
    id: nextUserId++,
    name,
    email,
    passwordHash: hashPassword(password),
    role: "customer",
  };

  users.push(user);

  res.status(201).json({
    token: createToken(user),
    user: serializeUser(user),
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  const user = users.find((entry) => entry.email.toLowerCase() === email?.toLowerCase());

  if (!user || user.passwordHash !== hashPassword(password ?? "")) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  res.json({
    token: createToken(user),
    user: serializeUser(user),
  });
});

app.get("/api/auth/me", requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

app.get("/api/products", (req, res) => {
  const filtered = filterProducts({
    category: req.query.category as string | undefined,
    search: req.query.search as string | undefined,
    minPrice: req.query.minPrice as string | undefined,
    maxPrice: req.query.maxPrice as string | undefined,
  });
  const limit = toPositiveInt(req.query.limit as string | undefined, filtered.length || 12);
  const offset = Math.max(0, Number.parseInt((req.query.offset as string | undefined) ?? "0", 10) || 0);
  const paginated = filtered.slice(offset, offset + limit);

  res.json({
    items: paginated,
    total: filtered.length,
    categories: [...new Set(baseProducts.map((product) => product.category))],
    limit,
    offset,
    hasMore: offset + limit < filtered.length,
  });
});

app.get("/api/categories", (_req, res) => {
  const counts = baseProducts.reduce<Record<string, number>>((acc, product) => {
    acc[product.category] = (acc[product.category] ?? 0) + 1;
    return acc;
  }, {});

  res.json(
    Object.entries(counts).map(([name, count]) => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      count,
    })),
  );
});

app.get("/api/categories/:slug", (req, res) => {
  const slug = req.params.slug.toLowerCase();
  const categoryName = [...new Set(baseProducts.map((product) => product.category))].find(
    (category) => category.toLowerCase().replace(/\s+/g, "-") === slug,
  );

  if (!categoryName) {
    return res.status(404).json({ error: "Category not found" });
  }

  const filtered = filterProducts({
    category: categoryName,
    search: req.query.search as string | undefined,
    minPrice: req.query.minPrice as string | undefined,
    maxPrice: req.query.maxPrice as string | undefined,
  });
  const limit = toPositiveInt(req.query.limit as string | undefined, filtered.length || 12);
  const offset = Math.max(0, Number.parseInt((req.query.offset as string | undefined) ?? "0", 10) || 0);

  res.json({
    category: {
      name: categoryName,
      slug,
      count: filtered.length,
    },
    items: filtered.slice(offset, offset + limit),
    total: filtered.length,
    limit,
    offset,
    hasMore: offset + limit < filtered.length,
  });
});

app.get("/api/products/:id", (req, res) => {
  const product = baseProducts.find((entry) => entry.id === Number(req.params.id));

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json({
    ...serializeProduct(product),
    reviewItems: getProductReviews(product.id),
  });
});

app.get("/api/products/:id/reviews", (req, res) => {
  res.json(getProductReviews(Number(req.params.id)));
});

app.post("/api/products/:id/reviews", requireAuth, (req: AuthenticatedRequest, res) => {
  const productId = Number(req.params.id);
  const product = baseProducts.find((entry) => entry.id === productId);
  const { rating, text } = req.body as { rating?: number; text?: string };

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  if (!rating || rating < 1 || rating > 5 || !text?.trim()) {
    return res.status(400).json({ error: "Rating and review text are required" });
  }

  const review: ReviewRecord = {
    id: nextReviewId++,
    productId,
    userId: req.user!.id,
    userName: req.user!.name,
    rating,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  reviews.push(review);

  res.status(201).json({
    review,
    aggregate: getProductRating(productId),
  });
});

app.post("/api/coupons/validate", (req, res) => {
  const { code, subtotal } = req.body as { code?: string; subtotal?: number };

  if (!code || typeof subtotal !== "number" || subtotal <= 0) {
    return res.status(400).json({ error: "Coupon code and subtotal are required" });
  }

  const coupon = getCouponResult(code, subtotal);

  if (!coupon) {
    return res.status(404).json({ error: "Coupon not found" });
  }

  res.json(coupon);
});

app.get("/api/orders", requireAuth, (req: AuthenticatedRequest, res) => {
  res.json(
    orders
      .filter((order) => order.userId === req.user!.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
});

app.post("/api/orders", requireAuth, (req: AuthenticatedRequest, res) => {
  const { address, items, couponCode } = req.body as {
    address?: AddressRecord;
    items?: OrderItemRecord[];
    couponCode?: string;
  };

  if (!address || !items?.length) {
    return res.status(400).json({ error: "Address and items are required" });
  }

  const subtotal = Number(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2),
  );
  const coupon = couponCode ? getCouponResult(couponCode, subtotal) : null;
  const discount = coupon?.discount ?? 0;
  const total = Number((subtotal - discount).toFixed(2));

  const order: OrderRecord = {
    id: nextOrderId++,
    userId: req.user!.id,
    status: "pending",
    createdAt: new Date().toISOString(),
    items,
    address,
    subtotal,
    discount,
    total,
    coupon: coupon
      ? {
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          discount: coupon.discount,
        }
      : undefined,
  };

  orders.push(order);
  res.status(201).json(order);
});

app.get("/api/admin/products", requireAuth, requireAdmin, (_req, res) => {
  res.json(baseProducts.map(serializeProduct));
});

app.post("/api/admin/products", requireAuth, requireAdmin, (req, res) => {
  const payload = req.body as Omit<ProductRecord, "id">;
  const fallbackGallery = payload.image
    ? [payload.image, payload.image, payload.image, payload.image]
    : [];

  const product: ProductRecord = {
    id: nextProductId++,
    name: payload.name,
    price: Number(payload.price),
    category: payload.category,
    image: payload.image,
    gallery: payload.gallery?.length ? payload.gallery : fallbackGallery,
    description: payload.description,
    stock: Number(payload.stock),
    sizes: payload.sizes,
    colors: payload.colors,
  };

  baseProducts.push(product);
  res.status(201).json(serializeProduct(product));
});

app.put("/api/admin/products/:id", requireAuth, requireAdmin, (req, res) => {
  const product = baseProducts.find((entry) => entry.id === Number(req.params.id));

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const payload = req.body as Partial<ProductRecord>;

  product.name = payload.name ?? product.name;
  product.price = payload.price !== undefined ? Number(payload.price) : product.price;
  product.category = payload.category ?? product.category;
  product.image = payload.image ?? product.image;
  product.gallery =
    payload.gallery && payload.gallery.length > 0
      ? payload.gallery
      : payload.image
        ? [payload.image, payload.image, payload.image, payload.image]
        : product.gallery;
  product.description = payload.description ?? product.description;
  product.stock = payload.stock !== undefined ? Number(payload.stock) : product.stock;
  product.sizes = payload.sizes ?? product.sizes;
  product.colors = payload.colors ?? product.colors;

  res.json(serializeProduct(product));
});

app.delete("/api/admin/products/:id", requireAuth, requireAdmin, (req, res) => {
  const index = baseProducts.findIndex((entry) => entry.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  const [removed] = baseProducts.splice(index, 1);
  res.json({ success: true, id: removed.id });
});

app.get("/api/admin/orders", requireAuth, requireAdmin, (_req, res) => {
  res.json(
    orders
      .map(serializeAdminOrder)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
});

app.patch("/api/admin/orders/:id/status", requireAuth, requireAdmin, (req, res) => {
  const order = orders.find((entry) => entry.id === Number(req.params.id));
  const { status } = req.body as { status?: OrderRecord["status"] };

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (!status || !["pending", "shipped", "delivered"].includes(status)) {
    return res.status(400).json({ error: "Valid status is required" });
  }

  order.status = status;
  res.json(serializeAdminOrder(order));
});

app.get("/api/admin/analytics", requireAuth, requireAdmin, (_req, res) => {
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalDiscount = orders.reduce((sum, order) => sum + order.discount, 0);

  res.json({
    overview: {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalDiscount: Number(totalDiscount.toFixed(2)),
      totalOrders: orders.length,
      averageOrderValue:
        orders.length > 0 ? Number((totalRevenue / orders.length).toFixed(2)) : 0,
      totalProducts: baseProducts.length,
    },
    ordersPerDay: buildOrdersPerDay(),
    topProducts: buildTopProducts(),
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
