---
title: "Audio-Reactive"
description: "Use channel levels or patch-owned frequency bands to drive parameters from sound."
---

Select an input in `Settings > Audio`, or open a song with
`File > Open Song...`. For how input, measurements, and connections relate,
see [Audio Reactivity](../../../concepts/audio-reactivity/).

## Channel levels

`Audio L` and `Audio R` follow the left and right input channels. Their
connections have per-assignment shaping: `RECTIFY` makes signed values
positive; `Attack` and `Release` smooth the response; `Gate` above 0 turns
the signal into an on/off value at that threshold. `Depth` and `Offset`
then determine how it moves the target.

## Frequency bands

Open `Modulation > AUDIO` to create bands. Drag across an empty part of
the live spectrum to draw one, or choose a range through `+ Add Band`.
Presets include `Kick`, `Snare`, `Vocals`, `Hi-hats`, and frequency ranges
from `Sub` to `Air`. Drag a band's edges to change its range or its body
to move the range. Each band appears as a source in modulation pickers.

> These band controls describe the next release and await verification
> in a released app.

| Parameter | Behavior |
|---|---|
| `Low` / `High` | Range to measure, 20 Hz to 20 kHz. |
| `Measure` | Selects `Level`, `Hits`, `Pitch`, `Flux`, or `Noisiness`; see below. |
| `Attack` | Response to a rise, 0 to 2000 ms. Disabled for Hits and Flux, which rise at once. |
| `Release` | Response to a fall, 0 to 2000 ms. |
| `Gain` | Scales the measurement, 0 to 8, before it is limited to full. Disabled for Pitch and Noisiness. |
| `AUTO LEVEL` / `FIXED LEVEL` | Auto Level compares the band with its own recent loudest moment. Fixed Level follows its actual strength, scaled by Gain. Disabled for Pitch, Flux, and Noisiness. |
| `LISTEN` | Auditions this frequency range through the playback output. Requires `Song and clips` as input and an available output stream. |

### Measurements

| `Measure` | What the value means |
|---|---|
| `Level` | How loud the selected range is. |
| `Hits` | How suddenly that range became louder, for flashes or cuts on drum hits. Release controls how the response falls after a hit. |
| `Pitch` | Where the sound sits within the range: 0 at `Low` and 1 at `High`, on a logarithmic frequency scale. Holds its last position while quiet. It is not a MIDI note number. |
| `Flux` | How much the sound's frequency distribution changes, including new notes or chords at the same loudness. Sustained noise can keep it partly high. |
| `Noisiness` | How spread out the sound is, from a clear tone at 0 to noise at 1. Holds while quiet. A range too narrow for a reliable measurement shows a note asking for a wider band. |

Bands have their own [processor stacks](../processors/). Assigning a band
uses the result after that stack. Per-assignment channel shaping does not
apply to bands; tune their own `Attack`, `Release`, and processors instead.
An envelope's `Audio Threshold` trigger can listen to a band's processed
output.

### Ownership and listening

Bands, their settings, and their processors belong to the patch. The
Mixer has a separate band bank saved with the bank's Mixer settings.
Changing a `Device` or `Application` input does not replace those band settings.

Only one band is auditioned at a time. `LISTEN` filters what comes from
the playback output; the patch's measurements, recordings, and exports
still receive the full mix. `Device` and `Application` inputs are not played
through by Hex Composer and cannot be auditioned this way.

Related: [Envelope](../envelope/),
[Make an Audio Spectrum](../../../guides/audio-spectrum/).
