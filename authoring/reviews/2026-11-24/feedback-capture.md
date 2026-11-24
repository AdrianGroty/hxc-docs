# FEEDBACK control capture, 24 November 2026

Replaced the guide's control-location figure with a real native macOS
capture showing Loop and SENDS > CHAIN. The original October capture,
derivative, and manifest remain preserved.

The [capture manifest](../../captures/2026-11-24/manifest.json) identifies
the development app, executable hash, source commit, build options,
untouched original, exact crop, setup patch, and remaining checks.
The public example patches were not changed.

## Verification

- Compiler check: the unchanged app at
  `f4692c2bd762e55bd36e534559d10fa415911e7b` built successfully on macOS arm64.
  This was a development compile, not a distributable package.
- Native observation: the preserved setup loaded through the isolated
  startup-default loader. FEEDBACK showed LIVE, Amount 1.00, Decay 0.975,
  Loop Blend Replace, CHAIN SENDING, and Dry/Wet 1.00.
- Image processing: the manifest check reproduced the 620 by 926 crop and
  verified the original and derivative hashes.
- Site checks: `npm run check` passed all 17 documentation tests, content
  and link validation, and the production build.
- Browser checks: all 10 editor tests passed, including no-op and edited
  preservation of all 134 authored pages. The development server logged a
  Milkdown `dropIndicatorState` cleanup error during the editor suite;
  the tests completed successfully. No editor code changed in this PR.
- Visual review: checked the rendered figure at desktop and 390-pixel
  phone widths. Both markers identify their numeric fields and leave
  labels visible; the phone layout has no horizontal overflow. Opened
  the clean full-size image using keyboard Enter. The built reader page
  produced no browser console errors. Screenshots are preserved beside
  this record.
- Independent source/reader review checked the changed guide sequence,
  reference, concept, native crop, annotation rectangles, hashes, and
  effective SHAPE-before-FEEDBACK order. The review caught an unconditional
  MUTE claim; the final text now limits chain clearing to an active CHAIN
  send and includes the routed-FEEDBACK exception. A second read confirmed
  those findings were resolved with no remaining actionable findings.

## Remaining checks

The new CHAIN layout is not verified in a released app. The current-build
walkthrough, numeric entry, and save/reopen sequence were not completed:
native coordinate automation returned `noWindowsAvailable`. The capture
establishes the loaded controls and values, not those interactions.
No new output comparison is published from this session.

Windows, Linux, packaged offline help, and distributable verification were
not performed. Inline verification notices remain in the affected pages.
