---
title: "ANALYSIS Processors"
description: "Track a modulation signal's range, speed, peaks, average, or beat phase."
---

| Processor | Behavior and controls |
|---|---|
| `Auto Range` | Learns the input's movement and scales it to fill a range. `Adapt`, normally 0.1 to 60 seconds, controls how quickly the learned range shrinks. `Floor` prevents tiny movements from being amplified to full scale. `Output` selects `Unipolar` (0 to 1) or `Bipolar` (-1 to 1). |
| `Velocity` | Measures how fast the input changes. `Scale` multiplies that rate; at 1 it gives units per second. `Smooth` reduces jitter. `Mode: Signed` distinguishes rising and falling; `Speed` is always positive. |
| `Peak Hold` | Rises to a new peak, waits for `Hold`, then falls. `Fall` is the time to drop one unit. `Shape` selects `Linear` or `Exponential`. Hold is normally 0 to 5 seconds; Fall is normally 0 to 10 seconds. |
| `Average` | Averages the recent input over `Window`, normally 0.01 to 10 seconds. A window covering one complete LFO cycle removes that cycle's oscillation. |
| `Beat Phase` | Estimates the interval between hits and produces a ramp from 0 to 1 between them. `Slowest` and `Fastest` set the accepted tempo range. `Snap: Tempo` rounds the interval to whole, half, or double beats of the tempo. |

Beat Phase needs distinct hits, such as an audio band's `Hits` measurement
or an [Onset processor](../events/). After learning an interval it predicts
the next hit and keeps moving through a break. It estimates timing from
its input; it does not change the app's BPM or join an Ableton Link session.

Peak Hold and Average have a `Mix` control.

Related: [Processor controls](../),
[Audio-Reactive](../../audio-reactive/).
