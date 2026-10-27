#!/usr/bin/env python3
"""Minimal Mock Media Event Sender for grok-new-tlyrics."""

import argparse
import json
import time
import sys

def build_event(event_type: str, title: str = None, artist: str = None, album: str = None, duration: int = None) -> dict:
    status = "Playing"
    if event_type in ("pause",):
        status = "Paused"
    elif event_type in ("resume",):
        status = "Playing"

    fields = {
        "MediaPlaybackStatus": status,
    }
    if title:
        fields["MediaNowPlayingTitle"] = title
    if artist:
        fields["MediaNowPlayingArtist"] = artist
    if album:
        fields["MediaNowPlayingAlbum"] = album
    if duration is not None:
        fields["MediaNowPlayingDuration"] = duration

    return {
        "source": "mock",
        "vehicle_id": "mock-vehicle-001",
        "timestamp": int(time.time() * 1000),
        "generation": 1,
        "event_type": event_type,
        "fields": fields,
    }

def main():
    parser = argparse.ArgumentParser(description="Send mock Tesla media events")
    parser.add_argument("event_type", choices=["song_start", "song_change", "pause", "resume"])
    parser.add_argument("--title", default=None)
    parser.add_argument("--artist", default=None)
    parser.add_argument("--album", default=None)
    parser.add_argument("--duration", type=int, default=None)
    args = parser.parse_args()

    event = build_event(
        args.event_type,
        title=args.title,
        artist=args.artist,
        album=args.album,
        duration=args.duration,
    )
    print(json.dumps(event, ensure_ascii=False, indent=2))
    # TODO: later POST to local receiver endpoint

if __name__ == "__main__":
    main()
