export function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso))
}

export function formatPercent(rate: number | null): string {
  if (rate === null) return "—"
  return `${Math.round(rate * 100)}%`
}

export function widgetSuggestions(names: string[]): string[] {
  const blob = names.join(" ").toLowerCase()
  const prompts: string[] = []
  if (blob.includes("breakfast")) prompts.push("What time is breakfast?")
  if (blob.includes("park")) prompts.push("Where do we park?")
  if (blob.includes("wi-fi") || blob.includes("wifi")) prompts.push("What's the wifi password?")
  if (blob.includes("dog")) prompts.push("Can we bring a dog?")
  if (blob.includes("late") || blob.includes("checkout") || blob.includes("check-out")) {
    prompts.push("Could we have a late checkout?")
  }
  if (prompts.length === 0) prompts.push("What time is check-in?")
  return prompts.slice(0, 4)
}
