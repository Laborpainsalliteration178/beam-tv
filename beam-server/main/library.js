/*
 * Folder-sharing library: turns the configured shared folders into a
 * browsable tree of stable-for-this-session object ids, mirroring the same
 * video/audio/image extension classification js/usbSource.js uses on the
 * Tizen client so a file that shows up on a USB drive shows up the same way
 * here. Directory contents are read live on every browse() call (not cached)
 * — this is meant to reflect whatever is actually on disk right now, not a
 * snapshot from whenever the app started.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const VIDEO_EXT = ['mp4', 'mkv', 'avi', 'mov', 'webm', 'ts', 'm2ts', 'wmv', 'flv', 'm4v'];
const AUDIO_EXT = ['mp3', 'flac', 'wav', 'aac', 'ogg', 'm4a', 'wma'];
const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];

const MIME = {
  mp4: 'video/mp4', mkv: 'video/x-matroska', avi: 'video/x-msvideo', mov: 'video/quicktime',
  webm: 'video/webm', ts: 'video/mp2t', m2ts: 'video/mp2t', wmv: 'video/x-ms-wmv',
  flv: 'video/x-flv', m4v: 'video/x-m4v',
  mp3: 'audio/mpeg', flac: 'audio/flac', wav: 'audio/wav', aac: 'audio/aac',
  ogg: 'audio/ogg', m4a: 'audio/mp4', wma: 'audio/x-ms-wma',
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
  webp: 'image/webp', bmp: 'image/bmp',
};

function extOf(name) {
  const m = /\.([a-z0-9]+)$/i.exec(name || '');
  return m ? m[1].toLowerCase() : '';
}
function kindOf(name) {
  const ext = extOf(name);
  if (VIDEO_EXT.includes(ext)) return 'video';
  if (AUDIO_EXT.includes(ext)) return 'audio';
  if (IMAGE_EXT.includes(ext)) return 'image';
  return 'other';
}
function mimeOf(name) { return MIME[extOf(name)] || 'application/octet-stream'; }

class Library {
  constructor() {
    this.reset([]);
  }

  // Called on startup and whenever the shared-folder list changes. Only paths
  // discovered beneath an explicitly shared root are added to this map.
  // Clients never receive an encoded local filesystem path and cannot invent
  // an object id that reaches outside the selected folders.
  reset(sharedFolders) {
    this.sharedFolders = sharedFolders || [];
    this.nodes = new Map();
    this.roots = new Map();
    for (const folder of this.sharedFolders) {
      let realPath;
      try {
        realPath = fs.realpathSync(folder.path);
        if (!fs.statSync(realPath).isDirectory()) continue;
      } catch (e) {
        continue;
      }
      const id = this._idFor(realPath);
      const node = {
        type: 'dir',
        absPath: realPath,
        name: folder.label || path.basename(realPath),
      };
      this.roots.set(id, node);
      this.nodes.set(id, node);
    }
  }

  _idFor(absPath) {
    return crypto.createHash('sha1').update(absPath).digest('hex').slice(0, 16);
  }

  _resolve(objectId) {
    if (objectId === '0' || !objectId) return { type: 'root' };
    return this.nodes.get(objectId) || null;
  }

  _idForPath(absPath) {
    const id = this._idFor(absPath);
    return id;
  }

  _remember(absPath, type, stat) {
    const id = this._idForPath(absPath);
    this.nodes.set(id, {
      type,
      absPath,
      name: path.basename(absPath),
      size: type === 'file' ? stat.size : undefined,
    });
    return id;
  }

  // Returns { containers: [{id,name}], items: [{id,name,kind,size,mime}] }
  browse(objectId) {
    const node = this._resolve(objectId);
    if (!node) throw new Error('unknown objectId');

    if (node.type === 'root') {
      return {
        containers: Array.from(this.roots, ([id, root]) => ({ id, name: root.name })),
        items: [],
      };
    }
    if (node.type === 'file') throw new Error('cannot browse a file');

    const entries = fs.readdirSync(node.absPath, { withFileTypes: true });
    const containers = [];
    const items = [];
    for (const e of entries) {
      // Symlinks are intentionally excluded. Following one could expose files
      // outside a folder the user selected for sharing.
      if (e.name.startsWith('.') || e.isSymbolicLink()) continue;
      let abs;
      let stat;
      try {
        abs = fs.realpathSync(path.join(node.absPath, e.name));
        stat = fs.statSync(abs);
      } catch (err) {
        continue;
      }
      if (e.isDirectory()) {
        containers.push({ id: this._remember(abs, 'dir', stat), name: e.name });
      } else {
        const kind = kindOf(e.name);
        if (kind === 'other') continue;
        items.push({
          id: this._remember(abs, 'file', stat),
          name: e.name,
          kind,
          size: stat.size,
          mime: mimeOf(e.name),
        });
      }
    }
    containers.sort((a, b) => a.name.localeCompare(b.name));
    items.sort((a, b) => a.name.localeCompare(b.name));
    return { containers, items };
  }

  // Resolves a streamable file's absolute path + mime straight from its id,
  // without needing a prior browse() in the same process.
  fileFor(objectId) {
    const node = this._resolve(objectId);
    if (!node || node.type !== 'file') return null;
    return { absPath: node.absPath, name: node.name, mime: mimeOf(node.name) };
  }
}

module.exports = { Library, kindOf, mimeOf, extOf };
