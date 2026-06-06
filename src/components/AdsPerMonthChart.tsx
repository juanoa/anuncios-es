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
  avg: {
    label: "Media anuncios",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

const MONTHS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
]

function computeAvgAdsPerMonth(raw: string) {
  const yearMonthCounts = new Map<string, number>()
  for (const line of raw.split("\n")) {
    if (!line) continue
    const { date } = JSON.parse(line) as { date: string }
    const key = date.slice(0, 7)
    yearMonthCounts.set(key, (yearMonthCounts.get(key) ?? 0) + 1)
  }
  const totals = Array.from({ length: 12 }, () => ({ sum: 0, years: 0 }))
  for (const [key, count] of yearMonthCounts) {
    const month = Number(key.slice(5, 7)) - 1
    totals[month].sum += count
    totals[month].years += 1
  }
  return totals.map(({ sum, years }, i) => ({
    month: MONTHS[i],
    avg: years === 0 ? 0 : Math.round((sum / years) * 10) / 10,
  }))
}

const data = computeAvgAdsPerMonth(adsJsonl)

export function AdsPerMonthChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Anuncios por mes</CardTitle>
        <CardDescription>
          Media de anuncios por mes, sobre los años con datos en ese mes
        </CardDescription>
      </CardHeader>
      <ChartContainer config={chartConfig} className="h-64 w-full px-2 pb-2">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <Bar dataKey="avg" fill="var(--color-avg)" radius={2} />
        </BarChart>
      </ChartContainer>
    </Card>
  )
}
