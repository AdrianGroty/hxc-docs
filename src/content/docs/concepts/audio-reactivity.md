---
title: "Audio Reactivity"
description: "How an audio input becomes modulation through levels, frequency bands, and processors."
---

Sound can move a parameter through a modulation connection. The connection
needs a number to work with: how loud the sound is, for example, or how
strongly a particular range of frequencies is changing. Audio sources
provide those numbers. The connection's `Depth` then determines how far
they move the target.

The input selected in `Settings > Audio` supplies the sound. It can come
from a device, another application, or `Song and clips`, which combines the
patch's song with the sound of its SOURCE clips. Left and right channel
levels follow the whole input. A frequency band listens to a range within
it, so a low drum and a high cymbal can move different parameters.

Bands belong to the patch and are configured in `Modulation > AUDIO`.
Each band has its own range and response. Its `Measure` can follow
loudness, sudden hits, the position of sound within the range, changes in
the sound, or noisiness. These measurements describe different aspects of
the same input; choosing a frequency range does not isolate an instrument
when other instruments occupy it too. The Mixer has its own bands,
separate from those in the deck patches.

A band can feed several targets or pass through
[processors](../modulation-processors/) first. A processor can turn its
movement into pulses for an envelope or make it follow a repeating
sequence. `LISTEN` auditions the band's frequency range while tuning it.
It changes what is heard through the playback output, while modulation,
recordings, and exports continue to receive the full mix.

> These band controls describe the next release and await verification
> in a released app.

Related: [Audio-Reactive reference](../../reference/modulation/audio-reactive/),
[Settings](../../reference/windows/settings/#audio-sources),
[Make an Audio Spectrum](../../guides/audio-spectrum/).
