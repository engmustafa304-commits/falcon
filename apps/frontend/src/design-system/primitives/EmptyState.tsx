import { Inbox } from "lucide-react";
import { Button } from "./Button";

export function EmptyState() {
  return (
    <div className="rounded-brand-lg border border-dashed border-border-subtle bg-white p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-section text-dark-900">
        <Inbox className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-dark-900">
        No records yet
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
        A quiet empty state with one clear next action and no visual clutter.
      </p>
      <Button className="mt-5" variant="secondary">
        Review setup
      </Button>
    </div>
  );
}
