---
title: "Processors"
description: "Add and arrange modulation processors, connect their inputs, and find each processor's controls."
---

Open a source in `Modulation`, expand `PROCESSORS`, and choose
`+ Add`. Processors run from top to bottom. Drag a processor's grip to
reorder it within the stack; use its right-click menu to rename,
duplicate, or remove it.

> These controls describe the next release and await verification in a
> released app.

| Group | Purpose |
|---|---|
| [SHAPE](shaping/) | Change the value's response or range. |
| [TIMING](timing/) | Smooth, delay, hold, or accumulate a signal. |
| [ANALYSIS](analysis/) | Follow peaks, movement, or beat timing. |
| [EVENTS](events/) | Make or rearrange pulses. |
| [SEQUENCE](sequences/) | Advance patterns or play recorded movement. |
| [MATH](math/) | Calculate with a constant or another source. |
| [COMBINE](combining/) | Blend, compare, or switch between signals. |

## Inputs and output

The first input is determined by the processor's position: the source
itself for the first processor, then the preceding processor's result.
A second input has a picker beside its label, such as `B`, `Trigger`, or
`Reset`. Click it to choose a source, or drop a source onto it. An input
that would make a circular connection is unavailable in the picker.

For a processor with an own `Value`, connecting a second source replaces
that value. Choose `OWN VALUE` in its input picker to disconnect the source.
Some second inputs have a different role: Sample & Hold uses a trigger,
and Wave Shaper uses an LFO's waveform as its response curve.

The source's targets receive the result after its complete stack. An LFO's
Screen draws that result with its original waveform behind it. Envelope
and Time displays likewise show the processed output. A processor's menu
offers `Duplicate LFO up to here`, or the corresponding command for its
source type, to make a separate source ending at that processor.

## Mix, bypass, and modulation

Processors with a `Mix` control blend their input with their result:
0 passes the input unchanged; 1 uses the complete result. The processor's
Rocker bypasses it without removing it. Parameters can receive modulation;
the Mixer uses its own Mod Matrix for those connections.

`Seed` selects repeatable randomness for processors that use it. It
cannot receive modulation. Step Sequencer's individual step values can.
Gesture Looper's recorded movement is saved with the patch or bank; its
`REC` and `CLEAR` actions are not parameter targets. Its `Record` input
allows a pulse to start recording.

Timing and event processors can carry movement from one frame into the
next. Check the export's [loop checklist](../../windows/export-video/#loop-checks)
when their output must repeat at a loop boundary.

Related: [Modulation Processors](../../../concepts/modulation-processors/),
[Envelope](../envelope/).
