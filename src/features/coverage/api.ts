import { supabase } from '@/lib/supabase'
import type { CoverageItem } from '@/types/database'

/**
 * Henter dækningsposter (opgaver + begivenheder samlet via v_coverage) for en
 * familie i et tidsinterval. Posterne sorteres kronologisk.
 */
export async function fetchCoverage(
  familyId: string,
  fromIso: string,
  toIso: string,
): Promise<CoverageItem[]> {
  const { data, error } = await supabase
    .from('v_coverage')
    .select('*')
    .eq('family_id', familyId)
    .gte('at', fromIso)
    .lte('at', toIso)
    .order('at', { ascending: true })
  if (error) throw error
  return (data ?? []) as CoverageItem[]
}
