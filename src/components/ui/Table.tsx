import { JSX } from 'solid-js';

interface TableProps extends JSX.HTMLAttributes<HTMLTableElement> {
  headers: string[];
}

export function Table(props: TableProps) {
  return (
    <div class="overflow-x-auto">
      <table class={`min-w-full divide-y divide-gray-200 ${props.class || ''}`}>
        <thead class="bg-gray-50">
          <tr>
            {props.headers.map((header) => (
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">{props.children}</tbody>
      </table>
    </div>
  );
}

interface TableRowProps extends JSX.HTMLAttributes<HTMLTableRowElement> {}

export function TableRow(props: TableRowProps) {
  return <tr class={`hover:bg-gray-50 ${props.class || ''}`}>{props.children}</tr>;
}

interface TableCellProps extends JSX.TdHTMLAttributes<HTMLTableCellElement> {}

export function TableCell(props: TableCellProps) {
  return <td class={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${props.class || ''}`}>{props.children}</td>;
} 