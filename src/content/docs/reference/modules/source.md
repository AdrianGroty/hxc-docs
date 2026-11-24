---
title: "SOURCE"
description: "Play and slice video files, or receive a camera, capture device, or another program's video output."
---

SOURCE brings a video file, camera, capture device, or another program's
NDI, Spout, or Syphon output into the chain.

| Parameter | Control | Notes |
|---|---|---|
| Source kind | Selector | `Video File`, `Camera / Capture`, `NDI In`, `Spout In` (Windows), or `Syphon In` (macOS). |
| Fit mode | Selector | `Fit` preserves the aspect ratio with borders. `Crop` fills the canvas and crops the overflow. `Stretch` fills the canvas by changing the aspect ratio. `Native` centers the frame at its original pixel size. Applies to every source kind. |
| `Open Video..` | File picker | Available for `Video File`. Other source kinds show device or sender connection controls instead. |
| `Opacity` / `Blend` | Trough, Selector | Strength and [blend mode](../../../concepts/signal-chain/#blend-modes) of the source against the chain. |

With nothing loaded, SOURCE leaves the chain unchanged in every `Blend` mode.

`NDI In` needs the free NDI Runtime, the same one NDI output uses. See
[Output and Recording](../../../concepts/output-and-recording/) for installation
instructions.

## Video clips

A video file shows a `Clip` section with a timeline. Drag the ends of its
region bar to trim the playable region; drag the bar to move that region.
Click or drag the pictures to move the playhead. `Edit Clip...` opens the
[Clip Editor](../../windows/clip-editor/) for zooming, frame steps, and slices.
See [Video Clips](../../../concepts/video-clips/) for how these parts relate.

> The clip controls below describe the next release and await verification
> in a released app.

| Parameter | Control | Behavior |
|---|---|---|
| `Mode` | Selector | `Loop` repeats the region; `One Shot` plays once per Restart; `Slices` plays one slice at a time; `Scrub` follows Position. |
| `Direction` | Selector | `Forward`, `Reverse`, or `Ping-Pong`. Unavailable in Scrub. |
| `Speed` | Trough | 0 to 4x the file's own rate while SYNC is off. At 0 playback pauses. |
| `SYNC` | Rocker | Fits the region, or each slice, to Length in beats. |
| `LENGTH` | Value field | With SYNC on, accepts a beat length from 1/64 to 256 beats, including fractions and bars. Modulate `Sync Rate` to double or halve its speed in steps. |
| `Restart` | Button | Plays from the region's start, or triggers the slice chosen by Order. A modulation signal fires it when it rises past the midpoint. |
| `Slice` | Selector | In Slices with Order set to Pick, choosing a slice plays it. Clicking the selected slice again retriggers it. Other Orders show a readout of the slice playing. |
| `Order` | Selector | `Pick` uses Slice. `Next` advances through slices; `Random` chooses one; `Shuffle` plays each once in shuffled order. The choice is made on Restart. |
| `NO REPEAT` | Rocker | Random only: excludes the slice that just played. |
| `Seed` | Value field | 0 to 999. Determines Random and Shuffle choices. |
| `At End` | Selector | See below. One Shot offers Hold and Empty only. |
| `Position` | Trough | Scrub only: 0 is the region's start and 1 its end. |
| `FREEZE` / `FROZEN` | Rocker | Holds the current frame. Restart and Slice can still jump. |
| `AUDIO` / `AUDIO ON` | Rocker | Plays the file's sound with the clip. Cannot receive modulation because enabling it can change the app's audio input. |
| `Audio Level` | Trough | Strength of the clip's sound in the mix, 0 to 100%. Supports modulation. |

`Start` and `End` are modulation targets expressed as shares of the whole
file, from 0 to 1. Slice marker positions are editing data and cannot
receive modulation. The other playback choices and values can be
modulated, including Direction, Mode, Order, Slice, Freeze, and Seed.

### What happens at the end

| `At End` | Behavior in Slices mode |
|---|---|
| `Hold` | Holds the last frame reached. |
| `Empty` | Leaves the SOURCE image empty after playback ends. |
| `Loop` | Repeats the current slice. |
| `Continue` | Plays on through neighboring slices without choosing a new one through Order. |
| `Restart` | Triggers another slice using Order. Next, Random, or Shuffle can therefore continue choosing slices without an external trigger. |

Changing `At End` also affects a clip that has already ended. Hold shows
its last frame, Empty hides it, Loop or Continue resumes playback, and
Restart makes a fresh choice through Order.

With `SYNC` on, `LENGTH` describes one pass. Ping-Pong takes twice that
length to travel there and back. In Slices with `At End: Continue`, it
fits the whole remaining play from the chosen slice to the region's edge,
rather than each individual slice.

### Clip sound

Enabling `AUDIO` selects `Song and clips` in `Settings > Audio`. Opening a
patch with clip audio also selects this input. It mixes the clips with the
song for listening, audio reactivity, recordings, and exports. Changing the
input to Device or Application makes clip sound silent until `Song and
clips` is selected again.

Sound follows playback speed and direction, without time stretching.
Pausing or freezing holds the picture and stops its sound. The panel
reports files with no sound or a sound track that cannot be read. Clip
sound longer than 20 minutes cannot be loaded.

### Optimize playback

When reverse playback, scrubbing, or slice jumps would benefit from a
playback copy, the panel offers `Optimize` with the reason and an estimated
size. The clip keeps playing while the copy is made and switches to it
when ready. `Cancel` stops the preparation.

The original file remains the patch's asset. Export Video reads it, and
sharing or embedding the patch does not depend on the local optimized
copy. Manage its disk usage in
[Settings > Output > Optimized Clips](../../windows/settings/#optimized-clips).

## Export and loops

Video files advance on the export's clock. The
[loop checklist](../../windows/export-video/#loop-checks) accounts for the
selected region, direction, mode, and Sync; use its `Snap` actions where
offered. Slices selected by non-repeating input and arbitrary scrubbing
still need a repeating modulation pattern to make a repeating picture.
A camera or NDI, Spout, or Syphon input holds one frame during export.

Related: [Insert FX Chains](../../../concepts/insert-fx-chains/),
[AUX Sends and Buses](../../../concepts/aux-sends-and-buses/).
