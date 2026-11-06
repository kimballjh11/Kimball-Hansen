document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav    = document.querySelector('nav');
  if (!toggle || !nav) return;

  // Set active link based on current page
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPage === '') currentPage = 'index.html';
  nav.querySelectorAll('ul li a').forEach(function (link) {
    link.classList.remove('active');
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });

  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', open);
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', function (e) {
    if (!nav.contains(e.target)) {
      nav.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
});
