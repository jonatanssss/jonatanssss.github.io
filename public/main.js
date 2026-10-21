const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
function closeMenu() { menu?.setAttribute('aria-expanded', 'false'); nav?.classList.remove('is-open'); }
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
  if (open) animateIn(nav, { duration: motion.menu, distance: 6, opacity: .8 });
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
matchMedia('(min-width: 801px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
document.querySelector('[data-print]')?.addEventListener('click', () => window.print());
let toastTimer;
function toast(message) { const box = document.querySelector('#toast'); box.textContent = message; box.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => box.classList.remove('visible'), 3500); }
document.querySelector('[data-copy-email]')?.addEventListener('click', async event => {
  try { await navigator.clipboard.writeText(event.currentTarget.dataset.copyEmail); toast('Email address copied.'); }
  catch { toast('Please select and copy the email address above.'); }
});

// Durations share the CSS motion tokens. All content is visible without animation.
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const desktopMotion = matchMedia('(min-width: 801px)');
const motionStyles = getComputedStyle(document.documentElement);
const motion = {
  menu: parseFloat(motionStyles.getPropertyValue('--motion-menu')) || 240,
  reveal: parseFloat(motionStyles.getPropertyValue('--motion-reveal')) || 360,
  entrance: parseFloat(motionStyles.getPropertyValue('--motion-entrance')) || 400,
  ease: motionStyles.getPropertyValue('--ease-out').trim() || 'cubic-bezier(.22,1,.36,1)'
};
const seen = new WeakSet();
const running = new Set();
let revealObserver;
function animateIn(element, { duration = motion.reveal, delay = 0, distance = 12, opacity = .65 } = {}) {
  if (!element || motionPreference.matches || !Element.prototype.animate || element.contains(document.activeElement)) return;
  const animation = element.animate(
    [{ opacity, transform: `translateY(${distance}px)` }, { opacity: 1, transform: 'translateY(0)' }],
    { duration, delay, easing: motion.ease, fill: 'backwards' }
  );
  running.add(animation);
  animation.finished.catch(() => {}).finally(() => running.delete(animation));
}
function stopMotion() {
  revealObserver?.disconnect();
  running.forEach(animation => animation.cancel());
  running.clear();
}
function setupMotion() {
  stopMotion();
  if (motionPreference.matches || !desktopMotion.matches || !('IntersectionObserver' in window) || !Element.prototype.animate) return;
  revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const element = entry.target;
      revealObserver.unobserve(element);
      if (seen.has(element)) continue;
      seen.add(element);
      animateIn(element);
    }
  }, { threshold: .12 });
  document.querySelectorAll('.section-intro > div, .project-art, .experience-heading, .about-grid > div > h2, .contact-section h2, .contact-cta, .case-image figure, .case-part h2, .next-project .container').forEach(element => {
    if (element.getBoundingClientRect().top < window.innerHeight) seen.add(element);
    else if (!seen.has(element)) revealObserver.observe(element);
  });
}
motionPreference.addEventListener('change', setupMotion);
desktopMotion.addEventListener('change', setupMotion);
window.addEventListener('beforeprint', stopMotion);
window.addEventListener('afterprint', setupMotion);
document.addEventListener('focusin', () => {
  running.forEach(animation => { if (animation.effect?.target?.contains(document.activeElement)) animation.cancel(); });
});
setupMotion();

// A small entrance sequence, skipped on anchor links and restored scroll positions.
// On mobile only the opening text moves; content farther down remains still.
requestAnimationFrame(() => {
  if (window.scrollY > 20 || window.location.hash) return;
  animateIn(document.querySelector('.hero-copy, .case-hero h1'), { duration: motion.entrance });
  if (desktopMotion.matches) {
    animateIn(document.querySelector('.hero-portrait, .case-summary'), { duration: motion.entrance, delay: 60 });
    animateIn(document.querySelector('.current-strip'), { duration: motion.reveal, delay: 100, distance: 6 });
  }
});

// Keep the current section identifiable without taking over scrolling.
if ('IntersectionObserver' in window) {
  const sectionLinks = [...document.querySelectorAll('#main-nav a')].filter(a => /#(work|experience|about|contact)$/.test(a.hash));
  const sectionObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      sectionLinks.forEach(link => {
        if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
  }, { rootMargin: '-10% 0px -65% 0px' });
  document.querySelectorAll('main > section[id], .hero').forEach(section => sectionObserver.observe(section));
}
