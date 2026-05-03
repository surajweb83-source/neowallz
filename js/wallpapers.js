// ================================
//   NeoWallz — wallpapers.js
//   Cards + Lazy Load + Infinite Scroll
// ================================

// ================================================
//   LAZY LOAD — IntersectionObserver
// ================================================

let lazyObserver = null;

function initLazyImages() {
  if (!('IntersectionObserver' in window)) {
    // Fallback — sab images load karo
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      img.classList.add('loaded');
    });
    return;
  }

  lazyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      if (!img.dataset.src) return;

      // Image load karo
      const tempImg = new Image();
      tempImg.onload = () => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        img.classList.add('loaded');
        // Parent skeleton hatao
        img.closest('.wall-card')?.classList.remove('skeleton-card');
      };
      tempImg.onerror = () => {
        img.src = 'https://picsum.photos/seed/error/400/700';
        img.classList.add('loaded');
      };
      tempImg.src = img.dataset.src;

      lazyObserver.unobserve(img);
    });
  }, {
    rootMargin: '300px 0px', // 300px pehle load start karo
    threshold: 0
  });
}

// Naye images ko observe karo
function observeNewImages() {
  if (!lazyObserver) initLazyImages();
  document.querySelectorAll('img[data-src]').forEach(img => {
    lazyObserver?.observe(img);
  });
}

// ================================================
//   CARD HTML BANAO
// ================================================

function createWallCard(wall, index = 0) {
  // Lazy load ke liye data-src use karo
  return `
    <div class="wall-card fade-in"
         style="animation-delay:${Math.min(index * 0.04, 0.4)}s"
         onclick="goToDetail('${wall.id}')">

      <!-- Lazy loaded image -->
      <img
        data-src="${wall.thumbnail_url}"
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 700'%3E%3Crect width='400' height='700' fill='%231a1a24'/%3E%3C/svg%3E"
        alt="${wall.title}"
        class="lazy lazy-blur"
        loading="lazy"
        decoding="async"
      />

      <!-- Resolution badge -->
      <div class="wall-badge">${wall.resolution || 'HD'}</div>

      <!-- Featured badge -->
      ${wall.is_featured
        ? `<div class="wall-featured-badge">⭐ Featured</div>`
        : ''}

      <!-- Hover overlay -->
      <div class="wall-card-overlay">
        <div class="wall-card-info">
          <div class="wall-card-title">${wall.title}</div>
          <div class="wall-card-category">
            ${wall.category || 'Wallpaper'}
          </div>
        </div>
        <div class="wall-card-actions">
          <button
            class="wall-action-btn like-btn"
            onclick="handleLike(event, '${wall.id}')"
            id="like-${wall.id}">
            ❤️ ${wall.likes_count || 0}
          </button>
          <button
            class="wall-action-btn dl-btn"
            onclick="handleQuickDownload(event, '${wall.id}', '${wall.image_url}')"
            id="dl-${wall.id}">
            <span class="dl-icon">⬇️</span> Save
          </button>
        </div>
      </div>
    </div>
  `;
}

// ================================================
//   GRID RENDER
// ================================================

function renderWallpaperGrid(wallpapers, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!wallpapers || wallpapers.length === 0) {
    container.innerHTML = `
      <div style="
        grid-column:1/-1;text-align:center;
        padding:80px 20px;color:var(--text-muted);">
        <div style="font-size:3.5rem;margin-bottom:14px;">🖼️</div>
        <p style="font-family:var(--font-sub-heading);
                  font-size:1rem;color:var(--text-secondary);">
          Koi wallpaper nahi mila
        </p>
      </div>`;
    return;
  }

  container.innerHTML = wallpapers
    .map((w, i) => createWallCard(w, i))
    .join('');

  // Naye images lazy load karo
  observeNewImages();
}

// ================================================
//   SKELETON SCREENS
// ================================================

function showSkeletons(containerId, count = 6) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = Array(count)
    .fill(0)
    .map((_, i) => `
      <div class="wall-card skeleton"
           style="animation-delay:${i * 0.05}s">
      </div>
    `)
    .join('');
}

// Skeleton with staggered appearance
function showStaggeredSkeletons(containerId, count = 12) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  // Ek ek karke add karo thode delay ke saath
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const div = document.createElement('div');
      div.className = 'wall-card skeleton';
      div.style.opacity = '0';
      div.style.transition = 'opacity 0.3s ease';
      container.appendChild(div);
      requestAnimationFrame(() => { div.style.opacity = '1'; });
    }, i * 30);
  }
}

// ================================================
//   INFINITE SCROLL
// ================================================

let infiniteObserver = null;

function initInfiniteScroll(loadMoreFn) {
  const sentinel = document.getElementById('infiniteScrollSentinel');
  if (!sentinel) return;

  // Purana observer hatao
  if (infiniteObserver) infiniteObserver.disconnect();

  if (!('IntersectionObserver' in window)) {
    // Fallback — load more button use karo
    return;
  }

  infiniteObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadMoreFn();
      }
    });
  }, {
    rootMargin: '400px 0px', // 400px pehle trigger karo
    threshold: 0
  });

  infiniteObserver.observe(sentinel);
}

function destroyInfiniteScroll() {
  if (infiniteObserver) {
    infiniteObserver.disconnect();
    infiniteObserver = null;
  }
}

// ================================================
//   APPEND MODE — Infinite scroll ke liye
// ================================================

function appendWallpapers(wallpapers, containerId, startIndex = 0) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Remove existing skeletons at end
  container.querySelectorAll('.skeleton-append')
    .forEach(s => s.remove());

  // Wallpapers append karo
  const fragment = document.createDocumentFragment();
  wallpapers.forEach((wall, i) => {
    const temp = document.createElement('div');
    temp.innerHTML = createWallCard(wall, startIndex + i);
    const card = temp.firstElementChild;
    fragment.appendChild(card);
  });

  container.appendChild(fragment);

  // Naye images observe karo
  observeNewImages();
}

// Append skeletons (loading indicator)
function appendSkeletons(containerId, count = 6) {
  const container = document.getElementById(containerId);
  if (!container) return;

  for (let i = 0; i < count; i++) {
    const div = document.createElement('div');
    div.className = 'wall-card skeleton skeleton-append';
    container.appendChild(div);
  }
}

function removeAppendedSkeletons(containerId) {
  const container = document.getElementById(containerId);
  container?.querySelectorAll('.skeleton-append')
    .forEach(s => s.remove());
}

// ================================================
//   LIKE FEATURE
// ================================================

async function handleLike(event, wallId) {
  event.stopPropagation();

  const user = await getCurrentUserAsync();
  if (!user) {
    showLoginPrompt(
      '❤️',
      'Like karne ke liye login karo',
      'Free account banao aur wallpapers like karo!'
    );
    return;
  }

  const btn = document.getElementById(`like-${wallId}`);
  if (!btn) return;

  btn.classList.add('animate');
  setTimeout(() => btn.classList.remove('animate'), 400);

  const supabase = window._supabase;
  if (!supabase) return;

  try {
    const { data: existing } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('wallpaper_id', wallId)
      .single();

    const curCount = parseInt(
      btn.textContent.replace('❤️', '').trim()
    ) || 0;

    if (existing) {
      await supabase.from('likes').delete()
        .eq('user_id', user.id)
        .eq('wallpaper_id', wallId);
      btn.classList.remove('liked');
      btn.innerHTML = `❤️ ${Math.max(0, curCount - 1)}`;
    } else {
      await supabase.from('likes').insert({
        user_id: user.id,
        wallpaper_id: wallId
      });
      btn.classList.add('liked');
      btn.innerHTML = `❤️ ${curCount + 1}`;
    }
  } catch (err) {
    console.warn('Like error:', err);
  }
}

// ================================================
//   DOWNLOAD FEATURE
// ================================================

async function handleQuickDownload(event, wallId, imageUrl) {
  event.stopPropagation();

  const btn = document.getElementById(`dl-${wallId}`);
  if (!btn) return;

  btn.classList.add('loading');
  const icon = btn.querySelector('.dl-icon');
  if (icon) icon.textContent = '⏳';

  try {
    await saveDownloadHistory(wallId, 'pc-hd');

    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `neowallz-${wallId}.jpg`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Count increment
    const supabase = window._supabase;
    if (supabase) {
      supabase.from('wallpapers')
        .select('downloads_count')
        .eq('id', wallId)
        .single()
        .then(({ data }) => {
          if (data) {
            supabase.from('wallpapers')
              .update({ downloads_count: (data.downloads_count || 0) + 1 })
              .eq('id', wallId);
          }
        });
    }

    btn.classList.remove('loading');
    btn.classList.add('done');
    btn.innerHTML = '✅ Saved!';

    // Toast show karo
    if (window.showToast) {
      window.showToast('✅ Download started!', 'success');
    }

    setTimeout(() => {
      btn.classList.remove('done');
      btn.innerHTML = '<span class="dl-icon">⬇️</span> Save';
    }, 3000);

  } catch (err) {
    btn.classList.remove('loading');
    btn.innerHTML = '<span class="dl-icon">⬇️</span> Save';
    console.warn('Download error:', err);
  }
}

async function saveDownloadHistory(wallId, deviceType) {
  const supabase = window._supabase;
  if (!supabase) return;
  try {
    await supabase.from('downloads').insert({
      wallpaper_id: wallId,
      device_type: deviceType,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('History save nahi hua:', err);
  }
}

// ================================================
//   LOGIN PROMPT
// ================================================

function showLoginPrompt(
  icon = '❤️',
  title = 'Login karo',
  desc = ''
) {
  const bg = document.getElementById('loginPromptBg');
  if (bg) {
    const iconEl  = document.getElementById('lpIcon');
    const titleEl = document.getElementById('lpTitle');
    const descEl  = document.getElementById('lpDesc');
    if (iconEl)  iconEl.textContent  = icon;
    if (titleEl) titleEl.textContent = title;
    if (descEl)  descEl.textContent  = desc;
    bg.classList.add('open');
    return;
  }
  // Fallback
  const ok = confirm(`${icon} ${title}\n\n${desc}\n\nLogin page pe jaoge?`);
  if (ok) window.location.href = '/pages/login.html';
}

// ================================================
//   HELPERS
// ================================================

function goToDetail(id) {
  window.location.href = `/pages/wallpaper-detail.html?id=${id}`;
}

async function getCurrentUserAsync() {
  try {
    const supabase = window._supabase;
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
  } catch {
    return null;
  }
}

function getCurrentUser() {
  return null;
}

// DOM ready pe lazy load init karo
document.addEventListener('DOMContentLoaded', () => {
  initLazyImages();
  observeNewImages();
});