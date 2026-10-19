// UI motion: re-trigger staggered entrance whenever dashboard content is re-rendered,
// count up stat numbers, and shake the login card on failed attempts.
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function countUp(el) {
    const target = parseInt(el.textContent, 10);
    if (isNaN(target) || target === 0 || reduce || document.hidden) return;
    const dur = 700, start = performance.now();
    el.textContent = '0';
    (function tick(now) {
      const t = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
    })(start);
    // rAF pauses in background tabs; guarantee the real value lands
    setTimeout(() => { el.textContent = target; }, dur + 100);
  }

  function animateMain(main) {
    main.classList.remove('anim-in');
    [...main.children].forEach((c, i) => c.style.setProperty('--i', i));
    main.querySelectorAll('.stat-card').forEach((c, i) => c.style.setProperty('--i', i));
    main.querySelectorAll('.ledger-row-item').forEach((c, i) => c.style.setProperty('--i', Math.min(i, 12)));
    void main.offsetWidth; // restart animations
    main.classList.add('anim-in');
    main.querySelectorAll('.stat-card-num').forEach(countUp);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const main = document.getElementById('dashMain');
    if (main) new MutationObserver(() => animateMain(main)).observe(main, { childList: true });

    const err = document.getElementById('loginError');
    const card = document.getElementById('loginCard');
    if (err && card) new MutationObserver(() => {
      if (!err.classList.contains('visible')) return;
      card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
    }).observe(err, { attributes: true, attributeFilter: ['class'] });
  });
})();
