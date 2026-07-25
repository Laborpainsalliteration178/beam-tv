/*
 * Playback engine: wraps the native <video> element (Tizen's platform
 * decoder handles MKV/H.265/AC3 etc. natively — no need for AVPlay for
 * direct file/HTTP playback), adds SRT->WebVTT subtitle conversion and
 * resume-where-you-left-off support.
 */
(function (global) {
  const RESUME_KEY = 'beam.resume.v1';
  const SAVE_INTERVAL_MS = 5000;

  function loadResumeMap() {
    try { return JSON.parse(localStorage.getItem(RESUME_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveResumeMap(map) { localStorage.setItem(RESUME_KEY, JSON.stringify(map)); }

  function srtTimeToVtt(t) { return t.replace(',', '.'); }

  function srtToVtt(srtText) {
    const lines = srtText.replace(/\r/g, '').split('\n');
    const out = ['WEBVTT', ''];
    for (const line of lines) {
      if (/^\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}/.test(line)) {
        out.push(srtTimeToVtt(line));
      } else if (/^\d+$/.test(line.trim())) {
        // cue index line — WebVTT doesn't require it, skip
        continue;
      } else {
        out.push(line);
      }
    }
    return out.join('\n');
  }

  class Player {
    constructor(videoEl) {
      this.video = videoEl;
      this.current = null; // { key, title, uri }
      this._saveTimer = null;
      this._trackUrl = null;
      this.onTimeUpdate = null;
      this.onEnded = null;
      this.onError = null;
      // Added once here rather than per-open(): these previously got
      // re-registered on every open() call and were never removed, so a
      // session with many videos played would accumulate duplicate
      // listeners — each 'ended' firing N times (N toasts, N navigations)
      // by the time you'd watched N videos.
      this.video.addEventListener('timeupdate', () => this.onTimeUpdate && this.onTimeUpdate(this.video));
      this.video.addEventListener('ended', () => { this._saveProgress(); this.onEnded && this.onEnded(); });
      this.video.addEventListener('error', () => this.onError && this.onError(this.video.error));
      this._registerHardwareKeys();
    }

    _registerHardwareKeys() {
      if (!BeamEnv.isTV || !tizen.tvinputdevice.registerKey) return;
      // Colored remote keys are reserved by the platform and never reach the
      // app as keydown events unless explicitly registered — ColorF2Yellow
      // (picture-in-picture) would silently do nothing without this.
      const keys = [
        'MediaPlayPause', 'MediaPlay', 'MediaPause', 'MediaStop', 'MediaRewind', 'MediaFastForward',
        'ColorF0Red', 'ColorF1Green', 'ColorF2Yellow', 'ColorF3Blue',
      ];
      keys.forEach((k) => { try { tizen.tvinputdevice.registerKey(k); } catch (e) { /* not supported on this key */ } });
    }

    getResumeSeconds(key) {
      const map = loadResumeMap();
      return (map[key] && map[key].t) || 0;
    }

    getWatchHistory() {
      const map = loadResumeMap();
      return Object.values(map).sort((a, b) => b.at - a.at);
    }

    _saveProgress() {
      if (!this.current || !this.video.duration) return;
      const map = loadResumeMap();
      const ratio = this.video.currentTime / this.video.duration;
      if (ratio > 0.96) {
        delete map[this.current.key];
      } else {
        map[this.current.key] = {
          key: this.current.key,
          title: this.current.title,
          uri: this.current.uri,
          t: this.video.currentTime,
          duration: this.video.duration,
          at: Date.now(),
          sourceType: this.current.sourceType,
        };
      }
      saveResumeMap(map);
    }

    async open({ key, title, uri, subtitleUri, sourceType }) {
      this.close();
      this.current = { key, title, uri, sourceType };
      this.video.src = uri;

      // Fire play() as the very first thing, synchronously within the same
      // call stack as the user's OK-press. Any `await` before this (e.g. a
      // subtitle fetch) breaks the browser's user-gesture/autoplay chain and
      // silently blocks playback until a second, fresh key press.
      const playAttempt = this.video.play().catch((e) => console.warn('play() rejected', e));

      const resumeAt = this.getResumeSeconds(key);
      const onLoaded = () => {
        if (resumeAt > 2) this.video.currentTime = resumeAt;
        this.video.removeEventListener('loadedmetadata', onLoaded);
      };
      this.video.addEventListener('loadedmetadata', onLoaded);
      this._saveTimer = setInterval(() => this._saveProgress(), SAVE_INTERVAL_MS);

      if (subtitleUri) {
        try {
          const text = await (await fetch(subtitleUri)).text();
          const vtt = /^\s*WEBVTT/i.test(text) ? text : srtToVtt(text);
          const blob = new Blob([vtt], { type: 'text/vtt' });
          this._trackUrl = URL.createObjectURL(blob);
          const track = document.createElement('track');
          track.kind = 'subtitles';
          track.label = 'Subtitles';
          track.default = true;
          track.src = this._trackUrl;
          this.video.appendChild(track);
        } catch (e) { console.warn('subtitle load failed', e); }
      }

      await playAttempt;
      return resumeAt;
    }

    close() {
      if (this._saveTimer) { clearInterval(this._saveTimer); this._saveTimer = null; }
      if (this.current) this._saveProgress();
      this.video.pause();
      this.video.removeAttribute('src');
      Array.from(this.video.querySelectorAll('track')).forEach((t) => t.remove());
      if (this._trackUrl) { URL.revokeObjectURL(this._trackUrl); this._trackUrl = null; }
      this.video.load();
      this.current = null;
    }

    togglePlay() { this.video.paused ? this.video.play() : this.video.pause(); }
    seekBy(sec) { this.video.currentTime = Math.max(0, Math.min(this.video.duration || Infinity, this.video.currentTime + sec)); }
  }

  global.BeamPlayer = Player;
})(window);
