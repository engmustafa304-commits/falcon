import { X } from "lucide-react";
import { Button } from "./Button";

export function DialogPreview() {
  return (
    <div className="rounded-brand-lg border border-border-subtle bg-white p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-dark-900">Dialog surface</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Calm modal composition for focused enterprise decisions.
          </p>
        </div>
        <button
          aria-label="Close preview dialog"
          className="falcon-motion flex h-9 w-9 items-center justify-center rounded-full bg-section text-slate-500 hover:text-dark-900"
          type="button"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary">Cancel</Button>
        <Button>Confirm</Button>
      </div>
    </div>
  );
}
