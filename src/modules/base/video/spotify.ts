/**
 * Spotify URL helpers shared by `base.video`'s publisher render path and
 * its editor preview component.
 *
 *   - `parseSpotify(url)` recognises the share links people copy from the
 *     Spotify app or web player (track / album / playlist / episode / show /
 *     artist), including localised `/intl-xx/` paths, `?si=` tracking params
 *     and existing `/embed/` URLs. Returns `{ type, id }` or `null`.
 *   - `spotifyEmbedUrl(ref)` builds the official `open.spotify.com/embed/...`
 *     player URL.
 *   - `spotifyEmbedHeight(type)` returns the height Spotify recommends for the
 *     compact (track / episode) or full (album / playlist / …) player.
 *
 * Kept in its own `.ts` (no JSX) module so React Fast Refresh works for the
 * sibling `VideoEditor.tsx` without re-running module registration.
 */

export type SpotifyType = 'track' | 'album' | 'playlist' | 'episode' | 'show' | 'artist'

export interface SpotifyRef {
  type: SpotifyType
  id: string
}

const TYPES: ReadonlySet<string> = new Set(['track', 'album', 'playlist', 'episode', 'show', 'artist'])

// Spotify IDs are 22 base62 characters.
const ID_RE = /^[A-Za-z0-9]{22}$/

/**
 * Extract the content type + ID from a Spotify URL or `spotify:` URI.
 * Strict by design: anything unexpected returns `null` so we never embed
 * an arbitrary origin.
 *
 * Accepts:
 *   - `https://open.spotify.com/track/ID`
 *   - `https://open.spotify.com/intl-nl/album/ID?si=...`
 *   - `https://open.spotify.com/embed/playlist/ID?utm_source=generator`
 *   - `spotify:episode:ID`
 */
export function parseSpotify(input: string): SpotifyRef | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  if (trimmed.startsWith('spotify:')) {
    const [, type, id] = trimmed.split(':')
    return type && id && TYPES.has(type) && ID_RE.test(id) ? { type: type as SpotifyType, id } : null
  }

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return null
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null
  if (parsed.hostname.toLowerCase() !== 'open.spotify.com') return null

  const parts = parsed.pathname.split('/').filter(Boolean)
  // Drop optional `/intl-xx/` locale and `/embed/` prefixes.
  while (parts.length && (/^intl-[a-z-]+$/i.test(parts[0]) || parts[0] === 'embed')) parts.shift()
  const [type, id] = parts
  if (!type || !id || !TYPES.has(type) || !ID_RE.test(id)) return null
  return { type: type as SpotifyType, id }
}

/** Official Spotify embed player URL for a parsed reference. */
export function spotifyEmbedUrl(ref: SpotifyRef): string {
  return `https://open.spotify.com/embed/${ref.type}/${ref.id}?utm_source=generator`
}

/** Spotify's recommended player height: compact for single items, full for collections. */
export function spotifyEmbedHeight(type: SpotifyType): number {
  return type === 'track' || type === 'episode' ? 152 : 352
}
