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
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
  pct: {
    label: '% con "gratis"',
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

const GRATIS_RE = /\bgratis\b/i

function computeGratisPerYear(raw: string) {
  const totals = new Map<string, { count: number; hits: number }>()
  for (const line of raw.split("\n")) {
    if (!line) continue
    const { date, text } = JSON.parse(line) as { date: string; text: string }
    const year = date.slice(0, 4)
    const acc = totals.get(year) ?? { count: 0, hits: 0 }
    acc.count += 1
    if (GRATIS_RE.test(text)) acc.hits += 1
    totals.set(year, acc)
  }
  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, { count, hits }]) => ({
      year,
      pct: Math.round((hits / count) * 1000) / 10,
    }))
}

const data = computeGratisPerYear(adsJsonl)

export function GratisChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Uso de "gratis"</CardTitle>
        <CardDescription>
          Porcentaje de anuncios por año que usan la palabra "gratis"
        </CardDescription>
      </CardHeader>
      <ChartContainer config={chartConfig} className="h-64 w-full px-2 pb-2">
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
          <Line
            dataKey="pct"
            type="monotone"
            stroke="var(--color-pct)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ChartContainer>
    </Card>
  )
}
