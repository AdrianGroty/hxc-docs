import { createHash } from 'node:crypto';
import { readFile, readdir, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { parseBody, sourceRoute } from '../src/lib/suggestions/document.mjs';

const SHA = /^[a-f0-9]{64}$/;
const COMMIT = /^[a-f0-9]{40}$/;
const isSha = value => typeof value === 'string' && SHA.test(value);
const isCommit = value => typeof value === 'string' && COMMIT.test(value);
const KINDS = new Set(['source-review', 'native-observation', 'walkthrough', 'save-reopen', 'rendered-page', 'packaged-help']);
const STATES = new Set(['passed', 'pending', 'not-assessed']);
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const safe = value => nonempty(value) && !path.posix.isAbsolute(value) && !/[\\\u0000-\u001f\u007f]/.test(value)
  && value.split('/').every(part => part !== '' && part !== '.' && part !== '..');

// This validates evidence integrity and declared coverage. It cannot establish
// that an app matches a page, or that an operator performed a claimed action.
export async function checkAuthoring({ root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..') } = {}) {
  const errors = [], warnings = [];
  root = await realpath(root);
  async function file(name) {
    if (!safe(name)) throw new Error(`Unsafe repository path: ${String(name)}`);
    const resolved = await realpath(path.join(root, name));
    if (!resolved.startsWith(root + path.sep)) throw new Error(`Path leaves repository: ${name}`);
    if (!(await stat(resolved)).isFile()) throw new Error(`Not a file: ${name}`);
    return readFile(resolved);
  }
  async function json(name) { return JSON.parse((await file(name)).toString('utf8')); }
  async function guarded(label, action) {
    try { return await action(); } catch (error) { errors.push(`${label}: ${error.message}`); return undefined; }
  }
  async function walk(name) {
    const resolved = await realpath(path.join(root, name));
    if (!resolved.startsWith(root + path.sep)) throw new Error(`Path leaves repository: ${name}`);
    const files = [];
    for (const entry of await readdir(resolved, { withFileTypes: true })) {
      const child = `${name}/${entry.name}`;
      if (entry.isDirectory()) files.push(...await walk(child));
      else if (entry.isFile() || entry.isSymbolicLink()) files.push(child);
    }
    return files;
  }
  const map = await guarded('Feature map', () => json('authoring/feature-map.json'));
  const ledger = await guarded('Verification ledger', () => json('authoring/verification.json'));
  const coverage = { scope: 'pilot', features: 0, pages: 0, mappedPages: 0, activeImages: 0, mappedActiveImages: 0,
    unmappedPages: [], unmappedImages: [], pendingChecks: 0 };
  const result = () => ({ errors, warnings, coverage, accuracy: 'not-established-by-automated-validation' });
  if (map === undefined || ledger === undefined) return result();
  if (!object(map) || !object(ledger)) { errors.push('Feature map and verification ledger must be JSON objects'); return result(); }
  if (map.schemaVersion !== 1 || map.scope !== 'pilot' || !Array.isArray(map.features) || !map.features.length) errors.push('Feature map: expected schemaVersion 1, scope pilot, and nonempty features array');
  if (ledger.schemaVersion !== 1 || !Array.isArray(ledger.records)) errors.push('Verification ledger: expected schemaVersion 1 and records array');
  if (errors.length) return result();
  const features = new Map(), mappedPages = new Set(), mappedImages = new Set();
  const scenarios = new Map(), scenarioIds = new Map();
  for (const feature of map.features) {
    if (!object(feature) || !/^[a-z][a-z0-9.-]*$/.test(feature.id || '') || !nonempty(feature.description)) {
      errors.push('Feature map: every feature needs a stable id and description'); continue;
    }
    if (features.has(feature.id)) errors.push(`Duplicate feature id: ${feature.id}`);
    features.set(feature.id, feature);
    for (const [field, prefix, extension] of [['pages', 'src/content/docs/', '.md'], ['images', 'public/images/', ''],
      ['patches', 'public/examples/', '.hxc'], ['scenarios', 'authoring/scenarios/', '.json']]) {
      if (!Array.isArray(feature[field]) || feature[field].some(p => !safe(p) || !p.startsWith(prefix) || !p.endsWith(extension))) {
        errors.push(`${feature.id}: invalid ${field} paths`); feature[field] = []; continue;
      }
      if (new Set(feature[field]).size !== feature[field].length) errors.push(`${feature.id}: duplicate ${field} paths`);
      for (const name of feature[field]) await guarded(`${feature.id} ${name}`, () => file(name));
    }
    feature.pages.forEach(p => mappedPages.add(p));
    if (!feature.pages.length) errors.push(`${feature.id}: feature needs at least one page`);
    feature.images.forEach(p => mappedImages.add(p));
    for (const name of feature.scenarios) {
      const scenario = await guarded(name, () => json(name));
      if (scenario === undefined) continue;
      if (!object(scenario)) { errors.push(`${name}: scenario must be a JSON object`); continue; }
      if (scenario.schemaVersion !== 1 || !/^[a-z][a-z0-9.-]*$/.test(typeof scenario.id === 'string' ? scenario.id : '') || !feature.pages.includes(scenario.page)
        || !feature.patches.includes(scenario.startingPatch) || !feature.patches.includes(scenario.finishedPatch)) {
        errors.push(`${name}: invalid scenario identity or unmapped page/patch`); continue;
      }
      if (scenarioIds.has(scenario.id) && scenarioIds.get(scenario.id) !== name) errors.push(`Duplicate scenario id: ${scenario.id}`);
      scenarioIds.set(scenario.id, name);
      const ids = new Set();
      let validSteps = true;
      for (const field of ['preflight', 'steps']) {
        if (!Array.isArray(scenario[field]) || !scenario[field].length) { errors.push(`${name}: missing ${field}`); validSteps = false; continue; }
        for (const step of scenario[field]) {
          if (!object(step) || !nonempty(step.id) || !nonempty(step.action) || !nonempty(step.expected) || ids.has(step.id)) {
            errors.push(`${name}: malformed or duplicate scenario step`);
            validSteps = false;
          } else ids.add(step.id);
        }
      }
      if (validSteps) scenarios.set(name, scenario);
    }
  }
  const pages = await guarded('Authored pages', async () => (await walk('src/content/docs')).filter(p => p.endsWith('.md'))) || [];
  coverage.features = features.size;
  const activeImages = new Set(), imageUses = new Map(), patchUses = new Map();
  for (const page of pages) {
    await guarded(page, async () => {
      const nodes = [], definitions = new Map();
      function visit(node) {
        if (node.type === 'definition' && !definitions.has(node.identifier.toLowerCase())) definitions.set(node.identifier.toLowerCase(), node.url);
        if (['image', 'imageReference', 'link', 'linkReference'].includes(node.type)) nodes.push(node);
        node.children?.forEach(visit);
      }
      visit(parseBody((await file(page)).toString('utf8')));
      for (const node of nodes) {
        const url = ['imageReference', 'linkReference'].includes(node.type) ? definitions.get(node.identifier.toLowerCase()) : node.url;
        if (!url || /^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//')) continue;
        const target = decodeURIComponent(url.split(/[?#]/)[0]);
        const isImage = ['image', 'imageReference'].includes(node.type);
        if (!isImage && !/\.hxc$/i.test(target)) continue;
        const name = path.posix.normalize(path.posix.join('public', sourceRoute(page), target));
        if (isImage && safe(name) && name.startsWith('public/images/')) {
          activeImages.add(name);
          if (!imageUses.has(name)) imageUses.set(name, new Set());
          imageUses.get(name).add(page);
        } else if (!isImage && safe(name) && name.startsWith('public/examples/')) {
          if (!patchUses.has(name)) patchUses.set(name, new Set());
          patchUses.get(name).add(page);
        }
      }
    });
  }
  coverage.pages = pages.length;
  coverage.mappedPages = pages.filter(p => mappedPages.has(p)).length;
  coverage.activeImages = activeImages.size;
  coverage.mappedActiveImages = [...activeImages].filter(p => mappedImages.has(p)).length;
  coverage.unmappedPages = pages.filter(p => !mappedPages.has(p)).sort();
  coverage.unmappedImages = [...activeImages].filter(p => !mappedImages.has(p)).sort();
  warnings.push(`Pilot coverage only: ${coverage.mappedPages}/${coverage.pages} pages and ${coverage.mappedActiveImages}/${coverage.activeImages} active images mapped; product accuracy is not established by this check.`);
  for (const feature of features.values()) for (const name of feature.images) {
    if (!feature.pages.some(page => imageUses.get(name)?.has(page))) errors.push(`${feature.id}: mapped image not used by a mapped page: ${name}`);
  }
  for (const [kind, uses, field] of [['image', imageUses, 'images'], ['patch', patchUses, 'patches']]) {
    for (const [name, usedPages] of uses) for (const page of usedPages) {
      if (mappedPages.has(page) && ![...features.values()].some(feature => feature.pages.includes(page) && feature[field].includes(name))) {
        errors.push(`${page}: ${kind} used by a mapped page needs a feature mapping: ${name}`);
      }
    }
  }
  let annotatedImages = new Set();
  try {
    const registry = await json('authoring/image-annotations.json');
    if (!Array.isArray(registry.images)) errors.push('Image annotation registry: missing images array');
    else annotatedImages = new Set(registry.images.filter(entry => object(entry) && nonempty(entry.source)).map(entry => `public/${entry.source}`));
  } catch (error) {
    if (error.code !== 'ENOENT') errors.push(`Image annotation registry: ${error.message}`);
  }

  const records = new Set();
  for (const record of ledger.records) {
    if (!object(record) || !features.has(record.featureId)) { errors.push('Verification ledger: unknown featureId'); continue; }
    const label = record.featureId, feature = features.get(label);
    if (records.has(label)) errors.push(`Duplicate verification record: ${label}`);
    records.add(label);
    if (!isCommit(record.reviewedAppCommit)) errors.push(`${label}: invalid reviewedAppCommit`);
    if (!object(record.inputs)) { errors.push(`${label}: missing input hashes`); continue; }
    for (const name of [...feature.pages, ...feature.images, ...feature.patches, ...feature.scenarios]) {
      if (!Object.hasOwn(record.inputs, name)) errors.push(`${label}: missing reviewed input ${name}`);
    }
    if (feature.images.some(name => annotatedImages.has(name)) && !Object.hasOwn(record.inputs, 'authoring/image-annotations.json')) {
      errors.push(`${label}: annotated images require reviewed input authoring/image-annotations.json`);
    }
    for (const [name, expected] of Object.entries(record.inputs)) {
      await guarded(`${label} input ${name}`, async () => {
        if (!isSha(expected)) throw new Error('invalid SHA-256');
        if (digest(await file(name)) !== expected) throw new Error('reviewed input hash is stale');
      });
    }
    async function evidence(names, evidenceLabel) {
      if (!Array.isArray(names) || !names.length) { errors.push(`${evidenceLabel}: missing evidence`); return []; }
      const valid = [];
      for (const name of names) {
        if (!Object.hasOwn(record.inputs, name)) errors.push(`${evidenceLabel}: evidence must have an input hash: ${name}`);
        if (await guarded(evidenceLabel, () => file(name))) valid.push(name);
      }
      return valid;
    }
    const nativeRuns = new Map();
    async function inspectNative(name, requireNative = false) {
      if (!name.endsWith('.json') || nativeRuns.has(name)) return;
      const run = await guarded(name, () => json(name));
      if (run?.kind !== 'native-walkthrough') {
        if (requireNative) errors.push(`${name}: expected a native-walkthrough JSON record`);
        return;
      }
      nativeRuns.set(name, run);
      const scenario = scenarios.get(run.scenario);
      if (run.schemaVersion !== 1 || !['normal-controls', 'startup-loaded'].includes(run.method)
        || !feature.scenarios.includes(run.scenario) || !scenario || !object(run.app)) {
        errors.push(`${name}: invalid native run structure or unmapped scenario`); return;
      }
      let hasPassed = false;
      for (const field of ['preflight', 'steps']) {
        if (!Array.isArray(run[field])) { errors.push(`${name}: missing native ${field}`); continue; }
        const expected = new Set((scenario[field] || []).map(step => step.id)), seen = new Set();
        for (const step of run[field]) {
          if (!object(step) || !expected.has(step.id) || seen.has(step.id) || ![...STATES, 'failed'].includes(step.status)
            || typeof step.observation !== 'string' || (['passed', 'failed'].includes(step.status) && !nonempty(step.observation))) {
            errors.push(`${name}: invalid native ${field} step`); continue;
          }
          seen.add(step.id);
          if (step.status === 'passed') hasPassed = true;
          if (field === 'steps') {
            if (!Array.isArray(step.evidence)) errors.push(`${name}: native step evidence must be an array`);
            else if (step.evidence.length || step.status === 'passed') await evidence(step.evidence, `${name} ${step.id}`);
          }
        }
        if ([...expected].some(id => !seen.has(id))) errors.push(`${name}: missing native ${field} step IDs`);
        const ordered = (scenario[field] || []).map(step => step.id);
        if (JSON.stringify(run[field].map(step => step?.id)) !== JSON.stringify(ordered)) errors.push(`${name}: native ${field} IDs must follow scenario order`);
      }
      const emptyIdentity = ['commit', 'version', 'executableSha256', 'platform', 'distribution'].every(field => run.app[field] === null);
      const validIdentity = run.app.commit === record.reviewedAppCommit && isCommit(run.app.commit)
        && isSha(run.app.executableSha256) && nonempty(run.app.version) && nonempty(run.app.platform)
        && ['development', 'release-candidate', 'release'].includes(run.app.distribution);
      if (!validIdentity && (hasPassed || !emptyIdentity)) errors.push(`${name}: invalid native app identity; null identity allowed only before any step passes`);
    }
    if (!Array.isArray(record.checks) || !record.checks.length) { errors.push(`${label}: missing checks`); continue; }
    const checkKinds = new Set();
    for (const check of record.checks) {
      if (!object(check) || !KINDS.has(check.kind) || !STATES.has(check.status) || !nonempty(check.reason)) {
        errors.push(`${label}: malformed verification check`); continue;
      }
      if (check.platform !== undefined && !nonempty(check.platform)) errors.push(`${label} ${check.kind}: invalid platform`);
      const allowedTargets = new Set([...feature.pages, ...feature.images, ...feature.patches, ...feature.scenarios]);
      if (!Array.isArray(check.targets) || !check.targets.length || check.targets.some(p => !allowedTargets.has(p))
        || new Set(check.targets).size !== check.targets.length) errors.push(`${label} ${check.kind}: invalid or unmapped targets`);
      const checkKey = `${check.kind}:${[...(Array.isArray(check.targets) ? check.targets : [])].sort().join(',')}:${check.platform || ''}`;
      if (checkKinds.has(checkKey)) errors.push(`${label}: duplicate check scope ${check.kind}`);
      checkKinds.add(checkKey);
      if (!Array.isArray(check.evidence)) { errors.push(`${label} ${check.kind}: evidence must be an array`); continue; }
      if (check.status !== 'passed') {
        coverage.pendingChecks++;
        warnings.push(`${label} ${check.kind}: ${check.status}: ${check.reason}`);
        if (check.evidence.length) for (const name of await evidence(check.evidence, `${label} ${check.kind}`)) await inspectNative(name, ['walkthrough', 'save-reopen'].includes(check.kind));
        continue;
      }
      const paths = await evidence(check.evidence, `${label} ${check.kind}`);
      for (const name of paths) await inspectNative(name, ['walkthrough', 'save-reopen'].includes(check.kind));
      if (!['walkthrough', 'save-reopen'].includes(check.kind)) continue;
      const runs = [];
      for (const name of paths.filter(p => p.endsWith('.json'))) {
        const run = nativeRuns.get(name);
        if (run?.kind === 'native-walkthrough') runs.push(run);
      }
      const targetedScenarios = feature.scenarios.filter(name => Array.isArray(check.targets) && check.targets.includes(name));
      if (!targetedScenarios.length) errors.push(`${label} ${check.kind}: passed check must target a mapped scenario`);
      const nativeTargets = new Set(targetedScenarios);
      for (const name of targetedScenarios) {
        const scenario = scenarios.get(name);
        if (!scenario) continue;
        [scenario.page, scenario.startingPatch, scenario.finishedPatch].forEach(target => nativeTargets.add(target));
        for (const image of feature.images) if (imageUses.get(image)?.has(scenario.page)) nativeTargets.add(image);
      }
      for (const target of Array.isArray(check.targets) ? check.targets : []) {
        if (!nativeTargets.has(target)) errors.push(`${label} ${check.kind}: native target not covered by targeted scenarios: ${target}`);
      }
      for (const scenarioName of targetedScenarios) {
        const scenario = scenarios.get(scenarioName);
        if (!scenario) continue;
        const matching = runs.filter(run => run.scenario === scenarioName);
        if (matching.length !== 1) { errors.push(`${label} ${check.kind}: needs one native run for ${scenarioName}`); continue; }
        const run = matching[0];
        if (check.platform !== undefined && check.platform !== run.app?.platform) errors.push(`${label} ${check.kind}: platform does not match native run`);
        if (run.schemaVersion !== 1 || run.method !== 'normal-controls' || run.app?.commit !== record.reviewedAppCommit
          || !isCommit(run.app?.commit) || !isSha(run.app?.executableSha256)
          || !nonempty(run.app?.version) || !nonempty(run.app?.platform)
          || !['development', 'release-candidate', 'release'].includes(run.app?.distribution)) {
          errors.push(`${label} ${check.kind}: native run needs matching app identity and normal-controls method`);
        }
        const requiredSteps = check.kind === 'walkthrough' ? scenario.steps : scenario.steps.filter(s => ['save-copy', 'reopen-copy'].includes(s.id));
        if (check.kind === 'save-reopen' && requiredSteps.length !== 2) errors.push(`${scenarioName}: save-reopen requires save-copy and reopen-copy scenario steps`);
        for (const [field, required] of [['preflight', scenario.preflight], ['steps', requiredSteps]]) {
          if (!Array.isArray(run[field])) { errors.push(`${label} ${check.kind}: missing native ${field}`); continue; }
          const ids = run[field].map(step => step?.id);
          if (new Set(ids).size !== ids.length) errors.push(`${label} ${check.kind}: duplicate native ${field} IDs`);
          for (const expected of required || []) {
            const actual = run[field].find(step => step?.id === expected.id);
            if (actual?.status !== 'passed' || !nonempty(actual?.observation)) errors.push(`${label} ${check.kind}: native step ${expected.id} did not pass`);
            if (actual && field === 'steps') await evidence(actual.evidence, `${label} native step ${expected.id}`);
          }
        }
      }
      if (!feature.scenarios.length) errors.push(`${label} ${check.kind}: no mapped scenario`);
    }
  }
  for (const id of features.keys()) if (!records.has(id)) errors.push(`Missing verification record: ${id}`);

  // Only active mapped publications need current provenance. Historical unused
  // derivatives and immutable sessions remain untouched and do not expire.
  const publications = new Map();
  const manifests = await guarded('Capture manifests', async () => (await walk('authoring/captures')).filter(p => p.endsWith('/manifest.json'))) || [];
  for (const name of manifests) {
    let manifest;
    try { manifest = await json(name); } catch (error) { warnings.push(`${name}: not inspected: ${error.message}`); continue; }
    if (!object(manifest)) { warnings.push(`${name}: not inspected: manifest is not a JSON object`); continue; }
    for (const entry of Array.isArray(manifest.images) ? manifest.images : []) {
      if (!object(entry)) { warnings.push(`${name}: ignored malformed image entry`); continue; }
      if (!mappedImages.has(entry.published) || !activeImages.has(entry.published)) continue;
      if (!publications.has(entry.published)) publications.set(entry.published, []);
      publications.get(entry.published).push({ manifest, entry, name });
    }
  }
  for (const published of [...mappedImages].filter(p => activeImages.has(p))) {
    const matches = publications.get(published) || [];
    if (matches.length !== 1) { errors.push(`${published}: expected one capture provenance entry, found ${matches.length}`); continue; }
    const { manifest, entry, name } = matches[0];
    await guarded(`${published} provenance (${name})`, async () => {
      if (manifest.schemaVersion !== 1 || !nonempty(manifest.captureDate) || !isSha(manifest.baseline?.executableSha256)
        || !nonempty(manifest.baseline?.version) || !nonempty(manifest.baseline?.platform) || !nonempty(manifest.baseline?.distribution)) throw new Error('invalid capture app identity');
      if (manifest.baseline.appCommit !== undefined && !isCommit(manifest.baseline.appCommit)) throw new Error('invalid capture appCommit');
      if (typeof entry.source !== 'string' || entry.source.startsWith('public/')) throw new Error('original capture must be outside public/');
      const originalPath = await realpath(path.join(root, entry.source)), publicPath = await realpath(path.join(root, 'public'));
      if (originalPath.startsWith(publicPath + path.sep) || originalPath === publicPath) throw new Error('original capture must resolve outside public/');
      const original = await file(entry.source), output = await file(published);
      if (!isSha(entry.sourceSha256) || digest(original) !== entry.sourceSha256) throw new Error('original hash mismatch');
      if (!isSha(entry.publishedSha256) || digest(output) !== entry.publishedSha256) throw new Error('derivative hash mismatch');
      const metadata = await sharp(original).metadata(), outputMetadata = await sharp(output).metadata();
      for (const [recorded, actual, description] of [[entry.sourceDimensions, metadata, 'original'], [entry.publishedDimensions, outputMetadata, 'derivative']]) {
        if (recorded?.width !== actual.width || recorded?.height !== actual.height) throw new Error(`${description} dimensions mismatch`);
      }
      const c = entry.crop;
      if (!object(c) || !['left', 'top', 'width', 'height'].every(k => Number.isSafeInteger(c[k])) || c.left < 0 || c.top < 0
        || c.width < 1 || c.height < 1 || c.left + c.width > metadata.width || c.top + c.height > metadata.height) throw new Error('invalid crop');
      let pipeline = sharp(original).extract(c);
      if (entry.resize != null) {
        if (!Number.isSafeInteger(entry.resize.width) || entry.resize.width < 1 || entry.resize.width > c.width
          || Object.keys(entry.resize).some(k => k !== 'width')) throw new Error('invalid resize');
        pipeline = pipeline.resize({ width: entry.resize.width, withoutEnlargement: true, kernel: 'lanczos3' });
      }
      const regenerated = await pipeline.png({ compressionLevel: 9, adaptiveFiltering: false }).toBuffer();
      if (digest(regenerated) !== entry.publishedSha256) throw new Error('derivative does not match recorded crop transform');
      if (entry.patchSha256 !== undefined) {
        if (!isSha(entry.patchSha256) || digest(await file(entry.patch)) !== entry.patchSha256) throw new Error('setup patch hash mismatch');
      }
      for (const example of manifest.examples || []) {
        if (![...features.values()].some(feature => feature.patches.includes(example.path))) continue;
        if (!isSha(example.sha256) || digest(await file(example.path)) !== example.sha256) throw new Error(`example patch hash mismatch: ${example.path}`);
      }
      for (const field of ['sourceRecord', 'sourceLog']) {
        const name = manifest.nativeExport?.[field], hash = manifest.nativeExport?.[`${field}Sha256`];
        if (name !== undefined || hash !== undefined) {
          if (!isSha(hash) || digest(await file(name)) !== hash) throw new Error(`native export ${field} hash mismatch`);
        }
      }
    });
  }
  return result();
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2), jsonOutput = args.includes('--json'), roots = args.filter(arg => arg !== '--json');
  if (roots.length > 1 || roots.some(arg => arg.startsWith('--'))) throw new Error('Usage: node scripts/check-authoring.mjs [repository-root] [--json]');
  const report = await checkAuthoring(roots.length ? { root: roots[0] } : {});
  if (jsonOutput) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`Authoring pilot: ${report.coverage.features} features, ${report.coverage.mappedPages}/${report.coverage.pages} pages, ${report.coverage.mappedActiveImages}/${report.coverage.activeImages} active images; ${report.errors.length} errors.`);
    report.warnings.forEach(warning => console.warn(`Warning: ${warning}`));
    report.errors.forEach(error => console.error(`Error: ${error}`));
  }
  if (report.errors.length) process.exitCode = 1;
}
