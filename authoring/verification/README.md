# Native walkthrough records

The [FEEDBACK scenario](../scenarios/feedback-trails.json) records the actions
and checkpoints for the [feedback guide](../../src/content/docs/guides/feedback-trails.md).
The [pending record](feedback-trails.pending.json) is an uncompleted template.
Its empty observations and app identity make no claim of a successful run.

Copy the template to a new dated record before testing. Preserve earlier
records and use an isolated profile and disposable patch copies. Record the
actual app commit, version, executable SHA-256, platform, and whether the
build is development, a release candidate, or a published release. Keep
private absolute paths out of committed observations.

Use `development`, `release-candidate`, or `release` for
`app.distribution`. A passed native check needs the complete app identity;
the null fields in the pending template are not valid evidence of a pass.

## Run the scenario

1. Complete the native-tool preflight in at most five minutes. Confirm
   window focus, a section interaction, numeric entry, and file-chooser
   cancellation against the observed app. If reliable input is unavailable,
   record the blocker and leave the walkthrough pending. A person can perform
   a separate native walkthrough; source inspection cannot complete it.
2. Start again from a copy of the supplied starting patch. Perform the
   scenario through the app's normal controls in the listed order. Do not
   load the finished patch or seed the final settings to bypass a step.
3. Record each observed outcome after the action completes. Preserve the
   step IDs and leave unperformed steps pending. Mark a step passed only
   when its expected outcome was observed; explain failures or blockers
   instead of copying the expected result into an observation.
4. For `save-copy`, wait for a completed write and check the saved file.
   For `reopen-copy`, actually open that saved copy and inspect its controls
   and result. A selected destination, successful dialog, or in-memory
   settings do not establish either outcome.
5. Reference preserved evidence files in the record. For UI images, follow
   [AUTHORING.md](../../AUTHORING.md): preserve untouched originals in a
   dated capture directory, identify the tested build and setup, and create
   crops through the capture manifest. Check published annotations at
   desktop and narrow widths and open the clean full-size image.

Evidence paths are relative to this repository. When promoting a check in
`authoring/verification.json`, include hashes for the native record and its
referenced evidence in that ledger's reviewed inputs. Retain failed or
incomplete runs so a later successful run does not erase their limitations.

Run `npm run check` to validate the documentation and record structure.
Run `npm run test:editor` when changing a published image or formatting.
These checks do not perform the native walkthrough or verify the truth of
an observation.

## Keep evidence types separate

- Source review establishes what the inspected code supports.
- Automated behavior tests establish the behavior exercised by those tests.
- A loaded-state UI capture establishes the visible controls and values.
  Loading a prepared startup patch is suitable for that capture, but does
  not prove numeric entry, the guide sequence, or save and reopen.
- A native walkthrough establishes the actions and outcomes actually
  completed in the identified app on the recorded platform.
- Packaged verification separately checks the delivered artifact, its
  matching manual, and the app's Help interaction.

Candidate verification can use an identified release-candidate executable.
Do not relabel it as a published-release check before publication. If
packaging or signing changes the executable identity, retain the earlier
record and perform the required acceptance checks against the final
artifact. Attach final artifact evidence without changing frozen manual
content or rebuilding packages merely to update the verification record.

No new native runner or app test hook is introduced by this scenario.
Browser tests cover the documentation site; they do not operate the native
GLFW/ImGui app. A schema-valid pending record is not release-readiness
approval.
