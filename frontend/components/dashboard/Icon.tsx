import type { CSSProperties } from "react";

export type IconName = "spark" | "search" | "bell" | "moon" | "arrow" | "external" | "target" | "planet" | "database" | "close" | "chevron" | "grid";
const paths: Record<IconName, React.ReactNode> = {
  spark: <path d="M12 2c1.2 7.2 2.8 8.8 10 10-7.2 1.2-8.8 2.8-10 10C10.8 14.8 9.2 13.2 2 12c7.2-1.2 8.8-2.8 10-10Z" />,
  search: <><circle cx="10.5" cy="10.5" r="7.5" /><path d="m16 16 5 5" /></>,
  bell: <><path d="M5 16h14l-2-3V9a5 5 0 0 0-10 0v4l-2 3Z" /><path d="M10 20h4M12 2v2" /></>,
  moon: <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />,
  arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
  external: <path d="M6 18 18 6M6 6h12v12" />,
  target: <><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2" /><path d="M12 1v4m0 14v4M1 12h4m14 0h4" /></>,
  planet: <><circle cx="12" cy="12" r="8" /><ellipse cx="12" cy="12" rx="12" ry="4" transform="rotate(-35 12 12)" /><circle cx="19" cy="4" r="1" fill="currentColor" /></>,
  database: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0M4 16c0 4 16 4 16 0" /></>,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  chevron: <path d="m7 10 5 5 5-5" />,
  grid: <><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="3" width="6" height="6" rx="1" /><rect x="3" y="15" width="6" height="6" rx="1" /><rect x="15" y="15" width="6" height="6" rx="1" /></>,
};

export function Icon({ name, className = "", style }: { name: IconName; className?: string; style?: CSSProperties }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className={`icon ${className}`} style={style}>{paths[name]}</svg>;
}
