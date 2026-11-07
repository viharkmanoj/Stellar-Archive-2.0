import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";

export function ExplorerHeader() {
  return <header className="explorer-header">
    <Link href="/" className="brand" aria-label="Stellar Archive home"><Icon name="spark" /><span>STELLAR ARCHIVE</span></Link>
    <nav className="nav-pill" aria-label="Main navigation"><Link href="/">Dashboard</Link><Link href="/explore" aria-current="page" prefetch={false}>Explore</Link></nav>
    <span className="explorer-header-label"><Icon name="database" />CELESTIAL ARCHIVE</span>
  </header>;
}
