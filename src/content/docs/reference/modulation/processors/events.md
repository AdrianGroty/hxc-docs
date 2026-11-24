---
title: "EVENTS Processors"
description: "Detect crossings or hits, count pulses, thin a clock, or turn one trigger into a burst."
---

A pulse turns on and then off. A clock-driven processor advances when its
input turns on, rather than repeatedly while the input remains high.

| Processor | Behavior and controls |
|---|---|
| `Trigger` | Emits a pulse when the input crosses `Threshold`. `Edge` selects `Rising`, `Falling`, or `Both`. `Length` is normally 0 to 2 seconds; 0 produces one frame. |
| `Change` | Emits a pulse whenever the input moves by `Amount`. `Length` sets its duration, normally 0 to 2 seconds. |
| `Counter` | Advances through `Steps` levels on incoming pulses, then starts over. Two steps alternate low and high. A pulse on `Reset` returns the count to its start. Steps is normally 2 to 32. |
| `Chance` | Each pulse chooses whether the output turns on, according to `Chance` from 0 to 1. `Seed` makes the random decisions repeatable. |
| `Clock Divide` | Passes one pulse from each group of `Divide`, normally 1 to 16. `Offset` chooses which pulse passes; 0 means the first after a reset. A pulse on `Reset` restarts the group. |
| `Burst` | Each trigger starts `Count` pulses, normally 1 to 8. `Spacing` ranges from 1/64 to 1 beat. `Length` gives each pulse's on-time as a fraction of that spacing, normally 0.05 to 1. |
| `Onset` | Detects sudden rises while adapting to the input's level. Higher `Sensitivity` admits quieter hits. `Hold` gives the shortest time between hits; `Length` gives each output pulse's duration. |

Onset can detect hits in a changing audio level without a fixed threshold.
Trigger uses an explicit crossing level. Each can fire an envelope through
the envelope's `Trigger: Processor` option.

Related: [Processor controls](../), [Envelope](../../envelope/),
[Sequences](../sequences/).
