import type { CoverageItem, MemberView } from './types'

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

  /**
   * Abonnér på ændringer i familiens data. Mock-kilden kalder onChange ved
   * lokale mutationer; Supabase-kilden vil bruge realtime. Returnerer en
   * funktion der afmelder abonnementet.
   */
  subscribe(familyId: string, onChange: () => void): () => void
}
