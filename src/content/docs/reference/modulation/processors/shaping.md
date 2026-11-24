---
title: "SHAPE Processors"
description: "Fold, rectify, quantize, bend, wrap, remap, gate, or compress a modulation signal."
---

These processors change how an input value becomes an output value.

| Processor | Behavior and controls |
|---|---|
| `Fold` | Reflects peaks back into range. `Drive` runs from 0 to 1; 0 leaves the input unchanged. |
| `Rectify` | Flips negative values above zero. Has no shaping parameter. |
| `Quantize` | Rounds the signal to evenly spaced steps. `Steps` is the number of steps per unit, normally 1 to 64. Higher values make smaller steps. |
| `Curve` | Bends the response while retaining its ends. Positive `Bend` stays low longer; negative values rise sooner. Range -1 to 1. |
| `Saturate` | Softens the peaks. `Drive`, normally 0 to 10, pushes the signal further into the flattened part of the curve. |
| `Wrap` | Returns to zero whenever the signal reaches `Size`, normally 0.01 to 10. A rising Time source becomes a repeating ramp. |
| `Range` | Maps the input's expected lower and upper ends onto `Low` and `High`. Both normally range from -1 to 1. Putting `High` below `Low` reverses the response. |
| `Deadzone` | Ignores small movements around `Center`, then continues toward the ends. `Width` is normally 0 to 1; `Center` is normally -1 to 1. |
| `Gate` | Attenuates a signal below `Threshold`. `Knee` makes the boundary gradual; `Floor` sets the fraction retained while shut. Threshold 0 to 1, Knee 0 to 0.5, Floor 0 to 1. |
| `Compressor` | Reduces rises above `Threshold`. `Ratio` of 4:1 lets one quarter of that rise through. `Knee` makes the boundary gradual. Threshold 0 to 1, Ratio 1:1 to 20:1, Knee 0 to 0.5. |

Gate and Compressor act on the signal's magnitude and preserve its sign.
They do not add attack or release timing. Use a band's `Attack` and
`Release`, or a [Slew processor](../timing/), to smooth the result.

`Range` uses the expected input range rather than learning its recent
peaks. Use [Auto Range](../analysis/) to adapt to changing signal strength.

Fold, Rectify, Quantize, Curve, Saturate, Wrap, Deadzone, Gate, and
Compressor have a `Mix` control. Range has none.

Related: [Processor controls](../).
