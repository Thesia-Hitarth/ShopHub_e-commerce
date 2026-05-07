import { notFound } from "next/navigation";
import ProductDetailClient from "../../components/ProductDetailClient";
import { getProduct } from "../../lib/products";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(Number(id));

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
