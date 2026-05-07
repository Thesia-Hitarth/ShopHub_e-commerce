"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "./AuthProvider";

type AuthMode = "login" | "register";

export default function AuthPageClient() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("demo@shophub.com");
  const [password, setPassword] = useState("demo1234");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      let signedInUser;

      if (mode === "login") {
        signedInUser = await login(email, password);
      } else {
        signedInUser = await register(name, email, password);
      }

      router.push(signedInUser.role === "admin" ? "/admin" : "/profile");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to continue",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-white py-12 dark:bg-slate-950 lg:py-16">
      <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-gray-100 bg-gray-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="mb-8">
            <p className="text-sm font-medium text-indigo-600">Account</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-3 text-gray-600 dark:text-slate-300">
              Use the shopper demo account, or sign in as admin when you need the dashboard.
            </p>
          </div>

          <div className="mb-6 inline-flex rounded-full bg-white p-1 shadow-sm dark:bg-slate-800">
            <button
              onClick={() => setMode("login")}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                mode === "login" ? "bg-indigo-600 text-white" : "text-gray-600 dark:text-slate-300"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode("register")}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                mode === "register" ? "bg-indigo-600 text-white" : "text-gray-600 dark:text-slate-300"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Full name"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            )}
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="Email"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 focus-within:border-indigo-400 dark:border-slate-700 dark:bg-slate-950">
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="min-w-0 flex-1 bg-transparent text-sm text-gray-700 outline-none dark:text-slate-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="text-gray-500 hover:text-indigo-600 dark:text-slate-300"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3l18 18M10.584 10.587A2 2 0 0 0 13.414 13.4M9.363 5.365A10.45 10.45 0 0 1 12 5c4.478 0 8.268 2.943 9.542 7-.423 1.346-1.125 2.567-2.042 3.604M6.228 6.233C4.276 7.464 2.785 9.532 2.458 12c1.274 4.057 5.064 7 9.542 7a9.78 9.78 0 0 0 4.216-.944" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.522 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S3.732 16.057 2.458 12Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                  </svg>
                )}
              </button>
            </label>

            {error ? (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white disabled:bg-gray-300"
            >
              {isSubmitting
                ? "Working..."
                : mode === "login"
                  ? "Login"
                  : "Create account"}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-sm text-gray-500 dark:text-slate-400">
            <p>
              Shopper demo:{" "}
              <span className="font-medium text-gray-700 dark:text-slate-200">
                demo@shophub.com / demo1234
              </span>
            </p>
            <p>
              Admin demo:{" "}
              <span className="font-medium text-gray-700 dark:text-slate-200">
                admin@shophub.com / admin1234
              </span>
            </p>
          </div>
          <Link href="/" className="mt-6 inline-block text-sm font-medium text-indigo-600">
            Back to shopping
          </Link>
        </div>
      </div>
    </section>
  );
}
