"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiFetch } from "../lib/api";
import type { Product } from "../lib/products";
import { useAuth } from "./AuthProvider";
import { useToast } from "./ToastProvider";

interface AdminOrder {
  id: number;
  status: "pending" | "shipped" | "delivered";
  createdAt: string;
  subtotal: number;
  total: number;
  items: Array<{ name: string; quantity: number }>;
  user: { name: string; email: string; role: string } | null;
}

interface ProductFormState {
  id?: number;
  name: string;
  price: string;
  category: string;
  image: string;
  description: string;
  stock: string;
  sizes: string;
  colors: string;
}

interface AnalyticsResponse {
  overview: {
    totalRevenue: number;
    totalDiscount: number;
    totalOrders: number;
    averageOrderValue: number;
    totalProducts: number;
  };
  ordersPerDay: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  topProducts: Array<{
    productId: number;
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

const EMPTY_FORM: ProductFormState = {
  name: "",
  price: "",
  category: "",
  image: "",
  description: "",
  stock: "",
  sizes: "",
  colors: "",
};

const BAR_COLORS = ["#4f46e5", "#0ea5e9", "#f97316", "#10b981", "#f43f5e"];

export default function AdminDashboardClient() {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || user?.role !== "admin") {
      return;
    }

    Promise.all([
      apiFetch<Product[]>("/api/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      apiFetch<AdminOrder[]>("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      apiFetch<AnalyticsResponse>("/api/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([productResponse, orderResponse, analyticsResponse]) => {
        setProducts(productResponse);
        setOrders(orderResponse);
        setAnalytics(analyticsResponse);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load admin data");
      });
  }, [token, user?.role]);

  const submitProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      return;
    }

    const payload = {
      name: form.name,
      price: Number(form.price),
      category: form.category,
      image: form.image,
      description: form.description,
      stock: Number(form.stock),
      sizes: form.sizes.split(",").map((item) => item.trim()).filter(Boolean),
      colors: form.colors.split(",").map((item) => item.trim()).filter(Boolean),
    };

    const path = form.id ? `/api/admin/products/${form.id}` : "/api/admin/products";
    const method = form.id ? "PUT" : "POST";

    const response = await apiFetch<Product>(path, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    setProducts((current) =>
      form.id
        ? current.map((product) => (product.id === response.id ? response : product))
        : [...current, response],
    );
    setForm(EMPTY_FORM);
    showToast(form.id ? "Product updated" : "Product created", "success");
  };

  const deleteProduct = async (id: number) => {
    if (!token) {
      return;
    }

    await apiFetch(`/api/admin/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    setProducts((current) => current.filter((product) => product.id !== id));
    showToast("Product deleted", "info");
  };

  const updateOrderStatus = async (id: number, status: AdminOrder["status"]) => {
    if (!token) {
      return;
    }

    const updated = await apiFetch<AdminOrder>(`/api/admin/orders/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    setOrders((current) => current.map((order) => (order.id === id ? updated : order)));
    setAnalytics((current) =>
      current
        ? {
            ...current,
            overview: {
              ...current.overview,
              totalOrders: current.overview.totalOrders,
            },
          }
        : current,
    );
    showToast(`Order #${id} marked ${status}`, "success");
  };

  if (user?.role !== "admin") {
    return (
      <section className="bg-white py-16 dark:bg-slate-950">
        <div className="mx-auto max-w-3xl px-4">
          <div className="rounded-[28px] border border-dashed border-gray-200 bg-gray-50 p-10 text-center dark:border-slate-800 dark:bg-slate-900">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin only</h1>
            <p className="mt-3 text-gray-600 dark:text-slate-300">
              This dashboard is reserved for admin accounts.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-12 dark:bg-slate-950 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-sm font-medium text-indigo-600">Admin Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white lg:text-4xl">
            Manage products, orders, and performance
          </h1>
        </div>

        {error ? <div className="mb-6 text-sm text-red-600">{error}</div> : null}

        {analytics ? (
          <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              {
                label: "Revenue",
                value: `$${analytics.overview.totalRevenue.toFixed(2)}`,
              },
              {
                label: "Orders",
                value: analytics.overview.totalOrders,
              },
              {
                label: "Avg Order",
                value: `$${analytics.overview.averageOrderValue.toFixed(2)}`,
              },
              {
                label: "Discounts",
                value: `$${analytics.overview.totalDiscount.toFixed(2)}`,
              },
              {
                label: "Products",
                value: analytics.overview.totalProducts,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[24px] border border-gray-100 bg-gray-50 px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{item.value}</p>
              </div>
            ))}
          </div>
        ) : null}

        {analytics ? (
          <div className="mb-8 grid gap-8 xl:grid-cols-2">
            <div className="rounded-[28px] border border-gray-100 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Orders Per Day</h2>
              <div className="mt-6 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.ordersPerDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                    <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="orders" stroke="#4f46e5" strokeWidth={3} />
                    <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-[28px] border border-gray-100 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Top Products</h2>
              <div className="mt-6 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.topProducts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                    <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="quantity" radius={[8, 8, 0, 0]}>
                      {analytics.topProducts.map((item, index) => (
                        <Cell key={item.productId} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
          <form
            onSubmit={submitProduct}
            className="rounded-[28px] border border-gray-100 bg-gray-50 p-6 dark:border-slate-800 dark:bg-slate-900"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {form.id ? "Edit product" : "Add product"}
            </h2>
            <div className="mt-5 space-y-3">
              {(
                [
                  ["name", "Product name"],
                  ["price", "Price"],
                  ["category", "Category"],
                  ["image", "Image URL"],
                  ["stock", "Stock"],
                  ["sizes", "Sizes comma separated"],
                  ["colors", "Colors comma separated"],
                ] as const
              ).map(([key, label]) => (
                <input
                  key={key}
                  value={form[key]}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, [key]: event.target.value }))
                  }
                  placeholder={label}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              ))}
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                rows={4}
                placeholder="Description"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
            <div className="mt-4 flex gap-3">
              <button className="flex-1 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white">
                {form.id ? "Save changes" : "Create product"}
              </button>
              {form.id ? (
                <button
                  type="button"
                  onClick={() => setForm(EMPTY_FORM)}
                  className="rounded-full border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 dark:border-slate-700 dark:text-slate-200"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>

          <div className="space-y-8">
            <div className="rounded-[28px] border border-gray-100 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Products</h2>
              <div className="mt-5 grid gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col gap-3 rounded-2xl bg-gray-50 p-4 dark:bg-slate-800 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{product.name}</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        {product.category} | ${product.price.toFixed(2)} | stock {product.stock}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setForm({
                            id: product.id,
                            name: product.name,
                            price: String(product.price),
                            category: product.category,
                            image: product.image,
                            description: product.description,
                            stock: String(product.stock),
                            sizes: product.sizes.join(", "),
                            colors: product.colors.join(", "),
                          })
                        }
                        className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 dark:border-slate-700 dark:text-slate-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-gray-100 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Orders</h2>
              <div className="mt-5 grid gap-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-2xl bg-gray-50 p-4 dark:bg-slate-800"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          Order #{order.id} - {order.user?.name ?? "Unknown customer"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                          {order.user?.email ?? "No email available"} | ${order.total.toFixed(2)}
                        </p>
                      </div>
                      <select
                        value={order.status}
                        onChange={(event) =>
                          updateOrderStatus(
                            order.id,
                            event.target.value as AdminOrder["status"],
                          )
                        }
                        className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      >
                        <option value="pending">pending</option>
                        <option value="shipped">shipped</option>
                        <option value="delivered">delivered</option>
                      </select>
                    </div>
                    <div className="mt-3 text-sm text-gray-500 dark:text-slate-400">
                      {order.items.map((item) => `${item.quantity} x ${item.name}`).join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
