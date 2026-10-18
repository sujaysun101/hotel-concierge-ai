"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { saveProperty } from "@/lib/actions"
import type { Property } from "@/lib/types"
import type { PropertyInput } from "@/lib/validators"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const STEPS = ["House", "Rooms", "Amenities", "Hours", "Policies", "Nearby", "Review"]

function blank(): PropertyInput {
  return {
    name: "",
    location: "",
    tagline: "",
    description: "",
    phone: "",
    email: "",
    checkIn: "3:00 PM",
    checkOut: "11:00 AM",
    rooms: [{ id: crypto.randomUUID(), name: "", type: "queen", sleeps: 2, description: "" }],
    amenities: [],
    policies: [],
    recommendations: [],
  }
}

function fromProperty(property: Property): PropertyInput {
  return {
    name: property.name,
    location: property.location,
    tagline: property.tagline,
    description: property.description,
    phone: property.phone,
    email: property.email,
    checkIn: property.checkIn,
    checkOut: property.checkOut,
    rooms: property.rooms,
    amenities: property.amenities,
    policies: property.policies,
    recommendations: property.recommendations,
  }
}

export function SetupWizard({ property }: { property: Property | null }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<PropertyInput>(property ? fromProperty(property) : blank())
  const [pending, start] = useTransition()

  function next() {
    if (step === 0 && draft.name.trim().length < 2) {
      toast.error("The house needs a name.")
      return
    }
    if (step === 1 && draft.rooms.some((room) => room.name.trim().length === 0)) {
      toast.error("Every room needs a name, or remove the empty one.")
      return
    }
    setStep((current) => Math.min(current + 1, STEPS.length - 1))
  }

  function save() {
    start(async () => {
      const result = await saveProperty(draft)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success("House book updated.")
      router.push("/app")
      router.refresh()
    })
  }

  return (
    <div>
      <ol className="mb-6 flex flex-wrap gap-2" aria-label="Setup steps">
        {STEPS.map((label, index) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => setStep(index)}
              className={`rounded-full px-3 py-1 text-xs ${index === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              aria-current={index === step ? "step" : undefined}
            >
              {index + 1}. {label}
            </button>
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Property name" value={draft.name} onChange={(name) => setDraft({ ...draft, name })} />
          <Field label="Location" value={draft.location} onChange={(location) => setDraft({ ...draft, location })} />
          <Field label="Tagline" value={draft.tagline} onChange={(tagline) => setDraft({ ...draft, tagline })} />
          <Field label="Phone" value={draft.phone} onChange={(phone) => setDraft({ ...draft, phone })} />
          <Field label="Email" value={draft.email} onChange={(email) => setDraft({ ...draft, email })} />
          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" className="mt-1 min-h-28" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <Editor
          addLabel="Add a room"
          onAdd={() => setDraft({ ...draft, rooms: [...draft.rooms, { id: crypto.randomUUID(), name: "", type: "queen", sleeps: 2, description: "" }] })}
        >
          {draft.rooms.map((room, index) => (
            <div key={room.id} className="grid gap-2 rounded-xl border border-border p-3 md:grid-cols-4">
              <Input aria-label="Room name" value={room.name} placeholder="Room name" onChange={(event) => updateRow(draft.rooms, index, { name: event.target.value }, (rooms) => setDraft({ ...draft, rooms }))} />
              <Input aria-label="Bed type" value={room.type} placeholder="queen" onChange={(event) => updateRow(draft.rooms, index, { type: event.target.value }, (rooms) => setDraft({ ...draft, rooms }))} />
              <Input aria-label="Sleeps" type="number" min={1} max={8} value={room.sleeps} onChange={(event) => updateRow(draft.rooms, index, { sleeps: Number(event.target.value) || 1 }, (rooms) => setDraft({ ...draft, rooms }))} />
              <Button type="button" variant="ghost" onClick={() => setDraft({ ...draft, rooms: draft.rooms.filter((item) => item.id !== room.id) })}>Remove</Button>
              <Textarea className="md:col-span-4" aria-label="Room description" value={room.description} onChange={(event) => updateRow(draft.rooms, index, { description: event.target.value }, (rooms) => setDraft({ ...draft, rooms }))} />
            </div>
          ))}
        </Editor>
      ) : null}

      {step === 2 ? (
        <Editor
          addLabel="Add an amenity"
          onAdd={() => setDraft({ ...draft, amenities: [...draft.amenities, { id: crypto.randomUUID(), name: "", detail: "" }] })}
        >
          {draft.amenities.map((item, index) => (
            <div key={item.id} className="grid gap-2 rounded-xl border border-border p-3">
              <Input aria-label="Amenity" value={item.name} placeholder="Name" onChange={(event) => updateRow(draft.amenities, index, { name: event.target.value }, (amenities) => setDraft({ ...draft, amenities }))} />
              <Textarea aria-label="Amenity detail" value={item.detail} placeholder="What a guest should know" onChange={(event) => updateRow(draft.amenities, index, { detail: event.target.value }, (amenities) => setDraft({ ...draft, amenities }))} />
              <Button type="button" variant="ghost" onClick={() => setDraft({ ...draft, amenities: draft.amenities.filter((row) => row.id !== item.id) })}>Remove</Button>
            </div>
          ))}
        </Editor>
      ) : null}

      {step === 3 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Check-in" value={draft.checkIn} onChange={(checkIn) => setDraft({ ...draft, checkIn })} />
          <Field label="Check-out" value={draft.checkOut} onChange={(checkOut) => setDraft({ ...draft, checkOut })} />
        </div>
      ) : null}

      {step === 4 ? (
        <Editor
          addLabel="Add a policy"
          onAdd={() => setDraft({ ...draft, policies: [...draft.policies, { id: crypto.randomUUID(), title: "", body: "" }] })}
        >
          {draft.policies.map((item, index) => (
            <div key={item.id} className="grid gap-2 rounded-xl border border-border p-3">
              <Input aria-label="Policy title" value={item.title} placeholder="Title" onChange={(event) => updateRow(draft.policies, index, { title: event.target.value }, (policies) => setDraft({ ...draft, policies }))} />
              <Textarea aria-label="Policy" value={item.body} onChange={(event) => updateRow(draft.policies, index, { body: event.target.value }, (policies) => setDraft({ ...draft, policies }))} />
              <Button type="button" variant="ghost" onClick={() => setDraft({ ...draft, policies: draft.policies.filter((row) => row.id !== item.id) })}>Remove</Button>
            </div>
          ))}
        </Editor>
      ) : null}

      {step === 5 ? (
        <Editor
          addLabel="Add a recommendation"
          onAdd={() =>
            setDraft({
              ...draft,
              recommendations: [...draft.recommendations, { id: crypto.randomUUID(), name: "", category: "dining", detail: "", distance: "" }],
            })
          }
        >
          {draft.recommendations.map((item, index) => (
            <div key={item.id} className="grid gap-2 rounded-xl border border-border p-3 md:grid-cols-2">
              <Input aria-label="Place" value={item.name} placeholder="Place" onChange={(event) => updateRow(draft.recommendations, index, { name: event.target.value }, (recommendations) => setDraft({ ...draft, recommendations }))} />
              <select
                aria-label="Kind of place"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={item.category}
                onChange={(event) =>
                  updateRow(
                    draft.recommendations,
                    index,
                    { category: event.target.value as "dining" | "outing" | "transit" },
                    (recommendations) => setDraft({ ...draft, recommendations }),
                  )
                }
              >
                <option value="dining">Dining</option>
                <option value="outing">Outing</option>
                <option value="transit">Transit</option>
              </select>
              <Input aria-label="Distance" value={item.distance} placeholder="Distance" onChange={(event) => updateRow(draft.recommendations, index, { distance: event.target.value }, (recommendations) => setDraft({ ...draft, recommendations }))} />
              <Textarea className="md:col-span-2" aria-label="Why go" value={item.detail} onChange={(event) => updateRow(draft.recommendations, index, { detail: event.target.value }, (recommendations) => setDraft({ ...draft, recommendations }))} />
              <Button type="button" variant="ghost" onClick={() => setDraft({ ...draft, recommendations: draft.recommendations.filter((row) => row.id !== item.id) })}>Remove</Button>
            </div>
          ))}
        </Editor>
      ) : null}

      {step === 6 ? (
        <div className="space-y-2 text-sm leading-6">
          <p className="font-serif text-2xl">{draft.name || "Untitled house"}</p>
          <p>{draft.location}</p>
          <p>Check-in {draft.checkIn} · Check-out {draft.checkOut}</p>
          <p>{draft.rooms.length} rooms · {draft.amenities.length} amenities · {draft.policies.length} policies · {draft.recommendations.length} nearby notes</p>
          <p className="text-muted-foreground">Saving rewrites the profile notes in the house book. Notes you added yourself stay put.</p>
        </div>
      ) : null}

      <div className="mt-6 flex gap-2">
        {step > 0 ? (
          <Button type="button" variant="outline" onClick={() => setStep((current) => current - 1)}>
            Back
          </Button>
        ) : null}
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={next}>Continue</Button>
        ) : (
          <Button type="button" onClick={save} disabled={pending}>{pending ? "Saving…" : "Save the house"}</Button>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const id = label.toLowerCase().replace(/[^a-z]+/g, "-")
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} className="mt-1" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}

function Editor({ children, addLabel, onAdd }: { children: React.ReactNode; addLabel: string; onAdd: () => void }) {
  return (
    <div className="space-y-3">
      {children}
      <Button type="button" variant="outline" onClick={onAdd}>{addLabel}</Button>
    </div>
  )
}

function updateRow<T>(rows: T[], index: number, patch: Partial<T>, commit: (next: T[]) => void) {
  commit(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)))
}
