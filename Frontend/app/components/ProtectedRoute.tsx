"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center text-gray-500">Loading...</div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="rounded-[28px] border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Sign in required</h1>
            <p className="mt-3 text-gray-600">
              Checkout and order history are protected until you log in.
            </p>
            <Link
              href="/auth"
              className="mt-6 inline-flex rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white"
            >
              Go to login
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}
