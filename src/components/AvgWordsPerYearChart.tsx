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
  avgWords: {
    label: "Palabras / anuncio",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

function computeAvgWordsPerYear(raw: string) {
  const totals = new Map<string, { sum: number; count: number }>()
  for (const line of raw.split("\n")) {
    if (!line) continue
    const { date, n_words } = JSON.parse(line) as {
      date: string
      n_words: number
    }
    const year = date.slice(0, 4)
    const acc = totals.get(year) ?? { sum: 0, count: 0 }
    acc.sum += n_words
    acc.count += 1
    totals.set(year, acc)
  }
  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, { sum, count }]) => ({
      year,
      avgWords: Math.round((sum / count) * 10) / 10,
    }))
}

const data = computeAvgWordsPerYear(adsJsonl)

export function AvgWordsPerYearChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Palabras por anuncio</CardTitle>
        <CardDescription>Media de palabras por anuncio cada año</CardDescription>
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
            allowDecimals={false}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <Line
            dataKey="avgWords"
            type="monotone"
            stroke="var(--color-avgWords)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ChartContainer>
    </Card>
  )
}
