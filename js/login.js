
import { supabase } from './supabaseClient.js';
import { supabaseVideo } from './supabaseClientVideo.js';

const form = document.getElementById('loginForm');
const errorEl = document.getElementById('loginError');
const loginSub = document.getElementById('loginSub');

const hashParams = new URLSearchParams(
  window.location.hash.replace(/^#/, '')
);

let tipe = hashParams.get('tipe');

if (tipe === 'foto' || tipe === 'video') {
  sessionStorage.setItem('secretRoomTipe', tipe);
} else {
  tipe = sessionStorage.getItem('secretRoomTipe') || 'foto';
}

// Pilih project sesuai galeri
const client = tipe === 'video' ? supabaseVideo : supabase;
const dest = tipe === 'video'
  ? 'video-gallery.html'
  : 'gallery.html';

if (loginSub) {
  loginSub.textContent = tipe === 'video'
    ? 'Masuk untuk melihat momen video kelas XII Satelit'
    : 'Masuk untuk melihat momen foto kelas XII Satelit';
}

// Cek sesi sebelumnya
async function checkSession() {
  try {
    const { data, error } = await client.auth.getSession();

    if (error) {
      console.error('Session error:', error);
      return;
    }

    if (data.session) {
      window.location.href = dest;
    }
  } catch (err) {
    console.error('Session connection error:', err);
  }
}

checkSession();

// Proses login
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  errorEl.textContent = '';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const btn = form.querySelector('button[type="submit"]');

  btn.disabled = true;
  btn.textContent = 'Memproses...';

  try {
    console.log('Login menggunakan:', tipe);

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Supabase Auth Error:', error);

      if (
        error.message.toLowerCase().includes('invalid login credentials')
      ) {
        errorEl.textContent = 'Email atau password salah.';
      } else if (
        error.message.toLowerCase().includes('email not confirmed')
      ) {
        errorEl.textContent = 'Email belum dikonfirmasi.';
      } else {
        errorEl.textContent = 'Login gagal: ' + error.message;
      }

      return;
    }

    if (data.session) {
      window.location.href = dest;
    }

  } catch (err) {
    console.error('Login connection error:', err);

    errorEl.textContent =
      'Tidak dapat terhubung ke server Supabase. Periksa koneksi atau URL project.';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Masuk';
  }
});
