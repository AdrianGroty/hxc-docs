---
title: "MILK"
description: "Play MilkDrop presets, blend paired presets, and keep their assets with a patch or bank."
---

MILK generates an audio-reactive image from a MilkDrop preset. In its
`Preset` section, choose `Load preset...` to open a `.milk` or `.milk2`
file. A preset can also be dropped onto the app window. The selected
audio input supplies its sound.

> These controls describe the next release and await verification in a
> released app.

| Control | Behavior |
|---|---|
| `Mix` / `Blend` | Strength and [blend mode](../../../concepts/signal-chain/#blend-modes) of the preset's image against the chain. |
| `Restart preset` | Restarts the preset's running state. |
| `Clear preset` | Removes the loaded preset. |

Presets that need shader preparation show their progress while the rest
of the chain keeps playing. A preset that cannot be prepared leaves the
current one running and shows an error. The module's Insert FX process
the preset's image, and `SENDS` can route the chain image at that point
to AUX buses.

## Preset pairs

A paired preset shows a `Preset pair` section. `Position` blends its
first half into its second, from 0 to 100%. `Pattern` determines how the
two images combine. `Direction` appears for patterns that can be reversed.
The corresponding modulation targets are `Pair position`, `Pair pattern`,
and `Pair direction`.

Changing these controls preserves playback and feedback within the pair.
`Reset to preset` restores its authored blend settings without restarting
it. If a change cannot be applied, the previous blend continues and the
panel reports the problem.

## Saving and export

Saved patches and banks keep the preset with its images and prepared
shaders, so the original preset files are not needed when reopening them.

Export waits for required presets to be ready before rendering. MILK's
running feedback and animation can need warm-up and may not return to the
same picture at a loop boundary. Check the export's loop notes and use a
video crossfade when appropriate.

Related: [Audio Reactivity](../../../concepts/audio-reactivity/),
[Insert FX Chains](../../../concepts/insert-fx-chains/),
[Export Video](../../windows/export-video/).
