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

const chartConfig = {
  urlPct: {
    label: "% con URL",
    color: "var(--chart-1)",
  },
  phonePct: {
    label: "% con teléfono",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

const URL_RE = /\b[\w-]+\.(?:es|com|net|org|app|io|tv)\b/i
const SPOKEN_URL_RE = /\bpunto\s+(?:es|com|net|org)\b/i
const PHONE_900_RE = /\b(?:9\d{2}|8\d{2})[\s.-]?\d{3}[\s.-]?\d{3}\b/
const MOBILE_RE = /\b[67]\d{2}[\s.-]?\d{3}[\s.-]?\d{3}\b/
const SHORT_RE = /\b\d{4,5}\b/g

function hasUrl(text: string) {
  return URL_RE.test(text) || SPOKEN_URL_RE.test(text)
}

function hasPhone(text: string) {
  if (PHONE_900_RE.test(text)) return true
  if (MOBILE_RE.test(text)) return true
  const shorts = text.match(SHORT_RE)
  if (!shorts) return false
  return shorts.some((s) => {
    const n = Number(s)
    if (s.length === 4) return true
    return n < 2010 || n > 2030
  })
}

function computeContactChannels(raw: string) {
  const totals = new Map<
    string,
    { count: number; url: number; phone: number }
  >()
  for (const line of raw.split("\n")) {
    if (!line) continue
    const { date, text } = JSON.parse(line) as { date: string; text: string }
    const year = date.slice(0, 4)
    const acc = totals.get(year) ?? { count: 0, url: 0, phone: 0 }
    acc.count += 1
    if (hasUrl(text)) acc.url += 1
    if (hasPhone(text)) acc.phone += 1
    totals.set(year, acc)
  }
  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, { count, url, phone }]) => ({
      year,
      urlPct: Math.round((url / count) * 1000) / 10,
      phonePct: Math.round((phone / count) * 1000) / 10,
    }))
}

const data = computeContactChannels(adsJsonl)

export function ContactChannelsPerYearChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>URL vs teléfono</CardTitle>
        <CardDescription>
          Porcentaje de anuncios que mencionan una URL o un teléfono
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
            domain={[0, 100]}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            dataKey="urlPct"
            type="monotone"
            stroke="var(--color-urlPct)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            dataKey="phonePct"
            type="monotone"
            stroke="var(--color-phonePct)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ChartContainer>
    </Card>
  )
}
