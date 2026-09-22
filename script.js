(function(){
  "use strict";

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ---------- mobile nav ---------- */
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('mobileMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', function(){
      var isOpen = !menu.hidden;
      menu.hidden = isOpen;
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });
    menu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ menu.hidden = true; toggle.setAttribute('aria-expanded','false'); });
    });
  }

  /* ---------- capability tabs ---------- */
  var tabButtons = Array.prototype.slice.call(document.querySelectorAll('.tab-btn'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.tab-panel'));
  tabButtons.forEach(function(btn){
    btn.addEventListener('click', function(){
      tabButtons.forEach(function(b){ b.setAttribute('aria-selected', b === btn ? 'true' : 'false'); });
      var key = btn.getAttribute('data-tab');
      panels.forEach(function(p){
        p.setAttribute('data-active', p.getAttribute('data-panel') === key ? 'true' : 'false');
      });
    });
  });

  /* ---------- scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function(el){ revealObserver.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }

  /* ---------- animated count-up numbers ---------- */
  function formatNumber(n, decimals){
    if (decimals > 0) { return n.toFixed(decimals); }
    return Math.round(n).toLocaleString('en-US');
  }

  function runCountUp(el){
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) { return; }
    var suffix = el.getAttribute('data-suffix') || '';
    var decimals = (el.getAttribute('data-count').indexOf('.') > -1) ? 1 : 0;
    var duration = 1400;
    var startTime = null;

    function easeOutExpo(x){ return x === 1 ? 1 : 1 - Math.pow(2, -10 * x); }

    function step(ts){
      if (startTime === null) { startTime = ts; }
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = easeOutExpo(progress);
      var value = target * eased;
      el.textContent = formatNumber(value, decimals) + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = formatNumber(target, decimals) + suffix;
      }
    }
    window.requestAnimationFrame(step);
  }

  var countEls = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  if ('IntersectionObserver' in window && countEls.length) {
    var countObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          runCountUp(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    countEls.forEach(function(el){ countObserver.observe(el); });
  } else {
    countEls.forEach(function(el){
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      if (!isNaN(target)) { el.textContent = target + suffix; }
    });
  }

  /* ---------- mini bar charts + radial rings (scroll-triggered) ---------- */
  var barEls = Array.prototype.slice.call(document.querySelectorAll('.bar[data-pct]'));
  var ringEls = Array.prototype.slice.call(document.querySelectorAll('.ring[data-pct]'));

  function animateBar(el){
    var pct = parseFloat(el.getAttribute('data-pct')) || 0;
    requestAnimationFrame(function(){ el.style.height = pct + '%'; });
  }
  function animateRing(el){
    var target = parseFloat(el.getAttribute('data-pct')) || 0;
    var duration = 1200;
    var startTime = null;
    function step(ts){
      if (startTime === null) { startTime = ts; }
      var progress = Math.min((ts - startTime) / duration, 1);
      var val = target * progress;
      el.style.setProperty('--pct', val.toFixed(1));
      if (progress < 1) { window.requestAnimationFrame(step); }
      else { el.style.setProperty('--pct', target); }
    }
    window.requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window && (barEls.length || ringEls.length)) {
    var vizObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          if (entry.target.classList.contains('ring')) { animateRing(entry.target); }
          else { animateBar(entry.target); }
          vizObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });
    barEls.forEach(function(el){ vizObserver.observe(el); });
    ringEls.forEach(function(el){ vizObserver.observe(el); });
  } else {
    barEls.forEach(animateBar);
    ringEls.forEach(function(el){ el.style.setProperty('--pct', el.getAttribute('data-pct') || 0); });
  }

  /* ---------- analytics proof modal ---------- */
  var analyticsModal = document.getElementById('analyticsModal');
  var openAnalyticsBtn = document.getElementById('openAnalytics');
  if (analyticsModal && openAnalyticsBtn) {
    function openModal(){
      analyticsModal.hidden = false;
      document.body.style.overflow = 'hidden';
    }
    function closeModal(){
      analyticsModal.hidden = true;
      document.body.style.overflow = '';
    }
    openAnalyticsBtn.addEventListener('click', openModal);
    analyticsModal.querySelectorAll('[data-close]').forEach(function(el){
      el.addEventListener('click', closeModal);
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && !analyticsModal.hidden) { closeModal(); }
    });
  }

  /* ---------- work samples: scroll to matching gallery tile ---------- */
  var samplesLinks = Array.prototype.slice.call(document.querySelectorAll('.case-samples-link'));
  samplesLinks.forEach(function(btn){
    btn.addEventListener('click', function(){
      var brand = btn.getAttribute('data-brand');
      if (!brand) { return; }
      var target = document.querySelector('.g-tile[data-brand="' + brand + '"]');
      if (!target) { return; }
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('pulse');
      setTimeout(function(){ target.classList.remove('pulse'); }, 2200);
    });
  });

})();
