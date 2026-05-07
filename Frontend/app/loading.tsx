import ProductGridSkeleton from "./components/ProductGridSkeleton";

export default function Loading() {
  return (
    <section className="bg-white py-12 dark:bg-slate-950 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 space-y-4">
          <div className="h-8 w-32 animate-pulse rounded-full bg-gray-200 dark:bg-slate-800" />
          <div className="h-12 w-72 animate-pulse rounded-full bg-gray-200 dark:bg-slate-800" />
          <div className="h-5 w-96 animate-pulse rounded-full bg-gray-200 dark:bg-slate-800" />
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    </section>
  );
}
