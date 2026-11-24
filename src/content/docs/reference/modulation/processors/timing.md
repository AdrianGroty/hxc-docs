---
title: "TIMING Processors"
description: "Smooth, delay, sample, or accumulate a modulation signal over time."
---

| Processor | Behavior and controls |
|---|---|
| `Slew` | Glides toward the input. `Rise` and `Fall` give the time to travel one full unit, normally 0 to 10 seconds. `Shape` selects steady `Linear` movement or `Exponential` easing. |
| `Delay` | Outputs an earlier value of the input. `Time` is 0 to 2 seconds. |
| `Sample & Hold` | Captures the input when its trigger turns on. With no trigger connected, `Rate` supplies a clock, normally 0 to 30 Hz. `Mode: Sample` holds one value per trigger; `Track` follows the input while the trigger is high and holds it while low. |
| `Spring` | Follows the input with overshoot and oscillation. `Frequency`, normally 0.05 to 10 Hz, sets the swing speed. `Damping` controls how quickly it settles; 1 settles without overshoot. |
| `Integrate` | Adds the input over time. `Rate` scales how much accumulates per second; `Leak` drains the total toward zero. `Free` keeps counting, `Wrap` wraps at whole units, and `Clamp` stops at -1 and 1. A pulse on `Reset` clears the total. |

Slew, Delay, Sample & Hold, and Spring have a `Mix` control. Integrate
has none.

Related: [Processor controls](../), [Time](../../time/).
