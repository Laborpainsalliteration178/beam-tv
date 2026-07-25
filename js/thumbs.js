/*
 * Thumbnail generation for video frames and photo files, both rasterized
 * down to a small JPEG via <canvas> so cards never hold a full-resolution
 * decode in memory. Everything runs through a small concurrency-limited
 * queue — a folder with dozens of photos/videos must not fire dozens of
 * simultaneous full-size decodes at once, which is what was choking the
 * TV's RAM. Falls back silently (resolves null) on any failure.
 */
(function (global) {
  const cache = new Map(); // uri -> dataURL | null
  const pending = new Map(); // uri -> Promise
  const THUMB_WIDTH = 320;
  const MAX_CONCURRENT = 2;

  let active = 0;
  const queue = [];
  function pump() {
    while (active < MAX_CONCURRENT && queue.length) {
      const job = queue.shift();
      active++;
      job().finally(() => { active--; pump(); });
    }
  }
  function enqueue(job) {
    return new Promise((resolve) => {
      queue.push(() => job().then(resolve));
      pump();
    });
  }

  function rasterize(source, naturalW, naturalH) {
    const w = THUMB_WIDTH;
    const h = Math.max(1, Math.round(w * ((naturalH || 9) / (naturalW || 16))));
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(source, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', 0.7);
  }

  function grabFrame(uri) {
    if (cache.has(uri)) return Promise.resolve(cache.get(uri));
    if (pending.has(uri)) return pending.get(uri);

    const p = enqueue(() => new Promise((resolve) => {
      const v = document.createElement('video');
      v.muted = true;
      v.playsInline = true;
      v.preload = 'metadata';
      let settled = false;

      const finish = (result) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        cache.set(uri, result);
        v.removeAttribute('src');
        v.load();
        resolve(result);
      };

      const timer = setTimeout(() => finish(null), 7000);

      v.addEventListener('loadedmetadata', () => {
        const dur = v.duration;
        const target = isFinite(dur) && dur > 1 ? Math.min(dur * 0.12, 30) : 0.1;
        try { v.currentTime = target; } catch (e) { finish(null); }
      });
      v.addEventListener('seeked', () => {
        try { finish(rasterize(v, v.videoWidth, v.videoHeight)); }
        catch (e) { finish(null); } // tainted canvas (no CORS) or decode error
      });
      v.addEventListener('error', () => finish(null));
      v.src = uri;
      v.load();
    }));

    pending.set(uri, p);
    p.finally(() => pending.delete(uri));
    return p;
  }

  // Downscales a photo file to a small thumbnail instead of ever handing the
  // full-resolution original to a card's background-image — a folder of
  // 12MP camera photos rendered at full size is exactly what was choking
  // the TV.
  function grabImageThumb(uri) {
    if (cache.has(uri)) return Promise.resolve(cache.get(uri));
    if (pending.has(uri)) return pending.get(uri);

    const p = enqueue(() => new Promise((resolve) => {
      const img = new Image();
      const finish = (result) => {
        cache.set(uri, result);
        img.src = '';
        resolve(result);
      };
      img.onload = () => {
        try { finish(rasterize(img, img.naturalWidth, img.naturalHeight)); }
        catch (e) { finish(null); } // tainted canvas (no CORS on a DLNA host, etc.)
      };
      img.onerror = () => finish(null);
      img.src = uri;
    }));

    pending.set(uri, p);
    p.finally(() => pending.delete(uri));
    return p;
  }

  global.ThumbGrabber = { grabFrame, grabImageThumb };
})(window);
