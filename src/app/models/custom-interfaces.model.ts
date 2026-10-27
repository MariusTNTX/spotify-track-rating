export interface PlaybackState {
  trackId: string,
  trackName: string,
  albumName: string,
  albumImageUrl: string,
  artistName: string,
  currentMillisecons: number,
  totalMilliseconds: number,
  trackPercent: number,
  isPlaying: boolean,
  isShuffled: boolean,
  mustShuffle: boolean
}

export interface PlaylistData {
  remainingTracks: number,
  totalTracks: number,
  playlistPercent: number
}

// ORIGINAL:
export enum RatingLevels {
  TOP = '3sZzeLHdxjhE4Rc3tndAg0',
  GOOD = '74ZYS66u6sRmoOYbhxwjLZ',
  OTHER = '6R3wWGDb8VL0mQQNOWjQrK',
  NONE = ''
}

// MOCK:
/* export enum RatingLevels {
  TOP = '0LdhM9YUMPmsnZVNHJce4L',
  GOOD = '5Ckdqe2TD0mznyF5QhAFvB',
  OTHER = '69xqt1ROUxvIWBs4AWbABM',
  NONE = ''
} */