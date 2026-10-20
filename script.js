(function () {
  const config = window.INVITATION;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function applyConfig() {
    $$('[data-config-text]').forEach((node) => {
      node.innerHTML = config[node.dataset.configText] || '';
    });
    $$('[data-config-src]').forEach((node) => {
      node.src = config[node.dataset.configSrc] || '';
    });
    if (config.music) {
      $('#music').src = config.music;
    }
    if (config.churchLocationLink) {
      const mapBtn = $('#mapButton');
      if (mapBtn) mapBtn.href = config.churchLocationLink;
    }
    if (config.receptionLocationLink) {
      const recBtn = $('#receptionMapButton');
      if (recBtn) recBtn.href = config.receptionLocationLink;
    }
    if (config.openingPhoto) {
      document.documentElement.style.setProperty('--opening-image', 'url("' + config.openingPhoto + '")');
    }

    // Check for personalized invitee name via URL (e.g. ?to=John+and+Family)
    const urlParams = new URLSearchParams(window.location.search);
    const guest = urlParams.get('to') || urlParams.get('guest');
    if (guest) {
      const guestNode = $('#guestName');
      if (guestNode) {
        guestNode.textContent = `Dear ${guest},`;
        guestNode.style.display = 'block';
      }
    }
  }

  function setupCalendarButtons() {
    const churchCalBtn = $('#churchCalButton');
    if (churchCalBtn) {
      const start = '20261126T100000Z'; // 3:30 PM IST (UTC+5:30) is 10:00 AM UTC
      const end = '20261126T123000Z';
      const title = encodeURIComponent("Rejin & Amrutha — Holy Sacrament & Wedding Ceremony");
      const details = encodeURIComponent("Holy Sacrament & Wedding Ceremony of Rejin Joy & Amrutha Paul at St. Antony's Church, Kodanad.");
      const loc = encodeURIComponent("St. Antony's Church, Kodanad, Kerala");
      churchCalBtn.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${loc}`;
    }

    const recCalBtn = $('#receptionCalButton');
    if (recCalBtn) {
      const start = '20261126T130000Z'; // 6:30 PM IST is 1:00 PM UTC
      const end = '20261126T160000Z';
      const title = encodeURIComponent("Rejin & Amrutha — Wedding Reception");
      const details = encodeURIComponent("Wedding Reception celebrating Rejin Joy & Amrutha Paul at River Front Resort, Kodanad.");
      const loc = encodeURIComponent("River Front Resort, Kodanad, Kerala");
      recCalBtn.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${loc}`;
    }
  }

  function openInvite() {
    $('#cover').classList.add('is-open');
    document.body.classList.add('is-opened');
    setTimeout(() => {
      $('#invitation').scrollIntoView({ behavior: 'smooth' });
    }, 360);
    playMusic();
  }

  async function playMusic() {
    const music = $('#music');
    if (!music.src) return;
    try {
      await music.play();
      const toggle = $('#musicToggle');
      if (toggle) {
        toggle.classList.add('is-playing');
        const label = toggle.querySelector('.music-label');
        if (label) label.textContent = 'Pause';
      }
    } catch (error) {
      const toggle = $('#musicToggle');
      if (toggle) {
        const label = toggle.querySelector('.music-label');
        if (label) label.textContent = 'Music';
      }
    }
  }

  function toggleMusic() {
    const music = $('#music');
    if (music.paused) {
      playMusic();
    } else {
      music.pause();
      const toggle = $('#musicToggle');
      if (toggle) {
        toggle.classList.remove('is-playing');
        const label = toggle.querySelector('.music-label');
        if (label) label.textContent = 'Music';
      }
    }
  }

  function setupRevealAnimation() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    $$('.reveal').forEach((node) => observer.observe(node));
  }

  function setupCountdown() {
    const units = {
      days: $('[data-unit="days"]'),
      hours: $('[data-unit="hours"]'),
      minutes: $('[data-unit="minutes"]'),
      seconds: $('[data-unit="seconds"]')
    };

    const target = new Date('2026-11-26T15:30:00+05:30').getTime();

    function tick() {
      const now = Date.now();
      const distance = Math.max(0, target - now);

      units.days.textContent = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
      units.hours.textContent = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
      units.minutes.textContent = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
      units.seconds.textContent = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
    }

    tick();
    setInterval(tick, 1000);
  }

  function setupScratchCard() {
    const card = $('#scratchCard');
    const canvas = $('#scratchCanvas');
    if (!card || !canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let scratching = false;
    let revealed = false;
    let scratchMoves = 0;

    function resize() {
      const ratio = window.devicePixelRatio || 1;
      const rect = card.getBoundingClientRect();
      canvas.width = Math.round(rect.width * ratio);
      canvas.height = Math.round(rect.height * ratio);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      paintCover(rect.width, rect.height);
    }

    function paintCover(width, height) {
      if (revealed) return;
      // Luxury Sapphire & Metallic Silver foil gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#0f2756');
      gradient.addColorStop(0.35, '#2563eb');
      gradient.addColorStop(0.65, '#cbd5e1');
      gradient.addColorStop(1, '#1d4ed8');

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Silver & diamond shimmer specks
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      for (let i = 0; i < 75; i += 1) {
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.8 + 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(147, 197, 253, 0.6)';
      for (let i = 0; i < 35; i += 1) {
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2 + 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function point(event) {
      const rect = canvas.getBoundingClientRect();
      const touch = event.touches && event.touches[0] ? event.touches[0] : event;
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    }

    function scratch(event) {
      if (!scratching || revealed) return;
      if (event.cancelable) event.preventDefault();
      const pos = point(event);

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 34, 0, Math.PI * 2);
      ctx.fill();

      const hint = $('#scratchHint');
      if (hint) hint.style.opacity = '0';
      scratchMoves += 1;
      checkReveal();
    }

    function checkReveal() {
      if (revealed) return;
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let clear = 0;
      for (let i = 3; i < pixels.length; i += 40) {
        if (pixels[i] < 20) clear += 1;
      }
      if (clear / (pixels.length / 40) > 0.18 || scratchMoves > 12) {
        revealed = true;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        burstPetals();
      }
    }

    ['mousedown', 'touchstart'].forEach((eventName) => {
      canvas.addEventListener(eventName, (event) => {
        scratching = true;
        scratch(event);
      }, { passive: false });
    });

    ['mousemove', 'touchmove'].forEach((eventName) => {
      canvas.addEventListener(eventName, scratch, { passive: false });
    });

    ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach((eventName) => {
      canvas.addEventListener(eventName, () => {
        scratching = false;
      });
    });

    window.addEventListener('resize', resize);
    resize();
  }

  function burstPetals() {
    const layer = $('#petalLayer');
    if (!layer) return;
    for (let i = 0; i < 40; i += 1) {
      const petal = document.createElement('span');
      petal.className = 'petal';
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.setProperty('--x', `${(Math.random() - 0.5) * 160}px`);
      petal.style.animationDelay = `${Math.random() * 0.5}s`;
      petal.style.animationDuration = `${2.6 + Math.random() * 2.4}s`;
      layer.appendChild(petal);
      setTimeout(() => petal.remove(), 5500);
    }
  }

  async function shareInvite() {
    const shareData = {
      title: `${config.couple} — Wedding Invitation`,
      text: `${config.couple} joyfully invite you to celebrate their wedding!\n\n` +
            `📅 Thursday, 26 November 2026\n` +
            `⛪ Ceremony: St. Antony's Church, Kodanad · 3:30 PM\n` +
            `🥂 Reception: River Front Resort, Kodanad · 6:30 PM`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        // Fallback to WhatsApp
      }
    }

    const text = encodeURIComponent(`${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener');
  }

  // Initialize All Systems
  applyConfig();
  setupCalendarButtons();
  setupRevealAnimation();
  setupCountdown();
  setupScratchCard();

  $('#openInvite').addEventListener('click', openInvite);
  $('#cover').addEventListener('click', (event) => {
    if (event.target.id !== 'openInvite' && !event.target.closest('#openInvite')) {
      openInvite();
    }
  });
  $('#musicToggle').addEventListener('click', toggleMusic);
  $('#shareButton').addEventListener('click', shareInvite);
})();
