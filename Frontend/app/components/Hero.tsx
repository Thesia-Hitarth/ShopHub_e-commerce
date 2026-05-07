"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Product } from "../lib/products";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80";

const slideThemes = [
  {
    eyebrow: "New Drop",
    kicker:
      "A sharper interface for discovering high-rotation products with less noise and more momentum.",
  },
  {
    eyebrow: "Launch Edit",
    kicker:
      "Minimal framing, stronger hierarchy, and a faster route from first glance to product intent.",
  },
  {
    eyebrow: "Motion Layer",
    kicker:
      "Cleaner browsing built around bold typography, animated spotlighting, and product-led storytelling.",
  },
];

const marqueeLabels = [
  "Fast checkout",
  "Wishlist ready",
  "Live categories",
  "Responsive UI",
  "Modern product flow",
  "Trust-building layout",
];

export default function Hero({ products }: { products: Product[] }) {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const ringRef = useRef<HTMLDivElement>(null);

  // Smooth rotation tracking
  const angleRef = useRef(0);
  const targetAngleRef = useRef(0);
  const pausedRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  // Responsive 3D dimensions
  const [dimensions, setDimensions] = useState({
    CARD_W: 148,
    CARD_H: 192,
    RADIUS: 186,
  });

  const featured = products.slice(0, 6);
  const total = featured.length;

  const slides = featured.map((product, index) => ({
    product: { ...product, image: product.image || FALLBACK_IMAGE },
    ...slideThemes[index % slideThemes.length],
  }));

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 640) {
        setDimensions({ CARD_W: 140, CARD_H: 180, RADIUS: 150 });
      } else if (window.innerWidth < 1024) {
        setDimensions({ CARD_W: 190, CARD_H: 260, RADIUS: 270 });
      } else {
        setDimensions({ CARD_W: 240, CARD_H: 330, RADIUS: 370 });
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Continuous buttery smooth rotation via RAF + Lerp
  useEffect(() => {
    if (total < 2) return;
    let lastTime: number | null = null;
    const SPEED = 0.018; // base auto-rotate speed in degrees/ms

    function animate(time: number) {
      if (!pausedRef.current) {
        if (lastTime !== null) {
          // Cap the delta time to 50ms to prevent high-speed spinning when coming back from an inactive tab
          const deltaTime = Math.min(time - lastTime, 50);
          targetAngleRef.current -= deltaTime * SPEED;
        }
      }
      lastTime = time;

      // Soft spring/lerp towards the target angle
      angleRef.current += (targetAngleRef.current - angleRef.current) * 0.05;

      if (ringRef.current) {
        ringRef.current.style.transform = `rotateY(${angleRef.current}deg)`;
      }

      // Automatically determine WHICH slide is facing front so it highlights
      const degPerCard = 360 / total;
      const normalised = ((-angleRef.current % 360) + 360) % 360;
      const front = Math.round(normalised / degPerCard) % total;
      setCurrentSlide((prev) => (prev !== front ? front : prev));

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [total]);

  // Snap instantly targets the clicked card and lets the lerp drift it to front
  function snapTo(idx: number) {
    const degPerCard = 360 / total;
    const currentMod = ((targetAngleRef.current % 360) + 360) % 360;
    const targetMod = ((-(idx * degPerCard) % 360) + 360) % 360;

    let delta = targetMod - currentMod;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    targetAngleRef.current += delta;

    // Pause auto-rotation for a few seconds to let them view
    pausedRef.current = true;
    setTimeout(() => {
      pausedRef.current = false;
    }, 5000);
  }

  if (slides.length === 0) return null;

  const activeSlide = slides[currentSlide];
  const { CARD_W, CARD_H, RADIUS } = dimensions;

  return (
    <section className="relative overflow-hidden px-4 pb-8 pt-4 sm:px-6 lg:px-8 lg:pb-12">
      <div className="mx-auto max-w-[90rem]">
        {/* We use a vertical stack (flex-col) to place the carousel purely ON TOP and text BELOW nicely */}
        <div className="hero-panel flex flex-col overflow-hidden rounded-[40px] shadow-[0_40px_100px_rgba(15,23,42,0.18)] border border-[color:var(--hero-panel-border)]">

          {/* ── TOP SECTION: 3D Orbital Carousel ──────────────────── */}
          <div className="hero-right relative flex flex-col overflow-hidden p-6 sm:p-8 lg:min-h-[640px] lg:p-12 xl:p-16 border-b border-[color:var(--hero-panel-border)]">
            <div className="spotlight-grid absolute inset-0 pointer-events-none opacity-60" />

            {/* Ambient center stage glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(circle at 50% 50%, var(--accent-soft) 0%, transparent 60%)",
              }}
            />

            <div key={`carousel-top`} className="hero-fade-enter relative z-10 flex h-full flex-col">

              {/* Product spotlight header */}
              <div
                className="flex items-center justify-between rounded-[22px] px-5 py-4 lg:mx-auto lg:w-[60%] border border-[color:var(--border-soft)] bg-[color:var(--surface)] shadow-sm backdrop-blur-md"
              >
                <div>
                  <p className="text-[0.66rem] font-bold uppercase tracking-[0.28em] text-[color:var(--muted)]">
                    Spotlight
                  </p>
                  <p className="mt-1 text-base font-semibold text-[color:var(--foreground)]">
                    {activeSlide.product.category}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[0.66rem] font-bold uppercase tracking-[0.28em] text-[color:var(--muted)]">
                    Price
                  </p>
                  <p className="mt-1 text-base font-semibold text-[color:var(--foreground)]">
                    ${activeSlide.product.price.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* ── 3D CIRCULAR RING ENGINE ── */}
              <div
                className="relative flex flex-1 items-center justify-center my-10 lg:my-16"
                style={{ minHeight: CARD_H + 40 }}
                //onMouseEnter={() => { pausedRef.current = true; }}
                onMouseLeave={() => { pausedRef.current = false; }}
              >
                {/* Visual anchor ring under cards */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    width: RADIUS * 2.2,
                    height: RADIUS * 2.2,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, var(--accent-soft) 0%, transparent 65%)",
                    border: "1px dashed var(--border-soft)",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%) rotateX(65deg)",
                  }}
                />

                {/* Perspective engine wrapper */}
                <div
                  className="relative"
                  style={{
                    width: CARD_W,
                    height: CARD_H,
                    perspective: "1400px",
                    perspectiveOrigin: "50% 50%",
                  }}
                >
                  <div
                    ref={ringRef}
                    style={{
                      position: "absolute",
                      inset: 0,
                      transformStyle: "preserve-3d",
                      willChange: "transform",
                    }}
                  >
                    {slides.map((slide, idx) => {
                      const cardAngle = (360 / total) * idx;
                      const isActive = idx === currentSlide;
                      return (
                        <div
                          key={slide.product.id}
                          onClick={() => {
                            if (isActive) {
                              router.push(`/products/${slide.product.id}`);
                            } else {
                              snapTo(idx);
                            }
                          }}
                          style={{
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            width: CARD_W,
                            height: CARD_H,
                            marginLeft: -CARD_W / 2,
                            marginTop: -CARD_H / 2,
                            transform: `rotateY(${cardAngle}deg) translateZ(${RADIUS}px)`,
                            backfaceVisibility: "hidden",
                            WebkitBackfaceVisibility: "hidden",
                            cursor: "pointer",
                            borderRadius: 18,
                            overflow: "hidden",
                            border: isActive
                              ? "1px solid var(--foreground)"
                              : "1px solid var(--border-soft)",
                            boxShadow: isActive
                              ? "0 0 0 1px var(--foreground), 0 20px 40px rgba(0,0,0,0.12)"
                              : "0 10px 30px rgba(0,0,0,0.04)",
                            opacity: isActive ? 1 : 0.65,
                            transition: "border 0.4s, box-shadow 0.4s, opacity 0.4s",
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={slide.product.image}
                            alt={slide.product.name}
                            onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                              pointerEvents: "none",
                              filter: isActive ? "brightness(1)" : "brightness(0.7)",
                              transition: "filter 0.4s"
                            }}
                          />
                          {/* Overlay Gradient & Name */}
                          <div
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
                              padding: "24px 12px 12px",
                            }}
                          >
                            <p
                              style={{
                                color: "#fff",
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.14em",
                                margin: 0,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {slide.product.name}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Product detail cards bottom area */}
              <div className="grid gap-3 lg:mx-auto lg:w-[60%] lg:grid-cols-2">
                <div className="rounded-[18px] p-5 border border-[color:var(--border-soft)] bg-[color:var(--surface)] shadow-sm backdrop-blur-md">
                  <p className="text-[0.64rem] font-bold uppercase tracking-[0.28em] text-[color:var(--muted)]">
                    Why it lands
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--foreground)]">
                    {activeSlide.product.description?.split(" ").slice(0, 16).join(" ")}…
                  </p>
                </div>
                <div className="rounded-[18px] p-5 border border-[color:var(--border-soft)] bg-[color:var(--surface)] shadow-sm backdrop-blur-md">
                  <p className="text-[0.64rem] font-bold uppercase tracking-[0.28em] text-[color:var(--muted)]">
                    Product pulse
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">
                    {activeSlide.product.rating?.toFixed(1) ?? "–"}
                    <span className="ml-1 text-sm font-normal text-[color:var(--muted)]">
                      ★
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">
                    {activeSlide.product.reviews ?? 0} reviews · {activeSlide.product.stock ?? 0} in stock
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* ── BOTTOM SECTION: Editorial Typography ──────────────── */}
          <div className="hero-left relative flex flex-col p-6 sm:p-8 lg:p-14 xl:p-16 lg:flex-row lg:items-center lg:justify-between lg:gap-16">

            {/* Left/Content side */}
            <div className="flex-1 max-w-3xl">
              <div className="flex flex-wrap items-center gap-4">
                <span className="hero-badge rounded-full px-4 py-2 text-[0.72rem] font-bold uppercase tracking-[0.34em]">
                  {activeSlide.eyebrow}
                </span>
                <div className="hero-badge hidden sm:flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: "var(--accent)" }} />
                  Live storefront
                </div>
              </div>

              <div className="mt-8">
                <p className="text-[0.76rem] font-bold uppercase tracking-[0.34em] text-[color:var(--accent)]">
                  Ecommerce Experience
                </p>
                <h1 className="mt-5 text-[3.2rem] font-semibold leading-[0.9] tracking-[-0.06em] sm:text-[4.5rem] lg:text-[5.5rem] text-[color:var(--foreground)]">
                  Build desire
                  <span className="headline-glow block mt-1">before the click.</span>
                </h1>
                <p className="mt-6 max-w-2xl text-base sm:text-lg leading-8 text-[color:var(--muted)]">
                  {activeSlide.kicker} Inspired by product-stage heroes that feel intentional, cinematic, and high-converting without sacrificing clarity.
                </p>
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href={`/products/${activeSlide.product.id}`}
                  className="hero-btn-primary rounded-full px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] shadow-[0_12px_24px_rgba(15,23,42,0.18)]"
                >
                  Explore Lead Product
                </Link>
                <Link
                  href="/#products"
                  className="hero-btn-secondary rounded-full px-8 py-4 text-sm font-bold uppercase tracking-[0.18em]"
                >
                  Browse Collection
                </Link>
              </div>
            </div>

            {/* Right/Stats side */}
            <div className="mt-12 flex w-full flex-col gap-5 lg:mt-0 lg:w-[440px]">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
                {[
                  { label: "Products", value: `${products.length}+` },
                  { label: "Experience", value: "Motion driven" },
                  { label: "Design", value: "Dark mode" },
                  { label: "Flow", value: "Curated" },
                ].map((item) => (
                  <div key={item.label} className="hero-stat-card rounded-[22px] px-5 py-4">
                    <p className="text-[0.64rem] font-bold uppercase tracking-[0.3em] text-[color:var(--muted)]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-xl font-semibold text-[color:var(--foreground)]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Marquee tag strip */}
              <div className="marquee-strip hero-stat-card rounded-[22px] px-4 py-4">
                <div className="marquee-track">
                  {[...marqueeLabels, ...marqueeLabels].map((label, index) => (
                    <span
                      key={`${label}-${index}`}
                      className="hero-marquee-tag inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]"
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
