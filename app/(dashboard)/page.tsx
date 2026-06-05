import { getDashboardStats } from "@/lib/db";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import type { DashboardStats } from "@/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let stats: DashboardStats | null = null;
  try {
    stats = await getDashboardStats() as DashboardStats;
  } catch {
    stats = null;
  }

  return <DashboardClient initialStats={stats} />;
}
