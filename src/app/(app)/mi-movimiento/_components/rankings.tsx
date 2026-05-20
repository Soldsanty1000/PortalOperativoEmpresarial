import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Trophy } from "lucide-react";

export type RankingItem = { id: string; nombre: string; valor: number };

export function RankingCard({
  titulo,
  items,
  formato = "numero",
  emptyText = "Sin datos",
}: {
  titulo: string;
  items: RankingItem[];
  formato?: "numero" | "moneda";
  emptyText?: string;
}) {
  const max = items[0]?.valor ?? 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="h-4 w-4 text-accent" />
          {titulo}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <ol className="space-y-2">
            {items.map((it, idx) => {
              const pct = max > 0 ? (it.valor / max) * 100 : 0;
              return (
                <li key={it.id} className="space-y-1">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-sm font-medium truncate">
                      <span className="text-muted-foreground mr-2">{idx + 1}.</span>
                      {it.nombre}
                    </span>
                    <span className="text-sm font-semibold tabular-nums">
                      {formato === "moneda" ? formatCurrency(it.valor) : it.valor}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
