import { notFound } from "next/navigation";
import { getOrderById, getClientById } from "@/lib/db";
import { InvoicePrintClient } from "@/components/admin/InvoicePrintClient";
import type { Order, OrderItem, Client } from "@/types";

export const dynamic = "force-dynamic";

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const order = await getOrderById(parseInt(params.id));
  if (!order) notFound();

  let client: Client | null = null;
  if (order.client_id) {
    client = (await getClientById(order.client_id)) as Client | null;
  }

  return (
    <InvoicePrintClient
      order={
        order as Order & {
          items: Array<Pick<OrderItem, "product_name" | "product_sku" | "quantity" | "price">>;
        }
      }
      client={client}
    />
  );
}
