"use client";

import Link from "next/link";
import "./explore.css";

export default function ExplorerError({ reset }: { reset: () => void }) {
  return <main className="explorer-shell explorer-loading"><h1>The archive could not be opened.</h1><p>Please retry. Your source records have not been changed.</p><button className="button button-primary" onClick={reset}>Try again</button><Link className="button button-outline" href="/">Return to dashboard</Link></main>;
}
