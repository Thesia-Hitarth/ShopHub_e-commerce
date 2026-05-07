import type { Metadata } from "next";
import Hero from "./components/Hero";
import ProductSections from "./components/ProductSections";
import RecentlyViewedSection from "./components/RecentlyViewedSection";
import Storefront from "./components/Storefront";
import {
  getCategories,
  getProducts,
  type CategorySummary,
  type ProductListResponse,
} from "./lib/products";

export const metadata: Metadata = {
  title: "ShopHub - Modern E-Commerce",
  description: "Your destination for premium products",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  let productData: ProductListResponse | null = null;
  let categories: CategorySummary[] = [];
  let error: string | null = null;

  try {
    const [productsResponse, categoriesResponse] = await Promise.all([
      getProducts({ limit: 8, offset: 0 }),
      getCategories(),
    ]);
    productData = productsResponse;
    categories = categoriesResponse;
  } catch (fetchError) {
    console.error("Homepage backend fetch failed", fetchError);
    error = "Failed to connect to backend. Make sure backend is running on port 3001.";
  }

  return (
    <div className="min-h-screen">
      {error || !productData ? (
        <section className="bg-white py-12 dark:bg-slate-950 lg:py-20">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <svg className="mx-auto mb-4 h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="font-medium text-red-600">{error}</p>
              <p className="mt-2 text-sm text-red-500">
                Please make sure the backend is running on port 3001
              </p>
            </div>
          </div>
        </section>
      ) : (
        <>
          <Hero products={productData.items} />
          <Storefront initialData={productData} categorySummaries={categories} />
          <RecentlyViewedSection />
          <ProductSections categories={categories} />
        </>
      )}
    </div>
  );
}
