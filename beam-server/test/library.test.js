const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { Library } = require('../main/library');

function fixture() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'beam-library-'));
  const shared = path.join(base, 'shared');
  const outside = path.join(base, 'private.mp4');
  fs.mkdirSync(path.join(shared, 'nested'), { recursive: true });
  fs.writeFileSync(path.join(shared, 'movie.mp4'), 'movie');
  fs.writeFileSync(path.join(shared, 'notes.txt'), 'ignored');
  fs.writeFileSync(path.join(shared, 'nested', 'song.mp3'), 'song');
  fs.writeFileSync(outside, 'private');
  return { base, shared, outside };
}

test('browses and resolves only files discovered under a shared root', (t) => {
  const f = fixture();
  t.after(() => fs.rmSync(f.base, { recursive: true, force: true }));

  const library = new Library();
  library.reset([{ path: f.shared, label: 'Media' }]);

  const root = library.browse('0');
  assert.equal(root.containers.length, 1);
  assert.equal(root.containers[0].name, 'Media');

  const listing = library.browse(root.containers[0].id);
  assert.deepEqual(listing.items.map((item) => item.name), ['movie.mp4']);
  assert.deepEqual(listing.containers.map((item) => item.name), ['nested']);

  const file = library.fileFor(listing.items[0].id);
  assert.equal(file.absPath, fs.realpathSync(path.join(f.shared, 'movie.mp4')));
});

test('rejects client-generated ids for files outside shared folders', (t) => {
  const f = fixture();
  t.after(() => fs.rmSync(f.base, { recursive: true, force: true }));

  const library = new Library();
  library.reset([{ path: f.shared, label: 'Media' }]);

  const oldEncodedPathId = Buffer.from(f.outside, 'utf8').toString('base64url');
  assert.equal(library.fileFor(oldEncodedPathId), null);
  assert.equal(library.fileFor('not-a-known-id'), null);
});

test('does not expose symbolic links that escape a shared folder', (t) => {
  const f = fixture();
  t.after(() => fs.rmSync(f.base, { recursive: true, force: true }));
  fs.symlinkSync(f.outside, path.join(f.shared, 'linked.mp4'));

  const library = new Library();
  library.reset([{ path: f.shared, label: 'Media' }]);
  const root = library.browse('0');
  const listing = library.browse(root.containers[0].id);

  assert.deepEqual(listing.items.map((item) => item.name), ['movie.mp4']);
});
