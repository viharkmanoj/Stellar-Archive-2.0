import { Suspense } from "react";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { getDashboardData } from "@/lib/api";

async function LiveDashboard() {
  return <Dashboard data={await getDashboardData()} />;
}

export default function Home() {
  return (
    <Suspense fallback={<Dashboard data={{ tables: null, catalog: null, status: "checking" }} />}>
      <LiveDashboard />
    </Suspense>
  );
}
