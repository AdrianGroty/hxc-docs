import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { checkAuthoring } from './check-authoring.mjs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const APP = 'a'.repeat(40);
const P = {
  page: 'src/content/docs/guides/example.md', image: 'public/images/example/panel.png', patch: 'public/examples/start.hxc',
  scenario: 'authoring/scenarios/example.json', evidence: 'authoring/reviews/example.md',
  run: 'authoring/verification/example.json', original: 'authoring/captures/2026-01-01/originals/panel.png',
  setup: 'authoring/captures/2026-01-01/setup/panel.hxc', manifest: 'authoring/captures/2026-01-01/manifest.json',
};

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'hxc-authoring-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  async function put(name, contents) {
    await mkdir(path.dirname(path.join(root, name)), { recursive: true });
    await writeFile(path.join(root, name), contents);
  }
  const json = (name, value) => put(name, JSON.stringify(value, null, 2) + '\n');
  const original = await sharp({ create: { width: 12, height: 10, channels: 3, background: '#123456' } }).png().toBuffer();
  const crop = { left: 2, top: 2, width: 8, height: 6 };
  const derivative = await sharp(original).extract(crop).png({ compressionLevel: 9, adaptiveFiltering: false }).toBuffer();
  const scenario = { schemaVersion: 1, id: 'example', page: P.page, startingPatch: P.patch, finishedPatch: P.patch,
    preflight: [{ id: 'focus-window', action: 'Focus the test window.', expected: 'Window receives input.' }],
    steps: [{ id: 'open-start', action: 'Open the example.', expected: 'Example shown.' },
      { id: 'save-copy', action: 'Save a copy.', expected: 'Write completed.' },
      { id: 'reopen-copy', action: 'Reopen the copy.', expected: 'Values retained.' }] };
  const map = { schemaVersion: 1, scope: 'pilot', features: [{ id: 'feedback.loop', description: 'Feedback controls and trail.',
    pages: [P.page], images: [P.image], patches: [P.patch], scenarios: [P.scenario] }] };
  const ledger = { schemaVersion: 1, records: [{ featureId: 'feedback.loop', reviewedAppCommit: APP, inputs: {}, checks: [
    { kind: 'source-review', status: 'passed', targets: [P.page], evidence: [P.evidence], reason: 'Compared source behavior.' },
    { kind: 'walkthrough', status: 'pending', targets: [P.scenario], evidence: [], reason: 'Native input not tested.' },
  ] }] };
  const manifest = { schemaVersion: 1, captureDate: '2026-01-01', baseline: { version: '1.0.0', executableSha256: 'b'.repeat(64),
    platform: 'macOS', distribution: 'Published release' }, images: [{ id: 'example', page: P.page,
    source: P.original, published: P.image, sourceSha256: sha(original), publishedSha256: sha(derivative),
    sourceDimensions: { width: 12, height: 10 }, publishedDimensions: { width: 8, height: 6 }, crop, resize: null,
    patch: P.setup, patchSha256: sha('capture setup') }] };
  await put(P.page, '---\ntitle: Example\ndescription: A specific task.\n---\n\n![Panel][controls]\n\n[controls]: ../../images/example/panel.png\n');
  await put('src/content/docs/guides/unmapped.md', 'Unmapped content, no verification claimed.');
  await put(P.patch, '{"name":"start"}');
  await put(P.setup, 'capture setup');
  await put(P.original, original); await put(P.image, derivative);
  await put(P.evidence, 'Source inspection only. No live procedure claimed.');
  await json(P.scenario, scenario);
  async function refresh() {
    for (const name of [P.page, P.image, P.patch, P.scenario, P.evidence]) ledger.records[0].inputs[name] = sha(await readFile(path.join(root, name)));
    await json('authoring/feature-map.json', map);
    await json('authoring/verification.json', ledger);
    await json(P.manifest, manifest);
  }
  await refresh();
  async function nativeRun({ method = 'normal-controls', pending = false } = {}) {
    const run = { schemaVersion: 1, kind: 'native-walkthrough', method, scenario: P.scenario,
      app: pending ? { commit: null, version: null, executableSha256: null, platform: null, distribution: null }
        : { commit: APP, version: '1.0.0', executableSha256: 'c'.repeat(64), platform: 'macOS', distribution: 'development' },
      preflight: scenario.preflight.map(s => ({ id: s.id, status: pending ? 'pending' : 'passed', observation: pending ? '' : 'Window focused.' })),
      steps: scenario.steps.map(s => ({ id: s.id, status: pending ? 'pending' : 'passed', observation: pending ? '' : 'Observed result.', evidence: pending ? [] : [P.evidence] })) };
    await json(P.run, run);
    ledger.records[0].inputs[P.run] = sha(await readFile(path.join(root, P.run)));
    const check = ledger.records[0].checks[1];
    check.status = pending ? 'pending' : 'passed'; check.evidence = [P.run];
    await refresh();
    return run;
  }
  return { root, map, ledger, manifest, scenario, put, json, refresh, nativeRun, check: () => checkAuthoring({ root }) };
}

test('legacy release provenance and CommonMark references pass with honest partial pilot coverage', async t => {
  const f = await fixture(t);
  // This unused historical session is preserved, not silently migrated or expired.
  await f.json('authoring/captures/old/manifest.json', { schemaVersion: 1, images: [{ published: 'public/images/unused.png' }] });
  const report = await f.check();
  assert.deepEqual(report.errors, []);
  assert.equal(report.coverage.features, 1);
  assert.equal(report.coverage.pages, 2);
  assert.equal(report.coverage.mappedPages, 1);
  assert.deepEqual(report.coverage.unmappedPages, ['src/content/docs/guides/unmapped.md']);
  assert.equal(report.coverage.mappedActiveImages, 1);
  assert.equal(report.coverage.pendingChecks, 1);
  assert.equal(report.accuracy, 'not-established-by-automated-validation');
  assert.ok(report.warnings.some(w => /Pilot coverage only/.test(w)));
  assert.equal(f.manifest.baseline.appCommit, undefined);
});

test('mutating captured pixels, setup, content, scenario, or evidence invalidates prior verification', async t => {
  for (const [label, name, expected] of [['original', P.original, /original hash mismatch/], ['derivative', P.image, /hash.*(stale|mismatch)/],
    ['setup', P.setup, /setup patch hash mismatch/], ['page', P.page, /reviewed input hash is stale/],
    ['scenario', P.scenario, /reviewed input hash is stale/], ['evidence', P.evidence, /reviewed input hash is stale/]]) {
    await t.test(label, async t => {
      const f = await fixture(t);
      await f.put(name, label === 'scenario' ? JSON.stringify({ ...f.scenario, id: 'modified' }) : 'changed bytes');
      assert.ok((await f.check()).errors.some(error => expected.test(error)), `${label} must invalidate evidence`);
    });
  }
});

test('an active mapped image needs exactly one capture record', async t => {
  const f = await fixture(t);
  f.manifest.images = [];
  await f.refresh();
  assert.ok((await f.check()).errors.some(e => /expected one capture provenance entry, found 0/.test(e)));
  const g = await fixture(t);
  await g.json('authoring/captures/duplicate/manifest.json', g.manifest);
  assert.ok((await g.check()).errors.some(e => /expected one capture provenance entry, found 2/.test(e)));
});

test('duplicate features, dangling references and unknown check targets are errors', async t => {
  const f = await fixture(t);
  f.map.features.push({ ...f.map.features[0] });
  f.map.features[0].pages.push('src/content/docs/guides/missing.md');
  f.ledger.records[0].checks[0].targets = ['src/content/docs/guides/unmapped.md'];
  await f.refresh();
  const errors = (await f.check()).errors.join('\n');
  assert.match(errors, /Duplicate feature id/);
  assert.match(errors, /missing.md/);
  assert.match(errors, /invalid or unmapped targets/);
});

test('passed native observation has narrow targets and does not imply a completed guide', async t => {
  const f = await fixture(t);
  f.ledger.records[0].checks.push({ kind: 'native-observation', status: 'passed', targets: [P.image], evidence: [P.evidence], reason: 'Loaded panel values observed only.' });
  await f.refresh();
  const result = await f.check();
  assert.deepEqual(result.errors, []);
  assert.equal(result.coverage.pendingChecks, 1);
  assert.equal(result.accuracy, 'not-established-by-automated-validation');
});

test('pending native template is checked structurally without requiring an invented app identity', async t => {
  const f = await fixture(t);
  const run = await f.nativeRun({ pending: true });
  assert.deepEqual((await f.check()).errors, []);
  run.steps[0].id = 'unknown-step';
  await f.json(P.run, run);
  f.ledger.records[0].inputs[P.run] = sha(await readFile(path.join(f.root, P.run)));
  await f.refresh();
  assert.ok((await f.check()).errors.some(e => /invalid native steps step/.test(e)));
});

test('walkthrough requires normal controls and every prescribed action, not a seeded capture', async t => {
  const f = await fixture(t);
  await f.nativeRun({ method: 'startup-loaded' });
  assert.ok((await f.check()).errors.some(e => /normal-controls/.test(e)));
  const g = await fixture(t);
  const run = await g.nativeRun();
  assert.deepEqual((await g.check()).errors, []);
  run.steps[0].status = 'pending'; run.steps[0].observation = '';
  await g.json(P.run, run);
  g.ledger.records[0].inputs[P.run] = sha(await readFile(path.join(g.root, P.run)));
  await g.refresh();
  assert.ok((await g.check()).errors.some(e => /native step open-start did not pass/.test(e)));
});

test('source-review Markdown cannot stand in for a live walkthrough or save/reopen run', async t => {
  const f = await fixture(t);
  f.ledger.records[0].checks[1].status = 'passed';
  f.ledger.records[0].checks[1].evidence = [P.evidence];
  await f.refresh();
  assert.ok((await f.check()).errors.some(e => /needs one native run/.test(e)));
  const g = await fixture(t);
  const run = await g.nativeRun();
  g.ledger.records[0].checks[1].kind = 'save-reopen';
  run.steps.find(s => s.id === 'reopen-copy').status = 'pending';
  await g.json(P.run, run);
  g.ledger.records[0].inputs[P.run] = sha(await readFile(path.join(g.root, P.run)));
  await g.refresh();
  assert.ok((await g.check()).errors.some(e => /native step reopen-copy did not pass/.test(e)));
});

test('supplied example and renderer-source hashes are validated without treating output as UI proof', async t => {
  const f = await fixture(t);
  f.manifest.examples = [{ path: P.patch, sha256: sha(await readFile(path.join(f.root, P.patch))) }];
  f.manifest.nativeExport = { sourceRecord: P.evidence, sourceRecordSha256: sha(await readFile(path.join(f.root, P.evidence))) };
  await f.refresh();
  assert.deepEqual((await f.check()).errors, []);
  f.manifest.examples[0].sha256 = 'f'.repeat(64);
  await f.refresh();
  assert.ok((await f.check()).errors.some(e => /example patch hash mismatch/.test(e)));
  f.manifest.examples[0].sha256 = sha(await readFile(path.join(f.root, P.patch)));
  f.manifest.nativeExport.sourceRecordSha256 = 'f'.repeat(64);
  await f.refresh();
  assert.ok((await f.check()).errors.some(e => /sourceRecord hash mismatch/.test(e)));
});

test('unsafe paths and symlink escapes cannot supply reviewed evidence', async t => {
  const f = await fixture(t);
  const outside = await mkdtemp(path.join(tmpdir(), 'hxc-authoring-outside-'));
  t.after(() => rm(outside, { recursive: true, force: true }));
  await writeFile(path.join(outside, 'evidence.md'), 'outside');
  await rm(path.join(f.root, P.evidence));
  await symlink(path.join(outside, 'evidence.md'), path.join(f.root, P.evidence));
  f.ledger.records[0].inputs[P.evidence] = sha('outside');
  f.ledger.records[0].inputs['../outside'] = 'f'.repeat(64);
  await f.json('authoring/verification.json', f.ledger);
  const errors = (await f.check()).errors.join('\n');
  assert.match(errors, /Path leaves repository/);
  assert.match(errors, /Unsafe repository path/);
});

test('annotated image verification is bound to the actual marker registry', async t => {
  const f = await fixture(t);
  const registryPath = 'authoring/image-annotations.json';
  const registry = { schemaVersion: 1, images: [{ id: 'example-controls', source: 'images/example/panel.png', targets: [{ x: 1, y: 1 }] }] };
  await f.json(registryPath, registry);
  assert.ok((await f.check()).errors.some(e => /annotated images require reviewed input/.test(e)));
  f.ledger.records[0].inputs[registryPath] = sha(await readFile(path.join(f.root, registryPath)));
  await f.refresh();
  assert.deepEqual((await f.check()).errors, []);
  registry.images[0].targets[0].x = 2;
  await f.json(registryPath, registry);
  assert.ok((await f.check()).errors.some(e => /image-annotations.json.*reviewed input hash is stale/.test(e)));
});

test('a passed procedure must target its scenario and cannot reuse an unknown or malformed scenario', async t => {
  const f = await fixture(t);
  await f.nativeRun();
  f.ledger.records[0].checks[1].targets = [P.image];
  await f.refresh();
  assert.ok((await f.check()).errors.some(e => /passed check must target a mapped scenario/.test(e)));
  const g = await fixture(t);
  await g.nativeRun();
  g.scenario.steps = [null];
  await g.json(P.scenario, g.scenario);
  await g.refresh();
  assert.ok((await g.check()).errors.some(e => /malformed or duplicate scenario step/.test(e)));
});

test('a public derivative cannot be passed off as its preserved original', async t => {
  const f = await fixture(t);
  f.manifest.images[0].source = P.image;
  await f.refresh();
  assert.ok((await f.check()).errors.some(e => /original capture must be outside public/.test(e)));
});

test('native proof cannot cover another mapped guide or patch outside its scenario', async t => {
  const f = await fixture(t);
  const otherPage = 'src/content/docs/guides/other.md', otherPatch = 'public/examples/other.hxc';
  await f.put(otherPage, 'Another guide.'); await f.put(otherPatch, '{}');
  f.map.features[0].pages.push(otherPage); f.map.features[0].patches.push(otherPatch);
  for (const name of [otherPage, otherPatch]) f.ledger.records[0].inputs[name] = sha(await readFile(path.join(f.root, name)));
  await f.nativeRun();
  f.ledger.records[0].checks[1].targets = [P.scenario, otherPage, otherPatch];
  await f.refresh();
  const errors = (await f.check()).errors.join('\n');
  assert.match(errors, /native target not covered.*other.md/);
  assert.match(errors, /native target not covered.*other.hxc/);
});

test('native actions retain scenario order and declared platform must match actual evidence', async t => {
  const f = await fixture(t);
  const run = await f.nativeRun();
  run.steps.reverse();
  await f.json(P.run, run);
  f.ledger.records[0].inputs[P.run] = sha(await readFile(path.join(f.root, P.run)));
  f.ledger.records[0].checks[1].platform = 'Windows';
  await f.refresh();
  const errors = (await f.check()).errors.join('\n');
  assert.match(errors, /native steps IDs must follow scenario order/);
  assert.match(errors, /platform does not match native run/);
});

test('malformed native steps are diagnosed without throwing and failure needs an observation', async t => {
  const f = await fixture(t);
  const run = await f.nativeRun({ pending: true });
  run.steps[0] = null;
  run.steps[1].status = 'failed';
  await f.json(P.run, run);
  f.ledger.records[0].inputs[P.run] = sha(await readFile(path.join(f.root, P.run)));
  await f.refresh();
  assert.ok((await f.check()).errors.some(e => /invalid native steps step/.test(e)));
});

test('commit and hash fields require strings, and original symlinks cannot resolve to public pixels', async t => {
  const f = await fixture(t);
  f.ledger.records[0].reviewedAppCommit = [APP];
  f.ledger.records[0].inputs[P.page] = [f.ledger.records[0].inputs[P.page]];
  await f.refresh();
  f.ledger.records[0].inputs[P.page] = ['f'.repeat(64)];
  await f.json('authoring/verification.json', f.ledger);
  const errors = (await f.check()).errors.join('\n');
  assert.match(errors, /invalid reviewedAppCommit/);
  assert.match(errors, /invalid SHA-256/);
  const g = await fixture(t);
  await rm(path.join(g.root, P.original));
  await symlink(path.join(g.root, P.image), path.join(g.root, P.original));
  assert.ok((await g.check()).errors.some(e => /original capture must resolve outside public/.test(e)));
});

test('pilot features need pages and different scenario files cannot reuse an id', async t => {
  const f = await fixture(t);
  const otherScenario = 'authoring/scenarios/duplicate.json';
  await f.json(otherScenario, f.scenario);
  f.map.features[0].scenarios.push(otherScenario);
  f.ledger.records[0].inputs[otherScenario] = sha(await readFile(path.join(f.root, otherScenario)));
  await f.refresh();
  assert.ok((await f.check()).errors.some(e => /Duplicate scenario id/.test(e)));
  const g = await fixture(t);
  g.map.features[0].pages = [];
  await g.refresh();
  assert.ok((await g.check()).errors.some(e => /feature needs at least one page/.test(e)));
});

test('falsy JSON cannot bypass map, ledger, scenario or native-record validation', async t => {
  for (const file of ['authoring/feature-map.json', 'authoring/verification.json']) {
    for (const value of [null, false, 0, '']) {
      const f = await fixture(t);
      await f.json(file, value);
      assert.ok((await f.check()).errors.some(e => /must be JSON objects/.test(e)), `${file} must reject ${JSON.stringify(value)}`);
    }
  }
  const f = await fixture(t);
  await f.json(P.scenario, null); await f.refresh();
  assert.ok((await f.check()).errors.some(e => /scenario must be a JSON object/.test(e)));
  const g = await fixture(t);
  await g.nativeRun({ pending: true });
  await g.json(P.run, null);
  g.ledger.records[0].inputs[P.run] = sha(await readFile(path.join(g.root, P.run)));
  await g.refresh();
  assert.ok((await g.check()).errors.some(e => /expected a native-walkthrough JSON record/.test(e)));
});

test('new media on a mapped page cannot evade provenance by being left out of the feature map', async t => {
  const f = await fixture(t);
  await f.put('public/images/example/new.png', await readFile(path.join(f.root, P.image)));
  await f.put('public/examples/new.hxc', '{}');
  const body = await readFile(path.join(f.root, P.page), 'utf8');
  await f.put(P.page, body + '\n![New control](../../images/example/new.png)\n\n[Download][new-patch]\n\n[new-patch]: ../../examples/new.hxc\n');
  await f.refresh();
  const errors = (await f.check()).errors.join('\n');
  assert.match(errors, /image used by a mapped page needs a feature mapping: public\/images\/example\/new.png/);
  assert.match(errors, /patch used by a mapped page needs a feature mapping: public\/examples\/new.hxc/);
});
