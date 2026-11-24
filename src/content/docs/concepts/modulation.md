---
title: "Modulation"
description: "Modulation sources, targets, and the connections between them."
---

A module's parameter values can be manipulated by mechanisms other than
direct keyboard or mouse input. These external adjustments are called
modulation. The mechanisms providing modulation are called
[modulation sources](../../reference/modulation/), and the parameters that
they modulate are called modulation targets. Modulation sources can be
assigned to modulation targets by a number of mechanisms, but modulation
assignments appear in the [Mod Matrix](../../reference/windows/mod-matrix/),
where they can be viewed and edited. Modulation assignments can be made by
right-clicking a parameter and selecting `Edit Modulation...`, by clicking
and dragging a modulation source onto a target, or by manually selecting
the sources and targets from the Selectors within the Mod Matrix itself.

A source can pass through a stack of
[processors](../modulation-processors/) before reaching its targets.
Every connection from that source receives the processed result. Each
connection's `Depth` sets how far that result moves its target, and
`Offset` adds a constant adjustment. Several connections can therefore
share one movement while giving their targets different ranges.

A pad holds two parameters, so right-clicking it offers one `Modulate`
item per axis, such as `Modulate Scale X...` and `Modulate Scale Y...`.
To drag a source onto a pad, drop it on the X or Y value beside or below
the pad, not on the pad itself.

Related: [Modulation Sources](../../reference/modulation/),
[MIDI and OpenSoundControl Learn](../midi-and-opensoundcontrol-learn/).
