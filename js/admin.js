// ================================
//   NeoWallz — admin.js
//   Admin Panel Logic
// ================================

// ---- Admin check karo ----
async function checkAdminAccess() {
  const supabase = window._supabase;
  if (!supabase) return false;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const role = session.user.user_metadata?.role;
    return role === 'admin';
  } catch {
    return false;
  }
}

// ---- Admin guard — page pe lagao ----
async function requireAdmin() {
  const isAdmin = await checkAdminAccess();
  if (!isAdmin) {
    document.getElementById('adminLayout').style.display = 'none';
    document.getElementById('accessDenied').style.display = 'block';
    return false;
  }

  // Sidebar user info fill karo
  fillSidebarUser();
  return true;
}

// ---- Sidebar user fill ----
async function fillSidebarUser() {
  const supabase = window._supabase;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const user = session.user;
  const username = user.user_metadata?.username ||
                   user.email?.split('@')[0] || 'Admin';

  const nameEl = document.getElementById('sidebarUserName');
  const avatarEl = document.getElementById('sidebarAvatar');

  if (nameEl) nameEl.textContent = username;
  if (avatarEl) avatarEl.textContent = username[0].toUpperCase();
}

// ---- Sidebar mobile toggle ----
function toggleSidebar() {
  const sidebar = document.getElementById('adminSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar?.classList.toggle('open');
  overlay?.classList.toggle('open');
}

// ---- Cloudinary Upload ----
async function uploadToCloudinary(file, onProgress) {
  // Step 2 mein setup kiya tha
  const CLOUD_NAME   = 'YOUR_CLOUD_NAME';
  const UPLOAD_PRESET = 'neowallz_unsigned';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'neowallz');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Progress track karo
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress(pct);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          url: data.secure_url,
          thumbnail_url: data.secure_url.replace(
            '/upload/',
            '/upload/w_400,h_700,c_fill,q_80/'
          ),
          public_id: data.public_id
        });
      } else {
        reject(new Error('Cloudinary upload fail hua'));
      }
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.open('POST',
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);
    xhr.send(formData);
  });
}

// ---- Supabase mein wallpaper save karo ----
async function saveWallpaperToDB(wallData) {
  const supabase = window._supabase;
  const { data, error } = await supabase
    .from('wallpapers')
    .insert(wallData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ---- Wallpaper update karo ----
async function updateWallpaper(id, updates) {
  const supabase = window._supabase;
  const { error } = await supabase
    .from('wallpapers')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
}

// ---- Wallpaper delete karo ----
async function deleteWallpaper(id) {
  const supabase = window._supabase;
  const { error } = await supabase
    .from('wallpapers')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ---- Featured toggle karo ----
async function toggleFeatured(id, current) {
  await updateWallpaper(id, { is_featured: !current });
}

// ---- Admin alert dikhao ----
function showAdminAlert(elId, msg, type = 'error') {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = (type === 'error' ? '⚠️ ' : '✅ ') + msg;
  el.className = `admin-alert ${type}`;
  setTimeout(() => { el.className = 'admin-alert'; }, 4000);
}

// ---- Confirm delete modal ----
function confirmDelete(message, onConfirm) {
  const ok = confirm(`⚠️ ${message}\n\nYe action undo nahi ho sakta!`);
  if (ok) onConfirm();
}

// ---- Tags input setup ----
function setupTagsInput(inputId, wrapperId) {
  const input   = document.getElementById(inputId);
  const wrapper = document.getElementById(wrapperId);
  if (!input || !wrapper) return;

  const tags = [];

  input.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.value.trim()) {
      e.preventDefault();
      const tag = input.value.trim().replace(',', '');
      if (tag && !tags.includes(tag)) {
        tags.push(tag);
        renderTagPills(tags, wrapper, input, inputId);
      }
      input.value = '';
    }
    if (e.key === 'Backspace' && !input.value && tags.length) {
      tags.pop();
      renderTagPills(tags, wrapper, input, inputId);
    }
  });
}

function renderTagPills(tags, wrapper, input, inputId) {
  // Remove existing pills
  wrapper.querySelectorAll('.tag-pill').forEach(p => p.remove());

  tags.forEach((tag, i) => {
    const pill = document.createElement('span');
    pill.className = 'tag-pill';
    pill.innerHTML = `${tag}
      <button class="tag-pill-remove"
              onclick="removeTag(${i}, '${inputId}')">✕</button>`;
    wrapper.insertBefore(pill, input);
  });

  // Hidden input update karo
  const hidden = document.getElementById(inputId + 'Hidden');
  if (hidden) hidden.value = JSON.stringify(tags);
}

function removeTag(index, inputId) {
  // Rebuild tags
  const wrapper = document.getElementById(inputId + 'Wrap');
  const pills = wrapper?.querySelectorAll('.tag-pill');
  if (!pills) return;
  const tags = Array.from(pills).map(p =>
    p.textContent.replace('✕', '').trim()
  );
  tags.splice(index, 1);
  const input = document.getElementById(inputId);
  renderTagPills(tags, wrapper, input, inputId);
}

// ---- Format numbers ----
function formatNum(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n/1000).toFixed(1) + 'K';
  return n?.toString() || '0';
}