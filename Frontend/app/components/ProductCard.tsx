"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "../lib/products";
import { useShop } from "./ShopProvider";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart, isWishlisted, toggleWishlist } = useShop();

  const handleAddToCart = () => {
    addToCart({
      product,
      selectedSize: product.sizes[0],
      selectedColor: product.colors[0],
    });
    setIsAdded(true);
    window.setTimeout(() => setIsAdded(false), 1800);
  };

  return (
    <article className="group glass-card flex h-full flex-col overflow-hidden rounded-[30px]">
      <div className="relative overflow-hidden bg-[color:var(--surface-strong)] border-b border-[color:var(--border-soft)]">
        <Link href={`/products/${product.id}`} className="block">
          <img
            src={product.image}
            alt={product.name}
            className="aspect-[4/4.8] w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          />
        </Link>

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <span className="rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[color:var(--foreground)] backdrop-blur-sm shadow-sm">
            {product.category}
          </span>
          <button
            onClick={() => toggleWishlist(product.id)}
            className={`rounded-full border p-2.5 backdrop-blur-sm ${
              isWishlisted(product.id)
                ? "border-[color:var(--foreground)] bg-[color:var(--foreground)] text-[color:var(--background)]"
                : "border-[color:var(--border-soft)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:scale-105"
            } transition-all`}
            aria-label="Toggle wishlist"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0Z" />
            </svg>
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 translate-y-5 px-4 pb-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Link
            href={`/products/${product.id}`}
            className="block rounded-full bg-[color:var(--foreground)] px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--background)] shadow-lg hover:scale-[1.02] transition-transform"
          >
            Quick View
          </Link>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.28em] text-[color:var(--accent)]">
              Featured piece
            </p>
            <Link href={`/products/${product.id}`} className="mt-2 block">
              <h3 className="line-clamp-2 min-h-[3.2rem] font-[family:var(--font-display)] text-[1.35rem] leading-tight text-[color:var(--foreground)]">
                {product.name}
              </h3>
            </Link>
          </div>
          <div className="text-right">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
              Price
            </p>
            <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
              ${product.price.toFixed(2)}
            </p>
          </div>
        </div>

        <p className="mt-4 line-clamp-2 min-h-[3rem] text-sm leading-6 text-[color:var(--muted)]">
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-1 border-t border-[color:var(--border-soft)] pt-5 sm:gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="whitespace-nowrap text-xs font-semibold text-[color:var(--foreground)] sm:text-sm">
              {product.rating.toFixed(1)}
            </span>
            <span className="whitespace-nowrap text-[0.7rem] text-[color:var(--muted)] sm:text-xs">
              {product.reviews} reviews
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            className={`whitespace-nowrap rounded-full px-3 py-2 text-[0.65rem] font-bold uppercase tracking-wider transition-all sm:px-4 sm:py-2.5 sm:text-xs sm:tracking-[0.12em] ${
              isAdded
                ? "bg-[color:var(--foreground)] text-[color:var(--background)] scale-95"
                : "border border-[color:var(--border-soft)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:border-[color:var(--foreground)] hover:bg-[color:var(--foreground)] hover:text-[color:var(--background)]"
            }`}
          >
            {isAdded ? "Added" : "Add To Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
