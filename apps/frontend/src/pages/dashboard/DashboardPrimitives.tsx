import type { ReactNode } from "react";
import { Card } from "@/design-system/primitives";
import { cn } from "@/utils/cn";

export function DashboardPageHeader({
  action,
  subtitle,
  title
}: {
  action?: ReactNode;
  subtitle?: string;
  title: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-dark-900 md:text-3xl">{title}</h2>
        {subtitle ? (
          <p className="mt-2 text-sm leading-7 text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="w-full sm:w-auto">{action}</div> : null}
    </div>
  );
}

export function MetricCard({
  label,
  trend,
  value
}: {
  label: string;
  trend: string;
  value: string;
}) {
  return (
    <Card className="p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-dark-900">{value}</p>
      <p className="mt-2 text-xs font-semibold text-accent-500">{trend}</p>
    </Card>
  );
}

export function MiniBars({
  className,
  data
}: {
  className?: string;
  data: readonly number[];
}) {
  const max = Math.max(...data);

  return (
    <div className={cn("flex h-44 items-end gap-2 rounded-brand-lg bg-section p-4", className)}>
      {data.map((value, index) => (
        <div
          className="flex-1 rounded-t-xl bg-accent-500/80"
          key={`${value}-${index}`}
          style={{ height: `${Math.max(14, (value / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

export function ResponsiveTable({
  headers,
  rows
}: {
  headers: readonly string[];
  rows: readonly (readonly ReactNode[])[];
}) {
  return (
    <div className="overflow-x-auto rounded-brand-lg border border-border-subtle bg-white shadow-subtle">
      <table className="w-full min-w-[680px] text-right text-sm">
        <thead className="bg-section text-slate-500">
          <tr>
            {headers.map((header) => (
              <th className="px-5 py-4 font-semibold" key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr className="border-t border-border-subtle" key={index}>
              {row.map((cell, cellIndex) => (
                <td className="px-5 py-4 text-dark-900" key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
