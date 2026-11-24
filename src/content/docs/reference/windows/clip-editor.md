---
title: "Clip Editor"
description: "Trim a SOURCE video, edit slice markers, navigate frames, and zoom its timeline."
---

Choose `Edit Clip...` in a SOURCE module's `Clip` section. The window edits
that module's video region and slices; playback Mode and Direction remain
in the SOURCE panel.

> These controls describe the next release and await verification in a
> released app.

## Timeline

The upper overview shows the whole file and the part visible below it.
Click or drag the overview to move that view. Over the main timeline,
scroll to zoom around the pointer; `Shift` plus scroll pans. `Fit` shows
the whole file, and `Zoom to clip` frames the selected region.

Drag the region bar's ends to trim Start and End. Drag its body to move
the region without changing its length. Double-click its body to zoom to
the region. Edges snap to nearby boundaries and the playhead; hold `Alt`
(`Option` on macOS) to bypass that snapping and move in single frames.

Click or drag the pictures to move the playhead. In Scrub mode this edits
`Position`. Otherwise playback continues from the chosen point when the
drag ends.

## Slices

`+ Slice at playhead` inserts a marker. Double-clicking the numbered lane
below the pictures also inserts one; drag a marker to move it or
right-click it to remove it. There can be up to 64 slices.

With Sync off, `Slice into` offers 4, 8, 16, or 32 equal parts of the
region. With Sync on, `Slice every` offers 1/4, 1/2, 1, or 2 beats at the
current tempo. `Apply` replaces the existing markers with that grid;
`Clear` removes them. Choose `Mode: Slices` in the SOURCE panel to play
the individual parts.

## Transport and keys

Frame steps and jumps pause the clip on the chosen frame. `Set In` makes
the region start at that frame; `Set Out` ends it after that frame.

These keys apply while the Clip Editor has keyboard focus and no text
field is being edited:

| Key | Action |
|---|---|
| `Space` | Play or pause this clip, rather than the song. |
| `Left` / `Right` | Step one frame backward or forward. |
| `Shift+Left` / `Shift+Right` | Move one second backward or forward. |
| `Home` / `End` | Jump to the region's first or last frame. |
| `I` / `O` | Set In or Out at the playhead. |
| `S` | Add a slice at the playhead. |

`Optimize`, when offered at the bottom, has the same role as in
[SOURCE](../../modules/source/#optimize-playback).

Related: [Video Clips](../../../concepts/video-clips/).
