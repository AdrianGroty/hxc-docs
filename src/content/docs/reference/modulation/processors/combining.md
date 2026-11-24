---
title: "COMBINE Processors"
description: "Blend, reshape, compare, switch, or duck modulation using a second source."
---

| Processor | Behavior and controls |
|---|---|
| `Crossfade` | `Mix` fades from the input at 0 to B at 1. With B unconnected it fades toward the own `Value`. |
| `Wave Shaper` | Reads the input through an LFO waveform selected as `Shape`. `Drive` determines how many times the input traverses the wave; `Offset` shifts its starting point. Has a separate `Mix` control for blending with the unchanged input. |
| `Compare` | Outputs 1 while the input is above B, or the own `Value`; otherwise 0. `Hysteresis` separates the on/off boundaries to prevent rapid switching around the threshold. |
| `Switch` | `Select` passes `A` or `B`; a source can modulate that choice. `Fade` smooths the change, normally over 0 to 2 seconds. With B unconnected it uses the own `Value`. |
| `Logic` | `Operation` combines gates: `AND` requires both, `OR` either, `XOR` exactly one, and `NOT` only the first input being off. `Threshold` defines when either input counts as on. With B unconnected its own `Value` is used; NOT ignores B. |
| `Duck` | Reduces the input while the source selected in `Duck by` is high. `Depth` is the reduction at full second-source strength, from 0 to 1. `Attack` sets how fast it dips; `Release` sets how fast it recovers. |

Wave Shaper uses the selected LFO's waveform as a response curve, rather
than following that LFO's current playback value. Duck instead follows a
live second source, such as a kick band reducing a hi-hat band's movement.

Compare and Logic can fire an [envelope](../../envelope/) with
`Trigger` set to `Processor`.

Related: [Processor controls](../).
