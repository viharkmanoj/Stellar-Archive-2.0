import type { Metadata } from "next";
import { Suspense } from "react";
import { Explorer } from "@/components/explorer/Explorer";
import { ExplorerLoading } from "@/components/explorer/ExplorerLoading";
import { getExplorerData } from "@/lib/explorer-data";
import type { QueryParams } from "@/lib/explorer";
import "./explore.css";

export const metadata: Metadata = {
  title: "Celestial Archive Explorer — Stellar Archive",
  description: "Browse astronomical catalogs, inspect source records and column metadata, and search across the Stellar Archive.",
};

async function ExplorerContent({ searchParams }: { searchParams: Promise<QueryParams> }) {
  return <Explorer data={await getExplorerData(await searchParams)} />;
}

export default function ExplorePage({ searchParams }: { searchParams: Promise<QueryParams> }) {
  return <Suspense fallback={<ExplorerLoading />}><ExplorerContent searchParams={searchParams} /></Suspense>;
}
