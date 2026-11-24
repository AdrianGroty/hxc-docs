---
title: "Video Clips"
description: "How a SOURCE clip's region, slices, playback mode, and clock determine which part of a video plays."
---

A video file in SOURCE can play as a clip within the patch. Its `Start`
and `End` define a region of the file without cutting the file itself.
The clip can repeat that region, play it once when triggered, or show the
frame selected by `Position`.

Slice markers divide the region into shorter parts. In `Slices` mode,
`Order` determines which part a `Restart` plays. Choosing a different
slice can also trigger it, so modulation can select pictures as well as
move their parameters. `At End` determines whether that slice holds,
disappears, repeats, continues through neighboring slices within the
region, or starts the next choice.
Slices are boundaries within one file, rather than separate video assets.

With `SYNC` off, `Speed` multiplies the video's own playback rate.
With it on, `Length` gives the playing region or slice a duration in beats.
That duration follows the live tempo, including Ableton Link. `Direction`
determines whether playback moves forward, backward, or back and forth.
If the clip's `AUDIO` is on, its sound follows that movement too. Faster
playback raises its pitch; reverse playback reverses the sound.

Some video formats are quick to play forward but slow to jump through.
`Optimize` makes a local playback copy when one would help. The patch
still refers to the original file, and exports read that original.
Trimming, slicing, and optimizing therefore leave the source video intact.

> These clip controls describe the next release and await verification
> in a released app.

Related: [SOURCE](../../reference/modules/source/),
[Clip Editor](../../reference/windows/clip-editor/),
[Audio Reactivity](../audio-reactivity/).
