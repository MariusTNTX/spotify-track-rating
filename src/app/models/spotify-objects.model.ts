export interface TrackObject {
  album: SpotifyAlbum;
  artists: SimplifiedArtistObject[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: SpotifyExternalIds;
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  is_local: boolean;
  is_playable: boolean;
  name: string;
  popularity: number;
  preview_url: string | null;
  track_number: number;
  type: 'track';
  uri: string;
}

export interface SpotifyAlbum {
  album_type: 'album' | string;
  artists: SimplifiedArtistObject[];
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  images: SpotifyImage[];
  is_playable: boolean;
  name: string;
  release_date: string;
  release_date_precision: 'day' | string;
  total_tracks: number;
  type: 'album' | string;
  uri: string;
}

export interface SimplifiedArtistObject {
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  name: string;
  type: 'artist';
  uri: string;
}

export interface SpotifyPagedItems<ItemType> {
  href: string,
  limit: number,
  next: string,
  offset: number,
  previous: string,
  total: number,
  items: ItemType[]
}

export interface SpotifyPlaylistOwner {
  external_urls: SpotifyExternalUrls,
  href: string,
  id: string,
  type: "user" | string,
  uri: string,
  display_name: string
}

export interface SpotifyContext {
  type: "artist" | "playlist" | "album" | "show",
  href: string,
  external_urls: SpotifyExternalUrls,
  uri: string
}

export interface SpotifyDevice {
  id: string | null,
  is_active: boolean,
  is_private_session: boolean,
  is_restricted: boolean,
  name: string,
  type:  "computer" | "smartphone" | "speaker",
  volume_percent: number | null,
  supports_volume: boolean
} 

export interface SpotifyActions {
  interrupting_playback: boolean,
  pausing: boolean,
  resuming: boolean,
  seeking: boolean,
  skipping_next: boolean,
  skipping_prev: boolean,
  toggling_repeat_context: boolean,
  toggling_shuffle: boolean,
  toggling_repeat_track: boolean,
  transferring_playback: boolean
}

export interface SpotifyImage {
  height: number;
  url: string;
  width: number;
}

export interface SpotifyExternalUrls {
  spotify: string;
}

export interface SpotifyExternalIds {
  isrc: string;
}