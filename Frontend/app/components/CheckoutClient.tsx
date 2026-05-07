"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { useAuth } from "./AuthProvider";
import { useShop } from "./ShopProvider";
import { useToast } from "./ToastProvider";

type CheckoutStep = "address" | "summary" | "done";

interface AddressForm {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface CouponResult {
  code: string;
  type: "percent" | "flat";
  value: number;
  label: string;
  discount: number;
}

const SHIPPING_COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Australia",
  "Canada",
  "Singapore",
  "United Arab Emirates",
] as const;

const EMPTY_ADDRESS: AddressForm = {
  fullName: "",
  email: "",
  phone: "",
  line1: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

export default function CheckoutClient() {
  const router = useRouter();
  const { token, user } = useAuth();
  const { cart, subtotal, clearCart } = useShop();
  const { showToast } = useToast();
  const [step, setStep] = useState<CheckoutStep>("address");
  const [address, setAddress] = useState<AddressForm>({
    ...EMPTY_ADDRESS,
    fullName: user?.name ?? "",
    email: user?.email ?? "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<CouponResult | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const total = useMemo(
    () => Math.max(0, subtotal - (coupon?.discount ?? 0)),
    [subtotal, coupon],
  );

  const handleAddressSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStep("summary");
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      return;
    }

    setIsApplyingCoupon(true);
    setError("");

    try {
      const response = await apiFetch<CouponResult>("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: couponCode,
          subtotal,
        }),
      });

      setCoupon(response);
      showToast(`Coupon applied: ${response.code}`, "success");
    } catch (couponError) {
      setCoupon(null);
      setError(couponError instanceof Error ? couponError.message : "Unable to apply coupon");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!token) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await apiFetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          address,
          couponCode: coupon?.code,
          items: cart.map((item) => ({
            productId: item.product.id,
            name: item.product.name,
            image: item.product.image,
            price: item.product.price,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
          })),
        }),
      });

      clearCart();
      showToast("Order placed", "success");
      setStep("done");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to place order",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0 && step !== "done") {
    return (
      <section className="bg-white py-16 dark:bg-slate-950">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your cart is empty</h1>
          <p className="mt-3 text-gray-600 dark:text-slate-300">Add a few things before heading to checkout.</p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white"
          >
            Browse products
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-12 dark:bg-slate-950 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-sm font-medium text-indigo-600">Checkout</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white lg:text-4xl">
            {step === "done" ? "Order placed" : "Complete your order"}
          </h1>
        </div>

        {step === "address" ? (
          <form onSubmit={handleAddressSubmit} className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["fullName", "Full name"],
                  ["email", "Email"],
                  ["phone", "Phone"],
                  ["line1", "Street address"],
                  ["city", "City"],
                  ["state", "State"],
                  ["postalCode", "Postal code"],
                ] as const
              ).map(([key, label]) => (
                <input
                  key={key}
                  value={address[key]}
                  onChange={(event) =>
                    setAddress((current) => ({ ...current, [key]: event.target.value }))
                  }
                  required
                  placeholder={label}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              ))}
              <select
                value={address.country}
                onChange={(event) =>
                  setAddress((current) => ({ ...current, country: event.target.value }))
                }
                required
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {SHIPPING_COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <aside className="h-fit rounded-[28px] border border-gray-100 bg-gray-50 p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Order Summary</h2>
              <p className="mt-4 text-sm text-gray-600 dark:text-slate-300">{cart.length} items in your cart</p>
              <div className="mt-6 flex items-center justify-between text-base">
                <span className="font-medium text-gray-600 dark:text-slate-300">Subtotal</span>
                <span className="font-semibold text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                  placeholder="Coupon code"
                  className="min-w-0 flex-1 rounded-full border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={isApplyingCoupon}
                  className="rounded-full border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 dark:border-slate-700 dark:text-slate-200"
                >
                  {isApplyingCoupon ? "..." : "Apply"}
                </button>
              </div>
              {coupon ? (
                <div className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30">
                  {coupon.code}: -${coupon.discount.toFixed(2)}
                </div>
              ) : null}
              <button className="mt-6 w-full rounded-full bg-indigo-600 px-6 py-4 text-sm font-semibold text-white">
                Continue to summary
              </button>
            </aside>
          </form>
        ) : null}

        {step === "summary" ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedSize ?? "na"}-${item.selectedColor ?? "na"}`}
                  className="rounded-[28px] border border-gray-100 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{item.product.name}</h2>
                      <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                        {item.quantity} x ${item.product.price.toFixed(2)}
                      </p>
                      <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                        {item.selectedSize ?? "Standard"} | {item.selectedColor ?? "Default"}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${(item.quantity * item.product.price).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
              <div className="rounded-[28px] border border-gray-100 bg-gray-50 p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Shipping Address</h3>
                <p className="mt-3 text-sm text-gray-600 dark:text-slate-300">{address.fullName}</p>
                <p className="text-sm text-gray-600 dark:text-slate-300">{address.line1}</p>
                <p className="text-sm text-gray-600 dark:text-slate-300">
                  {address.city}, {address.state} {address.postalCode}
                </p>
                <p className="text-sm text-gray-600 dark:text-slate-300">{address.country}</p>
              </div>
            </div>
            <aside className="h-fit rounded-[28px] border border-gray-100 bg-gray-50 p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Place Order</h2>
              <div className="mt-6 space-y-4 text-sm text-gray-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
                </div>
                {coupon ? (
                  <div className="flex items-center justify-between">
                    <span>{coupon.code}</span>
                    <span className="font-medium text-emerald-600">-${coupon.discount.toFixed(2)}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-gray-900 dark:text-white">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-4 text-base dark:border-slate-700 flex items-center justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="font-semibold text-gray-900 dark:text-white">${total.toFixed(2)}</span>
                </div>
              </div>
              {error ? (
                <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40">
                  {error}
                </div>
              ) : null}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStep("address")}
                  className="flex-1 rounded-full border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 dark:border-slate-700 dark:text-slate-200"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="flex-1 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white disabled:bg-gray-300"
                >
                  {isSubmitting ? "Placing..." : "Place order"}
                </button>
              </div>
            </aside>
          </div>
        ) : null}

        {step === "done" ? (
          <div className="rounded-[28px] border border-emerald-100 bg-emerald-50 p-10 text-center dark:bg-emerald-950/30">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Thank you</h2>
            <p className="mt-3 text-gray-600 dark:text-slate-300">
              Your mock order is confirmed and now lives in your order history.
            </p>
            <button
              onClick={() => router.push("/profile")}
              className="mt-6 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white"
            >
              View order history
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
