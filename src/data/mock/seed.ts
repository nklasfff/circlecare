import { startOfWeek, addDays, set } from 'date-fns'
import type { CalendarEvent, Task } from '@/types/database'
import type { MemberView } from '../types'

/*
  Hårdkodet demo-familie (Hansen). Datoer beregnes relativt til den
  indeværende uge, så dækningsbilledet altid har noget at vise.

  Dette spejler supabase/seed.sql, så skiftet til en rigtig database senere
  giver det samme indhold.
*/

export const FAMILY_ID = 'fam-hansen'

export const MEMBER_IDS = {
  far: 'm-far',
  mor: 'm-mor',
  peter: 'm-peter',
  maria: 'm-maria',
  anne: 'm-anne',
  lars: 'm-lars',
  lucas: 'm-lucas',
} as const

export const members: MemberView[] = [
  { membershipId: MEMBER_IDS.far, profileId: null, relation: 'father', isCareRecipient: true, displayName: 'Far (Jens)', avatarColor: null, roles: [] },
  { membershipId: MEMBER_IDS.mor, profileId: null, relation: 'mother', isCareRecipient: true, displayName: 'Mor (Inge)', avatarColor: null, roles: [] },
  { membershipId: MEMBER_IDS.peter, profileId: null, relation: 'son', isCareRecipient: false, displayName: 'Peter', avatarColor: null, roles: ['coordinator'] },
  { membershipId: MEMBER_IDS.maria, profileId: null, relation: 'daughter', isCareRecipient: false, displayName: 'Maria', avatarColor: null, roles: ['food'] },
  { membershipId: MEMBER_IDS.anne, profileId: null, relation: 'daughter', isCareRecipient: false, displayName: 'Anne', avatarColor: null, roles: ['doctor'] },
  { membershipId: MEMBER_IDS.lars, profileId: null, relation: 'son', isCareRecipient: false, displayName: 'Lars', avatarColor: null, roles: ['transport'] },
  { membershipId: MEMBER_IDS.lucas, profileId: null, relation: 'grandchild', isCareRecipient: false, displayName: 'Lucas', avatarColor: null, roles: [] },
]

const now = new Date()
const monday = startOfWeek(now, { weekStartsOn: 1 })

/** Et tidspunkt på ugedag `offset` (mandag = 0) kl. HH:MM. */
function weekday(offset: number, hh: number, mm = 0): string {
  return set(addDays(monday, offset), {
    hours: hh,
    minutes: mm,
    seconds: 0,
    milliseconds: 0,
  }).toISOString()
}

/** I dag kl. HH:MM (så posten altid lander i "I dag"-sektionen). */
function today(hh: number, mm = 0): string {
  return set(now, { hours: hh, minutes: mm, seconds: 0, milliseconds: 0 }).toISOString()
}

const ts = now.toISOString()

export const tasks: Task[] = [
  { id: 't-medicin', family_id: FAMILY_ID, title: 'Tag blodtryksmedicin', notes: null, assigned_to: MEMBER_IDS.far, status: 'todo', due_at: today(18, 0), category: 'medicine', recurrence: null, created_by: MEMBER_IDS.peter, created_at: ts, updated_at: ts },
  { id: 't-apotek', family_id: FAMILY_ID, title: 'Køb medicin på apoteket', notes: null, assigned_to: null, status: 'todo', due_at: weekday(2, 11, 0), category: 'other', recurrence: null, created_by: MEMBER_IDS.peter, created_at: ts, updated_at: ts },
  { id: 't-mad', family_id: FAMILY_ID, title: 'Lav mad til ugen', notes: null, assigned_to: MEMBER_IDS.maria, status: 'todo', due_at: weekday(6, 12, 0), category: 'food', recurrence: null, created_by: MEMBER_IDS.maria, created_at: ts, updated_at: ts },
  { id: 't-kor', family_id: FAMILY_ID, title: 'Kør far til lægen', notes: null, assigned_to: MEMBER_IDS.lars, status: 'todo', due_at: weekday(4, 9, 45), category: 'transport', recurrence: null, created_by: MEMBER_IDS.anne, created_at: ts, updated_at: ts },
]

export const events: CalendarEvent[] = [
  { id: 'e-maria', family_id: FAMILY_ID, title: 'Maria kommer forbi', location: 'Hjemme', starts_at: today(14, 30), ends_at: today(16, 0), covered_by: MEMBER_IDS.maria, category: 'visit', notes: null, created_at: ts },
  { id: 'e-peter', family_id: FAMILY_ID, title: 'Peter kommer forbi – gåtur', location: 'Parken', starts_at: weekday(1, 15, 0), ends_at: weekday(1, 16, 30), covered_by: MEMBER_IDS.peter, category: 'visit', notes: null, created_at: ts },
  { id: 'e-laege', family_id: FAMILY_ID, title: 'Lægebesøg – Dr. Jensen', location: 'Lægehuset', starts_at: weekday(4, 10, 0), ends_at: weekday(4, 11, 0), covered_by: null, category: 'medical', notes: null, created_at: ts },
]
