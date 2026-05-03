// ================================
//   NeoWallz — main.js
//   Global JS — Har page pe chale
// ================================

// ============================================
//   DARK / LIGHT MODE
// ============================================

const html         = document.documentElement;
const themeToggle  = document.getElementById('themeToggle');

// Saved theme load karo
const savedTheme = localStorage.getItem('nw-theme') || 'dark';
applyTheme(savedTheme);

// Theme apply karo
function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('nw-theme', theme);

  if (themeToggle) {
    themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
    themeToggle.title = theme === 'dark'
      ? 'Light mode pe switch karo'
      : 'Dark mode pe switch karo';
  }

  // Meta theme color (browser UI)
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.content = theme === 'dark' ? '#0a0a0f' : '#f0f2f5';
  }
}

// Toggle karo
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current  = html.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';

    // Smooth transition add karo
    html.style.transition = 'background 0.3s ease, color 0.3s ease';
    applyTheme(newTheme);

    // Animation effect
    themeToggle.style.transform = 'rotate(20deg) scale(1.2)';
    setTimeout(() => {
      themeToggle.style.transform = '';
    }, 300);
  });
}

// ============================================
//   HAMBURGER MENU (Mobile)
// ============================================

const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('active');

    // Hamburger animation
    const spans = hamburger.querySelectorAll('span');
    if (hamburger.classList.contains('active')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    }
  });

  // Click bahar se close karo
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar')) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.querySelectorAll('span').forEach(s => {
        s.style.transform = '';
        s.style.opacity   = '';
      });
    }
  });
}

// ============================================
//   "/" KEY — Search Focus
// ============================================

document.addEventListener('keydown', (e) => {
  const tag = document.activeElement.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;

  if (e.key === '/') {
    e.preventDefault();
    const searchInput =
      document.getElementById('heroSearch')    ||
      document.getElementById('mainSearch')    ||
      document.getElementById('wallSearch');

    if (searchInput) {
      searchInput.focus();
      searchInput.select();

      // Visual feedback
      searchInput.closest('.search-box, .search-bar-big, .filter-search')
        ?.classList.add('focused');
      setTimeout(() => {
        searchInput.closest('.search-box, .search-bar-big, .filter-search')
          ?.classList.remove('focused');
      }, 1000);
    }
  }

  // Escape key — modals close karo
  if (e.key === 'Escape') {
    document.querySelectorAll('.open[id$="Bg"], .open[id$="Modal"]')
      .forEach(el => el.classList.remove('open'));
    document.body.style.overflow = '';
  }
});

// ============================================
//   NAVBAR SCROLL EFFECT
// ============================================

const navbar = document.getElementById('navbar');
if (navbar) {
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    // Blur + opacity effect
    if (currentScroll > 50) {
      navbar.style.background = 'rgba(10, 10, 15, 0.98)';
      navbar.style.borderBottomColor = 'rgba(42,42,58,0.8)';
    } else {
      navbar.style.background = 'rgba(10, 10, 15, 0.85)';
      navbar.style.borderBottomColor = '';
    }

    // Light mode ke liye
    if (html.getAttribute('data-theme') === 'light') {
      if (currentScroll > 50) {
        navbar.style.background = 'rgba(240, 242, 245, 0.98)';
      } else {
        navbar.style.background = 'rgba(240, 242, 245, 0.85)';
      }
    }

    lastScroll = currentScroll;
  });
}

// ============================================
//   BACK TO TOP BUTTON
// ============================================

const backTopBtn = document.createElement('button');
backTopBtn.id = 'backToTop';
backTopBtn.innerHTML = '↑';
backTopBtn.setAttribute('title', 'Back to top');
backTopBtn.style.cssText = `
  position: fixed;
  bottom: 24px;
  right: 20px;
  width: 44px;
  height: 44px;
  background: var(--color-purple);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 900;
  box-shadow: 0 4px 16px rgba(124,58,237,0.5);
  transition: all 0.3s ease;
  font-family: sans-serif;
`;
document.body.appendChild(backTopBtn);

window.addEventListener('scroll', () => {
  if (window.scrollY > 400) {
    backTopBtn.style.display = 'flex';
    backTopBtn.style.opacity = '1';
  } else {
    backTopBtn.style.opacity = '0';
    setTimeout(() => {
      if (window.scrollY <= 400) backTopBtn.style.display = 'none';
    }, 300);
  }
});

backTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

backTopBtn.addEventListener('mouseover', () => {
  backTopBtn.style.transform = 'translateY(-3px)';
  backTopBtn.style.boxShadow = '0 8px 24px rgba(124,58,237,0.7)';
});
backTopBtn.addEventListener('mouseout', () => {
  backTopBtn.style.transform = '';
  backTopBtn.style.boxShadow = '0 4px 16px rgba(124,58,237,0.5)';
});

// ============================================
//   COOKIE CONSENT BANNER
// ============================================

function showCookieBanner() {
  // Already accepted? skip karo
  if (localStorage.getItem('nw-cookies-accepted')) return;

  const banner = document.createElement('div');
  banner.id = 'cookieBanner';
  banner.style.cssText = `
    position: fixed;
    bottom: 0; left: 0; right: 0;
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
    padding: 16px 20px;
    z-index: 800;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
  `;

  banner.innerHTML = `
    <div style="flex:1;min-width:200px;">
      <p style="color:var(--text-secondary);font-size:13px;margin:0;">
        🍪 Hum essential cookies use karte hain — theme save karne ke liye.
        Koi tracking nahi, koi ads nahi.
        <a href="/pages/legal/privacy.html"
           style="color:var(--color-cyan);text-decoration:none;">
          Privacy Policy
        </a>
      </p>
    </div>
    <div style="display:flex;gap:8px;flex-shrink:0;">
      <button onclick="acceptCookies()"
        style="
          background:var(--color-purple);color:white;
          border:none;padding:8px 20px;border-radius:6px;
          font-family:var(--font-sub-heading);font-size:13px;
          font-weight:600;cursor:pointer;
          transition:background 0.2s;">
        ✅ Accept
      </button>
      <button onclick="document.getElementById('cookieBanner').remove()"
        style="
          background:none;
          border:1px solid var(--border-color);
          color:var(--text-muted);padding:8px 16px;
          border-radius:6px;font-size:13px;cursor:pointer;">
        ✕
      </button>
    </div>
  `;

  document.body.appendChild(banner);
}

function acceptCookies() {
  localStorage.setItem('nw-cookies-accepted', '1');
  const banner = document.getElementById('cookieBanner');
  if (banner) {
    banner.style.transform = 'translateY(100%)';
    banner.style.transition = 'transform 0.3s ease';
    setTimeout(() => banner.remove(), 300);
  }
}

// Cookie banner 1 second baad dikhao
setTimeout(showCookieBanner, 1000);

// ============================================
//   LAZY LOADING IMAGES
// ============================================

function initLazyLoad() {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        }
      });
    }, { rootMargin: '200px' });

    document.querySelectorAll('img[data-src]').forEach(img => {
      observer.observe(img);
    });
  }
}

// DOM ready pe lazy load init karo
document.addEventListener('DOMContentLoaded', initLazyLoad);

// ============================================
//   SMOOTH PAGE TRANSITIONS
// ============================================

// Page load animation
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.3s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });
});

// ============================================
//   ACTIVE NAV LINK
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath && currentPath.includes(linkPath) && linkPath !== '/') {
      link.classList.add('active');
    }
    if (linkPath === '/index.html' && currentPath === '/') {
      link.classList.add('active');
    }
  });
});

// ============================================
//   UTILITY FUNCTIONS
// ============================================

// Toast notification
function showToast(message, type = 'info', duration = 3000) {
  const existing = document.getElementById('nwToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'nwToast';

  const colors = {
    success: { bg: 'rgba(34,197,94,0.15)',  border: 'rgba(34,197,94,0.4)',  color: '#4ade80' },
    error:   { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.4)',  color: '#f87171' },
    info:    { bg: 'rgba(6,182,212,0.15)',   border: 'rgba(6,182,212,0.4)',  color: '#22d3ee' },
  };
  const c = colors[type] || colors.info;

  toast.style.cssText = `
    position: fixed;
    top: 80px; right: 20px;
    background: ${c.bg};
    border: 1px solid ${c.border};
    color: ${c.color};
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-family: var(--font-sub-heading);
    font-weight: 600;
    z-index: 9999;
    max-width: 320px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    backdrop-filter: blur(8px);
    transform: translateX(120%);
    transition: transform 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Slide in
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
  });

  // Auto remove
  setTimeout(() => {
    toast.style.transform = 'translateX(120%)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Window pe available karo
window.showToast = showToast;