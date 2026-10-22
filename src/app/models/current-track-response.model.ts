export interface CurrentTrack {
  is_playing: boolean;
  timestamp: number;
  context: {
    external_urls: {
      spotify: string;
    };
    href: string;
    type: 'playlist' | string;
    uri: string;
  };
  progress_ms: number;
  item: {
    album: {
      album_type: 'album' | string;
      artists: CurrentTrackArtist[];
      external_urls: {
        spotify: string;
      };
      href: string;
      id: string;
      images: CurrentTrackImage[];
      is_playable: boolean;
      name: string;
      release_date: string;
      release_date_precision: 'day' | string;
      total_tracks: number;
      type: 'album' | string;
      uri: string;
    };
    artists: CurrentTrackArtist[];
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    external_ids: {
      isrc: string;
    };
    external_urls: {
      spotify: string;
    };
    href: string;
    id: string;
    is_local: boolean;
    is_playable: boolean;
    name: string;
    popularity: number;
    preview_url: string | null;
    track_number: number;
    type: 'track' | string;
    uri: string;
  };
  currently_playing_type: 'track' | string;
  actions: {
    disallows: {
      pausing: boolean;
      skipping_prev: boolean;
    };
  };
}

export interface CurrentTrackImage {
  height: number;
  url: string;
  width: number;
}

export interface CurrentTrackArtist {
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  name: string;
  type: 'artist' | string;
  uri: string;
}
