import { SpotifyActions, SpotifyContext, SpotifyDevice, TrackObject } from "./spotify-objects.model";

export interface PlaybackStateResponse {
  device: SpotifyDevice,
  repeat_state: string,
  shuffle_state: boolean,
  context: SpotifyContext | null,
  timestamp: number,
  progress_ms: number,
  is_playing: boolean,
  item: TrackObject;
  currently_playing_type: string,
  actions: SpotifyActions
}

export interface PlaylistResponse {
  description: string | null,
  items: {
    total: number
  }
}

export interface SnapshotPostOperationResponse {
  snapshot_id: string
}

