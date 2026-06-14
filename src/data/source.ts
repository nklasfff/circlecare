import type {
  CalendarEvent,
  Message,
  Task,
  Thread,
  Track,
} from '@/types/database'
import type {
  CoverageItem,
  EventPatch,
  MemberView,
  NewEventInput,
  NewMessageInput,
  NewTaskInput,
  NewThreadInput,
  TaskPatch,
  ThreadPatch,
} from './types'

/**
 * Backend-uafhængig grænseflade som alle skærme går igennem.
 *
 * I dag findes kun MockDataSource (hårdkodet, lokal). Når vi senere kobler
 * Supabase på, laver vi en SupabaseDataSource der implementerer det SAMME
 * interface — så skærme og hooks ikke skal bygges om. Metoderne er asynkrone
 * netop for at matche et rigtigt netværks-/database-kald.
 */
export interface DataSource {
  /** Den aktive families id (med login: den indloggede brugers familie). */
  getCurrentFamilyId(): Promise<string>

  /** Alle medlemmer (med roller) i en familie. */
  getMembers(familyId: string): Promise<MemberView[]>

  /** Dækningsposter (opgaver + begivenheder) i et tidsinterval. */
  getCoverage(
    familyId: string,
    fromIso: string,
    toIso: string,
  ): Promise<CoverageItem[]>

  /** Alle opgaver i en familie, sorteret efter forfaldstidspunkt. */
  getTasks(familyId: string): Promise<Task[]>

  /** Opret en ny opgave. */
  createTask(input: NewTaskInput): Promise<Task>

  /** Opdatér en opgave (fx tildel ansvarlig eller skift status). */
  updateTask(id: string, patch: TaskPatch): Promise<Task>

  /** Slet en opgave. */
  deleteTask(id: string): Promise<void>

  /** Alle kalender-begivenheder i en familie, sorteret efter starttidspunkt. */
  getEvents(familyId: string): Promise<CalendarEvent[]>

  /** Opret en ny begivenhed. */
  createEvent(input: NewEventInput): Promise<CalendarEvent>

  /** Opdatér en begivenhed (fx skift hvem der dækker). */
  updateEvent(id: string, patch: EventPatch): Promise<CalendarEvent>

  /** Slet en begivenhed. */
  deleteEvent(id: string): Promise<void>

  /** Kommunikations-spor i en familie. */
  getTracks(familyId: string): Promise<Track[]>

  /** Alle emne-tråde i en familie (på tværs af spor) — bruges af orkestratoren. */
  getFamilyThreads(familyId: string): Promise<Thread[]>

  /** Emne-tråde i et spor, nyeste aktivitet først. */
  getThreads(trackId: string): Promise<Thread[]>

  /** Opdatér en tråd (fx markér som løst). */
  updateThread(id: string, patch: ThreadPatch): Promise<Thread>

  /** Beskeder i en tråd, ældste først. */
  getMessages(threadId: string): Promise<Message[]>

  /** Opret en ny emne-tråd. */
  createThread(input: NewThreadInput): Promise<Thread>

  /** Send en besked i en tråd. */
  sendMessage(input: NewMessageInput): Promise<Message>

  /**
   * Abonnér på ændringer i familiens data. Mock-kilden kalder onChange ved
   * lokale mutationer; Supabase-kilden vil bruge realtime. Returnerer en
   * funktion der afmelder abonnementet.
   */
  subscribe(familyId: string, onChange: () => void): () => void
}
