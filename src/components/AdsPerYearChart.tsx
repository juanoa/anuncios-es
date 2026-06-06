import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
  count: {
    label: "Anuncios",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

function computeAdsPerYear(raw: string) {
  const counts = new Map<string, number>()
  for (const line of raw.split("\n")) {
    if (!line) continue
    const { date } = JSON.parse(line) as { date: string }
    const year = date.slice(0, 4)
    counts.set(year, (counts.get(year) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, count]) => ({ year, count }))
}

const data = computeAdsPerYear(adsJsonl)

export function AdsPerYearChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Anuncios por año</CardTitle>
        <CardDescription>
          Total de anuncios recogidos cada año
        </CardDescription>
      </CardHeader>
      <ChartContainer config={chartConfig} className="h-64 w-full px-2 pb-2">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
          <Bar dataKey="count" fill="var(--color-count)" radius={2} />
        </BarChart>
      </ChartContainer>
    </Card>
  )
}
