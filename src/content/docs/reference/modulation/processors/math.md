---
title: "MATH Processors"
description: "Add, subtract, multiply, divide, limit, or convert paired modulation values to polar coordinates."
---

These processors combine the incoming signal with an own value or a
second source selected through the other input.

| Processor | Behavior and controls |
|---|---|
| `Add` | Adds `B`, or `Value` when B is unconnected. |
| `Subtract` | Subtracts B from the incoming signal, or subtracts `Value`. |
| `Multiply` | Multiplies by B or `Value`. A value of 1 preserves the input, 0 stops its movement, and a negative value inverts it. |
| `Divide` | Divides the incoming signal by B or `Value`. Values near zero are protected from producing an infinite result. |
| `Min` | Outputs the smaller of the input and B or `Value`, limiting the upper end. |
| `Max` | Outputs the larger of the input and B or `Value`, limiting the lower end. |
| `Polar` | Treats the input as `X` and the second source or own value as `Y`. `Output: Angle` gives direction in degrees; 0 points along X and 90 along Y. `Length` gives the distance from the center. |

Multiply's own `Value` normally ranges from -4 to 4. For a change that
should apply to only one target, adjust that connection's `Depth` instead
of scaling the source for all of its targets.

Related: [Processor controls](../).
