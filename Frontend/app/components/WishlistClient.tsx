"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import type { Product } from "../lib/products";
import { useShop } from "./ShopProvider";

export default function WishlistClient() {
  const { wishlist, toggleWishlist, addToCart } = useShop();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    apiFetch<{ items: Product[] }>("/api/products")
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setProducts(response.items.filter((product) => wishlist.includes(product.id)));
      })
      .catch(() => {
        if (isMounted) {
          setProducts([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [wishlist]);

  return (
    <section className="bg-white py-12 dark:bg-slate-950 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white lg:text-4xl">
            Your Wishlist
          </h1>
          <p className="mt-3 text-gray-600 dark:text-slate-300">
            Keep favorite finds close, then send them to cart when you are ready.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center text-gray-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            Loading wishlist...
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Your wishlist is empty
            </h2>
            <p className="mt-2 text-gray-500 dark:text-slate-400">
              Tap the heart on any product and it will show up here.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white"
            >
              Discover products
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="rounded-[28px] border border-gray-100 bg-gray-50 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <Link href={`/products/${product.id}`} className="block overflow-hidden rounded-2xl">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="aspect-square w-full object-cover"
                  />
                </Link>
                <div className="mt-4">
                  <p className="text-sm font-medium text-indigo-600">{product.category}</p>
                  <Link href={`/products/${product.id}`}>
                    <h2 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
                      {product.name}
                    </h2>
                  </Link>
                  <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                    {product.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-amber-600">
                      {product.rating.toFixed(1)} / 5
                    </span>
                  </div>
                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() =>
                        addToCart({
                          product,
                          selectedSize: product.sizes[0],
                          selectedColor: product.colors[0],
                        })
                      }
                      className="flex-1 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white"
                    >
                      Add to cart
                    </button>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="rounded-full border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 dark:border-slate-700 dark:text-slate-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
