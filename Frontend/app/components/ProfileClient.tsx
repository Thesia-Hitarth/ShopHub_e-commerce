"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { useAuth } from "./AuthProvider";

interface OrderItem {
  productId: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface Order {
  id: number;
  status: "pending" | "shipped" | "delivered";
  createdAt: string;
  subtotal: number;
  discount: number;
  total: number;
  items: OrderItem[];
}

const STATUS_STYLES: Record<Order["status"], string> = {
  pending: "bg-amber-50 text-amber-600",
  shipped: "bg-sky-50 text-sky-600",
  delivered: "bg-emerald-50 text-emerald-600",
};

export default function ProfileClient() {
  const { token, user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }

    apiFetch<Order[]>("/api/orders", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(setOrders)
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load orders");
      });
  }, [token]);

  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-10">
          <div>
            <p className="text-sm font-medium text-indigo-600">Profile</p>
            <h1 className="mt-2 text-3xl lg:text-4xl font-bold text-gray-900">{user?.name}</h1>
            <p className="mt-2 text-gray-600">{user?.email}</p>
            <p className="mt-1 text-sm text-gray-500">Role: {user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-full border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700"
          >
            Logout
          </button>
        </div>

        {error ? <div className="mb-6 text-sm text-red-600">{error}</div> : null}

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-[28px] border border-gray-100 p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Order #{order.id}</h2>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_STYLES[order.status]}`}
                  >
                    {order.status}
                  </span>
                  <span className="text-lg font-semibold text-gray-900">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                {order.items.map((item) => (
                  <div
                    key={`${order.id}-${item.productId}-${item.selectedSize ?? "na"}`}
                    className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} x ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {item.selectedSize ?? "Standard"} | {item.selectedColor ?? "Default"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {orders.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-gray-600">
              No orders yet. Your mock checkout confirmations will show up here.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
