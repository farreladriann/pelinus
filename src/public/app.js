class PelinusApp {
    constructor() {
        this.baseUrl = window.location.origin;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadInitialData();
    }

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Form submissions
        document.getElementById('kelas-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addKelas();
        });

        document.getElementById('pelajaran-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addPelajaran();
        });

        document.getElementById('kuis-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addKuis();
        });

        // Cache button
        document.getElementById('load-cache-btn').addEventListener('click', () => {
            this.loadCacheData();
        });

        // PDF modal will be handled in viewPdf method
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from all buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab
        document.getElementById(`${tabName}-tab`).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }

    async loadInitialData() {
        await this.loadKelasList();
        await this.loadPelajaranList();
        await this.loadKuisList();
        this.populateKelasDropdown();
        this.populatePelajaranDropdown();
    }

    showLoading() {
        document.getElementById('loading-overlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    }

    showAlert(message, type = 'success') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        
        const container = document.querySelector('.container');
        container.insertBefore(alertDiv, container.firstChild);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    async apiCall(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, options);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'API Error');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Kelas Management
    async addKelas() {
        const nomorKelas = document.getElementById('nomorKelas').value;
        
        try {
            this.showLoading();
            await this.apiCall('/kelas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nomorKelas })
            });
            
            this.showAlert('Kelas berhasil ditambahkan!');
            document.getElementById('kelas-form').reset();
            await this.loadKelasList();
            this.populateKelasDropdown();
        } catch (error) {
            this.showAlert(error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadKelasList() {
        try {
            // Since there's no GET endpoint for kelas, we'll use cache data
            const cacheData = await this.apiCall('/cache');
            const kelasList = Object.entries(cacheData).map(([id, kelas]) => ({
                _id: id,
                nomorKelas: kelas.nomorKelas
            }));
            
            this.renderKelasList(kelasList);
        } catch (error) {
            console.error('Error loading kelas:', error);
        }
    }

    renderKelasList(kelasList) {
        const container = document.getElementById('kelas-list');
        container.innerHTML = '';
        
        kelasList.forEach(kelas => {
            const kelasCard = document.createElement('div');
            kelasCard.className = 'item-card';
            kelasCard.innerHTML = `
                <h4>Kelas ${kelas.nomorKelas}</h4>
                <p>ID: ${kelas._id}</p>
                <div class="item-actions">
                    <button class="btn-danger" data-action="delete-kelas" data-id="${kelas._id}">
                        🗑️ Hapus
                    </button>
                </div>
            `;

            const deleteBtn = kelasCard.querySelector('[data-action="delete-kelas"]');
            deleteBtn.addEventListener('click', () => {
                this.deleteKelas(kelas._id);
            });

            container.appendChild(kelasCard);
        });
    }

    async deleteKelas(idKelas) {
        if (!confirm('Apakah Anda yakin ingin menghapus kelas ini? Semua pelajaran dan kuis terkait akan ikut terhapus.')) {
            return;
        }
        
        try {
            this.showLoading();
            await this.apiCall(`/kelas/${idKelas}`, {
                method: 'DELETE'
            });
            
            this.showAlert('Kelas berhasil dihapus!');
            await this.loadKelasList();
            this.populateKelasDropdown();
        } catch (error) {
            this.showAlert(error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    populateKelasDropdown() {
        const select = document.getElementById('idKelas');
        select.innerHTML = '<option value="">Pilih Kelas</option>';
        
        // Get kelas from cache
        this.apiCall('/cache').then(cacheData => {
            Object.entries(cacheData).forEach(([id, kelas]) => {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = `Kelas ${kelas.nomorKelas}`;
                select.appendChild(option);
            });
        });
    }

    // Pelajaran Management
    async addPelajaran() {
        const formData = new FormData();
        formData.append('namaPelajaran', document.getElementById('namaPelajaran').value);
        formData.append('idKelas', document.getElementById('idKelas').value);
        formData.append('logo', document.getElementById('logo').files[0]);
        formData.append('filePdfMateri', document.getElementById('filePdfMateri').files[0]);
        
        try {
            this.showLoading();
            await this.apiCall('/pelajaran', {
                method: 'POST',
                body: formData
            });
            
            this.showAlert('Pelajaran berhasil ditambahkan!');
            document.getElementById('pelajaran-form').reset();
            await this.loadPelajaranList();
            this.populatePelajaranDropdown();
        } catch (error) {
            this.showAlert(error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadPelajaranList() {
        try {
            const cacheData = await this.apiCall('/cache');
            const pelajaranList = [];
            
            Object.entries(cacheData).forEach(([kelasId, kelas]) => {
                kelas.pelajaran.forEach(pelajaran => {
                    pelajaranList.push({
                        ...pelajaran,
                        kelasNomor: kelas.nomorKelas,
                        kelasId: kelasId
                    });
                });
            });
            
            this.renderPelajaranList(pelajaranList);
        } catch (error) {
            console.error('Error loading pelajaran:', error);
        }
    }

    renderPelajaranList(pelajaranList) {
        const container = document.getElementById('pelajaran-list');
        container.innerHTML = '';
        
        pelajaranList.forEach(pelajaran => {
            const pelajaranCard = document.createElement('div');
            pelajaranCard.className = 'item-card';
            pelajaranCard.innerHTML = `
                <div style="display: flex; align-items: center;">
                    ${pelajaran.logo ? `<img src="data:image/png;base64,${pelajaran.logo}" class="pelajaran-logo" alt="Logo">` : ''}
                    <div>
                        <h4>${pelajaran.namaPelajaran}</h4>
                        <p>Kelas: ${pelajaran.kelasNomor}</p>
                        <p>ID: ${pelajaran.idPelajaran}</p>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn-info" data-action="view-pdf" data-id="${pelajaran.idPelajaran}">
                        📄 Unduh PDF
                    </button>
                    <button class="btn-danger" data-action="delete-pelajaran" data-id="${pelajaran.idPelajaran}">
                        🗑️ Hapus
                    </button>
                </div>
            `;

            // Add event listeners for the buttons
            const viewPdfBtn = pelajaranCard.querySelector('[data-action="view-pdf"]');
            const deleteBtn = pelajaranCard.querySelector('[data-action="delete-pelajaran"]');
            
            viewPdfBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.viewPdf(pelajaran.idPelajaran);
            });
            
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.deletePelajaran(pelajaran.idPelajaran);
            });

            container.appendChild(pelajaranCard);
        });
    }

    async deletePelajaran(idPelajaran) {
        if (!confirm('Apakah Anda yakin ingin menghapus pelajaran ini?')) {
            return;
        }
        
        try {
            this.showLoading();
            await this.apiCall(`/pelajaran/${idPelajaran}`, {
                method: 'DELETE'
            });
            
            this.showAlert('Pelajaran berhasil dihapus!');
            await this.loadPelajaranList();
            this.populatePelajaranDropdown();
        } catch (error) {
            this.showAlert(error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async viewPdf(idPelajaran) {
        try {
            this.showLoading();
            
            // Create a download link
            const downloadUrl = `${this.baseUrl}/pelajaran/${idPelajaran}/pdf`;
            
            // Create a temporary link element
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `materi-${idPelajaran}.pdf`; // Set default filename
            link.style.display = 'none';
            
            // Add link to body, click it, then remove it
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showAlert('Download PDF dimulai...', 'success');
            
        } catch (error) {
            console.error('Download Error:', error);
            this.showAlert('Gagal mengunduh PDF: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    populatePelajaranDropdown() {
        const select = document.getElementById('idPelajaranKuis');
        select.innerHTML = '<option value="">Pilih Pelajaran</option>';
        
        this.apiCall('/cache').then(cacheData => {
            Object.entries(cacheData).forEach(([kelasId, kelas]) => {
                kelas.pelajaran.forEach(pelajaran => {
                    const option = document.createElement('option');
                    option.value = pelajaran.idPelajaran;
                    option.textContent = `${pelajaran.namaPelajaran} (${kelas.nomorKelas})`;
                    select.appendChild(option);
                });
            });
        });
    }

    // Kuis Management
    async addKuis() {
        const kuisData = {
            idPelajaran: document.getElementById('idPelajaranKuis').value,
            nomorKuis: parseInt(document.getElementById('nomorKuis').value),
            soal: document.getElementById('soal').value,
            opsiA: document.getElementById('opsiA').value,
            opsiB: document.getElementById('opsiB').value,
            opsiC: document.getElementById('opsiC').value,
            opsiD: document.getElementById('opsiD').value,
            opsiJawaban: document.getElementById('opsiJawaban').value
        };
        
        try {
            this.showLoading();
            await this.apiCall('/kuis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(kuisData)
            });
            
            this.showAlert('Kuis berhasil ditambahkan!');
            document.getElementById('kuis-form').reset();
            await this.loadKuisList();
        } catch (error) {
            this.showAlert(error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadKuisList() {
        try {
            const cacheData = await this.apiCall('/cache');
            const kuisList = [];
            
            Object.entries(cacheData).forEach(([kelasId, kelas]) => {
                kelas.pelajaran.forEach(pelajaran => {
                    pelajaran.kuis.forEach(kuis => {
                        kuisList.push({
                            ...kuis,
                            pelajaranNama: pelajaran.namaPelajaran,
                            kelasNomor: kelas.nomorKelas
                        });
                    });
                });
            });
            
            this.renderKuisList(kuisList);
        } catch (error) {
            console.error('Error loading kuis:', error);
        }
    }

    renderKuisList(kuisList) {
        const container = document.getElementById('kuis-list');
        container.innerHTML = '';
        
        kuisList.forEach(kuis => {
            const kuisCard = document.createElement('div');
            kuisCard.className = 'item-card';
            kuisCard.innerHTML = `
                <h4>Kuis #${kuis.nomorKuis}</h4>
                <p><strong>Pelajaran:</strong> ${kuis.pelajaranNama} (${kuis.kelasNomor})</p>
                <p><strong>Soal:</strong> ${kuis.soal}</p>
                <p><strong>A:</strong> ${kuis.opsiA}</p>
                <p><strong>B:</strong> ${kuis.opsiB}</p>
                <p><strong>C:</strong> ${kuis.opsiC}</p>
                <p><strong>D:</strong> ${kuis.opsiD}</p>
                <p><strong>Jawaban:</strong> ${kuis.opsiJawaban}</p>
                <div class="item-actions">
                    <button class="btn-danger" data-action="delete-kuis" data-id="${kuis.idKuis}">
                        🗑️ Hapus
                    </button>
                </div>
            `;

            // Add event listener for delete button
            const deleteBtn = kuisCard.querySelector('[data-action="delete-kuis"]');
            deleteBtn.addEventListener('click', () => {
                this.deleteKuis(kuis.idKuis);
            });
            
            container.appendChild(kuisCard);
        });
    }

    async deleteKuis(idKuis) {
        if (!confirm('Apakah Anda yakin ingin menghapus kuis ini?')) {
            return;
        }
        
        try {
            this.showLoading();
            await this.apiCall(`/kuis/${idKuis}`, {
                method: 'DELETE'
            });
            
            this.showAlert('Kuis berhasil dihapus!');
            await this.loadKuisList();
        } catch (error) {
            this.showAlert(error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    // Cache Management
    async loadCacheData() {
        try {
            this.showLoading();
            const cacheData = await this.apiCall('/cache');
            this.renderCacheData(cacheData);
        } catch (error) {
            this.showAlert(error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderCacheData(cacheData) {
        const container = document.getElementById('cache-data');
        container.innerHTML = '';
        
        Object.entries(cacheData).forEach(([kelasId, kelas]) => {
            const kelasDiv = document.createElement('div');
            kelasDiv.className = 'cache-kelas';
            
            let pelajaranHtml = '';
            kelas.pelajaran.forEach(pelajaran => {
                let kuisHtml = '';
                pelajaran.kuis.forEach(kuis => {
                    kuisHtml += `
                        <div class="cache-kuis">
                            <strong>Kuis #${kuis.nomorKuis}:</strong> ${kuis.soal}
                            <br><small>Jawaban: ${kuis.opsiJawaban}</small>
                        </div>
                    `;
                });
                
                pelajaranHtml += `
                    <div class="cache-pelajaran">
                        <h5>${pelajaran.namaPelajaran}</h5>
                        ${pelajaran.logo ? `<img src="data:image/png;base64,${pelajaran.logo}" class="cache-logo" alt="Logo">` : ''}
                        <p>Jumlah Kuis: ${pelajaran.kuis.length}</p>
                        ${kuisHtml}
                    </div>
                `;
            });
            
            kelasDiv.innerHTML = `
                <h4>Kelas ${kelas.nomorKelas}</h4>
                <p>ID: ${kelasId}</p>
                <p>Jumlah Pelajaran: ${kelas.pelajaran.length}</p>
                ${pelajaranHtml}
            `;
            
            container.appendChild(kelasDiv);
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PelinusApp();
});