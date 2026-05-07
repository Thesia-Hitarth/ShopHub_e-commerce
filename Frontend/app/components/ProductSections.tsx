import Link from "next/link";
import type { CategorySummary } from "../lib/products";

const categoryThemes = [
  "from-[#dbeafe] via-[#ecfeff] to-[#c4b5fd]",
  "from-[#cffafe] via-[#e0f2fe] to-[#93c5fd]",
  "from-[#e0e7ff] via-[#ede9fe] to-[#c084fc]",
];

export default function ProductSections({
  categories,
}: {
  categories: CategorySummary[];
}) {
  return (
    <>
      <section id="categories" className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.34em] text-[color:var(--accent)]">
                Curated Lanes
              </p>
              <h2 className="mt-3 text-4xl font-semibold leading-none text-[color:var(--foreground)] sm:text-5xl">
                Move through categories with more energy.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[color:var(--muted)] sm:text-base">
              These sections now lean brighter, cleaner, and more interactive so browsing feels like
              a modern product story instead of a plain department menu.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {categories.map((category, index) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group overflow-hidden rounded-[30px] border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
              >
                <div
                  className={`relative min-h-[280px] bg-gradient-to-br ${categoryThemes[index % categoryThemes.length]} p-6 sm:min-h-[320px] sm:p-8`}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.52),transparent_48%)]" />
                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <span className="rounded-full border border-white/40 bg-white/66 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.28em] text-[#111111]">
                        {category.count} products
                      </span>
                      <span className="font-[family:var(--font-display)] text-4xl text-[#111111]/82">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div>
                      <p className="text-[0.72rem] font-bold uppercase tracking-[0.3em] text-[#111111]/58">
                        Collection
                      </p>
                      <h3 className="mt-3 text-3xl font-semibold leading-none text-[#111111] sm:text-[2.4rem]">
                        {category.name}
                      </h3>
                      <p className="mt-4 max-w-xs text-sm leading-6 text-[#111111]/70">
                        A faster route through standout pieces, cleaner filters, and a more designed browse.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-6 py-5">
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">Explore this edit</p>
                  <span className="rounded-full border border-[color:var(--line)] px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[color:var(--foreground)] group-hover:border-[color:var(--accent)] group-hover:bg-[linear-gradient(135deg,var(--accent),var(--accent-3))] group-hover:text-white">
                    Enter
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="overflow-hidden rounded-[34px] border border-[color:var(--border-soft)] bg-[linear-gradient(135deg,#07101f,#0b132b_55%,#1d4ed8)] text-[#eff6ff]">
              <div className="grid h-full gap-8 p-6 sm:p-8 lg:p-10">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.34em] text-cyan-200/80">
                      About ShopHub
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
                      A storefront with more pull and more clarity.
                    </h2>
                  </div>
                  <span className="rounded-full border border-white/14 px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.26em] text-white/76">
                    Mobile + Desktop
                  </span>
                </div>

                <p className="max-w-2xl text-base leading-7 text-white/78">
                  Built to feel closer to a modern launch page than a template storefront, with clearer hierarchy, bolder contrast, and more visual momentum.
                </p>

                <div className="grid gap-4 sm:grid-cols-3">
                  {["Sharper hierarchy", "Cleaner filtering", "Faster attraction"].map((item) => (
                    <div
                      key={item}
                      className="rounded-[22px] border border-white/10 bg-white/4 px-4 py-4 text-sm font-semibold text-white/84"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-5">
              <div className="rounded-[34px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-8">
                <p className="text-[0.72rem] font-bold uppercase tracking-[0.34em] text-[color:var(--accent)]">
                  What changed
                </p>
                <h3 className="mt-3 text-3xl font-semibold leading-none text-[color:var(--foreground)]">
                  Cleaner, brighter, and more conversion-ready.
                </h3>
                <p className="mt-4 text-sm leading-6 text-[color:var(--muted)] sm:text-base">
                  The palette now pushes cool neutrals, electric highlights, and stronger contrast so the experience feels current instead of nostalgic.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {[
                  {
                    label: "Fast scan",
                    body: "Cleaner type rhythm and sharper spacing help users understand the page faster.",
                  },
                  {
                    label: "Modern pull",
                    body: "Cool gradients and stronger call-to-actions create a more clickable, current feel.",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[30px] border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
                  >
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.32em] text-[color:var(--accent)]">
                      {item.label}
                    </p>
                    <p className="mt-4 text-sm leading-6 text-[color:var(--foreground)]/78">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
