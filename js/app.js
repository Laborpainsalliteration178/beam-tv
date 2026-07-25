(function () {
  const ICONS = {
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
    usb: '<rect x="7" y="2" width="10" height="6" rx="1"/><path d="M12 8v7"/><circle cx="12" cy="19" r="3"/><path d="M9 12h-2a2 2 0 0 0-2 2v1"/><path d="M15 12h2a2 2 0 0 1 2 2v1"/>',
    network: '<path d="M5 12.5a11 11 0 0 1 14 0"/><path d="M8.5 16a6 6 0 0 1 7 0"/><path d="M12 19.5h.01"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 0 1-4 0v-.09A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 0 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 0 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.14.36.44.63.8.8V9c.71.2 1.55.2 1.55 1v4a1.7 1.7 0 0 0-1.55 1z"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>',
    film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 15h18M9 4v16M15 4v16"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    photo: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="9" r="1.8"/><path d="m21 15-5-5-9 9"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    server: '<rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/><path d="M7 7h.01M7 17h.01"/>',
    back: '<path d="M15 18l-6-6 6-6"/>',
    hdd: '<rect x="2" y="7" width="20" height="10" rx="2"/><circle cx="7" cy="12" r="1.4"/><path d="M11 12h9"/>',
    scan: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="M12 3v3M12 18v3M21 12h-3M6 12H3"/>',
  };
  function icon(name, size) {
    size = size || 24;
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;
  }

  const HUES = [210, 265, 330, 20, 160, 45, 285];
  function hashHue(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return HUES[h % HUES.length];
  }
  function thumbStyle(name) {
    const hue = hashHue(name || 'x');
    return `background: linear-gradient(135deg, hsl(${hue} 38% 20%), hsl(${(hue + 30) % 360} 32% 11%));`;
  }

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $all = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function toast(msg, ms) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('show'), ms || 2600);
  }

  function showScreen(id) {
    $all('.screen').forEach((s) => s.classList.toggle('active', s.id === 'screen-' + id));
    if (id !== 'player' && id !== 'photo') App._lastNonPlayerScreen = id;
    App.activeScreen = id;
    window.BeamPlayerActive = id === 'player' || id === 'photo';
    const chromeless = id === 'player' || id === 'photo';
    const sidebar = $('#sidebar');
    // display:none, not opacity/visibility: reports from the real TV showed
    // the sidebar's background panel still rendering as an empty bar during
    // playback (icons/labels gone but the panel itself visible) — a
    // compositing quirk with opacity+visibility on Tizen's embedded WebKit.
    // display:none removes it from the render tree outright, so there's no
    // partial-render state possible. Costs the fade transition, but this has
    // to be unconditionally correct on real hardware.
    sidebar.style.display = chromeless ? 'none' : 'flex';
    // Direct call, not requestAnimationFrame: content is already synchronously
    // in the DOM by the time showScreen() runs, and rAF can go unfired for an
    // arbitrarily long time when the callback is scheduled while the page/tab
    // isn't the active rendering target — which left focus stranded on
    // whatever screen the user had left.
    spatialNav.focusFirst();
  }

  const GLYPH_BY_KIND = { audio: 'music', image: 'photo', video: 'film' };

  function cardEl({ name, isDir, kind, onSelect, progress, size, uri, thumbUri }) {
    const el = document.createElement('div');
    el.className = 'card focusable' + (isDir ? ' folder' : '');
    const glyph = isDir ? icon('folder', 46) : icon(GLYPH_BY_KIND[kind] || 'film', 40);
    const sizeLabel = !isDir && size != null ? UsbSource.humanSize(size) : '';
    el.innerHTML = `
      <div class="thumb" style="${thumbStyle(name)}">
        <div class="shine"></div>
        <span class="glyph">${glyph}</span>
        ${!isDir && kind === 'video' ? `<span class="play-badge">${icon('play', 16)}</span>` : ''}
        ${progress != null ? `<div class="progress"><i style="width:${Math.round(progress * 100)}%"></i></div>` : ''}
      </div>
      <div class="meta">
        <div class="name">${escapeHtml(isDir ? name : UsbSource.prettyName(name))}</div>
        <div class="sub">${isDir ? 'Folder' : [kind.toUpperCase(), sizeLabel].filter(Boolean).join(' · ')}</div>
      </div>`;
    el.addEventListener('nav-select', onSelect);
    el.addEventListener('click', onSelect);

    if (!isDir && typeof ThumbGrabber !== 'undefined') {
      const thumbEl = el.querySelector('.thumb');
      const applyImage = (url) => {
        thumbEl.style.backgroundImage = `url("${url}")`;
        thumbEl.style.backgroundSize = 'cover';
        thumbEl.style.backgroundPosition = 'center';
        thumbEl.classList.add('has-thumb');
      };
      if (thumbUri) {
        // Server-provided art (DLNA albumArtURI) — cheap and reliable, skip
        // frame-grabbing entirely.
        ThumbGrabber.grabImageThumb(thumbUri).then((dataUrl) => { if (dataUrl && el.isConnected) applyImage(dataUrl); });
      } else if (kind === 'image' && uri) {
        ThumbGrabber.grabImageThumb(uri).then((dataUrl) => { if (dataUrl && el.isConnected) applyImage(dataUrl); });
      } else if (kind === 'video' && uri) {
        ThumbGrabber.grabFrame(uri).then((dataUrl) => { if (dataUrl && el.isConnected) applyImage(dataUrl); });
      }
    }
    return el;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  const App = {
    activeScreen: 'home',
    usbState: { storageLabel: null, path: [] },
    dlnaState: { server: null, trail: [{ id: '0', name: 'Root' }] },
    player: null,
    navGen: 0,
    pip: false,
  };

  // Every async render (renderUsbDir, renderHome, ...) grabs a token when it
  // starts and checks it's still current before touching the DOM/focus at
  // the end. If the user has since navigated elsewhere, a slower-resolving
  // older render just discards its result instead of clobbering whatever
  // screen is now showing — this is what caused focus to randomly land back
  // on a stale card from a screen the user had already left.
  function beginNav() { return ++App.navGen; }
  function staleNav(token) { return token !== App.navGen; }

  // ---------------- Sidebar ----------------
  function initSidebar() {
    const items = [
      { id: 'home', label: 'Home', icon: 'home' },
      { id: 'usb', label: 'USB', icon: 'usb' },
      { id: 'network', label: 'Network', icon: 'network' },
      { id: 'settings', label: 'Settings', icon: 'settings' },
    ];
    const nav = $('#sidebar');
    items.forEach((it) => {
      const el = document.createElement('div');
      el.className = 'nav-item focusable' + (it.id === 'home' ? ' current' : '');
      el.dataset.target = it.id;
      el.innerHTML = `${icon(it.icon, 20)}<span class="label">${it.label}</span>`;
      el.addEventListener('nav-select', () => navigateTo(it.id));
      el.addEventListener('click', () => navigateTo(it.id));
      nav.insertBefore(el, $('.nav-spacer', nav));
    });
  }

  function setActiveNav(id) {
    $all('.nav-item').forEach((el) => el.classList.toggle('current', el.dataset.target === id));
  }

  function navigateTo(id) {
    setActiveNav(id);
    if (id === 'home') renderHome();
    else if (id === 'usb') { App.usbState = { storageLabel: null, path: [] }; renderUsbRoot(); }
    else if (id === 'network') renderNetworkHome();
    else if (id === 'settings') renderSettings();
  }

  // ---------------- Home ----------------
  // Checks each Continue-Watching entry against what's actually reachable
  // right now — a USB entry only shows if that file still resolves on a
  // mounted drive, a DLNA entry only if its server is still saved. Stale
  // entries (drive unplugged, server removed) are silently dropped, not shown
  // then failing when clicked.
  async function getAvailableHistory() {
    const history = App.player.getWatchHistory();
    if (!history.length) return [];

    let usbLabel = null;
    try {
      const storages = await UsbSource.listStorages();
      const removable = storages.filter((s) => /external|removable|mmc|usb/i.test(String(s.type)) || /removable/i.test(String(s.label)));
      if (removable.length) usbLabel = removable[0].label;
    } catch (e) { /* no usb api / none mounted */ }
    const dlnaServerIds = new Set(DlnaSource.loadServers().map((s) => s.id));

    const checks = history.map(async (h) => {
      if (h.key.startsWith('usb:')) {
        if (!usbLabel) return null;
        if (BeamEnv.isPreview) return h; // mock fs has no real resolve semantics
        const subPath = h.key.slice(4).split('/');
        try {
          await new Promise((resolve, reject) => tizen.filesystem.resolve([usbLabel].concat(subPath).join('/'), resolve, reject, 'r'));
          return h;
        } catch (e) { return null; }
      }
      if (h.key.startsWith('dlna:')) {
        const serverId = h.key.split(':')[1];
        return dlnaServerIds.has(serverId) ? h : null;
      }
      return null;
    });
    return (await Promise.all(checks)).filter(Boolean);
  }

  async function renderHome() {
    const myNav = beginNav();
    const root = $('#screen-home .content');
    root.innerHTML = '';

    const quick = document.createElement('div');
    quick.className = 'row';
    quick.innerHTML = `<div class="row-header"><div class="row-title">Sources</div></div>`;
    const track = document.createElement('div');
    track.className = 'card-track';
    track.appendChild(sourceCard('Local USB', icon('usb', 40), () => navigateTo('usb')));
    track.appendChild(sourceCard('Network (DLNA)', icon('network', 40), () => navigateTo('network')));
    quick.appendChild(track);
    root.appendChild(quick);

    const empty = document.createElement('div');
    empty.className = 'empty-state fade-in';
    empty.innerHTML = `
      <div class="icon-badge">${icon('play', 32)}</div>
      <h3>Welcome to Beam</h3>
      <p>Plug in a USB drive or add a network media server to start browsing your movies, shows and music — beautifully, right here on your TV.</p>`;
    root.appendChild(empty);
    showScreen('home');

    const available = await getAvailableHistory();
    if (staleNav(myNav)) return; // user navigated away while we were checking
    if (available.length) {
      empty.remove();
      root.insertBefore(rowEl('Continue Watching', available.map((h) => cardFromHistory(h))), quick);
      spatialNav.focusFirst();
    }
  }

  function sourceCard(title, iconSvg, onSelect) {
    const el = document.createElement('div');
    el.className = 'card focusable';
    el.innerHTML = `<div class="thumb" style="background:linear-gradient(135deg,var(--accent-2),var(--accent));color:#06070c;">${iconSvg}</div>
      <div class="meta"><div class="name">${title}</div></div>`;
    el.addEventListener('nav-select', onSelect);
    el.addEventListener('click', onSelect);
    return el;
  }

  function cardFromHistory(h) {
    const pct = h.duration ? h.t / h.duration : 0;
    return cardEl({
      name: h.title, isDir: false, kind: h.sourceType === 'audio' ? 'audio' : 'video', progress: pct, uri: h.uri,
      onSelect: () => resumeFromHistory(h),
    });
  }

  function resumeFromHistory(h) {
    toast('Resuming ' + UsbSource.prettyName(h.title));
    playByKey(h);
  }

  function rowEl(title, cards) {
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `<div class="row-header"><div class="row-title">${title}</div><div class="row-count">${cards.length}</div></div>`;
    const track = document.createElement('div');
    track.className = 'card-track';
    cards.forEach((c) => track.appendChild(c));
    row.appendChild(track);
    return row;
  }

  // ---------------- USB ----------------
  function diagnosticsHtml(storages) {
    if (!storages || !storages.length) return '<p style="margin-top:18px;color:var(--ink-3);font-size:14px;">tizen.filesystem.listStorages() returned an empty list.</p>';
    const rows = storages.map((s) => `<tr>
        <td style="padding:4px 14px 4px 0;color:var(--ink-1);">${escapeHtml(s.label)}</td>
        <td style="padding:4px 14px;color:var(--ink-2);">${escapeHtml(String(s.type))}</td>
        <td style="padding:4px 14px;color:var(--ink-2);">${escapeHtml(String(s.state))}</td>
      </tr>`).join('');
    return `<div style="margin-top:22px;">
      <p style="color:var(--ink-3);font-size:14px;margin-bottom:10px;">Raw storages reported by tizen.filesystem.listStorages():</p>
      <table style="font-size:15px;border-collapse:collapse;"><tr style="color:var(--ink-3);font-size:13px;">
        <td style="padding:4px 14px 4px 0;">label</td><td style="padding:4px 14px;">type</td><td style="padding:4px 14px;">state</td>
      </tr>${rows}</table></div>`;
  }

  async function renderUsbRoot() {
    const myNav = beginNav();
    const root = $('#screen-usb .content');
    root.innerHTML = loadingHtml('Scanning for USB drives…');
    showScreen('usb');
    try {
      const storages = await UsbSource.listStorages();
      if (staleNav(myNav)) return;
      const removable = storages.filter((s) => /external|removable|mmc|usb/i.test(String(s.type)) || /removable/i.test(String(s.label)));
      if (!removable.length) {
        root.innerHTML = emptyHtml('usb', 'No USB drive found', 'Plug a USB flash drive or hard disk into your TV’s USB port. It will show up here automatically once mounted.') + diagnosticsHtml(storages);
        return;
      }
      App.usbState.storageLabel = removable[0].label;
      App.usbState.driveName = removable[0].label.split('/').pop() || 'USB Drive';
      renderStorageSubtitle();
      await renderUsbDir([]);
    } catch (e) {
      if (!staleNav(myNav)) root.innerHTML = emptyHtml('usb', 'Couldn’t read storage', e.message || String(e));
    }
  }

  async function renderStorageSubtitle() {
    const sub = $('#usb-subtitle');
    sub.innerHTML = `Media on ${escapeHtml(App.usbState.driveName)}.`;
    try {
      const stats = await UsbSource.getStorageStats();
      if (!stats || !stats.capacity) return;
      const used = stats.capacity - stats.availableCapacity;
      const pct = Math.round((used / stats.capacity) * 100);
      sub.innerHTML = `Media on ${escapeHtml(App.usbState.driveName)} &nbsp;·&nbsp; ${UsbSource.humanSize(stats.availableCapacity)} free of ${UsbSource.humanSize(stats.capacity)}
        <span class="cap-bar"><i style="width:${pct}%"></i></span>`;
    } catch (e) { /* stats unavailable on this platform, keep plain subtitle */ }
  }

  async function renderUsbDir(subPath) {
    const myNav = beginNav();
    App.usbState.path = subPath;
    const root = $('#screen-usb .content');
    root.innerHTML = loadingHtml('Loading…');
    try {
      const { items, subtitles } = await UsbSource.listDir(App.usbState.storageLabel, subPath);
      if (staleNav(myNav)) return;
      root.innerHTML = '';
      const crumbs = [App.usbState.driveName].concat(subPath);
      root.appendChild(breadcrumbEl(crumbs, (i) => renderUsbDir(subPath.slice(0, i))));
      if (!items.length) {
        root.appendChild(htmlToEl(emptyHtml('folder', 'Empty folder', 'No playable video, audio, or photo files here.')));
      } else {
        const grid = document.createElement('div');
        grid.className = 'grid-track';
        const images = items.filter((it) => !it.isDir && it.kind === 'image');
        items.forEach((it) => {
          grid.appendChild(cardEl({
            name: it.name, isDir: it.isDir, kind: it.kind, size: it.size, uri: it.uri,
            onSelect: () => it.isDir ? renderUsbDir(it.subPath) : openMediaItem(it, images, subtitles, () => renderUsbDir(subPath)),
          }));
        });
        root.appendChild(grid);
      }
      showScreen('usb');
    } catch (e) {
      if (!staleNav(myNav)) root.innerHTML = emptyHtml('usb', 'Error reading folder', e.message || String(e));
    }
  }

  // Routes a selected file to the video/audio player or the photo viewer,
  // and for images hands along the folder's other images for prev/next.
  // For video, auto-matches a sidecar subtitle file (Movie.srt next to
  // Movie.mkv) if one exists in the same folder.
  function openMediaItem(item, imageSiblings, subtitles, backTo) {
    const key = 'usb:' + item.subPath.join('/');
    if (item.kind === 'image') {
      const idx = Math.max(0, imageSiblings.findIndex((s) => s.uri === item.uri));
      openPhotoViewer(imageSiblings, idx, backTo);
    } else {
      const sub = item.kind === 'video' ? UsbSource.findSubtitleFor(item.name, subtitles) : null;
      openPlayer({ key, title: item.name, uri: item.uri, subtitleUri: sub ? sub.uri : undefined, sourceType: item.kind, backTo });
    }
  }

  // ---------------- Network / DLNA ----------------
  function renderNetworkHome() {
    const root = $('#screen-network .content');
    root.innerHTML = '';
    const servers = DlnaSource.loadServers();
    root.appendChild(htmlToEl(`<h2 class="page-title" style="font-size:32px;margin-bottom:22px;">Network Media Servers</h2>`));

    const grid = document.createElement('div');
    grid.className = 'grid-track';
    servers.forEach((s) => {
      const el = document.createElement('div');
      el.className = 'card focusable';
      el.innerHTML = `<div class="thumb" style="background:linear-gradient(135deg,#22314f,#101526);">${icon('server', 40)}</div>
        <div class="meta"><div class="name">${escapeHtml(s.name)}</div><div class="sub">DLNA / UPnP</div></div>`;
      el.addEventListener('nav-select', () => openDlnaServer(s));
      el.addEventListener('click', () => openDlnaServer(s));
      grid.appendChild(el);
    });
    const scanCard = document.createElement('div');
    scanCard.className = 'card focusable';
    scanCard.innerHTML = `<div class="thumb" style="background:linear-gradient(135deg,var(--accent-2),var(--accent));color:#06070c;">${icon('scan', 34)}</div>
      <div class="meta"><div class="name">Scan Network</div><div class="sub">Find servers automatically</div></div>`;
    scanCard.addEventListener('nav-select', renderNetworkScan);
    scanCard.addEventListener('click', renderNetworkScan);
    grid.appendChild(scanCard);

    const addCard = document.createElement('div');
    addCard.className = 'card focusable';
    addCard.innerHTML = `<div class="thumb" style="background:var(--bg-panel-solid);">${icon('plus', 34)}</div>
      <div class="meta"><div class="name">Add Server Manually</div></div>`;
    addCard.addEventListener('nav-select', renderAddServerForm);
    addCard.addEventListener('click', renderAddServerForm);
    grid.appendChild(addCard);
    root.appendChild(grid);

    if (!servers.length) {
      root.appendChild(htmlToEl(emptyHtml('network', 'No servers added yet', 'Tap Scan Network to find a Beam Companion Server automatically, or add any DLNA server manually by its description.xml URL.')));
    }
    showScreen('network');
  }

  // Real SSDP is unreachable to a Tizen web app (no raw UDP socket access —
  // a platform limitation, not something worth re-litigating). This finds
  // the TV's own subnet via systeminfo and unicast-probes it for Beam
  // Companion Servers, which is the practical substitute: no typing needed
  // for the common case, at the cost of only finding that one known port.
  async function renderNetworkScan() {
    const myNav = beginNav();
    const root = $('#screen-network .content');
    root.innerHTML = `
      <h2 class="page-title" style="font-size:32px;margin-bottom:8px;">Scanning Network…</h2>
      <p class="page-subtitle" id="scan-progress" style="margin-bottom:30px;">Looking for Beam Companion Servers on your network.</p>
    `;
    showScreen('network');

    const result = await DlnaSource.scanNetwork((scanned, total) => {
      if (staleNav(myNav)) return;
      const el = $('#scan-progress');
      if (el) el.textContent = `Checked ${scanned} of ${total} devices…`;
    });
    if (staleNav(myNav)) return;

    root.innerHTML = `<h2 class="page-title" style="font-size:32px;margin-bottom:8px;">Scan Results</h2>`;

    if (result.error === 'no-network-info') {
      root.appendChild(htmlToEl(emptyHtml('network', 'Couldn’t read network info', 'This TV didn’t report a Wi-Fi or Ethernet IP address, so a subnet scan isn’t possible. Add your server manually instead.')));
      root.appendChild(htmlToEl(`<div class="btn primary focusable" id="scan-fallback-add" style="margin-top:18px;">${icon('plus', 18)} Add Server Manually</div>`));
      $('#scan-fallback-add').addEventListener('nav-select', renderAddServerForm);
      $('#scan-fallback-add').addEventListener('click', renderAddServerForm);
      showScreen('network');
      return;
    }

    if (!result.found.length) {
      root.appendChild(htmlToEl(emptyHtml('network', 'No servers found', 'Make sure the Beam Companion Server is running on a computer on this same network, then try again.')));
      const retryBtn = htmlToEl(`<div class="btn focusable" id="scan-retry" style="margin-top:18px;">${icon('scan', 18)} Scan Again</div>`);
      root.appendChild(retryBtn);
      $('#scan-retry').addEventListener('nav-select', renderNetworkScan);
      $('#scan-retry').addEventListener('click', renderNetworkScan);
      showScreen('network');
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'grid-track';
    result.found.forEach((found) => {
      const el = document.createElement('div');
      el.className = 'card focusable';
      el.innerHTML = `<div class="thumb" style="background:linear-gradient(135deg,var(--accent-2),var(--accent));color:#06070c;">${icon('server', 40)}</div>
        <div class="meta"><div class="name">${escapeHtml(found.name)}</div><div class="sub">Found at ${escapeHtml(found.ip)}</div></div>`;
      const addIt = async () => {
        toast('Adding ' + found.name + '…');
        try {
          const entry = await DlnaSource.addServer(found.name, found.descriptionUrl);
          toast('Added ' + entry.name);
          renderNetworkHome();
        } catch (e) {
          toast('Couldn’t connect: ' + (e.message || e));
        }
      };
      el.addEventListener('nav-select', addIt);
      el.addEventListener('click', addIt);
      grid.appendChild(el);
    });
    root.appendChild(grid);
    showScreen('network');
  }

  function renderAddServerForm() {
    const root = $('#screen-network .content');
    root.innerHTML = `
      <h2 class="page-title" style="font-size:32px;margin-bottom:8px;">Add Network Server</h2>
      <p class="page-subtitle" style="margin-bottom:30px;">Enter your DLNA/UPnP server’s description URL. Common examples:<br>
      Plex &mdash; http://SERVER-IP:32469/dlna/;&nbsp; Windows Media Player &mdash; http://SERVER-IP:2869/upnphost/udhisapi.dll?...;&nbsp; Universal Media Server / Serviio &mdash; check the app’s DLNA settings page.</p>
      <div class="form-field">
        <label>Server name (optional)</label>
        <input class="input-box focusable" id="f-name" type="text" placeholder="Living Room Plex">
      </div>
      <div class="form-field">
        <label>Description URL</label>
        <input class="input-box focusable" id="f-url" type="text" placeholder="http://192.168.1.20:32469/dlna/">
        <div class="hint">Press OK to open the keyboard, Enter again to confirm.</div>
      </div>
      <div class="btn primary focusable" id="f-submit">${icon('plus', 18)} Add Server</div>
    `;
    $('#f-name').addEventListener('click', () => spatialNav.beginEditing($('#f-name')));
    $('#f-url').addEventListener('click', () => spatialNav.beginEditing($('#f-url')));
    $('#f-submit').addEventListener('nav-select', submitAddServer);
    $('#f-submit').addEventListener('click', submitAddServer);
    showScreen('network');
  }

  async function submitAddServer() {
    const name = $('#f-name').value.trim();
    const url = $('#f-url').value.trim();
    if (!url) { toast('Please enter a description URL'); return; }
    toast('Connecting…');
    try {
      const entry = await DlnaSource.addServer(name, url);
      toast('Added ' + entry.name);
      renderNetworkHome();
    } catch (e) {
      toast('Couldn’t connect: ' + (e.message || e));
    }
  }

  function openDlnaServer(server) {
    App.dlnaState = { server, trail: [{ id: '0', name: server.name }] };
    renderDlnaDir();
  }

  async function renderDlnaDir() {
    const myNav = beginNav();
    const root = $('#screen-network .content');
    root.innerHTML = loadingHtml('Browsing ' + App.dlnaState.server.name + '…');
    showScreen('network');
    const { server, trail } = App.dlnaState;
    const objectId = trail[trail.length - 1].id;
    try {
      const { items } = await DlnaSource.browse(server, objectId);
      if (staleNav(myNav)) return;
      root.innerHTML = '';
      root.appendChild(breadcrumbEl(trail.map((t) => t.name), (i) => {
        App.dlnaState.trail = App.dlnaState.trail.slice(0, i + 1);
        renderDlnaDir();
      }));
      if (trail.length === 1) {
        const removeBtn = document.createElement('div');
        removeBtn.className = 'btn focusable';
        removeBtn.style.marginBottom = '22px';
        removeBtn.textContent = 'Remove this server';
        const doRemove = () => { DlnaSource.removeServer(server.id); toast('Removed ' + server.name); renderNetworkHome(); };
        removeBtn.addEventListener('nav-select', doRemove);
        removeBtn.addEventListener('click', doRemove);
        root.appendChild(removeBtn);
      }
      if (!items.length) {
        root.appendChild(htmlToEl(emptyHtml('folder', 'Empty folder', 'Nothing playable in this folder.')));
      } else {
        const grid = document.createElement('div');
        grid.className = 'grid-track';
        const images = items.filter((it) => !it.isDir && it.kind === 'image');
        items.forEach((it) => {
          grid.appendChild(cardEl({
            name: it.name, isDir: it.isDir, kind: it.kind, size: it.size, uri: it.uri, thumbUri: it.thumbUri,
            onSelect: () => it.isDir ? drillDlna(it) : playDlnaFile(it, images),
          }));
        });
        root.appendChild(grid);
      }
    } catch (e) {
      if (!staleNav(myNav)) root.innerHTML = emptyHtml('network', 'Couldn’t browse server', e.message || String(e));
    }
  }

  function drillDlna(item) {
    App.dlnaState.trail.push({ id: item.id, name: item.name });
    renderDlnaDir();
  }

  function playDlnaFile(item, imageSiblings) {
    const key = 'dlna:' + App.dlnaState.server.id + ':' + item.id;
    if (item.kind === 'image') {
      const idx = Math.max(0, imageSiblings.findIndex((s) => s.uri === item.uri));
      openPhotoViewer(imageSiblings, idx, () => renderDlnaDir());
      return;
    }
    openPlayer({ key, title: item.name, uri: item.uri, sourceType: item.kind, backTo: () => renderDlnaDir() });
  }

  // ---------------- Settings ----------------
  function renderSettings() {
    const root = $('#screen-settings .content');
    const servers = DlnaSource.loadServers();
    root.innerHTML = `
      <h2 class="page-title" style="font-size:32px;">Settings</h2>
      <div class="row" style="margin-top:26px;">
        <div class="row-header"><div class="row-title">About</div></div>
        <p style="color:var(--ink-2);font-size:17px;max-width:640px;">Beam — a fast, beautiful local &amp; network media player for Samsung TVs. Built for browsing USB drives and DLNA servers with subtitle support and resume playback.</p>
      </div>
      <div class="row">
        <div class="row-header"><div class="row-title">Data</div></div>
        <div style="display:flex;gap:14px;">
          <div class="btn focusable" id="clear-history">Clear watch history</div>
          <div class="btn focusable" id="clear-servers">Remove all network servers (${servers.length})</div>
        </div>
      </div>
    `;
    $('#clear-history').addEventListener('nav-select', () => { localStorage.removeItem('beam.resume.v1'); toast('Watch history cleared'); });
    $('#clear-history').addEventListener('click', () => { localStorage.removeItem('beam.resume.v1'); toast('Watch history cleared'); });
    $('#clear-servers').addEventListener('nav-select', () => { localStorage.removeItem('beam.dlna.servers'); toast('Servers removed'); renderSettings(); });
    $('#clear-servers').addEventListener('click', () => { localStorage.removeItem('beam.dlna.servers'); toast('Servers removed'); renderSettings(); });
    showScreen('settings');
  }

  // ---------------- Helpers ----------------
  function breadcrumbEl(segments, onClick) {
    const el = document.createElement('div');
    el.className = 'breadcrumb';
    segments.forEach((s, i) => {
      const span = document.createElement('span');
      span.className = 'seg focusable';
      span.textContent = s;
      span.tabIndex = 0;
      span.addEventListener('nav-select', () => onClick(i));
      span.addEventListener('click', () => onClick(i));
      el.appendChild(span);
      if (i < segments.length - 1) {
        const sep = document.createElement('span');
        sep.className = 'sep';
        sep.textContent = '›';
        el.appendChild(sep);
      }
    });
    return el;
  }
  function loadingHtml(msg) {
    return `<div class="empty-state fade-in"><div class="icon-badge pulse">${icon('film', 30)}</div><h3>${msg}</h3></div>`;
  }
  function emptyHtml(iconName, title, body) {
    return `<div class="empty-state fade-in"><div class="icon-badge">${icon(iconName, 30)}</div><h3>${title}</h3><p>${body}</p></div>`;
  }
  function htmlToEl(html) {
    const d = document.createElement('div');
    d.innerHTML = html;
    return d.firstElementChild;
  }

  // ---------------- Player screen ----------------
  let hideControlsTimer = null;
  function openPlayer(source) {
    App.pip = false;
    $('#screen-player').classList.remove('pip');
    App._playerBackTo = source.backTo;
    showScreen('player');
    $('#player-title').textContent = UsbSource.prettyName(source.title);
    const audioArt = $('#player-audio-art');
    const isAudio = source.sourceType === 'audio';
    audioArt.classList.toggle('hidden', !isAudio);
    if (isAudio) audioArt.setAttribute('style', thumbStyle(source.title));
    App.player.open(source).then((resumeAt) => {
      if (resumeAt > 2) toast('Resuming from ' + formatTime(resumeAt));
    }).catch((e) => toast('Playback failed: ' + e.message));
    showPlayerControls();
  }

  function formatTime(sec) {
    sec = Math.floor(sec || 0);
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0');
  }

  function showPlayerControls() {
    $('#player-controls').classList.remove('hidden');
    clearTimeout(hideControlsTimer);
    hideControlsTimer = setTimeout(() => $('#player-controls').classList.add('hidden'), 4000);
  }

  function closePlayer() {
    App.player.close();
    $('#player-video').removeAttribute('src');
    const back = App._playerBackTo;
    navigateBackFromPlayer(back);
  }

  function navigateBackFromPlayer(back) {
    if (back) back(); else navigateTo(App._lastNonPlayerScreen || 'home');
  }

  // ---------------- Picture-in-picture ----------------
  // Shrinks the fullscreen player into a corner overlay and reactivates the
  // screen behind it, rather than making PiP a special third screen state —
  // the underlying screen gets completely normal D-pad navigation while the
  // video keeps playing untouched (same <video> element, just restyled).
  function enterPip() {
    if (App.activeScreen !== 'player' || !App.player.current) return;
    if (App.player.current.sourceType === 'image') return; // photo viewer has its own screen, N/A
    App.pip = true;
    $('#screen-player').classList.add('pip');
    const under = App._lastNonPlayerScreen || 'home';
    $all('.screen').forEach((s) => { if (s.id !== 'screen-player') s.classList.toggle('active', s.id === 'screen-' + under); });
    App.activeScreen = under;
    window.BeamPlayerActive = false;
    $('#sidebar').style.display = 'flex';
    spatialNav.focusFirst();
    updateSidebarExpansion();
  }

  function exitPip() {
    App.pip = false;
    $('#screen-player').classList.remove('pip');
    showScreen('player');
  }

  function togglePip() {
    if (App.pip) exitPip(); else enterPip();
    if (window.BeamSound) window.BeamSound.pip();
  }

  // A single play/pause press still just plays/pauses; a second press within
  // this window is read as a double-press and toggles PiP instead. Yellow
  // still works too (colored keys aren't reachable on every remote — some
  // universal/hotel remotes have no colored keys at all — so play/pause,
  // which every remote has, is the one guaranteed to reach every viewer).
  // The single-press action is deliberately delayed rather than fired
  // immediately-then-undone on a second press: undoing a play() that has
  // already started decoding is a visible flicker, whereas delaying it
  // briefly is imperceptible for a genuine single press.
  const PLAY_PAUSE_DOUBLE_MS = 320;
  let ppPending = false;
  let ppTimer = null;
  function handlePlayPausePress() {
    if (!App.player || !App.player.current) return;
    if (ppPending) {
      clearTimeout(ppTimer);
      ppPending = false;
      togglePip();
      return;
    }
    ppPending = true;
    ppTimer = setTimeout(() => {
      ppPending = false;
      App.player.togglePlay();
      showPlayerControls();
      if (window.BeamSound) window.BeamSound.select();
    }, PLAY_PAUSE_DOUBLE_MS);
  }

  // Tizen remote color keys: Red 403, Green 404, Yellow 405, Blue 406.
  // Bound globally (not gated on BeamPlayerActive) since it has to work both
  // from fullscreen playback and while browsing with PiP already active.
  document.addEventListener('keydown', (e) => {
    const isPipKey = e.keyCode === 405 || e.key === 'y' || e.key === 'Y';
    if (!isPipKey) return;
    if (App.activeScreen === 'player' || App.pip) { e.preventDefault(); togglePip(); }
  });

  // Dedicated hardware play/pause key: also bound globally, not gated on
  // BeamPlayerActive — it should reach the current video (and be
  // double-press-able into/out of PiP) whether the player is fullscreen or
  // already shrunk into a corner while the user browses.
  document.addEventListener('keydown', (e) => {
    const isHwPlayPause = e.code === 'MediaPlayPause' || e.keyCode === 10252;
    if (!isHwPlayPause) return;
    if (App.activeScreen !== 'player' && !App.pip) return;
    e.preventDefault();
    handlePlayPausePress();
  });

  function initPlayerKeys() {
    document.addEventListener('keydown', (e) => {
      if (!window.BeamPlayerActive) return;
      if (App.activeScreen === 'photo') { handlePhotoKey(e); return; }
      if (e.keyCode === 10009 || e.key === 'Backspace' || e.key === 'Escape') {
        e.preventDefault(); if (window.BeamSound) window.BeamSound.back(); closePlayer(); return;
      }
      // MediaPlayPause is handled by the always-on global listener above —
      // deliberately not repeated here, or a real hardware key press while
      // fullscreen would fire handlePlayPausePress() twice per press.
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); handlePlayPausePress(); return;
      }
      if (e.key === 'ArrowRight' || e.keyCode === 417) { e.preventDefault(); App.player.seekBy(10); showPlayerControls(); if (window.BeamSound) window.BeamSound.move(); return; }
      if (e.key === 'ArrowLeft' || e.keyCode === 412) { e.preventDefault(); App.player.seekBy(-10); showPlayerControls(); if (window.BeamSound) window.BeamSound.move(); return; }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); showPlayerControls(); return; }
    }, true);
  }

  function initPlayerUi() {
    const v = $('#player-video');
    App.player = new BeamPlayer(v);
    App.player.onTimeUpdate = (video) => {
      const bar = $('#player-progress-fill');
      if (video.duration) bar.style.width = (video.currentTime / video.duration * 100) + '%';
      $('#player-time').textContent = formatTime(video.currentTime) + ' / ' + formatTime(video.duration);
    };
    App.player.onEnded = () => closePlayer();
    App.player.onError = (err) => {
      const messages = {
        1: 'Playback was aborted.',
        2: 'Network error while loading this file.',
        3: 'This file is corrupt or uses an unsupported codec.',
        4: 'This format isn’t supported on this TV.',
      };
      toast(messages[err && err.code] || 'This file couldn’t be played.', 4000);
      console.error(err);
      setTimeout(() => { if (App.activeScreen === 'player') closePlayer(); }, 2200);
    };
    v.addEventListener('play', () => $('#player-playicon').classList.add('is-playing'));
    v.addEventListener('pause', () => $('#player-playicon').classList.remove('is-playing'));
    initPlayerKeys();
  }

  function playByKey(h) {
    // The resume map now stores the actual playback uri, so Home can resume
    // directly without re-browsing USB/DLNA.
    openPlayer({ key: h.key, title: h.title, uri: h.uri, sourceType: h.sourceType, backTo: () => renderHome() });
  }

  // ---------------- Photo viewer ----------------
  function openPhotoViewer(images, index, backTo) {
    App.photoState = { images, index, backTo };
    showScreen('photo');
    renderPhotoAt(index);
  }

  function renderPhotoAt(index) {
    const { images } = App.photoState;
    if (!images.length) return;
    const i = ((index % images.length) + images.length) % images.length;
    App.photoState.index = i;
    const item = images[i];
    const img = $('#photo-img');
    img.classList.remove('loaded');
    const loadHandler = () => { img.classList.add('loaded'); img.removeEventListener('load', loadHandler); };
    img.addEventListener('load', loadHandler);
    img.src = item.uri;
    img.alt = item.name;
    $('#photo-title').textContent = UsbSource.prettyName(item.name);
    $('#photo-counter').textContent = (i + 1) + ' / ' + images.length;
  }

  function closePhotoViewer() {
    const back = App.photoState && App.photoState.backTo;
    App.photoState = null;
    if (back) back(); else navigateTo(App._lastNonPlayerScreen || 'home');
  }

  function handlePhotoKey(e) {
    if (e.keyCode === 10009 || e.key === 'Backspace' || e.key === 'Escape') {
      e.preventDefault(); if (window.BeamSound) window.BeamSound.back(); closePhotoViewer(); return;
    }
    if (e.key === 'ArrowRight') { e.preventDefault(); renderPhotoAt(App.photoState.index + 1); if (window.BeamSound) window.BeamSound.move(); return; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); renderPhotoAt(App.photoState.index - 1); if (window.BeamSound) window.BeamSound.move(); return; }
  }

  spatialNav.onBack = () => {
    if (App.activeScreen === 'player') { closePlayer(); return; }
    if (App.activeScreen === 'photo') { closePhotoViewer(); return; }
    if (App.activeScreen !== 'home') navigateTo('home');
  };

  // Sidebar collapses to icons-only whenever focus isn't actually inside it,
  // expanding to show labels only while the user is navigating it directly —
  // reclaims screen width for content without reintroducing the old overlap
  // bug, since #sidebar's width and #main's left offset both animate off the
  // same --sidebar-w custom property in lockstep.
  function updateSidebarExpansion() {
    const sidebar = $('#sidebar');
    const expanded = !!(spatialNav.current && sidebar.contains(spatialNav.current));
    sidebar.classList.toggle('collapsed', !expanded);
    document.documentElement.style.setProperty(
      '--sidebar-w',
      expanded ? 'var(--sidebar-w-expanded)' : 'var(--sidebar-w-collapsed)'
    );
  }
  document.addEventListener('nav-focus', updateSidebarExpansion);

  // Boot splash: the visual sequence is entirely CSS keyframes (see
  // #splash in theme.css) and plays on its own the moment the element
  // paints — this just fires the laser sound in sync with it, then fades
  // and removes the overlay once the sequence has had time to land. Removed
  // outright (not just left at opacity:0) so a full-screen z-index:500 layer
  // doesn't linger over the app, even inert, for the rest of the session.
  function playSplash() {
    const splash = $('#splash');
    if (!splash) return;
    if (window.BeamSound) window.BeamSound.laser();
    setTimeout(() => {
      splash.classList.add('hide');
      splash.addEventListener('transitionend', () => splash.remove(), { once: true });
    }, 950);
  }

  document.addEventListener('DOMContentLoaded', () => {
    playSplash();
    initSidebar();
    initPlayerUi();
    renderHome();
    spatialNav.focusFirst();
    updateSidebarExpansion();
  });
})();
