/**
 * Builds an ilike pattern safe to embed in a PostgREST `or()` filter.
 *
 * The filter is a comma-separated grammar, so an unescaped `,` `(` `)` or `.` in user
 * input changes which filters run rather than what they match. `%` and `_` are LIKE
 * wildcards and `*` is PostgREST's wildcard, so those are stripped too — otherwise a
 * search for "%" matches every row.
 */
export function ilikePattern(query: string): string {
  const cleaned = query.replace(/[,.()\\%_*:"']/g, ' ').trim();
  return `*${cleaned}*`;
}

/** Combines columns into a PostgREST `or` expression against one search term. */
export function ilikeAny(columns: string[], query: string): string {
  const pattern = ilikePattern(query);
  return columns.map((column) => `${column}.ilike.${pattern}`).join(',');
}
