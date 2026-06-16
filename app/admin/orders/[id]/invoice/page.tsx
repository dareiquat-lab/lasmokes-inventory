import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/db";
import { InvoicePrintClient } from "@/components/admin/InvoicePrintClient";
import type { Order, OrderItem } from "@/types";

export const dynamic = "force-dynamic";

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const order = await getOrderById(parseInt(params.id));
  if (!order) notFound();
  return (
    <InvoicePrintClient
      order={
        order as Order & {
          items: Array<Pick<OrderItem, "product_name" | "product_sku" | "quantity" | "price">>;
        }
      }
    />
  );
}
