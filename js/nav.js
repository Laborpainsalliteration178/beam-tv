/*
 * Geometry-based spatial navigation for D-pad remotes.
 * Any element with class="focusable" inside the active .screen (or inside
 * a temporary overlay marked [data-nav-scope]) is a navigation candidate.
 */
(function (global) {
  const KEP = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    Up: 'up', Down: 'down', Left: 'left', Right: 'right',
  };

  class SpatialNav {
    constructor() {
      this.current = null;
      this.onSelect = null; // callback(el)
      this.onBack = null;   // callback()
      this.editing = false; // true while a real <input> has native focus
      this._bind();
    }

    _bind() {
      document.addEventListener('keydown', (e) => this._handleKey(e), true);
    }

    _scopeRoot() {
      const overlay = document.querySelector('[data-nav-scope]:not(.hidden)');
      if (overlay) return overlay;
      return document.querySelector('.screen.active') || document;
    }

    _candidates() {
      const root = this._scopeRoot();
      // The sidebar lives outside every .screen, so without this Left-arrow
      // could never reach it once focus moved into a screen's content — it
      // was structurally unreachable via the remote. It naturally drops out
      // of the list below (visibility:hidden) while a chromeless screen
      // (player/photo) hides it.
      const sidebar = document.getElementById('sidebar');
      const nodes = Array.from(root.querySelectorAll('.focusable'));
      if (sidebar && root !== sidebar && !root.contains(sidebar)) {
        nodes.push(...sidebar.querySelectorAll('.focusable'));
      }
      return nodes.filter((el) => {
        if (el.offsetParent === null && el.tagName !== 'BODY') return false;
        const style = getComputedStyle(el);
        return style.visibility !== 'hidden' && style.display !== 'none';
      });
    }

    focusFirst(container) {
      const root = container || this._scopeRoot();
      const el = root.querySelector('.focusable[data-autofocus]') || root.querySelector('.focusable');
      if (el) this.setFocus(el);
    }

    setFocus(el) {
      if (!el || el === this.current) return;
      if (this.current) this.current.classList.remove('focused');
      this.current = el;
      el.classList.add('focused');
      if (typeof el.scrollIntoViewIfNeeded === 'function') {
        el.scrollIntoViewIfNeeded({ block: 'nearest' });
      } else {
        el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
      el.dispatchEvent(new CustomEvent('nav-focus', { bubbles: true }));
      if (global.BeamSound) global.BeamSound.move();
    }

    // Layout-space geometry (offsetTop/Left chain) rather than
    // getBoundingClientRect(), so a focused card's hover transform
    // (translateY/scale) never skews direction math for its neighbors.
    _layoutRect(el) {
      let x = 0, y = 0, node = el;
      while (node) { x += node.offsetLeft; y += node.offsetTop; node = node.offsetParent; }
      return { left: x, top: y, width: el.offsetWidth, height: el.offsetHeight };
    }

    _bestCandidate(candidates, direction) {
      const from = this._layoutRect(this.current);
      const fx = from.left + from.width / 2;
      const fy = from.top + from.height / 2;

      let best = null;
      let bestScore = Infinity;

      for (const el of candidates) {
        const r = this._layoutRect(el);
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = cx - fx;
        const dy = cy - fy;

        let primary, perpendicular, aligned;
        if (direction === 'left') { primary = -dx; perpendicular = Math.abs(dy); aligned = dx < -1; }
        else if (direction === 'right') { primary = dx; perpendicular = Math.abs(dy); aligned = dx > 1; }
        else if (direction === 'up') { primary = -dy; perpendicular = Math.abs(dx); aligned = dy < -1; }
        else { primary = dy; perpendicular = Math.abs(dx); aligned = dy > 1; }

        if (!aligned) continue;
        const score = primary * 1.0 + perpendicular * 2.2;
        if (score < bestScore) { bestScore = score; best = el; }
      }
      return best;
    }

    move(direction) {
      if (!this.current) {
        this.focusFirst();
        return;
      }
      const all = this._candidates().filter((el) => el !== this.current);

      // Prefer staying within the same region (sidebar vs. screen content)
      // before ever considering a cross-region jump. Without this, moving
      // Down from a breadcrumb sitting near the top of a screen could score
      // a sidebar item as "closer" than the content grid directly below it
      // (short vertical distance beats a tall card's far-off center), which
      // reads as the remote randomly teleporting to the sidebar instead of
      // going where it visibly points.
      const sidebar = document.getElementById('sidebar');
      const currentInSidebar = !!(sidebar && sidebar.contains(this.current));
      const sameRegion = all.filter((el) => !!(sidebar && sidebar.contains(el)) === currentInSidebar);

      const best = this._bestCandidate(sameRegion, direction) || this._bestCandidate(all, direction);
      if (best) this.setFocus(best);
    }

    // Puts a text <input> into real editable focus so the platform's
    // on-screen keyboard appears and arrow/backspace keys work as text
    // editing instead of spatial navigation. Enter (or blur) commits.
    beginEditing(input) {
      this.editing = true;
      input.focus();
      if (input.setSelectionRange) input.setSelectionRange(input.value.length, input.value.length);
      let exited = false;
      // Sets state synchronously rather than solely reacting to the 'blur'
      // event — some WebKit/embedded builds are inconsistent about firing
      // blur promptly (or at all) for a programmatic .blur() call, and this
      // flag is what unblocks the D-pad again, so it can't be left hostage
      // to that event actually arriving.
      const exit = () => {
        if (exited) return;
        exited = true;
        this.editing = false;
        input.removeEventListener('blur', exit);
        input.removeEventListener('keydown', onKey);
        input.dispatchEvent(new CustomEvent('field-committed', { bubbles: true }));
      };
      input.addEventListener('blur', exit);
      const onKey = (ke) => {
        // Enter confirms. The remote's dedicated Back button (keyCode 10009 /
        // XF86Back) also exits editing — without this, Back did nothing while
        // typing (the global handler skips input while `editing` is true) and
        // there was no way out of a text field short of pressing Enter.
        // Deliberately NOT keying off plain 'Backspace' here: that has to stay
        // reserved for deleting a character, or typing would be unusable.
        if (ke.key === 'Enter' || ke.keyCode === 10009 || ke.key === 'XF86Back' || ke.key === 'Escape') {
          ke.preventDefault();
          input.blur();
          exit();
        }
      };
      input.addEventListener('keydown', onKey);
    }

    _handleKey(e) {
      if (this.editing) return; // let the native input handle its own keys
      if (global.BeamPlayerActive) return; // player screen handles its own keys
      const dir = KEP[e.key];
      if (dir) {
        e.preventDefault();
        this.move(dir);
        return;
      }
      if (e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault();
        if (this.current) {
          if (this.current.tagName === 'INPUT') { this.beginEditing(this.current); return; }
          if (global.BeamSound) global.BeamSound.select();
          this.current.dispatchEvent(new CustomEvent('nav-select', { bubbles: true }));
          if (this.onSelect) this.onSelect(this.current);
        }
        return;
      }
      // Tizen remote "Return/Back" key: keyCode 10009, browsers: Backspace/Escape
      if (e.keyCode === 10009 || e.key === 'Backspace' || e.key === 'Escape' || e.key === 'XF86Back') {
        e.preventDefault();
        if (global.BeamSound) global.BeamSound.back();
        if (this.onBack) this.onBack();
      }
    }
  }

  global.spatialNav = new SpatialNav();
})(window);
