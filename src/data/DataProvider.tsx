import { createContext, useContext, type ReactNode } from 'react'
import type { DataSource } from './source'
import { MockDataSource } from './mock/MockDataSource'

/*
  Vælger den aktive data-kilde for hele appen. I dag altid mock.
  Når Supabase kobles på, byttes blot instansen her ud (eller vælges via en
  miljøvariabel) — ingen skærme skal røres.
*/
const dataSource: DataSource = new MockDataSource()

const DataContext = createContext<DataSource | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  return (
    <DataContext.Provider value={dataSource}>{children}</DataContext.Provider>
  )
}

export function useDataSource(): DataSource {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useDataSource skal bruges inde i DataProvider')
  return ctx
}
