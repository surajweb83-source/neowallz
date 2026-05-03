// ================================
//   NeoWallz — search.js
//   Live Search + Filters
// ================================

// ---- DEMO DATA (Supabase baad mein replace hoga) ----
const allWallpapers = [
  { id:'1',  title:'Naruto Sage Mode',      category:'anime',    resolution:'4K', is_featured:true,  likes_count:245, thumbnail_url:'https://picsum.photos/seed/naruto/400/700',  image_url:'https://picsum.photos/seed/naruto/1920/1080'  },
  { id:'2',  title:'Valorant Agents',       category:'gaming',   resolution:'2K', is_featured:false, likes_count:189, thumbnail_url:'https://picsum.photos/seed/valo/400/700',    image_url:'https://picsum.photos/seed/valo/1920/1080'    },
  { id:'3',  title:'Cyberpunk City Night',  category:'cyberpunk',resolution:'HD', is_featured:true,  likes_count:312, thumbnail_url:'https://picsum.photos/seed/cyber/400/700',   image_url:'https://picsum.photos/seed/cyber/1920/1080'   },
  { id:'4',  title:'Deep Space Galaxy',     category:'space',    resolution:'4K', is_featured:false, likes_count:98,  thumbnail_url:'https://picsum.photos/seed/space/400/700',   image_url:'https://picsum.photos/seed/space/1920/1080'   },
  { id:'5',  title:'Demon Slayer Tanjiro',  category:'anime',    resolution:'HD', is_featured:false, likes_count:421, thumbnail_url:'https://picsum.photos/seed/demon/400/700',   image_url:'https://picsum.photos/seed/demon/1920/1080'   },
  { id:'6',  title:'Minecraft Sunset',      category:'gaming',   resolution:'2K', is_featured:false, likes_count:156, thumbnail_url:'https://picsum.photos/seed/mine/400/700',    image_url:'https://picsum.photos/seed/mine/1920/1080'    },
  { id:'7',  title:'One Piece Luffy',       category:'anime',    resolution:'4K', is_featured:true,  likes_count:534, thumbnail_url:'https://picsum.photos/seed/luffy/400/700',   image_url:'https://picsum.photos/seed/luffy/1920/1080'   },
  { id:'8',  title:'GTA VI Miami',          category:'gaming',   resolution:'4K', is_featured:false, likes_count:678, thumbnail_url:'https://picsum.photos/seed/gta/400/700',     image_url:'https://picsum.photos/seed/gta/1920/1080'     },
  { id:'9',  title:'Neon Tokyo Street',     category:'cyberpunk',resolution:'2K', is_featured:false, likes_count:290, thumbnail_url:'https://picsum.photos/seed/tokyo/400/700',   image_url:'https://picsum.photos/seed/tokyo/1920/1080'   },
  { id:'10', title:'Milky Way Stars',       category:'space',    resolution:'4K', is_featured:true,  likes_count:445, thumbnail_url:'https://picsum.photos/seed/milky/400/700',   image_url:'https://picsum.photos/seed/milky/1920/1080'   },
  { id:'11', title:'Attack on Titan',       category:'anime',    resolution:'HD', is_featured:false, likes_count:388, thumbnail_url:'https://picsum.photos/seed/titan/400/700',   image_url:'https://picsum.photos/seed/titan/1920/1080'   },
  { id:'12', title:'CS2 Fire',              category:'gaming',   resolution:'HD', is_featured:false, likes_count:210, thumbnail_url:'https://picsum.photos/seed/cs2/400/700',     image_url:'https://picsum.photos/seed/cs2/1920/1080'     },
  { id:'13', title:'Dark Minimal Abstract', category:'abstract', resolution:'2K', is_featured:false, likes_count:167, thumbnail_url:'https://picsum.photos/seed/abst/400/700',    image_url:'https://picsum.photos/seed/abst/1920/1080'    },
  { id:'14', title:'Ferrari Night Drive',   category:'cars',     resolution:'4K', is_featured:false, likes_count:302, thumbnail_url:'https://picsum.photos/seed/ferrari/400/700', image_url:'https://picsum.photos/seed/ferrari/1920/1080' },
  { id:'15', title:'Forest Rain Nature',    category:'nature',   resolution:'HD', is_featured:false, likes_count:143, thumbnail_url:'https://picsum.photos/seed/forest/400/700',  image_url:'https://picsum.photos/seed/forest/1920/1080'  },
];

// ---- VARIABLES ----
let currentQuery = '';
let currentCategory = '';
let currentResolution = '';
let debounceTimer = null;

// ---- PAGE LOAD ----
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q') || '';

  if (q) {
    document.getElementById('mainSearch').value = q;
    currentQuery = q;
    document.getElementById('clearBtn').style.display = 'block';
  }

  runSearch();
  setupListeners();
});

// ---- SETUP LISTENERS ----
function setupListeners() {
  const input = document.getElementById('mainSearch');
  const clearBtn = document.getElementById('clearBtn');

  // Live search — type karo aur results aate jaao
  input.addEventListener('input', () => {
    currentQuery = input.value.trim();

    // Clear button show/hide
    clearBtn.style.display = currentQuery ? 'block' : 'none';

    // Debounce — 300ms ke baad search karo
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      showLiveDropdown(currentQuery);
      runSearch();
    }, 300);
  });

  // Enter key
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      closeDropdown();
      runSearch();
    }
    // Escape — dropdown band karo
    if (e.key === 'Escape') {
      closeDropdown();
      input.blur();
    }
  });

  // Clear button
  clearBtn.addEventListener('click', () => {
    input.value = '';
    currentQuery = '';
    clearBtn.style.display = 'none';
    closeDropdown();
    runSearch();
    input.focus();
  });

  // Click bahar — dropdown band karo
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-bar-wrapper')) {
      closeDropdown();
    }
  });
}

// ---- MAIN SEARCH FUNCTION ----
function runSearch() {
  const grid = document.getElementById('searchGrid');
  const countEl = document.getElementById('resultsCount');

  // Filter karo
  let results = allWallpapers.filter(w => {
    const matchQuery = !currentQuery ||
      w.title.toLowerCase().includes(currentQuery.toLowerCase()) ||
      w.category.toLowerCase().includes(currentQuery.toLowerCase());

    const matchCategory = !currentCategory ||
      w.category === currentCategory;

    const matchResolution = !currentResolution ||
      w.resolution === currentResolution;

    return matchQuery && matchCategory && matchResolution;
  });

  // Count update karo
  countEl.innerHTML = `<span>${results.length}</span> results`;

  // Grid render karo
  if (results.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <h3>Koi result nahi mila</h3>
        <p>"<strong>${currentQuery}</strong>" ke liye koi wallpaper nahi hai</p>
        <button class="btn btn-outline" onclick="clearSearch()">
          Clear Search
        </button>
      </div>
    `;
    return;
  }

  renderWallpaperGrid(results, 'searchGrid');
}

// ---- LIVE DROPDOWN ----
function showLiveDropdown(query) {
  const dropdown = document.getElementById('searchDropdown');

  if (!query || query.length < 2) {
    closeDropdown();
    return;
  }

  // Top 5 matches dhundho
  const matches = allWallpapers
    .filter(w =>
      w.title.toLowerCase().includes(query.toLowerCase()) ||
      w.category.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 5);

  if (matches.length === 0) {
    closeDropdown();
    return;
  }

  // Dropdown HTML banao
  dropdown.innerHTML = matches.map(w => `
    <div class="dropdown-item" onclick="selectDropdownItem('${w.id}', '${w.title}')">
      <img src="${w.thumbnail_url}" alt="${w.title}" />
      <div class="dropdown-item-info">
        <div class="d-title">${highlightMatch(w.title, query)}</div>
        <div class="d-cat">${w.category} • ${w.resolution}</div>
      </div>
    </div>
  `).join('');

  dropdown.classList.remove('hidden');
}

// Match wala text highlight karo
function highlightMatch(text, query) {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, `<span style="color:var(--color-cyan);font-weight:700;">$1</span>`);
}

// Dropdown close karo
function closeDropdown() {
  document.getElementById('searchDropdown').classList.add('hidden');
}

// Dropdown item select karo
function selectDropdownItem(id, title) {
  document.getElementById('mainSearch').value = title;
  currentQuery = title;
  document.getElementById('clearBtn').style.display = 'block';
  closeDropdown();
  runSearch();
}

// ---- SEARCH TRIGGER ----
function doSearch() {
  currentQuery = document.getElementById('mainSearch').value.trim();
  closeDropdown();
  runSearch();

  // URL update karo
  const url = new URL(window.location);
  url.searchParams.set('q', currentQuery);
  window.history.pushState({}, '', url);
}

// ---- TAG CLICK ----
function setTag(tag) {
  document.getElementById('mainSearch').value = tag;
  currentQuery = tag;
  document.getElementById('clearBtn').style.display = 'block';

  // Active class toggle
  document.querySelectorAll('.tag-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === tag);
  });

  closeDropdown();
  runSearch();
}

// ---- FILTERS ----
function applyFilters() {
  currentCategory = document.getElementById('categoryFilter').value;
  currentResolution = document.getElementById('resolutionFilter').value;
  runSearch();
}

// ---- CLEAR SEARCH ----
function clearSearch() {
  document.getElementById('mainSearch').value = '';
  currentQuery = '';
  document.getElementById('clearBtn').style.display = 'none';
  document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
  runSearch();
}