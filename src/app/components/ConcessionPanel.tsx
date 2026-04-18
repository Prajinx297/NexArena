import { Coffee, Ham, ShoppingBag } from "lucide-react";

interface ConcessionPanelProps {
  concessions?: {
    hot_dogs: number;
    drinks: number;
    merch: number;
  };
}

const labels = {
  hot_dogs: { label: "Hot dogs", icon: Ham },
  drinks: { label: "Drinks", icon: Coffee },
  merch: { label: "Merch", icon: ShoppingBag },
};

export function ConcessionPanel({ concessions }: ConcessionPanelProps) {
  const data = concessions ?? { hot_dogs: 8, drinks: 5, merch: 11 };
  const bestKey = Object.entries(data).sort(([, left], [, right]) => left - right)[0][0] as keyof typeof data;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {(Object.keys(data) as Array<keyof typeof data>).map((key) => {
        const item = labels[key];
        const Icon = item.icon;
        const isBest = key === bestKey;
        return (
          <div
            key={key}
            className={`rounded-[24px] border bg-black/20 p-4 ${isBest ? "border-emerald-300/60" : "border-white/10"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <Icon className="h-5 w-5 text-sky-300" />
              </div>
              {isBest ? (
                <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  Best now
                </span>
              ) : null}
            </div>
            <p className="mt-4 text-sm font-semibold text-[var(--text-primary)]">{item.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold text-[var(--text-primary)]">{data[key]} min</p>
          </div>
        );
      })}
    </div>
  );
}
