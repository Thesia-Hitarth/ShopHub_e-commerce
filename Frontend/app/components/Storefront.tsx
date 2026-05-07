"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type {
  CategoryProductsResponse,
  CategorySummary,
  Product,
  ProductListResponse,
} from "../lib/products";
import { getCategoryProducts, getProducts } from "../lib/products";
import ProductCard from "./ProductCard";
import ProductGridSkeleton from "./ProductGridSkeleton";
import { useShop } from "./ShopProvider";

type SortValue = "featured" | "price-asc" | "price-desc" | "rating-desc";

interface StorefrontProps {
  initialData: ProductListResponse | CategoryProductsResponse;
  categorySummaries: CategorySummary[];
  categorySlug?: string;
}

export default function Storefront({
  initialData,
  categorySummaries,
  categorySlug,
}: StorefrontProps) {
  const { searchQuery } = useShop();
  const lockedCategory = "category" in initialData ? initialData.category.name : undefined;
  const [selectedCategory, setSelectedCategory] = useState<string>(lockedCategory ?? "All");
  const [sortBy, setSortBy] = useState<SortValue>("featured");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [items, setItems] = useState<Product[]>(initialData.items);
  const [total, setTotal] = useState(initialData.total);
  const [hasMore, setHasMore] = useState(initialData.hasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const hasHydrated = useRef(false);

  const categories = lockedCategory
    ? [lockedCategory]
    : ["All", ...categorySummaries.map((item) => item.name)];
  const normalizedQuery = searchQuery.trim();
  const isCategoryPage = Boolean(lockedCategory);

  useEffect(() => {
    if (!hasHydrated.current) {
      hasHydrated.current = true;
      return;
    }

    const controller = new AbortController();
    const run = async () => {
      setIsLoading(true);
      try {
        const response = isCategoryPage
          ? await getCategoryProducts(categorySlug!, {
              search: normalizedQuery || undefined,
              minPrice: minPrice ? Number(minPrice) : undefined,
              maxPrice: maxPrice ? Number(maxPrice) : undefined,
              limit: 8,
              offset: 0,
            })
          : await getProducts({
              category: selectedCategory === "All" ? undefined : selectedCategory,
              search: normalizedQuery || undefined,
              minPrice: minPrice ? Number(minPrice) : undefined,
              maxPrice: maxPrice ? Number(maxPrice) : undefined,
              limit: 8,
              offset: 0,
            });

        if (!response || controller.signal.aborted) {
          return;
        }

        setItems(response.items);
        setTotal(response.total);
        setHasMore(response.hasMore);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    run();

    return () => controller.abort();
  }, [selectedCategory, normalizedQuery, minPrice, maxPrice, categorySlug, isCategoryPage]);

  const loadMore = async () => {
    setIsLoadingMore(true);

    try {
      const nextOffset = items.length;
      const response = isCategoryPage
        ? await getCategoryProducts(categorySlug!, {
            search: normalizedQuery || undefined,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            limit: 8,
            offset: nextOffset,
          })
        : await getProducts({
            category: selectedCategory === "All" ? undefined : selectedCategory,
            search: normalizedQuery || undefined,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            limit: 8,
            offset: nextOffset,
          });

      if (!response) {
        return;
      }

      setItems((current) => [...current, ...response.items]);
      setHasMore(response.hasMore);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "rating-desc":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const spotlightProduct = sortedItems[0];
  const visibleCount = sortedItems.length;

  return (
    <section id="products" className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {isCategoryPage ? (
          <div className="mb-10">
            <div className="mb-4 flex items-center gap-2 text-sm text-[color:var(--muted)]">
              <Link href="/" className="hover:text-[color:var(--foreground)]">
                Home
              </Link>
              <span>/</span>
              <Link href="/#categories" className="hover:text-[color:var(--foreground)]">
                Categories
              </Link>
              <span>/</span>
              <span className="font-medium text-[color:var(--foreground)]">{lockedCategory}</span>
            </div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <span className="mb-4 inline-block rounded-full border border-[color:var(--line)] bg-[color:var(--surface-strong)] px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.28em] text-[color:var(--accent)]">
                  Category Edit
                </span>
                <h1 className="text-4xl font-semibold text-[color:var(--foreground)] lg:text-5xl">
                  {lockedCategory}
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
                  {total} products in this lane with live filters, paginated browsing, and a cleaner editorial rhythm.
                </p>
              </div>
              <div className="rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3 text-sm text-[color:var(--foreground)]/74">
                {total} total products
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Top-Level Categories Navigation */}
            <div className="mb-8 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {categories.map((category) => {
                const isActive = selectedCategory === category;
                const isAll = category === "All";
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`group relative overflow-hidden rounded-[16px] border p-5 text-left transition-all duration-300 ease-out focus:outline-none ${
                      isActive
                        ? "border-[color:var(--foreground)] bg-[color:var(--foreground)] shadow-md"
                        : "border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] shadow-sm hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface)]"
                    }`}
                  >
                    <div className="relative z-10 flex items-start justify-between gap-3">
                      <div>
                        <p className={`text-[0.62rem] font-bold uppercase tracking-[0.24em] transition-colors duration-300 ${isActive ? "text-[color:var(--background)]/70" : "text-[color:var(--muted)]"}`}>
                          {isAll ? "Full Catalog" : "Category Lane"}
                        </p>
                        <p className={`mt-2 font-display text-[1.1rem] leading-none uppercase tracking-[0.04em] transition-colors duration-300 ${isActive ? "text-[color:var(--background)]" : "text-[color:var(--foreground)]/80 group-hover:text-[color:var(--foreground)]"}`}>
                          {category}
                        </p>
                      </div>
                      <span className={`flex h-[26px] min-w-[26px] items-center justify-center rounded-full px-2 text-[0.68rem] font-bold transition-colors duration-300 ${isActive ? "bg-[color:var(--background)] text-[color:var(--foreground)] shadow-sm" : "bg-[color:var(--surface)] border border-[color:var(--border-soft)] text-[color:var(--muted)] group-hover:border-[color:var(--muted)] group-hover:text-[color:var(--foreground)]"}`}>
                        {isAll ? total : (categorySummaries.find((item) => item.name === category)?.count ?? 0)}
                      </span>
                    </div>
                    <p className={`relative z-10 mt-4 text-[0.82rem] leading-relaxed line-clamp-2 transition-colors duration-300 ${isActive ? "text-[color:var(--background)]/90" : "text-[color:var(--muted)]"}`}>
                      {isAll ? "Explore the entire collection instantly." : `Browse ${category.toLowerCase()} with a focused mix.`}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Global Sort & Details Section Head */}
            <div className="mb-12 flex flex-col justify-between gap-6 border-b border-[color:var(--border-soft)] pb-6 sm:flex-row sm:items-end">
              <div>
                <h2 className="font-display text-3xl font-semibold leading-none text-[color:var(--foreground)] sm:text-4xl">
                  {selectedCategory === "All" ? "Full Catalog" : selectedCategory}
                </h2>
                <p className="mt-3 text-sm text-[color:var(--muted)]">
                  {selectedCategory === "All" 
                    ? "Browse everything we have to offer." 
                    : `Showing all perfectly curated matches for ${selectedCategory.toLowerCase()}.`}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-[44px] items-center rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] px-5 text-[0.75rem] font-bold uppercase tracking-[0.16em] text-[color:var(--muted)] shadow-sm">
                  {total} Items
                </div>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as SortValue)}
                    className="cursor-pointer appearance-none rounded-full border border-[color:var(--border-strong)] bg-[color:var(--foreground)] py-[11px] pl-6 pr-12 text-sm font-bold text-[color:var(--surface)] outline-none transition-transform hover:-translate-y-0.5 active:scale-95 shadow-md"
                  >
                    <option value="featured">Featured Picks</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating-desc">Top Rated</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[color:var(--surface)]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Collection Floor (Promotional Context) */}
            <div className="mb-12 overflow-hidden rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] shadow-sm">
              <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
                <div className="relative overflow-hidden border-b border-[color:var(--border-soft)] p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
                  <div className="relative z-10">
                    <span className="inline-flex rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.32em] text-[color:var(--accent)]">
                      Collection Floor
                    </span>
                    <h2 className="mt-6 max-w-3xl text-4xl font-semibold leading-[0.95] text-[color:var(--foreground)] sm:text-5xl lg:text-[3.6rem]">
                      Everything worth exploring, without the clutter.
                    </h2>
                    <p className="mt-5 max-w-2xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
                      Browse categories, refine fast, and move straight into products from a calmer, more product-first interface.
                    </p>

                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                      {[
                        { label: "Live categories", value: `${categorySummaries.length} lanes` },
                        { label: "Visible now", value: `${visibleCount} products` },
                        {
                          label: "Current mode",
                          value: sortBy === "featured" ? "Editorial sort" : sortBy.replace("-", " "),
                        },
                      ].map((item) => (
                        <div key={item.label} className="rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-4 py-4">
                          <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-[color:var(--muted)]">{item.label}</p>
                          <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col bg-[color:var(--surface)] p-6 sm:p-8 lg:p-10">
                  {spotlightProduct ? (
                    <div className="group relative flex flex-1 flex-col overflow-hidden rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                      <div className="relative min-h-[260px] flex-1 overflow-hidden border-b border-[color:var(--border-soft)]">
                        <img src={spotlightProduct.image} alt={spotlightProduct.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
                        <div className="absolute left-5 top-5">
                          <span className="rounded-full bg-black/40 px-3 py-1.5 text-[0.64rem] font-bold uppercase tracking-[0.24em] text-white backdrop-blur-md shadow-md border border-white/20">
                            {selectedCategory === "All" ? "Catalog lead" : selectedCategory}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col p-6 sm:p-8">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-display text-2xl font-semibold leading-tight text-[color:var(--foreground)] line-clamp-2">{spotlightProduct.name}</h3>
                          <p className="shrink-0 font-display text-2xl font-semibold text-[color:var(--foreground)]">${spotlightProduct.price.toFixed(2)}</p>
                        </div>
                        <p className="mt-4 text-sm leading-relaxed text-[color:var(--muted)] line-clamp-2">{spotlightProduct.description}</p>

                        <div className="mt-8 flex flex-col gap-4">
                          <div className="flex items-center justify-between rounded-[20px] bg-[color:var(--surface)] p-4 px-6 border border-[color:var(--border-soft)]">
                            <div>
                              <p className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">Stock</p>
                              <p className="mt-1 text-sm font-semibold text-[color:var(--foreground)]">{spotlightProduct.stock} units</p>
                            </div>
                            <div className="h-8 border-l border-[color:var(--border-soft)]" />
                            <div className="text-right">
                              <p className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">Pulse Rating</p>
                              <p className="mt-1 text-sm font-semibold text-[color:var(--foreground)]">{spotlightProduct.rating.toFixed(1)} ★</p>
                            </div>
                          </div>
                          <Link href={`/products/${spotlightProduct.id}`} className="flex w-full items-center justify-center rounded-[16px] bg-[color:var(--foreground)] px-4 py-4 text-[0.8rem] font-bold uppercase tracking-[0.2em] text-[color:var(--background)] transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-sm">
                            Explore Product
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </>
        )}

        <div className={`grid gap-8 ${isCategoryPage ? "lg:grid-cols-[260px_1fr]" : ""}`}>
          {isCategoryPage ? (
            <aside className="editorial-shell h-fit rounded-[28px] p-6">
              <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Filters</h2>
              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[color:var(--foreground)]">
                    Search
                  </label>
                  <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-[color:var(--muted)]">
                    {normalizedQuery || "Type in navbar search"}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[color:var(--foreground)]">
                    Min Price
                  </label>
                  <input
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                    placeholder="0"
                    className="w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[color:var(--foreground)]">
                    Max Price
                  </label>
                  <input
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                    placeholder="999"
                    className="w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none"
                  />
                </div>
              </div>
            </aside>
          ) : null}

          <div>
            {isCategoryPage ? (
              <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                <input
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                  placeholder="Min price"
                  className="rounded-full border border-[color:var(--line)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none"
                />
                <input
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  placeholder="Max price"
                  className="rounded-full border border-[color:var(--line)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none"
                />
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortValue)}
                  className="rounded-full border border-[color:var(--line)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating-desc">Top Rated</option>
                </select>
              </div>
            ) : null}

            {isLoading ? (
              <ProductGridSkeleton />
            ) : sortedItems.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {sortedItems.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {hasMore ? (
                  <div className="mt-10 text-center">
                    <button
                      onClick={loadMore}
                      disabled={isLoadingMore}
                      className="rounded-full bg-[color:var(--foreground)] px-8 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-[color:var(--background)] shadow-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
                    >
                      {isLoadingMore ? "Loading..." : "Load more"}
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="rounded-3xl border border-dashed border-[color:var(--line)] bg-[color:var(--surface)] px-6 py-16 text-center">
                <h3 className="mb-2 text-xl font-semibold text-[color:var(--foreground)]">
                  No products found
                </h3>
                <p className="text-[color:var(--muted)]">
                  Try a different keyword, price range, or category.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
