import type { CalendarEvent, Task } from '@/types/database'
import type { DataSource } from '../source'
import type {
  CoverageItem,
  EventPatch,
  MemberView,
  NewEventInput,
  NewTaskInput,
  TaskPatch,
} from '../types'
import { FAMILY_ID, events as seedEvents, members as seedMembers, tasks as seedTasks } from './seed'

/** Simulér en lille netværksforsinkelse, så loading-tilstande er ægte. */
const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms))

function taskToCoverage(t: Task): CoverageItem {
  return {
    family_id: t.family_id,
    kind: 'task',
    id: t.id,
    title: t.title,
    category: t.category,
    at: t.due_at,
    responsible: t.assigned_to,
    uncovered: t.assigned_to === null,
    status: t.status,
  }
}

function eventToCoverage(e: CalendarEvent): CoverageItem {
  return {
    family_id: e.family_id,
    kind: 'event',
    id: e.id,
    title: e.title,
    category: e.category,
    at: e.starts_at,
    responsible: e.covered_by,
    uncovered: e.covered_by === null,
    status: null,
  }
}

/**
 * Mock-implementering af DataSource over hårdkodet data, holdt i hukommelsen.
 * Mutationer (kommer i Fase 2) opdaterer arrays og kalder listeners — samme
 * kontrakt som en rigtig realtime-backend.
 */
export class MockDataSource implements DataSource {
  private members: MemberView[] = [...seedMembers]
  private tasks: Task[] = [...seedTasks]
  private events: CalendarEvent[] = [...seedEvents]
  private listeners = new Set<() => void>()

  async getCurrentFamilyId(): Promise<string> {
    await delay()
    return FAMILY_ID
  }

  async getMembers(familyId: string): Promise<MemberView[]> {
    await delay()
    if (familyId !== FAMILY_ID) return []
    return this.members
  }

  async getCoverage(
    familyId: string,
    fromIso: string,
    toIso: string,
  ): Promise<CoverageItem[]> {
    await delay()
    if (familyId !== FAMILY_ID) return []
    const from = new Date(fromIso).getTime()
    const to = new Date(toIso).getTime()

    const items = [
      ...this.tasks.map(taskToCoverage),
      ...this.events.map(eventToCoverage),
    ].filter((i) => {
      if (!i.at) return false
      const at = new Date(i.at).getTime()
      return at >= from && at <= to
    })

    items.sort((a, b) => (a.at! < b.at! ? -1 : a.at! > b.at! ? 1 : 0))
    return items
  }

  async getTasks(familyId: string): Promise<Task[]> {
    await delay()
    if (familyId !== FAMILY_ID) return []
    return [...this.tasks].sort(byDueAt)
  }

  async createTask(input: NewTaskInput): Promise<Task> {
    await delay()
    const now = new Date().toISOString()
    const task: Task = {
      id: `t-${crypto.randomUUID()}`,
      family_id: input.family_id,
      title: input.title,
      notes: null,
      assigned_to: input.assigned_to,
      status: 'todo',
      due_at: input.due_at,
      category: input.category,
      recurrence: null,
      created_by: null,
      created_at: now,
      updated_at: now,
    }
    this.tasks = [...this.tasks, task]
    this.notify()
    return task
  }

  async updateTask(id: string, patch: TaskPatch): Promise<Task> {
    await delay()
    let updated: Task | undefined
    this.tasks = this.tasks.map((t) => {
      if (t.id !== id) return t
      updated = { ...t, ...patch, updated_at: new Date().toISOString() }
      return updated
    })
    if (!updated) throw new Error(`Opgave ${id} findes ikke`)
    this.notify()
    return updated
  }

  async deleteTask(id: string): Promise<void> {
    await delay()
    this.tasks = this.tasks.filter((t) => t.id !== id)
    this.notify()
  }

  async getEvents(familyId: string): Promise<CalendarEvent[]> {
    await delay()
    if (familyId !== FAMILY_ID) return []
    return [...this.events].sort((a, b) =>
      a.starts_at < b.starts_at ? -1 : a.starts_at > b.starts_at ? 1 : 0,
    )
  }

  async createEvent(input: NewEventInput): Promise<CalendarEvent> {
    await delay()
    const event: CalendarEvent = {
      id: `e-${crypto.randomUUID()}`,
      family_id: input.family_id,
      title: input.title,
      location: input.location,
      starts_at: input.starts_at,
      ends_at: input.ends_at,
      covered_by: input.covered_by,
      category: input.category,
      notes: null,
      created_at: new Date().toISOString(),
    }
    this.events = [...this.events, event]
    this.notify()
    return event
  }

  async updateEvent(id: string, patch: EventPatch): Promise<CalendarEvent> {
    await delay()
    let updated: CalendarEvent | undefined
    this.events = this.events.map((e) => {
      if (e.id !== id) return e
      updated = { ...e, ...patch }
      return updated
    })
    if (!updated) throw new Error(`Begivenhed ${id} findes ikke`)
    this.notify()
    return updated
  }

  async deleteEvent(id: string): Promise<void> {
    await delay()
    this.events = this.events.filter((e) => e.id !== id)
    this.notify()
  }

  subscribe(_familyId: string, onChange: () => void): () => void {
    this.listeners.add(onChange)
    return () => this.listeners.delete(onChange)
  }

  /** Udløs alle abonnenter efter en mutation (spejler realtime senere). */
  private notify() {
    for (const l of this.listeners) l()
  }
}

function byDueAt(a: Task, b: Task): number {
  const av = a.due_at ?? ''
  const bv = b.due_at ?? ''
  if (av === bv) return 0
  if (!av) return 1
  if (!bv) return -1
  return av < bv ? -1 : 1
}
