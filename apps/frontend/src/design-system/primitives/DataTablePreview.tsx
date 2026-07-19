const rows = [
  ["Falcon Core", "Active", "Global"],
  ["White-label", "Planned", "Tenant"],
  ["Localization", "Ready", "Platform"]
] as const;

export function DataTablePreview() {
  return (
    <div className="overflow-x-auto rounded-brand-lg border border-border-subtle bg-white shadow-subtle">
      <table className="w-full min-w-[520px] text-right text-sm">
        <thead className="bg-section text-slate-500">
          <tr>
            {["System", "Status", "Scope"].map((heading) => (
              <th className="px-5 py-4 font-semibold" key={heading}>
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-t border-border-subtle" key={row.join("-")}>
              {row.map((cell) => (
                <td className="px-5 py-4 text-dark-900" key={cell}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
