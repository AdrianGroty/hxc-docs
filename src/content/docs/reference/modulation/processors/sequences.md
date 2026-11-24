---
title: "SEQUENCE Processors"
description: "Step through rhythms or values, evolve a random pattern, or record a looping gesture."
---

Euclid, Step Sequencer, and Turing advance on pulses in their `Clock`
input. They need an input that returns low between pulses. Add them after
an event processor, or use a source that already alternates low and high.
Their `Reset` input returns the pattern to its start on a pulse.

| Processor | Behavior and controls |
|---|---|
| `Euclid` | Distributes `Pulses` as evenly as possible across `Steps`, normally 1 to 32. `Rotate` shifts the pattern by steps. For example, 3 pulses in 8 steps produces a repeating uneven rhythm. |
| `Step Sequencer` | Plays up to 16 values. `Length` selects how many steps are used. `Direction` is `Forward`, `Backward`, `Ping-pong`, or seeded `Random`. `Glide` smooths changes, normally over 0 to 2 seconds. |
| `Turing` | Repeats an evolving random pattern. `Length` is normally 2 to 16 steps; `Mutate` is the chance of changing each step. At 0 the pattern stays fixed. `Output` selects `Values` or `Gates`. `Seed` selects its repeatable randomness. |
| `Gesture Looper` | Records the incoming movement for `Length`, then repeats it. Length choices run from 1/2 to 64 beats. `Start` chooses `Now` or `Next loop`. A pulse on `Record` has the same role as `REC`. |

## Edit a Step Sequencer

Drag across the step bars to draw a sequence. Right-click a step to
assign modulation to it; `Ctrl`-click opens numeric entry. Steps outside
`Length` retain their values but do not play. `Seed` determines the Random
direction's choices.

## Record a gesture

Place Gesture Looper after the signal you want to record, such as a macro.
Set `Length`, press `REC`, and move that input. With `Start: Next loop`,
recording waits for the next loop boundary. Once the chosen length has
been recorded, the take plays repeatedly. With no take, the input passes
through.

The take is saved with the patch or bank. `CLEAR` removes it and returns
to the input; recording and clearing can be undone. `Mix` blends the live
input with the recorded movement.

Related: [Processor controls](../), [Events](../events/).
