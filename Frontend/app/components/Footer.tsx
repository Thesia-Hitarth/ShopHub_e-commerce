import Link from "next/link";

const footerColumns = [
  {
    title: "Discover",
    items: ["New Season", "Collections", "Footwear Focus", "Carry Systems"],
  },
  {
    title: "Service",
    items: ["Delivery", "Returns", "Support", "Order Tracking"],
  },
  {
    title: "Journal",
    items: ["Campaign Notes", "Product Drops", "City Guides", "Gift Edit"],
  },
];

export default function Footer() {
  return (
    <footer className="px-4 pb-6 pt-8 sm:px-6 lg:px-8 lg:pb-8 lg:pt-12">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-[color:var(--border-soft)] bg-[#09090b] text-[#fafafa] shadow-md">
        <div className="grid gap-10 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-10 xl:p-12">
          <div className="space-y-6">
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.34em] text-cyan-200/80">
                ShopHub Studio
              </p>
              <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-none text-white sm:text-5xl">
                A sharper storefront for people who notice design.
              </h2>
            </div>

            <p className="max-w-xl text-sm leading-7 text-white/68 sm:text-base">
              Faster scanning, cleaner product focus, and a more contemporary visual system without losing the ecommerce basics that already work.
            </p>

            <form className="grid gap-3 sm:max-w-xl sm:grid-cols-[1fr_auto]">
              <input
                type="email"
                placeholder="Email for future drops"
                className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm text-white outline-none placeholder:text-white/35"
              />
              <button
                type="submit"
                className="rounded-full bg-white px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-[#09090b] hover:bg-neutral-200 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.34em] text-white/36">
                  {column.title}
                </p>
                <div className="mt-5 grid gap-3">
                  {column.items.map((item) => (
                    <Link
                      key={item}
                      href="/"
                      className="text-sm font-semibold text-white/78 hover:text-white"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 px-6 py-5 text-xs uppercase tracking-[0.26em] text-white/34 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p>&copy; 2026 ShopHub. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/" className="hover:text-white/72">
              Privacy
            </Link>
            <Link href="/" className="hover:text-white/72">
              Terms
            </Link>
            <Link href="/" className="hover:text-white/72">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
