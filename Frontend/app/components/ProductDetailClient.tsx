"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import type { Product, Review } from "../lib/products";
import ProductCard from "./ProductCard";
import { useAuth } from "./AuthProvider";
import { useShop } from "./ShopProvider";

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addToCart, isWishlisted, toggleWishlist, trackRecentlyViewed } = useShop();
  const { token, user } = useAuth();
  const [activeImage, setActiveImage] = useState(product.gallery[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(product.reviewItems ?? []);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewInfo, setReviewInfo] = useState("");
  const [averageRating, setAverageRating] = useState(product.rating);
  const [reviewCount, setReviewCount] = useState(product.reviews);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const inStock = product.stock > 0;

  const handleAddToCart = () => {
    addToCart({
      product,
      quantity,
      selectedSize,
      selectedColor,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const submitReview = async () => {
    if (!token) {
      setReviewError("Please sign in before leaving a review.");
      return;
    }

    setReviewError("");
    setReviewInfo("");

    try {
      const response = await apiFetch<{
        review: Review;
        aggregate: { rating: number; reviews: number };
      }>(`/api/products/${product.id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          text: reviewText,
        }),
      });

      setReviews((current) => [response.review, ...current]);
      setAverageRating(response.aggregate.rating);
      setReviewCount(response.aggregate.reviews);
      setReviewText("");
      setRating(5);
      setReviewInfo("Review added.");
    } catch (submitError) {
      setReviewError(
        submitError instanceof Error ? submitError.message : "Unable to add review",
      );
    }
  };

  useEffect(() => {
    trackRecentlyViewed(product);
    // The tracker is intentionally called once per product view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  useEffect(() => {
    apiFetch<{ items: Product[] }>("/api/products")
      .then((response) => {
        setRelatedProducts(
          response.items
            .filter(
              (candidate) =>
                candidate.id !== product.id && candidate.category === product.category,
            )
            .slice(0, 3),
        );
      })
      .catch(() => undefined);
  }, [product.category, product.id]);

  return (
    <section className="min-h-screen bg-[color:var(--background)] py-8 lg:py-16">
      <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-8">
        
        {/* Split Pane Container */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Left Pane - Sticky Gallery */}
          <div className="lg:sticky lg:top-12 self-start lg:w-3/5 space-y-4">
            <div className="overflow-hidden rounded-[32px] border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] p-3 lg:p-4">
              <img
                src={activeImage}
                alt={product.name}
                className="aspect-[4/4.5] w-full rounded-[28px] object-cover"
              />
            </div>
            {product.gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-3 lg:gap-4 mt-4">
                {product.gallery.map((image) => (
                  <button
                    key={image}
                    onClick={() => setActiveImage(image)}
                    className={`relative overflow-hidden rounded-[24px] border-2 transition-all ${
                      activeImage === image
                        ? "border-[color:var(--accent)] scale-[0.98] shadow-sm"
                        : "border-[color:var(--border-soft)] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={image}
                      alt={product.name}
                      className="aspect-square w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Pane - Content Funnel */}
          <div className="flex flex-col lg:w-2/5 pt-2 lg:pt-10 pb-16">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.28em] text-[color:var(--accent)]">
                  {product.category}
                </p>
                <h1 className="mt-3 font-[family:var(--font-display)] text-4xl lg:text-5xl font-semibold leading-tight tracking-tight text-[color:var(--foreground)]">
                  {product.name}
                </h1>
              </div>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`rounded-full border p-3.5 transition-all active:scale-95 ${
                  isWishlisted(product.id)
                    ? "border-[color:var(--foreground)] bg-[color:var(--foreground)] text-[color:var(--background)] shadow-sm"
                    : "border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] text-[color:var(--foreground)] hover:border-[color:var(--border-strong)]"
                }`}
                aria-label="Toggle wishlist"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isWishlisted(product.id) ? 2.5 : 1.5} d="M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0Z" />
                </svg>
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 rounded-full border border-[color:var(--border-strong)] bg-[color:var(--surface-strong)] px-4 py-1.5 text-[color:var(--foreground)] shadow-sm">
                <svg className="h-3.5 w-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                <span className="font-bold">{averageRating.toFixed(1)}</span>
                <span className="text-[0.7rem] text-[color:var(--muted)] border-l border-[color:var(--border-soft)] pl-2 ml-1">{reviewCount} reviews</span>
              </div>
              <span className={`text-[0.7rem] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border ${inStock ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500' : 'border-red-500/20 bg-red-500/10 text-red-500'}`}>
                {inStock ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>

            <div className="mt-10 font-[family:var(--font-display)] text-5xl font-semibold text-[color:var(--foreground)]">
              ${product.price.toFixed(2)}
            </div>

            <p className="mt-8 text-[1.05rem] leading-8 text-[color:var(--muted)]">
              {product.description}
            </p>

            {/* Configurator Modules */}
            <div className="mt-12 space-y-8 border-t border-[color:var(--border-soft)] pt-10">
              
              {/* Size Selector */}
              <div>
                <p className="mb-4 text-[0.75rem] font-bold uppercase tracking-[0.2em] text-[color:var(--muted)]">Size Format</p>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[4.5rem] rounded-full border px-5 py-3 text-[0.8rem] font-bold uppercase tracking-wider transition-all ${
                        selectedSize === size
                          ? "border-[color:var(--foreground)] bg-[color:var(--foreground)] text-[color:var(--surface)] shadow-md"
                          : "border-[color:var(--border-strong)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:border-[color:var(--foreground)]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selector */}
              <div>
                <p className="mb-4 text-[0.75rem] font-bold uppercase tracking-[0.2em] text-[color:var(--muted)]">Color Finish</p>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`rounded-full border px-6 py-3 text-[0.8rem] font-bold uppercase tracking-wider transition-all ${
                        selectedColor === color
                          ? "border-[color:var(--foreground)] bg-[color:var(--foreground)] text-[color:var(--surface)] shadow-md"
                          : "border-[color:var(--border-strong)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:border-[color:var(--foreground)]"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Counter */}
              <div>
                <p className="mb-4 text-[0.75rem] font-bold uppercase tracking-[0.2em] text-[color:var(--muted)]">Quantity</p>
                <div className="inline-flex items-center space-x-3 rounded-full border border-[color:var(--border-strong)] bg-[color:var(--surface)] p-1 shadow-sm">
                  <button
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-[color:var(--surface-strong)] text-[color:var(--foreground)]"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </button>
                  <span className="min-w-[2.5rem] text-center text-[0.95rem] font-bold text-[color:var(--foreground)]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((current) => current + 1)}
                    className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-[color:var(--surface-strong)] text-[color:var(--foreground)]"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Buy Row */}
            <div className="mt-14 flex flex-col gap-4 sm:flex-row pb-12 border-b border-[color:var(--border-soft)]">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`flex-1 rounded-full px-8 py-5 text-[0.8rem] font-bold uppercase tracking-[0.2em] transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 ${
                  added
                    ? "bg-[color:var(--foreground)] text-[color:var(--background)] opacity-90 scale-[0.98]"
                    : "bg-[color:var(--foreground)] text-[color:var(--background)] shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]"
                }`}
              >
                {added ? "Added To Bag" : "Add To Bag"}
              </button>
              <Link
                href="/cart"
                className="flex items-center justify-center rounded-full border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-10 py-5 text-[0.8rem] font-bold uppercase tracking-[0.2em] text-[color:var(--foreground)] transition-colors hover:border-[color:var(--foreground)] hover:bg-[color:var(--surface-strong)]"
              >
                View Bag
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-8 lg:mt-24 lg:grid-cols-[360px_1fr]">
          {/* Write a review box */}
          <div className="rounded-[30px] border border-[color:var(--border-strong)] bg-[color:var(--surface-strong)] p-8 shadow-sm h-max">
            <h2 className="font-[family:var(--font-display)] text-2xl font-bold text-[color:var(--foreground)]">Leave a review</h2>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              {user ? `Posting publicly as ${user.name}` : "Sign in to share your thoughts and notes."}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setRating(value)}
                  className={`rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all ${
                    rating === value
                      ? "border-[color:var(--foreground)] bg-[color:var(--foreground)] text-[color:var(--surface)] shadow-md"
                      : "border border-[color:var(--border-soft)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:border-[color:var(--border-strong)]"
                  }`}
                >
                  {value} <span className="opacity-60 ml-0.5">★</span>
                </button>
              ))}
            </div>
            <textarea
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              rows={4}
              placeholder="What stood out once you actually used it?"
              className="mt-6 w-full rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-5 py-4 text-[0.95rem] text-[color:var(--foreground)] outline-none transition-all focus:border-[color:var(--accent)] focus:ring-1 focus:ring-[color:var(--accent)]"
            />
            {reviewError ? (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500 font-semibold">
                {reviewError}
              </div>
            ) : null}
            {reviewInfo ? (
              <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500 font-semibold">
                {reviewInfo}
              </div>
            ) : null}
            <button
              onClick={submitReview}
              className="mt-6 w-full rounded-full border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-6 py-4 text-[0.8rem] font-bold uppercase tracking-[0.2em] text-[color:var(--foreground)] transition-colors hover:border-[color:var(--foreground)] hover:bg-[color:var(--foreground)] hover:text-[color:var(--surface)]"
            >
              Submit Rating
            </button>
          </div>

          {/* Social Proof / Read reviews */}
          <div className="rounded-[30px] border border-[color:var(--border-soft)] p-8">
            <div className="flex items-end justify-between gap-4 border-b border-[color:var(--border-soft)] pb-6">
              <div>
                <h2 className="font-[family:var(--font-display)] text-3xl font-bold text-[color:var(--foreground)]">Customer Reviews</h2>
                <div className="mt-3 flex items-center gap-2">
                  <span className="font-bold text-[color:var(--foreground)]">{averageRating.toFixed(1)}</span>
                  <span className="text-sm text-[color:var(--muted)]">Calculated from {reviewCount} real buyers</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-6 transition-colors hover:border-[color:var(--border-strong)]">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-bold text-[color:var(--foreground)]">{review.userName}</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[color:var(--muted)]">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full border border-[color:var(--border-strong)] bg-[color:var(--surface-strong)] px-3 py-1.5 text-[0.7rem] font-bold text-[color:var(--foreground)]">
                      {review.rating} <span className="text-[color:var(--muted)]">/</span> 5
                    </div>
                  </div>
                  <p className="mt-4 text-[0.95rem] leading-7 text-[color:var(--muted)]">{review.text}</p>
                </div>
              ))}
              {reviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[color:var(--border-strong)] p-12 text-center text-[color:var(--muted)]">
                  <p className="font-semibold text-[color:var(--foreground)]">No reviews yet.</p>
                  <p className="mt-2 text-sm">Be the first to share your thoughts.</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 ? (
          <div className="mt-24 border-t border-[color:var(--border-soft)] pt-16">
            <div className="mb-10 text-center font-[family:var(--font-display)]">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.28em] text-[color:var(--accent)]">Explore Related</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-[color:var(--foreground)] sm:text-4xl">More from {product.category}</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 mt-12">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
