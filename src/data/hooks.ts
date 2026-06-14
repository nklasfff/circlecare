import { useEffect } from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { startOfWeek, endOfWeek } from 'date-fns'
import { useDataSource } from './DataProvider'
import type {
  EventPatch,
  MemberView,
  NewEventInput,
  NewMessageInput,
  NewTaskInput,
  NewThreadInput,
  TaskPatch,
  ThreadPatch,
} from './types'

export function useFamilyId() {
  const ds = useDataSource()
  return useQuery({
    queryKey: ['family-id'],
    queryFn: () => ds.getCurrentFamilyId(),
  })
}

export function useMembers(familyId: string | null | undefined) {
  const ds = useDataSource()
  return useQuery({
    queryKey: ['members', familyId],
    enabled: Boolean(familyId),
    queryFn: () => ds.getMembers(familyId as string),
  })
}

/**
 * Dækningsbilledet for den indeværende uge (mandag–søndag), med live-opdatering
 * via data-kildens subscribe (mock i dag, realtime senere).
 */
export function useWeekCoverage(familyId: string | null | undefined) {
  const ds = useDataSource()
  const now = new Date()
  const from = startOfWeek(now, { weekStartsOn: 1 })
  const to = endOfWeek(now, { weekStartsOn: 1 })

  const query = useQuery({
    queryKey: ['coverage', familyId, from.toISOString().slice(0, 10)],
    enabled: Boolean(familyId),
    queryFn: () =>
      ds.getCoverage(familyId as string, from.toISOString(), to.toISOString()),
  })

  const { refetch } = query
  useEffect(() => {
    if (!familyId) return
    return ds.subscribe(familyId, () => {
      void refetch()
    })
  }, [ds, familyId, refetch])

  return { ...query, weekStart: from, weekEnd: to }
}

export function useTasks(familyId: string | null | undefined) {
  const ds = useDataSource()
  const query = useQuery({
    queryKey: ['tasks', familyId],
    enabled: Boolean(familyId),
    queryFn: () => ds.getTasks(familyId as string),
  })

  const { refetch } = query
  useEffect(() => {
    if (!familyId) return
    return ds.subscribe(familyId, () => {
      void refetch()
    })
  }, [ds, familyId, refetch])

  return query
}

/**
 * Mutationer på opgaver. Efter hver ændring genindlæses både opgave- og
 * dækningslisten, så UI og dækningsbilledet altid er i sync.
 */
export function useTaskMutations() {
  const ds = useDataSource()
  const queryClient = useQueryClient()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['tasks'] })
    void queryClient.invalidateQueries({ queryKey: ['coverage'] })
  }

  const create = useMutation({
    mutationFn: (input: NewTaskInput) => ds.createTask(input),
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: (vars: { id: string; patch: TaskPatch }) =>
      ds.updateTask(vars.id, vars.patch),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (id: string) => ds.deleteTask(id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}

export function useEvents(familyId: string | null | undefined) {
  const ds = useDataSource()
  const query = useQuery({
    queryKey: ['events', familyId],
    enabled: Boolean(familyId),
    queryFn: () => ds.getEvents(familyId as string),
  })

  const { refetch } = query
  useEffect(() => {
    if (!familyId) return
    return ds.subscribe(familyId, () => {
      void refetch()
    })
  }, [ds, familyId, refetch])

  return query
}

/**
 * Mutationer på begivenheder. Efter hver ændring genindlæses begivenheds- og
 * dækningslisten, så kalenderen og dækningsbilledet altid er i sync.
 */
export function useEventMutations() {
  const ds = useDataSource()
  const queryClient = useQueryClient()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['events'] })
    void queryClient.invalidateQueries({ queryKey: ['coverage'] })
  }

  const create = useMutation({
    mutationFn: (input: NewEventInput) => ds.createEvent(input),
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: (vars: { id: string; patch: EventPatch }) =>
      ds.updateEvent(vars.id, vars.patch),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (id: string) => ds.deleteEvent(id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}

export function useTracks(familyId: string | null | undefined) {
  const ds = useDataSource()
  return useQuery({
    queryKey: ['tracks', familyId],
    enabled: Boolean(familyId),
    queryFn: () => ds.getTracks(familyId as string),
  })
}

/** Alle tråde i familien (på tværs af spor) — driver orkestratoren. */
export function useFamilyThreads(familyId: string | null | undefined) {
  const ds = useDataSource()
  const query = useQuery({
    queryKey: ['family-threads', familyId],
    enabled: Boolean(familyId),
    queryFn: () => ds.getFamilyThreads(familyId as string),
  })

  const { refetch } = query
  useEffect(() => {
    if (!familyId) return
    return ds.subscribe(familyId, () => {
      void refetch()
    })
  }, [ds, familyId, refetch])

  return query
}

export function useThreads(
  familyId: string | null | undefined,
  trackId: string | null | undefined,
) {
  const ds = useDataSource()
  const query = useQuery({
    queryKey: ['threads', trackId],
    enabled: Boolean(trackId),
    queryFn: () => ds.getThreads(trackId as string),
  })

  const { refetch } = query
  useEffect(() => {
    if (!familyId) return
    return ds.subscribe(familyId, () => {
      void refetch()
    })
  }, [ds, familyId, refetch])

  return query
}

export function useMessages(
  familyId: string | null | undefined,
  threadId: string | null | undefined,
) {
  const ds = useDataSource()
  const query = useQuery({
    queryKey: ['messages', threadId],
    enabled: Boolean(threadId),
    queryFn: () => ds.getMessages(threadId as string),
  })

  const { refetch } = query
  useEffect(() => {
    if (!familyId) return
    return ds.subscribe(familyId, () => {
      void refetch()
    })
  }, [ds, familyId, refetch])

  return query
}

/** Mutationer for kommunikation: opret tråd og send besked. */
export function useCommunicationMutations() {
  const ds = useDataSource()
  const queryClient = useQueryClient()

  const createThread = useMutation({
    mutationFn: (input: NewThreadInput) => ds.createThread(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['threads'] }),
  })
  const sendMessage = useMutation({
    mutationFn: (input: NewMessageInput) => ds.sendMessage(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['messages'] })
      void queryClient.invalidateQueries({ queryKey: ['threads'] })
    },
  })
  const updateThread = useMutation({
    mutationFn: (vars: { id: string; patch: ThreadPatch }) =>
      ds.updateThread(vars.id, vars.patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['threads'] })
      void queryClient.invalidateQueries({ queryKey: ['family-threads'] })
    },
  })

  return { createThread, sendMessage, updateThread }
}

/** Slå et medlems-navn op ud fra membership-id. */
export function memberName(
  members: MemberView[] | undefined,
  membershipId: string | null,
): string | null {
  if (!membershipId || !members) return null
  return members.find((m) => m.membershipId === membershipId)?.displayName ?? null
}
