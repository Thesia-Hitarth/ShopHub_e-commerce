"use client";

import Link from "next/link";
import { useShop } from "./ShopProvider";

export default function CartClient() {
  const { cart, subtotal, removeFromCart, updateCartQuantity } = useShop();

  return (
    <section className="bg-[color:var(--background)] py-12 lg:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-[color:var(--foreground)]">Your Cart</h1>
          <p className="mt-3 text-[color:var(--muted)]">
            Update quantities, remove products, and keep your selections saved locally.
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] px-6 py-16 text-center">
            <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">Your cart is empty</h2>
            <p className="mt-2 text-[color:var(--muted)]">Add something from the catalog and it will stay here.</p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-full bg-[color:var(--foreground)] px-6 py-3 text-sm font-semibold text-[color:var(--surface)] hover:bg-[color:var(--surface-strong)] hover:text-[color:var(--foreground)] border border-[color:var(--border-strong)] transition-colors"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedSize ?? "na"}-${item.selectedColor ?? "na"}`}
                  className="flex flex-col gap-4 rounded-3xl border border-[color:var(--border-soft)] p-5 shadow-sm sm:flex-row bg-[color:var(--surface)]"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-28 w-28 rounded-2xl object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-[color:var(--foreground)]">{item.product.name}</h2>
                        <p className="text-sm text-[color:var(--muted)]">{item.product.category}</p>
                        <p className="mt-2 text-sm text-[color:var(--muted)]">
                          {item.selectedSize ? `Size: ${item.selectedSize}` : "Standard"}
                          {" | "}
                          {item.selectedColor ? `Color: ${item.selectedColor}` : "Default"}
                        </p>
                      </div>
                      <div className="text-lg font-semibold text-[color:var(--foreground)]">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="inline-flex items-center rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)]">
                        <button
                          onClick={() =>
                            updateCartQuantity(
                              item.product.id,
                              item.quantity - 1,
                              item.selectedSize,
                              item.selectedColor,
                            )
                          }
                          className="px-4 py-2 text-lg text-[color:var(--foreground)] hover:text-[color:var(--accent)]"
                        >
                          -
                        </button>
                        <span className="min-w-10 text-center text-sm font-semibold text-[color:var(--foreground)]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateCartQuantity(
                              item.product.id,
                              item.quantity + 1,
                              item.selectedSize,
                              item.selectedColor,
                            )
                          }
                          className="px-4 py-2 text-lg text-[color:var(--foreground)] hover:text-[color:var(--accent)]"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() =>
                          removeFromCart(
                            item.product.id,
                            item.selectedSize,
                            item.selectedColor,
                          )
                        }
                        className="text-sm font-medium text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="h-fit rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] p-6">
              <h2 className="text-xl font-semibold text-[color:var(--foreground)]">Order Summary</h2>
              <div className="mt-6 space-y-4 text-sm text-[color:var(--muted)]">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-[color:var(--foreground)]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-[color:var(--foreground)]">Free</span>
                </div>
                <div className="border-t border-[color:var(--border-soft)] pt-4 flex items-center justify-between text-base">
                  <span className="font-semibold text-[color:var(--foreground)]">Total</span>
                  <span className="font-semibold text-[color:var(--foreground)]">${subtotal.toFixed(2)}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="mt-6 block w-full rounded-full bg-[color:var(--foreground)] px-6 py-4 text-center text-sm font-semibold text-[color:var(--surface)] hover:bg-[color:var(--surface-strong)] hover:text-[color:var(--foreground)] border border-[color:var(--border-strong)] transition-colors"
              >
                Proceed to checkout
              </Link>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
