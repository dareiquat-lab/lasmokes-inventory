import { ProductFormWrapper } from "@/components/products/ProductFormWrapper";

export default function NewProductPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-orbitron text-2xl font-black text-[#e0e0f0] tracking-wider">
          ADD ITEM
        </h1>
        <p className="font-jetbrains text-xs text-[#4a4a6a] mt-1 tracking-wider">
          <span className="text-[#00ff8860]">//</span> Add a new product to inventory
        </p>
      </div>
      <ProductFormWrapper />
    </div>
  );
}
