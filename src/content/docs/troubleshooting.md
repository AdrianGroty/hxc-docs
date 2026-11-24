---
title: "Troubleshooting"
description: "Check recording failures, skipped frames, MIDI input, and differences in external output, and gather the details needed to report a problem."
---

## Recording

| Symptom | Check |
|---|---|
| Recording cannot start | Read the error message. Check the selected codec in `Settings > Recording`; an unavailable codec prevents recording. Check that `Output Folder` exists and is writable, and that the disk has free space. |
| The saved clip skips frames | Choose H.264 or a lower frame rate in `Settings > Recording`. Record a short test again. The save message reports skipped frames. |
| The file is still being saved | Wait for the message naming the saved file. `Saving...` means the write is still in progress, and `REC` stays dimmed until it finishes. |

See [Output and Recording](../concepts/output-and-recording/) for codec,
frame-rate, and save-completion behavior.

## Audio response

| Symptom | Check |
|---|---|
| A song does not drive the picture | Press `Space` or Play on the song strip, then check `Settings > Audio > Source` is `Song and clips`. Check the target's modulation Depth, or `Height` for POINTCLOUD's Spectrum shape. |
| The picture reacts but the song is inaudible | In `Settings > Audio`, check the Song and clips `Output` device. |
| A device or application supplies no input | Select it in `Settings > Audio` and click `Open`. Read the status beneath the source list; application capture can require permission or platform support. |
| A clip has a picture but no sound | Enable `AUDIO` in SOURCE, select `Song and clips` in `Settings > Audio`, and check `Audio Level` and the output device. Read the clip's note if its sound cannot be loaded. |
| A band's `LISTEN` is unavailable | It needs `Song and clips` as the input and an active playback output. `Device` and `Application` inputs are not played through. |
| A band gives an unreliable `Noisiness` value | Widen `Low` to `High` until the narrow-range note clears. |

See [Make an Audio Spectrum](../guides/audio-spectrum/) or
[Audio-Reactive](../reference/modulation/audio-reactive/).

## Clip playback

| Symptom | Check |
|---|---|
| Reverse, scrubbing, or slice jumps stutter | Use `Optimize` if offered in SOURCE or the `Clip Editor`. Read the reason shown beside it. Fewer simultaneously playing clips can also free frame-cache memory. |
| Slice choices cannot be selected | Set `Order` to `Pick`. `Next`, `Random`, and `Shuffle` show a readout of the slice playing. |
| A sequence stays on one value | Feed its `Clock` with pulses that return low between hits. A sustained high value does not keep stepping. |
| A clip-only export has no audio track | The current dialog exposes `Include audio track` only with a song selected and `Use song` enabled. Clip sound can still drive the exported picture. |

See [SOURCE](../reference/modules/source/) and
[Export Video](../reference/windows/export-video/#song).

## Opening older patches

LFO `Level` and `Fold` settings in older patches are not converted to
processors. Their values, and connections modulating those settings, are
discarded on load. Recreate shared gain with a `Multiply` processor and
folding with a `Fold` processor. Keep a copy of the original file before
saving the converted patch if you need to recover its old settings.

Fixed and custom frequency-band connections are converted to patch-owned
audio bands with matching names and ranges. Their response can differ;
check the band's `Attack`, `Release`, `Gain`, and `Measure` when matching a
previous appearance.

## Controller input

| Symptom | Check |
|---|---|
| `Open a MIDI port in Settings > MIDI.` appears | Open your controller's input port in `Settings > MIDI`. |
| A MIDI assignment does nothing | Check the input port, CC number, and channel. Channel `0` accepts any channel. Use the parameter's `MIDI Learn` action and move a control that sends MIDI CC. |
| MIDI Learn stays armed | Send a MIDI CC message from the controller. A successful learn adds the assignment and disarms Learn. |
| A loaded patch reacts to the wrong knobs or faders | The patch was mapped to another controller. Use `Edit > Clear MIDI Bindings...` and learn your own controls. |

See [MIDI](../reference/modulation/midi/) and
[MIDI and OpenSoundControl Learn](../concepts/midi-and-opensoundcontrol-learn/).

## External output

| Symptom | Check |
|---|---|
| The receiving application shows a different picture | Check its handling of transparency. Recordings show empty areas as black; NDI, Spout, and Syphon send those areas as transparency. A receiver that ignores alpha can show fading feedback echoes at full strength. |
| You need an output window for a second display | Enable `Dual Monitor Output` in `Settings > Output`. |

See [Output and Recording](../concepts/output-and-recording/) for sender
settings and display fit.

## Report a problem

Include:

- The Hex Composer version, shown at the bottom of `Settings`.
- Your operating system and version.
- The exact error message.
- The steps that reproduce the problem, including relevant settings.
- A patch that reproduces it, if the problem depends on a patch. Check any
  embedded media before sharing the file.

Use [the Hex Composer Discord](https://discord.gg/Mfx6Jkffkj) to report an
app problem. In the app, `Help > Join the Discord...` opens it.
For unclear or incorrect instructions, use `Describe a problem` on the
relevant documentation page.
