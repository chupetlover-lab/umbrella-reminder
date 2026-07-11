import type { OsatsDomain } from "../lib/osats";

export function ScoreSlider({
  domain,
  value,
  onChange,
}: {
  domain: OsatsDomain;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="py-2">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{domain.label}</span>
        <span className="rounded-md bg-teal-50 px-2 py-0.5 text-sm font-semibold text-teal-700 dark:bg-teal-950 dark:text-teal-300">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-teal-600"
      />
      <div className="mt-1 flex justify-between text-xs text-slate-400 dark:text-slate-500">
        <span>{domain.lowAnchor}</span>
        <span>{domain.highAnchor}</span>
      </div>
    </div>
  );
}
