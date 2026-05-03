// ================================
//   NeoWallz — auth.js
//   Login, Register, Logout
// ================================

// ---- Current User get karo ----
function getCurrentUser() {
  try {
    const supabase = window._supabase;
    if (!supabase) return null;
    // Sync way — session se user
    const session = supabase.auth.getSession();
    return session?.data?.session?.user || null;
  } catch {
    return null;
  }
}

// ---- Auth State Change — har page pe chale ----
async function initAuth() {
  const supabase = window._supabase;
  if (!supabase) return;

  // Current session check karo
  const { data: { session } } = await supabase.auth.getSession();
  updateNavForUser(session?.user || null);

  // Auth state change sun o
  supabase.auth.onAuthStateChange((_event, session) => {
    updateNavForUser(session?.user || null);
  });
}

// ---- Navbar update karo based on login ----
function updateNavForUser(user) {
  const loginBtn = document.getElementById('loginBtn');
  const userAvatar = document.getElementById('userAvatar');

  if (!loginBtn) return;

  if (user) {
    // Login hai — avatar dikhao
    loginBtn.style.display = 'none';
    if (userAvatar) {
      userAvatar.style.display = 'flex';
      const initial = (user.user_metadata?.username || user.email || 'U')[0].toUpperCase();
      userAvatar.textContent = initial;
    }
  } else {
    // Logout hai — login button dikhao
    loginBtn.style.display = 'flex';
    if (userAvatar) userAvatar.style.display = 'none';
  }
}

// ---- Logout ----
async function logout() {
  const supabase = window._supabase;
  if (!supabase) return;
  await supabase.auth.signOut();
  window.location.href = '/index.html';
}

// Page load pe auth init karo
document.addEventListener('DOMContentLoaded', initAuth);