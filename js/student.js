/**
 * Student Page Logic
 * ==================
 * Handles: login form → validate → show QR code
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm   = document.getElementById('login-form');
  const loginSection = document.getElementById('login-section');
  const qrSection   = document.getElementById('qr-section');
  const claimedSection = document.getElementById('claimed-section');
  const loginError  = document.getElementById('login-error');
  const btnLogin    = document.getElementById('btn-login');
  const btnBack     = document.getElementById('btn-back');
  const btnBackClaimed = document.getElementById('btn-back-claimed');
  const inputNama   = document.getElementById('input-nama');
  const inputStudentID = document.getElementById('input-student-id');
  const qrCode      = document.getElementById('qr-code');
  const qrName      = document.getElementById('qr-name');
  const qrClass     = document.getElementById('qr-class');
  const claimedDetail = document.getElementById('claimed-detail');

  // Login form submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = inputStudentID.value.trim();
    const nama = inputNama.value.trim();

    // Client-side validation
    if (!id) {
      showError('Silakan masukkan ID siswa kamu.');
      inputStudentID.focus();
      return;
    }
    if (!nama) {
      showError('Silakan masukkan nama lengkap kamu.');
      inputNama.focus();
      return;
    }

    // Set loading state
    setLoading(true);
    hideError();

    try {
      const db = getDB();
      if (!db) throw new Error('Koneksi Supabase tidak tersedia');

      // Match ID exactly and name case-insensitively.
      const { data: student, error } = await db
        .from('siswa')
        .select('*')
        .eq('id', id)
        .ilike('nama', nama)
        .maybeSingle();

      if (error) throw error;

      if (!student) {
        showError('Data tidak ditemukan. Periksa kembali ID Siswa dan Nama kamu.');
        showToast('Data tidak ditemukan', 'error');
        setLoading(false);
        return;
      }

      // Check if already claimed
      if (student.claimed) {
        showClaimedState(student);
        setLoading(false);
        return;
      }

      // Show QR code
      showQRCode(student);
      setLoading(false);

    } catch (err) {
      console.error('Login error:', err);
      showError('Terjadi kesalahan. Silakan coba lagi.');
      showToast('Koneksi gagal', 'error');
      setLoading(false);
    }
  });

  // Generate and display QR code
  function showQRCode(student) {
    if (!window.QRCode) {
      showError('Library QR Code gagal dimuat. Periksa koneksi internet lalu refresh halaman.');
      showToast('Library QR Code gagal dimuat', 'error');
      loginSection.classList.remove('hidden');
      qrSection.classList.add('hidden');
      return;
    }

    qrCode.innerHTML = '';

    new window.QRCode(qrCode, {
      text: student.qr_token,
      width: 200,
      height: 200,
      colorDark: '#3A2A1F',
      colorLight: '#ffffff',
      correctLevel: window.QRCode.CorrectLevel.H,
    });

    // Fill info
    qrName.textContent = student.nama;
    qrClass.textContent = `ID Siswa: ${student.id}`;

    // Transition: hide login, show QR
    loginSection.classList.add('hidden');
    claimedSection.classList.add('hidden');
    qrSection.classList.remove('hidden');

    showToast(`Halo, ${student.nama}!`, 'success');
  }

  // Show claimed state
  function showClaimedState(student) {
    claimedDetail.textContent = `${student.nama} (ID: ${student.id}) — Diambil pada ${formatDate(student.claimed_at)}`;
    
    loginSection.classList.add('hidden');
    qrSection.classList.add('hidden');
    claimedSection.classList.remove('hidden');
  }

  // Back button
  function resetToLogin() {
    qrSection.classList.add('hidden');
    claimedSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    loginForm.reset();
    hideError();
    inputStudentID.focus();
  }

  btnBack.addEventListener('click', resetToLogin);
  btnBackClaimed.addEventListener('click', resetToLogin);

  // Error display
  function showError(msg) {
    loginError.textContent = msg;
    loginError.classList.add('active');
  }

  // Hide error
  function hideError() {
    loginError.textContent = '';
    loginError.classList.remove('active');
  }

  // Loading state
  function setLoading(isLoading) {
    if (isLoading) {
      btnLogin.classList.add('btn--loading');
      btnLogin.disabled = true;
    } else {
      btnLogin.classList.remove('btn--loading');
      btnLogin.disabled = false;
    }
  }
});
