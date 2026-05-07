"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";
import { useShop } from "./ShopProvider";
import { useTheme } from "./ThemeProvider";

const primaryLinks = [
  { href: "/", label: "New Season" },
  { href: "/#products", label: "Collections" },
  { href: "/#categories", label: "Editions" },
  { href: "/profile", label: "Profile" },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { cartCount, wishlistCount, searchQuery, setSearchQuery } = useShop();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 24) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      if (currentScrollY > lastScrollY.current + 8) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current - 8) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const themeLabel = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <nav
      className={`sticky top-0 z-50 border-b border-[color:var(--border-soft)] bg-[color:var(--background)]/72 backdrop-blur-2xl transition-transform duration-500 ${
        isVisible ? "translate-y-0" : "-translate-y-[115%]"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="glass-card overflow-hidden rounded-[28px] px-4 py-3 sm:px-5 lg:px-7">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 lg:gap-6">
              <button
                className="rounded-full border border-[color:var(--line)] p-2.5 text-[color:var(--foreground)] md:hidden"
                onClick={() => setIsMobileMenuOpen((current) => !current)}
                aria-label="Toggle menu"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>

              <Link href="/" className="flex flex-col leading-none">
                <span className="font-[family:var(--font-display)] text-[1.8rem] font-semibold tracking-[-0.08em] text-[color:var(--foreground)] sm:text-[2.1rem]">
                  ShopHub
                </span>
                <span className="mt-1 hidden text-[0.62rem] uppercase tracking-[0.38em] text-[color:var(--accent)] sm:block">
                  Motion Commerce
                </span>
              </Link>

              <div className="hidden items-center gap-5 xl:flex">
                {primaryLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm font-semibold text-[color:var(--foreground)]/74 hover:text-[color:var(--accent)]"
                  >
                    {link.label}
                  </Link>
                ))}
                {user?.role === "admin" ? (
                  <Link
                    href="/admin"
                    className="text-sm font-semibold text-[color:var(--foreground)]/74 hover:text-[color:var(--accent)]"
                  >
                    Control Room
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="hidden min-w-0 flex-1 px-4 lg:block xl:max-w-xl">
              <label className="flex items-center gap-3 rounded-full border border-[color:var(--line)] bg-[color:var(--surface-strong)]/88 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                <svg className="h-4 w-4 shrink-0 text-[color:var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
                </svg>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search collections, product names, categories"
                  className="w-full bg-transparent text-sm text-[color:var(--foreground)] outline-none placeholder:text-[color:var(--muted)]"
                />
              </label>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={toggleTheme}
                aria-label={themeLabel}
                title={themeLabel}
                className="hidden rounded-full border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-2.5 text-[color:var(--foreground)] hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-soft)] md:block"
              >
                {theme === "dark" ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m0 13.5V21m9-9h-2.25M5.25 12H3m15.114 6.364-1.59-1.59M7.476 7.476l-1.59-1.59m12.228 0-1.59 1.59M7.476 16.524l-1.59 1.59M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12.79A9 9 0 1 1 11.21 3c-.02.27-.03.54-.03.81A9 9 0 0 0 20.19 12c.27 0 .54-.01.81-.03Z" />
                  </svg>
                )}
              </button>

              <Link
                href="/wishlist"
                aria-label="Open wishlist"
                className="relative rounded-full border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-2.5 text-[color:var(--foreground)] hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-soft)]"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0Z" />
                </svg>
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--foreground)] px-1 text-[10px] font-bold text-[color:var(--background)]">
                  {wishlistCount}
                </span>
              </Link>

              <Link
                href="/cart"
                aria-label="Open cart"
                className="relative rounded-full border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-2.5 text-[color:var(--foreground)] hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-soft)]"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V8a4 4 0 1 0-8 0v3M5 10h14l1 10H4L5 10Z" />
                </svg>
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--accent)] px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              </Link>

              {user ? (
                <div className="hidden items-center gap-2 sm:flex">
                  <Link
                    href={user.role === "admin" ? "/admin" : "/profile"}
                    className="rounded-full bg-[color:var(--foreground)] px-4 py-2 text-sm font-semibold text-[color:var(--background)] shadow-sm hover:scale-105 transition-transform"
                  >
                    {user.role === "admin" ? "Admin" : user.name.split(" ")[0]}
                  </Link>
                  <button
                    onClick={logout}
                    className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]/76 hover:border-[color:var(--accent)]"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="hidden rounded-full bg-[color:var(--foreground)] px-4 py-2 text-sm font-semibold text-[color:var(--background)] shadow-sm hover:scale-105 transition-transform sm:block"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {isMobileMenuOpen ? (
            <div className="mt-4 space-y-4 border-t border-[color:var(--border-soft)] pt-4 md:hidden">
              <label className="flex items-center gap-3 rounded-[22px] border border-[color:var(--line)] bg-[color:var(--surface-strong)]/88 px-4 py-3">
                <svg className="h-4 w-4 shrink-0 text-[color:var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
                </svg>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search the catalog"
                  className="w-full bg-transparent text-sm text-[color:var(--foreground)] outline-none placeholder:text-[color:var(--muted)]"
                />
              </label>

              <div className="grid gap-2">
                {[...primaryLinks, ...(user?.role === "admin" ? [{ href: "/admin", label: "Control Room" }] : [])].map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="rounded-[20px] border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm font-semibold text-[color:var(--foreground)]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={toggleTheme}
                  aria-label={themeLabel}
                  className="rounded-full border border-[color:var(--line)] px-4 py-3 text-sm font-semibold text-[color:var(--foreground)]"
                >
                  {theme === "dark" ? "Light" : "Dark"}
                </button>
                <Link
                  href="/cart"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-full bg-[color:var(--foreground)] px-4 py-3 text-sm font-semibold text-[color:var(--background)]"
                >
                  Cart
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-full border border-[color:var(--line)] px-4 py-3 text-center text-sm font-semibold text-[color:var(--foreground)]"
                >
                  Wishlist
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-full border border-[color:var(--line)] px-4 py-3 text-center text-sm font-semibold text-[color:var(--foreground)]"
                >
                  Checkout
                </Link>
              </div>

              {user ? (
                <button
                  onClick={logout}
                  className="w-full rounded-full border border-[color:var(--line)] px-4 py-3 text-sm font-semibold text-[color:var(--foreground)]"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/auth"
                  className="block w-full rounded-full bg-[color:var(--foreground)] px-4 py-3 text-center text-sm font-semibold text-[color:var(--background)]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
