"use client";

import Link from "next/link";
import { useShop } from "./ShopProvider";

export default function CartDrawer() {
  const {
    cart,
    subtotal,
    isCartDrawerOpen,
    closeCartDrawer,
    updateCartQuantity,
    removeFromCart,
  } = useShop();

  if (!isCartDrawerOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] lg:hidden">
      <button className="absolute inset-0 bg-black/40" onClick={closeCartDrawer} />
      <aside className="absolute right-0 top-0 h-full w-[min(92vw,380px)] bg-white p-5 shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Cart</h2>
          <button
            onClick={closeCartDrawer}
            className="rounded-full border border-gray-200 px-3 py-2 text-sm text-gray-600 dark:border-slate-700 dark:text-slate-300"
          >
            Close
          </button>
        </div>

        <div className="mt-5 space-y-3 overflow-y-auto pb-28">
          {cart.map((item) => (
            <div
              key={`${item.product.id}-${item.selectedSize ?? "na"}-${item.selectedColor ?? "na"}`}
              className="rounded-2xl bg-gray-50 p-4 dark:bg-slate-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.product.name}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    ${item.product.price.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() =>
                    removeFromCart(item.product.id, item.selectedSize, item.selectedColor)
                  }
                  className="text-sm text-red-500"
                >
                  Remove
                </button>
              </div>
              <div className="mt-3 inline-flex items-center rounded-full border border-gray-200 dark:border-slate-700">
                <button
                  onClick={() =>
                    updateCartQuantity(
                      item.product.id,
                      item.quantity - 1,
                      item.selectedSize,
                      item.selectedColor,
                    )
                  }
                  className="px-4 py-2 text-gray-600 dark:text-slate-300"
                >
                  -
                </button>
                <span className="min-w-10 text-center text-sm font-semibold text-gray-900 dark:text-white">
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
                  className="px-4 py-2 text-gray-600 dark:text-slate-300"
                >
                  +
                </button>
              </div>
            </div>
          ))}
          {cart.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500 dark:border-slate-700 dark:text-slate-400">
              Your cart is empty.
            </div>
          ) : null}
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-slate-300">
            <span>Subtotal</span>
            <span className="font-semibold text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
          </div>
          <Link
            href="/checkout"
            onClick={closeCartDrawer}
            className="mt-4 block rounded-full bg-indigo-600 px-5 py-3 text-center text-sm font-semibold text-white"
          >
            Checkout
          </Link>
        </div>
      </aside>
    </div>
  );
}
