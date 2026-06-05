import { getProductById } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProductFormWrapper } from "@/components/products/ProductFormWrapper";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  let product: Product | null = null;
  try {
    product = await getProductById(parseInt(params.id)) as Product;
  } catch {
    product = null;
  }

  if (!product) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Edit Product</h1>
        <p className="text-gray-500 text-sm mt-1">{product!.product_name}</p>
      </div>
      <ProductFormWrapper product={product!} />
    </div>
  );
}
