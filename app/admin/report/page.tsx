import { getMonthlyReportData } from "@/lib/db";
import { ReportPrintClient } from "@/components/admin/ReportPrintClient";

export const dynamic = "force-dynamic";

export default async function ReportPage() {
  const data = await getMonthlyReportData();
  return <ReportPrintClient data={data} />;
}
