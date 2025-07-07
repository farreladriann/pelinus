const messageContainer = document.getElementById('messageContainer');
const kelasList = document.getElementById('kelasList');
const kelasForm = document.getElementById('kelasForm');
const nomorKelasInput = document.getElementById('nomorKelas');
const submitBtn = document.getElementById('submitBtn');

// Fungsi untuk menampilkan pesan
function showMessage(message, type = 'success') {
    messageContainer.innerHTML = `<div class="message ${type}">${message}</div>`;
    setTimeout(() => {
        messageContainer.innerHTML = '';
    }, 5000);
}

// Fungsi untuk mengambil semua kelas
async function fetchKelas() {
    try {
        kelasList.innerHTML = '<div class="loading">Memuat data kelas...</div>';
        
        const response = await fetch('/kelas');
        if (!response.ok) {
            throw new Error('Gagal mengambil data kelas');
        }
        
        const data = await response.json();
        
        if (data.length === 0) {
            kelasList.innerHTML = `
                <div class="empty-state">
                    <div>📝</div>
                    <p>Belum ada kelas yang terdaftar</p>
                </div>
            `;
            return;
        }
        
        kelasList.innerHTML = `
            <div class="kelas-grid">
                ${data.map(kelas => `
                    <div class="kelas-card">
                        <div class="kelas-number">${kelas.nomorKelas}</div>
                    </div>
                `).join('')}
            </div>
        `;
        
    } catch (error) {
        console.error('Error fetching classes:', error);
        showMessage(error.message, 'error');
        kelasList.innerHTML = '<div class="empty-state">Gagal memuat data kelas</div>';
    }
}

// Handle form submission
kelasForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const nomorKelas = nomorKelasInput.value.trim();
    if (!nomorKelas) {
        showMessage('Nomor kelas tidak boleh kosong', 'error');
        return;
    }
    
    // Disable button selama proses
    submitBtn.disabled = true;
    submitBtn.textContent = 'Menambahkan...';
    
    try {
        const response = await fetch('/kelas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nomorKelas })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Gagal menambah kelas');
        }
        
        showMessage('Kelas berhasil ditambahkan!', 'success');
        kelasForm.reset();
        fetchKelas(); // Refresh daftar kelas
        
    } catch (error) {
        console.error('Error adding class:', error);
        showMessage(error.message, 'error');
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Tambah Kelas';
    }
});

// Load kelas saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    fetchKelas();
});