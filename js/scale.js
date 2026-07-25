(function () {
  // Real screen.width/height (the panel's native resolution) rather than
  // window.innerWidth/innerHeight (the viewport being fit *into* that panel)
  // — on a real TV these are normally the same number, but only screen.*
  // reflects "what resolution is this actual display" if the two ever
  // diverge. In desktop preview, screen.* is the dev's monitor and tells us
  // nothing about a TV, so fall back to the window size there instead so
  // resizing the preview window is a usable way to test each size tier.
  function resolutionClass() {
    const isTizen = !!(window.BeamEnv && window.BeamEnv.isTizen);
    const w = isTizen ? (screen.width || window.innerWidth) : window.innerWidth;
    if (w >= 3840) return '4k';
    if (w < 1920) return 'hd';
    return 'fhd';
  }
  // Set once a real TV has been measured — see the comment in fit() below.
  let frozen = false;

  function fit() {
    const stage = document.getElementById('stage');
    if (!stage) return;
    const isTizen = !!(window.BeamEnv && window.BeamEnv.isTizen);
    // A real TV's panel resolution is static — nothing on the device ever
    // resizes it at runtime. The one thing that *does* fire a 'resize' event
    // after first paint is the on-screen keyboard: Tizen's WebKit shrinks
    // window.innerWidth/innerHeight for it exactly like a mobile browser
    // does, rather than overlaying it as a separate layer. Reacting to that
    // by recomputing scale/position against the shrunk viewport was
    // squashing and shifting the *entire* app around the keyboard instead of
    // leaving the keyboard to sit on top of a stable layout — measure once
    // on a real TV and ignore every resize after that. Desktop preview has
    // no keyboard doing this, so resize stays live there, which is also what
    // makes manually resizing the preview window a usable way to test the
    // different --pip-w/h size tiers below.
    if (isTizen && frozen) return;
    const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    const x = (window.innerWidth - 1920 * scale) / 2;
    const y = (window.innerHeight - 1080 * scale) / 2;
    stage.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    document.documentElement.setAttribute('data-res', resolutionClass());
    if (isTizen) frozen = true;
  }
  window.addEventListener('resize', fit);
  document.addEventListener('DOMContentLoaded', fit);
  fit();
})();
