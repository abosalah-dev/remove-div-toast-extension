(function () {

  /* ========== SETTINGS ========== */

  const selectorsToRemove = [
    'div[role="dialog"]',
    'div[data-uia="nf-modal-background"]',
    'div.nf-modal.interstitial-full-screen'
  ];

  const requiredText = ['Netflix Household'];

  /* ========== STYLES ========== */

  if (document.head && !document.getElementById("nf-helper-style")) {
    const style = document.createElement("style");
    style.id = "nf-helper-style";
    style.textContent = `
      #toast-bar {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(.95);
        background: #111;
        color: #fff;
        padding: 14px 22px;
        border-radius: 12px;
        font-size: 15px;
        box-shadow: 0 20px 40px rgba(0,0,0,.45);
        opacity: 0;
        transition: all .3s ease;
        z-index: 999999;
        pointer-events: none;
        text-align: center;
      }
      #toast-bar.show {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }

      #video-toggle-btn {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 999999;
        background: #e50914;
        color: #fff;
        border: none;
        border-radius: 50px;
        padding: 12px 18px;
        font-size: 14px;
        cursor: pointer;
        box-shadow: 0 10px 25px rgba(0,0,0,.4);
        transition: opacity .3s ease;
      }

      #speed-container {
        position: fixed;
        bottom: 75px;
        right: 20px;
        z-index: 999999;
        background: rgba(20, 20, 20, 0.92);
        padding: 12px 16px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,.5);
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 160px;
        transition: opacity .3s ease;
        font-family: system-ui, -apple-system, sans-serif;
      }

      #speed-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      #speed-label {
        color: #aaa;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      #speed-value {
        color: #fff;
        font-size: 18px;
        font-weight: 600;
      }

      #video-speed-bar {
        width: 100%;
        height: 6px;
        -webkit-appearance: none;
        appearance: none;
        background: rgba(255,255,255,0.2);
        border-radius: 3px;
        outline: none;
        cursor: pointer;
      }

      #video-speed-bar::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 16px;
        height: 16px;
        background: #e50914;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,.4);
        transition: transform .15s ease;
      }

      #video-speed-bar::-webkit-slider-thumb:hover {
        transform: scale(1.15);
      }

      #video-speed-bar::-moz-range-thumb {
        width: 16px;
        height: 16px;
        background: #e50914;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,.4);
      }

      .controls-hidden {
        opacity: 0;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  }

  /* ========== TOAST ========== */

  function showToast(msg, showCredit = false) {
    if (!document.body) return;
    let toast = document.getElementById("toast-bar");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast-bar";
      document.body.appendChild(toast);
    }
    if (showCredit) {
      toast.innerHTML = `${msg}<div style="font-size:11px;opacity:0.6;margin-top:6px;">Made with ❤️ by Ahmed Salah</div>`;
    } else {
      toast.textContent = msg;
    }
    toast.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  /* ========== POPUP REMOVER ========== */

  function removeTargets() {
    selectorsToRemove.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        if (
          selector === 'div[role="dialog"]' &&
          !requiredText.some(t => el.innerText.includes(t))
        ) return;

        el.remove();
        showToast("✅ Netflix block bypassed", true);
      });
    });
  }

  removeTargets();
  if (document.body) {
    new MutationObserver(removeTargets).observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /* ========== VIDEO CONTROLS ========== */

  let btn, speedContainer, speedBar, speedValue, mouseTimer;

  function injectControls() {
    // Only show controls on Netflix
    if (!window.location.hostname.includes('netflix.com')) return;

    if (!btn) {
      btn = document.createElement("button");
      btn.id = "video-toggle-btn";
      btn.textContent = "⏯ Play / Pause";

      btn.onclick = () => {
        const video = document.querySelector("video");
        if (!video) {
          showToast("❌ No video found");
          return;
        }
        video.paused ? video.play() : video.pause();
      };

      document.body.appendChild(btn);
    }

    if (!speedContainer) {
      // Container
      speedContainer = document.createElement("div");
      speedContainer.id = "speed-container";

      // Header (label + value)
      const header = document.createElement("div");
      header.id = "speed-header";

      const label = document.createElement("span");
      label.id = "speed-label";
      label.textContent = "Speed";

      speedValue = document.createElement("span");
      speedValue.id = "speed-value";
      speedValue.textContent = "1x";

      header.appendChild(label);
      header.appendChild(speedValue);

      // Slider
      speedBar = document.createElement("input");
      speedBar.id = "video-speed-bar";
      speedBar.type = "range";
      speedBar.min = "0.5";
      speedBar.max = "2";
      speedBar.step = "0.25";
      speedBar.value = "1";

      speedBar.oninput = () => {
        const video = document.querySelector("video");
        if (!video) return;
        video.playbackRate = parseFloat(speedBar.value);
        speedValue.textContent = speedBar.value + "x";
      };

      // Assemble
      speedContainer.appendChild(header);
      speedContainer.appendChild(speedBar);
      document.body.appendChild(speedContainer);
    }
  }

  injectControls();
  new MutationObserver(injectControls).observe(document.body, {
    childList: true,
    subtree: true
  });

  /* ========== AUTO HIDE ON MOUSE IDLE ========== */

  function showControls() {
    if (!btn || !speedContainer) return;

    btn.classList.remove("controls-hidden");
    speedContainer.classList.remove("controls-hidden");

    clearTimeout(mouseTimer);
    mouseTimer = setTimeout(() => {
      btn.classList.add("controls-hidden");
      speedContainer.classList.add("controls-hidden");
    }, 2000);
  }

  document.addEventListener("mousemove", showControls);
  showControls();

})();
