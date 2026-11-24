# Documentation verification pilot

This pilot tracks FEEDBACK and shared CHAIN controls. It checks the
integrity and scope of documentation evidence; it does not decide whether
the app's current behavior matches the manual. Other authored pages and
assets remain outside the pilot, and the validator reports that coverage.

[AUTHORING.md](../AUTHORING.md) still owns procedure and capture standards.
The records here make those standards checkable without replacing a
native walkthrough, independent review, or packaged Help check.

## Records

- [feature-map.json](feature-map.json) gives each feature a stable ID and
  lists its pages, published images, downloadable patches, and scenarios.
  Features can share inputs. Paths are repository-relative and point to
  active material, not archived manuals.
- [verification.json](verification.json) records the reviewed app commit,
  hashes of reviewed inputs and evidence, and checks with explicit targets.
  A check applies only to its listed targets; a FEEDBACK control observation
  does not establish another module's behavior or a completed guide.
- [scenarios](scenarios/feedback-trails.json) describe a repeatable procedure.
  The [run instructions](verification/README.md) explain how to record its
  preflight and actions. The pending run is an incomplete record, not a
  successful example to copy unchanged.
- `captures/YYYY-MM-DD/manifest.json` preserves capture identity, original
  and derivative hashes, processing, and limitations. Historical records
  retain the evidence actually collected at that time.

The ledger does not contain its own docs commit: committing that value
would change the commit it was meant to identify. A future app-side report
can supply the actual app/docs revision pair. This docs-only validator
checks the format of the declared app commit, not its existence, ancestry,
or relationship to later app changes. It needs no private app credentials.

## Update a mapped input

1. Find all affected feature IDs in the map. Add a page, image, patch, or
   scenario to each applicable feature when extending the pilot.
   Every local image and downloadable patch used by a mapped page must
   belong to at least one feature that covers that page.
2. Review the change against the identified app. Decide which existing
   evidence still applies and which checks need repeating. A prose edit
   can leave a screenshot accurate; an app layout change can invalidate a
   recent screenshot. Capture age alone decides neither case.
3. Preserve new evidence in an identified review, capture, or native run
   record. Keep original captures unchanged. A new capture gets a new
   original and manifest entry rather than replacing historical evidence.
4. Update the affected ledger records. Every mapped input and referenced
   evidence file needs its current SHA-256 in `inputs`. Compute hashes
   after review, for example with `shasum -a 256 <path>`; changing a hash
   alone is not evidence that the material was reviewed.
5. Set each check's targets and result. A passed check needs evidence.
   Pending or unassessed work needs a reason. Keep platform and build
   limitations in the evidence and reader-facing warnings where required.
6. Run `npm run check` and report the affected feature IDs and pending
   checks in the PR. Release-manual builds run the same authoring validator.

`inputs` includes the mapped scenario and referenced evidence so changing
the procedure or proof cannot silently retain the previous record. Do not
include `verification.json` itself in its own input hashes.

Features with annotated images also bind `image-annotations.json`. The
pilot hashes the whole registry, so an unrelated marker edit can request
review of these records too. Review its effect before updating the hash;
a bounds-valid marker can still identify the wrong control.

## Check types and outcomes

| Kind | Evidence it records |
|---|---|
| `source-review` | Review of instructions or concepts against identified product source. |
| `native-observation` | Visible controls or output in an identified native app; not necessarily an interactive procedure. |
| `walkthrough` | All scenario preflight and procedure steps completed through normal controls in an identified app. |
| `save-reopen` | Completed save and reopen actions in a native run, including the saved values and appearance. |
| `rendered-page` | Documentation presentation, such as labels, annotations, responsive layout, and image access. |
| `packaged-help` | The installed manual opened and exercised from an identified package. |

Results are `passed`, `pending`, or `not-assessed`. Pending and unassessed
checks appear as warnings and do not fail the pilot. Invalid references,
missing evidence, hash mismatches, and malformed records fail validation.
No aggregate result means that a feature or the whole manual is verified.

For passed walkthrough and save/reopen checks, evidence must include a
structured native run with the required completed actions. Target the
scenario explicitly and only the pages, patches, and images it covers.
Split checks when another guide or patch needs its own scenario. Loading a saved
setup through startup is valid observation evidence, but cannot satisfy
those checks. The validator checks the record's consistency; reviewers
remain responsible for the truth of its observations.

## Capture validation

For images both mapped and used by the mapped pages, the validator finds
the matching capture manifest, checks original and published hashes and
dimensions, and reproduces the crop in memory. It checks recorded setup
patch hashes where supplied. Existing manifests without an app commit
retain their original identity and limitations; missing historical fields
are not filled with invented evidence.

Preserved unused derivatives and assets outside the pilot do not become
current-verification failures. They remain available for later inventory.
Mapped downloadable patches and all referenced evidence are also bound by
the ledger's hashes.

Run the authoring check on its own with:

```sh
npm run check:authoring
```

The command distinguishes invalid or stale records from pending checks and
unmapped coverage. A successful exit establishes record integrity only.
Detecting relevant changes in the app and enforcing release readiness
belong to the separate app-side implementation.
