import { ProductFormWrapper } from "@/components/products/ProductFormWrapper";

export default function NewProductPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-black text-[#2d3436] tracking-tight">
          Add Item
        </h1>
        <p className="font-jetbrains text-xs text-[#4a5568] mt-1 tracking-wider">
          Add a new product to inventory
        </p>
      </div>
      <ProductFormWrapper />
    </div>
  );
}
