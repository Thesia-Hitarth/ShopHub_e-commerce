import { apiFetch, fetchFromApi } from "./api";

export interface Review {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  rating: number;
  reviews: number;
  stock: number;
  sizes: string[];
  colors: string[];
  gallery: string[];
  reviewItems?: Review[];
}

export interface CategorySummary {
  name: string;
  slug: string;
  count: number;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  categories: string[];
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface CategoryProductsResponse {
  category: CategorySummary;
  items: Product[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

interface ProductQuery {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

function withQuery(path: string, query?: ProductQuery) {
  if (!query) {
    return path;
  }

  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export async function getProducts(query?: ProductQuery): Promise<ProductListResponse> {
  return apiFetch<ProductListResponse>(withQuery("/api/products", query), {
    cache: "no-store",
  });
}

export async function getCategories(): Promise<CategorySummary[]> {
  return apiFetch<CategorySummary[]>("/api/categories", {
    cache: "no-store",
  });
}

export async function getCategoryProducts(
  slug: string,
  query?: Omit<ProductQuery, "category">,
): Promise<CategoryProductsResponse | null> {
  const res = await fetchFromApi(withQuery(`/api/categories/${slug}`, query), {
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error("Failed to fetch category");
  }

  return res.json();
}

export async function getProduct(id: number): Promise<Product | null> {
  const res = await fetchFromApi(`/api/products/${id}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error("Failed to fetch product");
  }

  return res.json();
}
