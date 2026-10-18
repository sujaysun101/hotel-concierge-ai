export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="max-w-2xl">
        {eyebrow ? <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{eyebrow}</p> : null}
        <h1 className="font-serif text-3xl tracking-tight md:text-4xl">{title}</h1>
        {description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}
