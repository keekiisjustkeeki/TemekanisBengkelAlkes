// Layanan JavaScript
document.addEventListener('DOMContentLoaded', function() {
    loadLayanan();
});

function loadLayanan() {
    const container = document.getElementById('layanan-container');
    if (!container) return;
    
    // Default layanan if localStorage not available
    const defaultLayanan = [
        {
            nama: 'Perbaikan Alat Kesehatan',
            deskripsi: 'Layanan perbaikan berbagai jenis alat kesehatan dengan teknisi berpengalaman.',
            harga: 'Hubungi untuk Perbaikan',
            icon: 'bi-tools'
        },
        {
            nama: 'Jual Beli Sparepart',
            deskripsi: 'Jual beli sparepart alat kesehatan berkualitas tinggi dengan harga terjangkau.',
            harga: 'Bergantung jenis sparepart',
            icon: 'bi-gear'
        },
        {
            nama: 'Maintenance Berkala',
            deskripsi: 'Layanan maintenance berkala untuk memastikan alat kesehatan selalu berfungsi optimal.',
            harga: 'Hubungi untuk Maintenance',
            icon: 'bi-calendar-check'
        },
        {
            nama: 'Konsultasi Teknis',
            deskripsi: 'Konsultasi teknis gratis untuk permasalahan alat kesehatan Anda.',
            harga: 'Hubungi untuk Konsultasi',
            icon: 'bi-chat-dots'
        }
    ];
    
    // Try to load from localStorage (admin controlled)
    let layanan = JSON.parse(localStorage.getItem('temeknis_layanan'));
    
    if (!layanan || layanan.length === 0) {
        layanan = defaultLayanan;
    }
    
    displayLayanan(layanan);
}

function displayLayanan(layanan) {
    const container = document.getElementById('layanan-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    layanan.forEach(item => {
        const col = document.createElement('div');
        col.className = 'col-md-6 mb-4';
        col.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <i class="bi ${item.icon || 'bi-tools'} display-4 text-primary mb-3"></i>
                    <h5 class="card-title">${item.nama}</h5>
                    <p class="card-text">${item.deskripsi}</p>
                    <p class="text-primary fw-bold">${item.harga}</p>
                    <a href="https://wa.me/6281991303343?text=Halo%20TeMekanis,%20saya%20tertarik%20dengan%20layanan%20${encodeURIComponent(item.nama)}" class="btn btn-primary" target="_blank">
                        <i class="bi bi-whatsapp me-2"></i>Pesan Sekarang
                    </a>
                </div>
        `;
        container.appendChild(col);
    });
}
