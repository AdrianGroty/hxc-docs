---
title: "Envelope"
description: "Shape a modulation signal with attack, decay, sustain, and release."
---

An envelope rises on a trigger, falls to a sustained level, then releases
to zero. Configure it in `Modulation > ENV`. `LOOP` makes it repeat without
waiting for a trigger.

| Parameter | Control | Notes |
|---|---|---|
| `Attack` | Trough | Time to rise from zero to full level, 0.001 to 10 seconds. |
| `Decay` | Trough | Time to fall to `Sustain`, 0.001 to 10 seconds. |
| `Sustain` | Trough | Held level, 0 to 1. While looping, sets the notch between decay and release. |
| `Release` | Trough | Full-scale fall time, 0.001 to 10 seconds. Release from a lower level takes proportionally less time. |
| `AUTO-RELEASE` / `HOLD` | Rocker | `HOLD` sustains for as long as the trigger stays on. `AUTO-RELEASE` releases after a fixed time instead, even while still gated. Hidden while looping. |
| `Duration` | Trough | Time at `Sustain` before release under `AUTO-RELEASE`. |
| `LOOP` / `LOOPING` | Rocker | Repeats through attack, decay, and release. `Trigger` becomes `Sync/Reset`: its gate realigns the cycle. |
| `Trigger` | Selector | `MIDI Note`, `Audio Threshold`, `LFO Edge`, or `Processor`. |
| `Ch (0=any)` | Value field | `MIDI Note` trigger only; 0 means any channel. |
| `Input` / `Threshold` | Selector, Trough | `Audio Threshold` only: `Audio L`, `Audio R`, or `Band`, and the level that opens the gate. Band is available once an audio band exists; choose it in the additional Band picker. |
| `LFO` / `Split` | Selector, Trough | `LFO Edge` only: which LFO drives the gate, and the phase position (0 to 1) below which it stays open. |
| `Processor` | Selector | Processor trigger only: chooses an eligible event or gate output, such as Onset, Trigger, Compare, or Logic. |

An audio-band trigger reads that band's output after its processors.
Processor triggers use their on/off output to gate the envelope; its own
Attack, Decay, Sustain, and Release still shape the resulting movement.
The envelope can have a [processor stack](../processors/) of its own,
which changes what its targets receive without changing its trigger input.

Related: [Modulation](../../../concepts/modulation/).
