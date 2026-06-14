/*
  Domæne-typer for CircleCare.

  Disse spejler schemaet i supabase/migrations/0001_init.sql. Når et rigtigt
  Supabase-projekt er koblet på, kan filen genereres automatisk med:
    npm run db:types
  Indtil da vedligeholdes typerne her i hånden, så app-koden er typesikker.
*/

export type Relation =
  | 'son'
  | 'daughter'
  | 'father'
  | 'mother'
  | 'grandchild'

export type MemberRole = 'coordinator' | 'food' | 'doctor' | 'transport'

export type TaskStatus = 'todo' | 'doing' | 'done'
export type TaskCategory =
  | 'medicine'
  | 'food'
  | 'transport'
  | 'appointment'
  | 'other'

export type EventCategory =
  | 'visit'
  | 'medical'
  | 'meal'
  | 'transport'
  | 'other'

export type TrackKind = 'siblings' | 'with_parent' | 'with_grandchildren'
export type ThreadStatus = 'open' | 'resolved'

export interface Family {
  id: string
  name: string
  created_at: string
}

export interface Profile {
  id: string
  display_name: string
  avatar_color: string | null
  created_at: string
}

export interface Membership {
  id: string
  family_id: string
  profile_id: string | null
  label: string | null
  relation: Relation
  is_care_recipient: boolean
  created_at: string
}

export interface MemberRoleRow {
  membership_id: string
  role: MemberRole
}

export interface Task {
  id: string
  family_id: string
  title: string
  notes: string | null
  assigned_to: string | null
  status: TaskStatus
  due_at: string | null
  category: TaskCategory
  recurrence: unknown | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface CalendarEvent {
  id: string
  family_id: string
  title: string
  location: string | null
  starts_at: string
  ends_at: string | null
  covered_by: string | null
  category: EventCategory
  notes: string | null
  created_at: string
}

export interface Track {
  id: string
  family_id: string
  kind: TrackKind
  name: string
}

export interface Thread {
  id: string
  track_id: string
  title: string
  status: ThreadStatus
  created_by: string | null
  created_at: string
  last_activity_at: string
}

export interface Message {
  id: string
  thread_id: string
  author: string | null
  body: string
  created_at: string
}

/** Rad fra v_coverage-viewet: en samlet opgave eller begivenhed. */
export interface CoverageItem {
  family_id: string
  kind: 'task' | 'event'
  id: string
  title: string
  category: string
  at: string | null
  responsible: string | null
  uncovered: boolean
  status: TaskStatus | null
}
