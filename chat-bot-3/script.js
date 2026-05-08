// script.js
// ─────────────────────────────────────────────────────────────
//  SigmaDoxs — Shared Auth & Token Utilities
//  Used by index.html; helper functions imported by other pages.
// ─────────────────────────────────────────────────────────────

const SD_API = 'http://127.0.0.1:8000';

/* ── Session helpers ──────────────────────────────────────── */

function getSession() {
  return localStorage.getItem('sd_session');
}

function requireAuth() {
  const user = getSession();
  if (!user) { window.location.href = 'index.html'; return null; }
  return user;
}

function getUserData(user) {
  const raw = localStorage.getItem('sd_user_' + user);
  return raw ? JSON.parse(raw) : null;
}

function saveUserData(user, data) {
  localStorage.setItem('sd_user_' + user, JSON.stringify(data));
}

function logout() {
  localStorage.removeItem('sd_session');
  window.location.href = 'index.html';
}

/* ── Token management ─────────────────────────────────────── */

/**
 * Deducts `amount` tokens from the current user.
 * Returns false if insufficient balance.
 */
function deductTokens(amount) {
  const user = getSession();
  if (!user) return false;
  const data = getUserData(user);
  if (!data || data.tokens < amount) return false;
  data.tokens -= amount;
  saveUserData(user, data);
  return true;
}

function getTokenBalance() {
  const user = getSession();
  if (!user) return 0;
  const data = getUserData(user);
  return data ? data.tokens : 0;
}

/* ── File → base64 handoff for processing.html ────────────── */

/**
 * Reads a File object as a base64 data URL and stores metadata
 * in localStorage so processing.html can pick it up.
 */
async function handoffFileToProcessor(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem('sd_pending_file_b64',  reader.result);
      localStorage.setItem('sd_pending_file_name', file.name);
      localStorage.setItem('sd_pending_file_size', file.size);
      resolve();
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}