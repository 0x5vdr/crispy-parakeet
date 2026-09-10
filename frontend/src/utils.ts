/**
 * Normalizes market session names to classify equivalent names together.
 * e.g., 'NY', 'New York', and 'newyork' are all unified as 'New York'.
 */
export function normalizeSession(session: string | null | undefined): string {
  if (!session) return 'Unassigned'
  const trimmed = session.trim()
  const lower = trimmed.toLowerCase()

  if (lower === 'ny' || lower === 'new york' || lower === 'newyork') {
    return 'New York'
  }
  if (lower === 'ny am' || lower === 'new york am' || lower === 'new york (am)') {
    return 'New York AM'
  }
  if (lower === 'ny pm' || lower === 'new york pm' || lower === 'new york (pm)') {
    return 'New York PM'
  }
  if (lower === 'london' || lower === 'london open' || lower === 'london session') {
    return 'London'
  }
  if (lower === 'asia' || lower === 'asia session' || lower === 'asian session') {
    return 'Asia'
  }

  return trimmed
}
