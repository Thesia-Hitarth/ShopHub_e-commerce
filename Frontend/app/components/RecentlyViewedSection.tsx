"use client";

import Link from "next/link";
import { useShop } from "./ShopProvider";

export default function RecentlyViewedSection() {
  const { recentlyViewed } = useShop();

  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.34em] text-[color:var(--muted)]">
              Recently Viewed
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-[color:var(--foreground)] sm:text-4xl">
              Pick up where you left off.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[color:var(--muted)]">
            A lightweight ecommerce staple so shoppers can jump back into products they just explored.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {recentlyViewed.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="overflow-hidden rounded-[28px] border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] p-4 shadow-[0_12px_30px_rgba(17,17,17,0.05)]"
            >
              <img
                src={product.image}
                alt={product.name}
                className="aspect-square w-full rounded-[22px] object-cover"
              />
              <div className="mt-4">
                <p className="text-sm font-medium text-[color:var(--accent)]">{product.category}</p>
                <h3 className="mt-1 text-lg font-semibold text-[color:var(--foreground)]">
                  {product.name}
                </h3>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="font-semibold text-[color:var(--foreground)]">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-[color:var(--muted)]">{product.rating.toFixed(1)} / 5</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
