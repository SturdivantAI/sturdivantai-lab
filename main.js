// SturdivantAI Lab — site behavior
// Behaviors: mobile nav, section reveal, scrollspy, reading progress,
// back-to-top, external link handling. Each earns its place; nothing decorative.

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Mobile nav ----------
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    // Close the index on outside click or Escape
    document.addEventListener('click', function (e) {
      if (links.classList.contains('open') && !e.target.closest('.nav')) {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  // ---------- Section reveal ----------
  var targets = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    targets.forEach(function (el) { io.observe(el); });
  }

  // ---------- Scrollspy: highlight the section you're reading (tabs + index) ----------
  var navAnchors = document.querySelectorAll('.nav-links a[href^="#"], .nav-tabs a[href^="#"]');
  var anchorMap = {};
  navAnchors.forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    (anchorMap[id] = anchorMap[id] || []).push(a);
  });
  if ('IntersectionObserver' in window && navAnchors.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && anchorMap[entry.target.id]) {
          navAnchors.forEach(function (a) { a.classList.remove('active'); });
          anchorMap[entry.target.id].forEach(function (a) { a.classList.add('active'); });
        }
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { spy.observe(s); });
  }

  // ---------- Reading progress + back-to-top ----------
  var progress = document.querySelector('.progress');
  var toTop = document.querySelector('.to-top');
  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    if (toTop) toTop.classList.toggle('show', window.scrollY > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  }

  // ---------- External links open in a new tab ----------
  document.querySelectorAll('a[href^="http"]').forEach(function (a) {
    a.target = '_blank';
    a.rel = 'noopener';
  });

  // ---------- Contact form: AJAX submit with native POST fallback ----------
  var form = document.getElementById('contact-form');
  if (form && window.fetch) {
    var status = form.querySelector('.form-status');
    var button = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (button) button.disabled = true;
      if (status) { status.textContent = 'SENDING…'; status.className = 'form-status mono'; }
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (res) {
        if (res.ok) {
          form.reset();
          if (status) { status.textContent = 'RECEIVED. THE LAB WILL REPLY.'; status.className = 'form-status mono ok'; }
        } else {
          return res.json().then(function (data) {
            var msg = (data && data.errors) ? data.errors.map(function (x) { return x.message; }).join(' / ') : 'SUBMISSION FAILED. USE THE PROFILE LINKS.';
            if (status) { status.textContent = msg.toUpperCase(); status.className = 'form-status mono err'; }
          });
        }
      }).catch(function () {
        if (status) { status.textContent = 'NETWORK ERROR. USE THE PROFILE LINKS.'; status.className = 'form-status mono err'; }
      }).finally(function () {
        if (button) button.disabled = false;
      });
    });
  }

  // ---------- Footer year ----------
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
