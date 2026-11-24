---
title: "Modulation Processors"
description: "How processors reshape a source, combine it with another source, or turn its movement into events."
---

A modulation source does not have to reach its targets unchanged. Just as
Insert FX process an image along a chain, processors change a source's
value before it reaches the parameters connected to it. An LFO can become
a staircase, a jumpy audio band can glide, or a hit can advance a sequence
of values.

LFOs, envelopes, Time sources, macros, and audio bands each have a
`PROCESSORS` section. Its processors run from top to bottom, with each
reading the result of the one above. The source sends the final result to
all of its targets. Their individual `Depth` and `Offset` settings then
control how that result moves each parameter. Changing a processor affects
every connection from the source; changing a connection affects only its
target.

Some processors also read a second source. `Multiply`, for example, can
scale an LFO by an audio band, so the motion grows with the music.
`Compare` produces an on/off value when one signal exceeds another.
Processors that respond to pulses need a signal that turns on and off:
a sustained high value does not keep advancing a Step Sequencer.

Order matters. Quantizing before smoothing produces glides between
steps; quantizing after smoothing leaves a staircase. To use a result
partway through a stack as well as its final result, a processor's menu
can duplicate its source with the processors up to that point. The two
sources can then develop independently.

> These processors describe the next release and await verification
> in a released app.

Related: [Processor reference](../../reference/modulation/processors/),
[Modulation](../modulation/), [Audio Reactivity](../audio-reactivity/).
