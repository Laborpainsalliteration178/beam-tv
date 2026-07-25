/*
 * Environment shim: when running on a real Tizen TV, window.tizen / window.webapis
 * are provided by the platform. When previewing in a normal desktop browser,
 * we fall back to a small mock filesystem + mock DLNA server so the UI/UX
 * can be built and tested without hardware.
 */
(function (global) {
  const isTizen = typeof global.tizen !== 'undefined';
  const isTV = isTizen && !!global.tizen.tvinputdevice;

  global.BeamEnv = {
    isTizen,
    isTV,
    isPreview: !isTizen,
  };

  if (!isTizen) {
    // ---- Mock tizen.filesystem for browser preview ----
    function mockPhoto(c1, c2) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${c1})"/><stop offset="1" stop-color="hsl(${c2})"/></linearGradient></defs><rect width="640" height="360" fill="url(#g)"/></svg>`;
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    }
    const mockUsbTree = {
      name: 'USB Drive (SanDisk 64GB)',
      type: 'dir',
      children: [
        {
          name: 'Movies',
          type: 'dir',
          children: [
            { name: 'Interstellar.2014.2160p.mkv', type: 'file', size: 18200000000, ext: 'mkv' },
            { name: 'Interstellar.2014.2160p.en.srt', type: 'file', size: 82000, ext: 'srt', previewUri: 'data:text/vtt,WEBVTT%0A%0A00:00:01.000 --> 00:00:04.000%0AMock subtitle line for preview testing.' },
            { name: 'The.Matrix.1999.1080p.mp4', type: 'file', size: 4200000000, ext: 'mp4' },
            { name: 'Dune.Part.Two.2024.mkv', type: 'file', size: 15600000000, ext: 'mkv' },
          ],
        },
        {
          name: 'TV Shows',
          type: 'dir',
          children: [
            { name: 'Severance.S02E01.mkv', type: 'file', size: 2100000000, ext: 'mkv' },
            { name: 'Severance.S02E02.mkv', type: 'file', size: 2050000000, ext: 'mkv' },
          ],
        },
        {
          name: 'Home Videos',
          type: 'dir',
          children: [
            { name: 'Family Trip 2025.mp4', type: 'file', size: 900000000, ext: 'mp4' },
            { name: 'Birthday Playlist.mp3', type: 'file', size: 8400000, ext: 'mp3' },
          ],
        },
        {
          name: 'Photos',
          type: 'dir',
          children: [
            { name: 'Sunset_Beach.jpg', type: 'file', size: 4200000, ext: 'jpg', previewUri: mockPhoto('245 90% 55%', '25 90% 60%') },
            { name: 'Family_Reunion.jpg', type: 'file', size: 5100000, ext: 'jpg', previewUri: mockPhoto('160 70% 40%', '90 70% 55%') },
            { name: 'Mountain_Hike.png', type: 'file', size: 6800000, ext: 'png', previewUri: mockPhoto('205 80% 45%', '190 80% 65%') },
          ],
        },
        { name: 'vacation_clip.mov', type: 'file', size: 320000000, ext: 'mov' },
      ],
    };

    global.tizen = {
      filesystem: {
        listStorages(onSuccess) {
          setTimeout(() => onSuccess([
            { label: 'internal', type: 'INTERNAL', state: 'MOUNTED' },
            { label: 'removable/usb1', type: 'EXTERNAL', state: 'MOUNTED' },
          ]), 250);
        },
        resolve(uri, onSuccess) {
          setTimeout(() => onSuccess({ __mock: true, fullPath: uri }), 50);
        },
        _mockTree: mockUsbTree,
      },
      tvinputdevice: {
        getSupportedKeys() { return []; },
        registerKey() {},
        unregisterKey() {},
      },
      application: {
        getCurrentApplication() {
          return { exit() { console.log('[preview] exit() called'); } };
        },
      },
      systeminfo: {
        addPropertyValueChangeListener() {},
      },
    };
  }
})(window);
