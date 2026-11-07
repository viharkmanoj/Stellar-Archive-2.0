import { fieldValue, recordFields, recordTitle } from "@/lib/explorer";
import type { AstronomyRecord, ColumnInfo } from "@/lib/types";
import { Icon } from "@/components/dashboard/Icon";

export function RecordsTable({ records, columns, offset, busy, inspect }: {
  records: AstronomyRecord[]; columns: ColumnInfo[]; offset: number; busy: boolean; inspect: (record: AstronomyRecord) => void;
}) {
  const fields = recordFields(records, columns);
  return <div className="records-scroll" role="region" aria-label="Catalog records, scroll horizontally for all fields" tabIndex={0}>
    <table className="records-table"><caption className="sr-only">Actual catalog records. Use Inspect to view all fields in a record.</caption><thead><tr><th scope="col">Record</th>{fields.map((field) => <th scope="col" key={field}><span>{field.replaceAll("_", " ")}</span>{columns.find((column) => column.name === field)?.primary_key && <small>PRIMARY KEY</small>}</th>)}<th scope="col"><span className="sr-only">Details</span></th></tr></thead>
      <tbody>{records.map((record, index) => <tr key={index}><td className="row-number">{offset + index + 1}</td>{fields.map((field) => <td key={field}><span className={`cell-value ${record[field] == null || record[field] === "" ? "missing-value" : ""}`} title={fieldValue(record[field])}>{fieldValue(record[field])}</span></td>)}<td className="inspect-cell"><button disabled={busy} className="inspect-button" onClick={() => inspect(record)} aria-label={`Inspect ${recordTitle(record, columns)}`}>Inspect<Icon name="external" /></button></td></tr>)}</tbody>
    </table>
  </div>;
}
