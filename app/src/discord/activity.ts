import { Track, DiscordActivity, DiscordActivityButton } from '../types';

const truncate = (text: string, max = 15): string =>
  text.length > max ? `${text.slice(0, max)}...` : text;

/** Builds a Discord Rich Presence activity object from a Track.
 * @param track The track to build the activity from.
 * @returns A DiscordActivity object representing the track.
 */
export function buildActivity(track: Track): DiscordActivity {
  const gameName = track.game.gameName || 'Nintendo Music';
  const notation = track.track.rightNotation ? track.track.rightNotation.replace('©', '').trim() : null;

  const activity: DiscordActivity = {
    name: `Nintendo Music - ${truncate(track.track.name)}`,
    details: track.track.name,
    state: notation ? `${notation} · ${gameName}` : `From ${gameName}`,
    type: 2,
    instance: false,
  };

  if (
    !track.paused &&
    typeof track.currentTime === 'number' &&
    typeof track.duration === 'number' &&
    !Number.isNaN(track.duration)
  ) {
    const now = Date.now();
    activity.timestamps = {
      start: Math.floor(now - track.currentTime * 1000),
      end: Math.floor(now + (track.duration - track.currentTime) * 1000),
    };
  }

  if (track.track.thumbnailURL) {
    activity.assets = {
      large_image: track.track.thumbnailURL,
      large_text: track.paused ? `${gameName} · ⏸ Paused` : `${gameName}`,
    };
  }

  if (track.game.gameImage) {
    activity.assets = {
      large_image: activity.assets?.large_image || '',
      large_text: activity.assets?.large_text || '',
      small_image: track.game.gameImage,
      small_text: gameName,
    };
  }

  const buttons: DiscordActivityButton[] = [];

  if (track.track.id) {
    buttons.push({
      label: 'Listen on Nintendo Music',
      url: Track.trackURL(track) || 'https://music.nintendo.com',
    });
  }

  if (track.game.gameId && track.game.gameName) {
    buttons.push({
      label: `${truncate(track.game.gameName, 11)} on Nintendo Music`,
      url: Track.gameURL(track) || 'https://music.nintendo.com',
    });
  }

  if (buttons.length > 0) {
    activity.buttons = buttons;
  }

  return activity;
}
