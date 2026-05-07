export default function ProductGridSkeleton({
  count = 8,
}: {
  count?: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="aspect-square animate-pulse bg-gray-200 dark:bg-slate-800" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-slate-800" />
            <div className="h-5 w-3/4 animate-pulse rounded-full bg-gray-200 dark:bg-slate-800" />
            <div className="h-4 w-1/2 animate-pulse rounded-full bg-gray-200 dark:bg-slate-800" />
            <div className="flex items-center justify-between pt-2">
              <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-slate-800" />
              <div className="h-10 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
