import { describe, expect, it } from 'bun:test'
import { parseSpotify, spotifyEmbedHeight, spotifyEmbedUrl } from '@modules/base/video/spotify'

describe('parseSpotify', () => {
  it.each([
    ['https://open.spotify.com/track/74JJ96ARbvOHc3L5BKKRsv', 'track'],
    ['https://open.spotify.com/intl-nl/album/3ITzp1XFemybqziyz94HIO?si=x', 'album'],
    ['https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator', 'playlist'],
    ['spotify:episode:4rOoJ6Egrf8K2IrywzwOMk', 'episode'],
    ['https://open.spotify.com/show/6Sv1uLBWghOGA67uqHJci8', 'show'],
  ])('accepts %s', (url, type) => {
    expect(parseSpotify(url)?.type).toBe(type as never)
  })

  it.each([
    '',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://open.spotify.com/user/abc',
    'https://open.spotify.com/track/short',
    'https://evil.example/track/74JJ96ARbvOHc3L5BKKRsv',
    'javascript:alert(1)',
  ])('rejects %s', (url) => {
    expect(parseSpotify(url)).toBeNull()
  })

  it('builds the embed URL and height', () => {
    const ref = parseSpotify('https://open.spotify.com/track/74JJ96ARbvOHc3L5BKKRsv')!
    expect(spotifyEmbedUrl(ref)).toBe('https://open.spotify.com/embed/track/74JJ96ARbvOHc3L5BKKRsv?utm_source=generator')
    expect(spotifyEmbedHeight('track')).toBe(152)
    expect(spotifyEmbedHeight('album')).toBe(352)
  })
})
