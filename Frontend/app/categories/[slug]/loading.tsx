import ProductGridSkeleton from "../../components/ProductGridSkeleton";

export default function CategoryLoading() {
  return (
    <section className="bg-white py-12 dark:bg-slate-950 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 space-y-4">
          <div className="h-5 w-52 animate-pulse rounded-full bg-gray-200 dark:bg-slate-800" />
          <div className="h-12 w-72 animate-pulse rounded-full bg-gray-200 dark:bg-slate-800" />
          <div className="h-5 w-80 animate-pulse rounded-full bg-gray-200 dark:bg-slate-800" />
        </div>
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <div className="rounded-[28px] border border-gray-100 bg-gray-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-slate-800" />
            <div className="mt-5 space-y-4">
              <div className="h-10 animate-pulse rounded-2xl bg-gray-200 dark:bg-slate-800" />
              <div className="h-10 animate-pulse rounded-2xl bg-gray-200 dark:bg-slate-800" />
              <div className="h-10 animate-pulse rounded-2xl bg-gray-200 dark:bg-slate-800" />
            </div>
          </div>
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    </section>
  );
}
