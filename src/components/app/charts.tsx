"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { Analytics } from "@/lib/types"

const forest = "#1F4D3A"
const brass = "#B08958"

export function ConversationChart({ data }: { data: Analytics["daily"] }) {
  return (
    <div className="h-52 w-full" role="img" aria-label="Conversations over the last 14 days">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="currentColor" strokeOpacity={0.08} vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} interval={1} />
          <YAxis allowDecimals={false} width={28} tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip
            cursor={{ stroke: brass, strokeWidth: 1 }}
            contentStyle={{ borderRadius: 12, borderColor: "#e6e0d4", fontSize: 12 }}
          />
          <Area type="monotone" dataKey="conversations" name="Conversations" stroke={forest} fill={forest} fillOpacity={0.16} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function RequestsChart({ data }: { data: Analytics["requestsByType"] }) {
  return (
    <div className="h-52 w-full" role="img" aria-label="Requests by type">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="currentColor" strokeOpacity={0.08} vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis allowDecimals={false} width={28} tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#e6e0d4", fontSize: 12 }} />
          <Bar dataKey="count" name="Requests" fill={brass} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function QuestionsChart({ data }: { data: Analytics["topQuestions"] }) {
  return (
    <div className="h-64 w-full" role="img" aria-label="Top guest questions">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid stroke="currentColor" strokeOpacity={0.08} horizontal={false} />
          <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
          <YAxis type="category" dataKey="label" width={120} tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#e6e0d4", fontSize: 12 }} />
          <Bar dataKey="count" name="Questions" fill={forest} radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
