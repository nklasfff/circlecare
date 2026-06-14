import type { CalendarEvent, Task } from '@/types/database'
import type { DataSource } from '../source'
import type { CoverageItem, MemberView } from '../types'
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

  subscribe(_familyId: string, onChange: () => void): () => void {
    this.listeners.add(onChange)
    return () => this.listeners.delete(onChange)
  }
}
