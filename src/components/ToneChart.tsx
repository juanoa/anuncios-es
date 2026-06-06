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

const IMP_VERBS =
  "compra|descubre|llama|descarga|prueba|entra|ven|mira|vive|disfruta|elige|pide|contrata|reserva|visita|conoce|aprende|gana|despierta|busca|escucha|haz|cambia|mejora|empieza|sigue|usa|abre|come|bebe|comparte|pulsa|toca|consulta|act[uú]a|apunta|disfruta|date|d[eé]janos|d[ií]selo|reg[aá]lale"

const SENTENCE_IMP_RE = new RegExp(
  `(?:^|[.!?¡¿\\n]\\s*)(?:${IMP_VERBS})\\b`,
  "i",
)

const PRONOMINAL_IMP_RE =
  /\b(?:suscr[ií]bete|atr[eé]vete|an[ií]mate|cu[ií]date|hazte|ponte|ll[eé]vate|[uú]nete|reg[ií]strate|inf[oó]rmate|prep[aá]rate|ap[uú]ntate|conv[ií][eé]rtete|olv[ií]date|qu[eé]date|si[eé]ntete|acomp[aá]ñanos|ll[aá]manos|escr[ií]benos|cont[aá]ctanos|escr[ií]beme|d[ií]melo|d[eé]janos|descu[bí]breme|descu[bí]brelo|descu[bí]brela|desc[aá]rgalo|desc[aá]rgatelo|desc[aá]rgate|pru[eé]balo|conv[eé]ncete|atrev[eé]te)\b/i

const QUESTION_RE = /[?¿]/

function isImperative(text: string) {
  return SENTENCE_IMP_RE.test(text) || PRONOMINAL_IMP_RE.test(text)
}

const chartConfig = {
  imperative: { label: "Imperativos", color: "var(--chart-1)" },
  question: { label: "Preguntas", color: "var(--chart-2)" },
} satisfies ChartConfig

function computeTonePerYear(raw: string) {
  const totals = new Map<
    string,
    { count: number; imp: number; qst: number }
  >()
  for (const line of raw.split("\n")) {
    if (!line) continue
    const { date, text } = JSON.parse(line) as { date: string; text: string }
    const year = date.slice(0, 4)
    const acc = totals.get(year) ?? { count: 0, imp: 0, qst: 0 }
    acc.count += 1
    if (isImperative(text)) acc.imp += 1
    if (QUESTION_RE.test(text)) acc.qst += 1
    totals.set(year, acc)
  }
  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, { count, imp, qst }]) => ({
      year,
      imperative: Math.round((imp / count) * 1000) / 10,
      question: Math.round((qst / count) * 1000) / 10,
    }))
}

const data = computeTonePerYear(adsJsonl)

export function ToneChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tono</CardTitle>
        <CardDescription>
          Porcentaje de anuncios por año con imperativos o preguntas
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
            domain={[0, 100]}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            dataKey="imperative"
            type="monotone"
            stroke="var(--color-imperative)"
            strokeWidth={2}
            dot={{ r: 2 }}
          />
          <Line
            dataKey="question"
            type="monotone"
            stroke="var(--color-question)"
            strokeWidth={2}
            dot={{ r: 2 }}
          />
        </LineChart>
      </ChartContainer>
    </Card>
  )
}
