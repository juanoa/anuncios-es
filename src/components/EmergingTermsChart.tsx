import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import adsJsonl from "../../data/processed/ads.jsonl?raw"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const TERMS = [
  { key: "bio", label: "bio", re: /\bbio\w*/i },
  { key: "eco", label: "eco", re: /\beco(?:\b|l\w*|s\w*)/i },
  { key: "azucar", label: "azúcar", re: /\baz[uú]car\w*/i },
] as const

const chartConfig = {
  bio: { label: "bio", color: "var(--chart-1)" },
  eco: { label: "eco", color: "var(--chart-2)" },
  azucar: { label: "azúcar", color: "var(--chart-3)" },
} satisfies ChartConfig

type TermKey = (typeof TERMS)[number]["key"]
type YearRow = { year: string } & Record<TermKey, number>

function computeEmergingTerms(raw: string): YearRow[] {
  const totals = new Map<string, { count: number } & Record<TermKey, number>>()
  for (const line of raw.split("\n")) {
    if (!line) continue
    const { date, text } = JSON.parse(line) as { date: string; text: string }
    const year = date.slice(0, 4)
    let acc = totals.get(year)
    if (!acc) {
      acc = { count: 0 } as { count: number } & Record<TermKey, number>
      for (const t of TERMS) acc[t.key] = 0
      totals.set(year, acc)
    }
    acc.count += 1
    for (const t of TERMS) {
      if (t.re.test(text)) acc[t.key] += 1
    }
  }
  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, acc]) => {
      const row = { year } as YearRow
      for (const t of TERMS) {
        row[t.key] = Math.round((acc[t.key] / acc.count) * 1000) / 10
      }
      return row
    })
}

const data = computeEmergingTerms(adsJsonl)

export function EmergingTermsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Términos emergentes</CardTitle>
        <CardDescription>
          Porcentaje de anuncios por año que mencionan cada término
        </CardDescription>
      </CardHeader>
      <ChartContainer config={chartConfig} className="h-72 w-full px-2 pb-2">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="year"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            unit="%"
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <ChartLegend content={<ChartLegendContent />} />
          {TERMS.map((t) => (
            <Line
              key={t.key}
              dataKey={t.key}
              type="monotone"
              stroke={`var(--color-${t.key})`}
              strokeWidth={2}
              dot={{ r: 2 }}
            />
          ))}
        </LineChart>
      </ChartContainer>
    </Card>
  )
}
