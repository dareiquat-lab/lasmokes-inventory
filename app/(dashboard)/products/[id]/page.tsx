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
        <h1 className="font-orbitron text-2xl font-black text-[#e0e0f0] tracking-wider">
          EDIT ITEM
        </h1>
        <p className="font-jetbrains text-xs text-[#4a4a6a] mt-1 tracking-wider">
          <span className="text-[#00d4ff60]">//</span> {product!.product_name}
        </p>
      </div>
      <ProductFormWrapper product={product!} />
    </div>
  );
}
