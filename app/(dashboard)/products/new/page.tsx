import { ProductFormWrapper } from "@/components/products/ProductFormWrapper";

export default function NewProductPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Add Product</h1>
        <p className="text-gray-500 text-sm mt-1">Add a new product to inventory</p>
      </div>
      <ProductFormWrapper />
    </div>
  );
}
