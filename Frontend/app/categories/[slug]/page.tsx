import { notFound } from "next/navigation";
import Storefront from "../../components/Storefront";
import { getCategories, getCategoryProducts } from "../../lib/products";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [categoryData, categories] = await Promise.all([
    getCategoryProducts(slug, { limit: 8, offset: 0 }),
    getCategories(),
  ]);

  if (!categoryData) {
    notFound();
  }

  return <Storefront initialData={categoryData} categorySummaries={categories} categorySlug={slug} />;
}
