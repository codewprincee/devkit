'use client';

interface ResponseHeadersProps {
  headers: Record<string, string>;
}

export function ResponseHeaders({ headers }: ResponseHeadersProps) {
  const entries = Object.entries(headers);

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-gray-400 p-4">
        No response headers
      </div>
    );
  }

  return (
    <div className="overflow-auto h-full">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider">Header</th>
            <th className="px-4 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider">Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {entries.map(([key, value]) => (
            <tr key={key} className="hover:bg-gray-50/80">
              <td className="px-4 py-1.5 font-mono font-medium text-gray-700 whitespace-nowrap">{key}</td>
              <td className="px-4 py-1.5 font-mono text-gray-600 break-all">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
