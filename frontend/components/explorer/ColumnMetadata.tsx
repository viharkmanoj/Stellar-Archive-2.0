import type { ColumnInfo } from "@/lib/types";

export function ColumnMetadata({ columns }: { columns: ColumnInfo[] }) {
  return <div className="metadata-scroll" role="region" aria-label="Column metadata" tabIndex={0}>
    <table className="metadata-table"><caption className="sr-only">Source column definitions</caption><thead><tr><th scope="col">Column</th><th scope="col">Database type</th><th scope="col">Nullable</th><th scope="col">Primary key</th></tr></thead>
      <tbody>{columns.map((column) => <tr key={column.name}><th scope="row">{column.name}</th><td><code>{column.type}</code></td><td>{column.nullable ? "Yes" : "No"}</td><td>{column.primary_key ? "Yes" : "No"}</td></tr>)}</tbody>
    </table>
  </div>;
}
