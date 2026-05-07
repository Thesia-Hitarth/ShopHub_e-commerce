"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Product } from "../lib/products";
import { useToast } from "./ToastProvider";

interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface AddToCartPayload {
  product: Product;
  quantity?: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface ShopContextValue {
  cart: CartItem[];
  wishlist: number[];
  recentlyViewed: Product[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addToCart: (payload: AddToCartPayload) => void;
  removeFromCart: (productId: number, selectedSize?: string, selectedColor?: string) => void;
  updateCartQuantity: (
    productId: number,
    quantity: number,
    selectedSize?: string,
    selectedColor?: string,
  ) => void;
  toggleWishlist: (productId: number) => void;
  isWishlisted: (productId: number) => boolean;
  cartCount: number;
  wishlistCount: number;
  subtotal: number;
  clearCart: () => void;
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  trackRecentlyViewed: (product: Product) => void;
}

const CART_STORAGE_KEY = "shophub-cart";
const WISHLIST_STORAGE_KEY = "shophub-wishlist";
const RECENTLY_VIEWED_STORAGE_KEY = "shophub-recently-viewed";

const ShopContext = createContext<ShopContextValue | null>(null);

function isSameVariant(
  item: CartItem,
  productId: number,
  selectedSize?: string,
  selectedColor?: string,
) {
  return (
    item.product.id === productId &&
    item.selectedSize === selectedSize &&
    item.selectedColor === selectedColor
  );
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  useEffect(() => {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    const storedWishlist = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    const storedRecentlyViewed = window.localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);

    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }

    if (storedWishlist) {
      setWishlist(JSON.parse(storedWishlist));
    }

    if (storedRecentlyViewed) {
      setRecentlyViewed(JSON.parse(storedRecentlyViewed));
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    window.localStorage.setItem(
      RECENTLY_VIEWED_STORAGE_KEY,
      JSON.stringify(recentlyViewed),
    );
  }, [recentlyViewed]);

  const addToCart = ({
    product,
    quantity = 1,
    selectedSize,
    selectedColor,
  }: AddToCartPayload) => {
    setCart((current) => {
      const existingItem = current.find((item) =>
        isSameVariant(item, product.id, selectedSize, selectedColor),
      );

      if (!existingItem) {
        return [...current, { product, quantity, selectedSize, selectedColor }];
      }

      return current.map((item) =>
        isSameVariant(item, product.id, selectedSize, selectedColor)
          ? { ...item, quantity: item.quantity + quantity }
          : item,
      );
    });
    showToast(`${product.name} added to cart`, "success");
  };

  const removeFromCart = (
    productId: number,
    selectedSize?: string,
    selectedColor?: string,
  ) => {
    setCart((current) =>
      current.filter(
        (item) => !isSameVariant(item, productId, selectedSize, selectedColor),
      ),
    );
  };

  const updateCartQuantity = (
    productId: number,
    quantity: number,
    selectedSize?: string,
    selectedColor?: string,
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize, selectedColor);
      return;
    }

    setCart((current) =>
      current.map((item) =>
        isSameVariant(item, productId, selectedSize, selectedColor)
          ? { ...item, quantity }
          : item,
      ),
    );
  };

  const toggleWishlist = (productId: number) => {
    const isAlreadyWishlisted = wishlist.includes(productId);

    setWishlist((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
    showToast(
      isAlreadyWishlisted ? "Removed from wishlist" : "Saved to wishlist",
      "info",
    );
  };

  const trackRecentlyViewed = (product: Product) => {
    setRecentlyViewed((current) => {
      const next = [
        product,
        ...current.filter((entry) => entry.id !== product.id),
      ].slice(0, 6);

      return next;
    });
  };

  const value: ShopContextValue = {
    cart,
    wishlist,
    recentlyViewed,
    searchQuery,
    setSearchQuery,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    toggleWishlist,
    isWishlisted: (productId: number) => wishlist.includes(productId),
    cartCount: cart.reduce((total, item) => total + item.quantity, 0),
    wishlistCount: wishlist.length,
    subtotal: cart.reduce((total, item) => total + item.product.price * item.quantity, 0),
    clearCart: () => setCart([]),
    isCartDrawerOpen,
    openCartDrawer: () => setIsCartDrawerOpen(true),
    closeCartDrawer: () => setIsCartDrawerOpen(false),
    trackRecentlyViewed,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);

  if (!context) {
    throw new Error("useShop must be used inside ShopProvider");
  }

  return context;
}
