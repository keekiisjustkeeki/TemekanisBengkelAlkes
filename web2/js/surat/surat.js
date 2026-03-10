// ==================== SURAT SYSTEM ====================

// Get current user
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Default kop surat settings
function getDefaultKopSurat() {
    return {
        nama_perusahaan: 'TeMekanis Bengkel Alkes',
        layanan: 'LAYANAN PERBAIKAN ALAT KESEHATAN',
        alamat: 'Batulayar, Lombok Barat, Nusa Tenggara Barat',
        telepon: '081991303343',
        email: 'temmekanis@gmail.com'
    };
}

// Get kop surat from localStorage or use default
function getKopSurat() {
    const savedKop = localStorage.getItem('temeknis_kop_surat');
    const defaultKop = getDefaultKopSurat();
    
    if (savedKop) {
        const parsed = JSON.parse(savedKop);
        // Merge saved values with default values (to include new fields)
        return {
            ...defaultKop,
            ...parsed
        };
    }
    return defaultKop;
}

// Save kop surat
function saveKopSurat(kop) {
    localStorage.setItem('temeknis_kop_surat', JSON.stringify(kop));
}

// Get stamp from localStorage
function getStamp() {
    return localStorage.getItem('temeknis_stamp') || null;
}

// Save stamp
function saveStamp(stampData) {
    localStorage.setItem('temeknis_stamp', stampData);
}

// Get stamp settings (show/hide)
function getStampSettings() {
    const settings = localStorage.getItem('temeknis_stamp_settings');
    if (settings) {
        return JSON.parse(settings);
    }
    return { showStamp: true };
}

// Get layout settings
function getLayoutSettings() {
    const settings = localStorage.getItem('temeknis_layout_surat');
    if (settings) {
        return JSON.parse(settings);
    }
    return {
        showWatermark: true,
        watermarkOpacity: 0.1,
        showLogo: true,
        logoSize: 60,
        paperSize: 'A4'
    };
}

// Save layout settings
function saveLayoutSettings(settings) {
    localStorage.setItem('temeknis_layout_surat', JSON.stringify(settings));
}

// Get all services
function getLayanan() {
    const layanan = localStorage.getItem('temeknis_layanan');
    if (!layanan) {
        return [
            { id: 1, nama: 'Service AC', harga: 150000 },
            { id: 2, nama: 'Service Oxygen', harga: 200000 },
            { id: 3, nama: 'Service Nebulizer', harga: 100000 },
            { id: 4, nama: 'Service Infus Pump', harga: 250000 },
            { id: 5, nama: 'Service Suction Machine', harga: 180000 }
        ];
    }
    return JSON.parse(layanan);
}

// Generate nomor surat
function generateNomorSurat(jenis) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const prefix = jenis === 'RAB' ? 'RAB' : 'INV';
    return `${prefix}/${month}/${year}/${random}`;
}

// Generate QR Code data with verification URL
function generateQRData(surat) {
    const baseUrl = window.location.origin + window.location.pathname.replace(/[^/]+$/, '');
    const verifyUrl = baseUrl + 'verifikasi-surat.html?id=' + surat.id + '&hash=' + encodeURIComponent(btoa(surat.id));
    
    const data = {
        id: surat.id,
        nomor: surat.nomor,
        jenis: surat.jenis,
        created_at: surat.created_at,
        verify_url: verifyUrl,
        hash: btoa(JSON.stringify(surat))
    };
    return JSON.stringify(data);
}

// Get verification URL for surat
function getVerifyUrl(suratId) {
    const baseUrl = window.location.origin + window.location.pathname.replace(/[^/]+$/, '');
    return baseUrl + 'verifikasi-surat.html?id=' + suratId;
}

// Save surat
function saveSurat(surat) {
    const surats = JSON.parse(localStorage.getItem('temeknis_surats') || '[]');
    surats.push(surat);
    localStorage.setItem('temeknis_surats', JSON.stringify(surats));
    return surat;
}

// Get all surats
function getAllSurats() {
    return JSON.parse(localStorage.getItem('temeknis_surats') || '[]');
}

// Get surats by user
function getSuratsByUser(userId) {
    const surats = getAllSurats();
    return surats.filter(s => s.pelanggan_id === userId);
}

// Get surat by ID
function getSuratById(id) {
    const surats = getAllSurats();
    return surats.find(s => s.id === id);
}

// Delete surat
function deleteSurat(id) {
    const surats = getAllSurats();
    const filtered = surats.filter(s => s.id !== id);
    localStorage.setItem('temeknis_surats', JSON.stringify(filtered));
}

// Verify surat authenticity
function verifySurat(id, providedHash) {
    const surat = getSuratById(id);
    if (!surat) {
        return { valid: false, message: 'Surat tidak ditemukan' };
    }
    
    const expectedHash = btoa(JSON.stringify({
        id: surat.id,
        nomor: surat.nomor,
        jenis: surat.jenis,
        created_at: surat.created_at
    }));
    
    if (providedHash === expectedHash) {
        return { 
            valid: true, 
            message: 'SURAT ASLI - Valid',
            surat: surat
        };
    }
    
    return { valid: false, message: 'SURAT TIDAK VALID - Dapat dimanipulasi' };
}

// Generate HTML for printing
function generateSuratHTML(surat, kop, layoutSettings = null) {
    const verifyUrl = getVerifyUrl(surat.id);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(verifyUrl)}`;
    
    const items = JSON.parse(surat.items || '[]');
    let total = 0;
    items.forEach(item => {
        total += item.jumlah * item.harga;
    });
    
    const teknisi = surat.teknisi || '-';
    
    // Format date
    const tgl = new Date(surat.created_at);
    const bulanNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const tglFormatted = `${tgl.getDate()} ${bulanNames[tgl.getMonth()]} ${tgl.getFullYear()}`;
    
    const layout = layoutSettings || getLayoutSettings();
    const stamp = getStamp();
    const stampSettings = getStampSettings();
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${surat.jenis} - ${surat.nomor}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Times New Roman', serif; 
            padding: 20px; 
            font-size: 12px; 
            background: #f5f5f5;
        }
        
        /* A4 Container */
        .surat-container {
            max-width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: white;
            padding: 20mm;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        
/* Header - Logo kiri, text tengah */
        .header { 
            display: flex; 
            align-items: flex-start; 
            margin-bottom: 15px; 
            border-bottom: 2px solid #333; 
            padding-bottom: 8px; 
        }
        .logo { width: 60px; height: 60px; margin-right: 15px; }
        .header-text { 
            text-align: center; 
            flex: 1; 
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        .header-text h1 { font-size: 18px; font-weight: bold; margin-bottom: 3px; }
        .header-text .layanan { font-size: 14px; font-weight: bold; margin-bottom: 5px; color: #333; }
        .header-text .alamat { 
            font-size: 10px; 
            margin: 2px 0; 
            color: #555; 
            line-height: 1.4;
            word-wrap: break-word;
            overflow-wrap: break-word;
            white-space: normal;
        }
        
        /* Jenis Surat - besar dan centered */
        .jenis-surat { 
            text-align: center; 
            margin: 15px 0 5px 0;
            font-size: 24px; 
            font-weight: bold; 
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        /* Nomor Surat - kecil dan centered */
        .nomor-surat { 
            text-align: center; 
            margin-bottom: 15px; 
            font-size: 11px; 
            color: #666;
        }
        
        .info-box { margin: 15px 0; }
        .info-row { margin: 5px 0; }
        .info-label { font-weight: bold; display: inline-block; min-width: 150px; }
        
        .description { margin: 15px 0; line-height: 1.6; text-align: justify; }
        
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #000; padding: 6px; text-align: left; vertical-align: top; font-size: 11px; }
        th { background: #f0f0f0; text-align: center; }
        
        .total-box { margin-top: 15px; text-align: right; font-size: 14px; font-weight: bold; }
        
        /* Footer - QR di samping tanda tangan (bersebelahan) */
        .footer { 
            margin-top: 40px; 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-end; 
        }
        .footer-left { 
            text-align: left; 
            display: flex;
            flex-direction: column;
        }
        .footer-right { 
            text-align: right; 
            display: flex;
            align-items: flex-end;
            gap: 15px;
        }
        .hormat-kami { margin-bottom: 50px; font-size: 12px; }
        .ttd-name { font-weight: bold; }
        
        .stamp-img { width: 100px; margin-bottom: 10px; }
        
        .qr-section img { width: 70px; height: 70px; }
        
        @media print {
            body { background: white; padding: 0; }
            .surat-container {
                box-shadow: none;
                margin: 0;
                padding: 15mm;
            }
        }
    </style>
</head>
<body>
    <div class="surat-container">
        <!-- Header: Logo kiri, text tengah -->
        <div class="header">
            <img src="../LOGO TMEKANIS.png" alt="Logo" class="logo">
            <div class="header-text">
                <h1>${kop.nama_perusahaan}</h1>
                <div class="layanan">${kop.layanan || 'LAYANAN PERBAIKAN ALAT KESEHATAN'}</div>
                <div class="alamat">
                    ${kop.alamat}<br>
                    No. Telp: ${kop.telepon} | Email: ${kop.email}
                </div>
            </div>
        </div>
        
        <!-- Jenis Surat - besar dan centered -->
        <div class="jenis-surat">${surat.jenis || 'RAB'}</div>
        
        <!-- Nomor Surat - kecil dan centered -->
        <div class="nomor-surat">No: ${surat.nomor || '-'}</div>
        
        <!-- Info -->
        <div class="info-box">
            <div class="info-row"><span class="info-label">Nama Pekerjaan</span> : ${surat.jenis_layanan || '-'}</div>
            <div class="info-row"><span class="info-label">Nama Pelanggan</span> : ${surat.nama_pelanggan}</div>
            <div class="info-row"><span class="info-label">Teknisi</span> : ${teknisi}</div>
        </div>
        
        <!-- Description -->
        <div class="description">
            <p>Sehubungan dengan kegiatan perbaikan (${surat.jenis_layanan || '-'}) pada (${tglFormatted}), ditemukan</p>
            <p>${surat.desripsi || 'Kerusakan pada beberapa komponen alat kesehatan.'}</p>
            <p>Berdasarkan hasil pemeriksaan terdapat beberapa komponen yang perlu dilakukan pergantian dan maintenance. Berikut rinciannya :</p>
        </div>
        
        <!-- Table -->
        <table>
            <thead>
                <tr>
                    <th style="width:30px">No</th>
                    <th>Nama Sparepart</th>
                    <th style="width:60px">Kondisi</th>
                    <th style="width:60px">Tindakan</th>
                    <th style="width:30px">Qty</th>
                    <th style="width:70px">Harga(Rp)</th>
                    <th style="width:70px">Total(Rp)</th>
                </tr>
            </thead>
            <tbody>
                ${items.map((item, i) => `
                <tr>
                    <td style="text-align:center">${i + 1}</td>
                    <td>${item.nama}</td>
                    <td>${item.kondisi || 'Baru'}</td>
                    <td>${item.tindakan || 'Pemasangan'}</td>
                    <td style="text-align:center">${item.jumlah}</td>
                    <td style="text-align:right">${formatRupiah(item.harga)}</td>
                    <td style="text-align:right">${formatRupiah(item.jumlah * item.harga)}</td>
                </tr>
                `).join('')}
                ${surat.jasa_service ? `
                <tr>
                    <td style="text-align:center">${items.length + 1}</td>
                    <td>${surat.jasa_service}</td>
                    <td>-</td>
                    <td>-</td>
                    <td style="text-align:center">-</td>
                    <td style="text-align:right">-</td>
                    <td style="text-align:right">${formatRupiah(surat.jasa_service_harga || 0)}</td>
                </tr>
                ` : ''}
            </tbody>
        </table>
        
        <!-- Total -->
        <div class="total-box">
            Total : ${formatRupiah(total + (surat.jasa_service_harga || 0))}
        </div>
        
        <!-- Footer: QR di samping tanda tangan -->
        <div class="footer">
            <div class="footer-left">
                <div class="hormat-kami">Hormat kami,</div>
                ${stamp && stampSettings.showStamp ? `<img src="${stamp}" alt="Stamp" class="stamp-img">` : ''}
                <div class="ttd-name">${teknisi}</div>
            </div>
            <div class="footer-right">
                <div class="qr-section">
                    <img src="${qrCodeUrl}" alt="QR Code">
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    `;
}

// Generate PDF
async function generateSuratPDF(surat, kop) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const items = JSON.parse(surat.items || '[]');
    let total = 0;
    items.forEach(item => {
        total += item.jumlah * item.harga;
    });
    
    const teknisi = surat.teknisi || '-';
    
    // Format date
    const tgl = new Date(surat.created_at);
    const bulanNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const tglFormatted = `${tgl.getDate()} ${bulanNames[tgl.getMonth()]} ${tgl.getFullYear()}`;
    
    const verifyUrl = getVerifyUrl(surat.id);
    const stamp = getStamp();
    const stampSettings = getStampSettings();
    
    let y = 15;
    
    // Header with logo (left) and text (centered)
    try {
        doc.addImage('../LOGO TMEKANIS.png', 'PNG', 15, y, 20, 20);
    } catch(e) {}
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(kop.nama_perusahaan || 'TeMekanis Bengkel Alkes', 105, y + 8, { align: 'center' });
    
    y += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(kop.layanan || 'LAYANAN PERBAIKAN ALAT KESEHATAN', 105, y + 4, { align: 'center' });
    
    y += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const alamatText = `${kop.alamat || ''} No.Telp ${kop.telepon || ''} email: ${kop.email || ''}`;
    doc.text(alamatText, 105, y + 4, { align: 'center' });
    
    y += 10;
    
    doc.setLineWidth(0.5);
    doc.line(15, y, 195, y);
    y += 10;
    
    // Jenis Surat - besar dan centered
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(surat.jenis || 'RAB', 105, y, { align: 'center' });
    y += 8;
    
    // Nomor Surat - kecil dan centered
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`No: ${surat.nomor || '-'}`, 105, y, { align: 'center' });
    y += 12;
    
    // Info
    doc.setFontSize(11);
    doc.text(`Nama Pekerjaan : ${surat.jenis_layanan || '-'}`, 15, y);
    y += 5;
    doc.text(`Nama Pelanggan : ${surat.nama_pelanggan}`, 15, y);
    y += 5;
    doc.text(`Teknisi        : ${teknisi}`, 15, y);
    
    y += 10;
    
    // Description
    doc.text(`Sehubungan dengan kegiatan perbaikan (${surat.jenis_layanan || '-'}) pada (${tglFormatted}), ditemukan`, 15, y);
    y += 5;
    doc.text(surat.desripsi || 'Kerusakan pada beberapa komponen alat kesehatan.', 15, y);
    y += 5;
    doc.text('Berdasarkan hasil pemeriksaan terdapat beberapa komponen yang perlu dilakukan pergantian dan maintenance. Berikut rinciannya :', 15, y);
    
    y += 8;
    
    // Table header
    const colX = [15, 30, 90, 120, 150, 170, 195];
    
    doc.setFillColor(240, 240, 240);
    doc.rect(15, y, 180, 7, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('No', colX[0] + 3, y + 5);
    doc.text('Nama Sparepart', colX[1], y + 5);
    doc.text('Kondisi', colX[2], y + 5);
    doc.text('Tindakan', colX[3], y + 5);
    doc.text('Qty', colX[4] + 2, y + 5);
    doc.text('Harga', colX[5], y + 5);
    doc.text('Total', colX[6], y + 5);
    
    y += 8;
    doc.setFont('helvetica', 'normal');
    
    // Table rows
    items.forEach((item, i) => {
        if (y > 250) {
            doc.addPage();
            y = 15;
        }
        
        doc.text((i + 1).toString(), colX[0] + 3, y + 4);
        doc.text(item.nama.substring(0, 30), colX[1], y + 4);
        doc.text(item.kondisi || 'Baru', colX[2], y + 4);
        doc.text(item.tindakan || 'Pemasangan', colX[3], y + 4);
        doc.text(item.jumlah.toString(), colX[4] + 2, y + 4);
        doc.text(formatRupiah(item.harga), colX[5], y + 4);
        doc.text(formatRupiah(item.jumlah * item.harga), colX[6], y + 4);
        
        y += 6;
    });
    
    // Jasa Service
    if (surat.jasa_service) {
        if (y > 250) { doc.addPage(); y = 15; }
        
        doc.text((items.length + 1).toString(), colX[0] + 3, y + 4);
        doc.text(surat.jasa_service, colX[1], y + 4);
        doc.text('-', colX[2], y + 4);
        doc.text('-', colX[3], y + 4);
        doc.text('-', colX[4] + 2, y + 4);
        doc.text('-', colX[5], y + 4);
        doc.text(formatRupiah(surat.jasa_service_harga || 0), colX[6], y + 4);
        y += 6;
    }
    
    // Total
    const grandTotal = total + (surat.jasa_service_harga || 0);
    y += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Total : ${formatRupiah(grandTotal)}`, 195, y, { align: 'right' });
    
    // Footer - Left: Hormat kami + stamp, Right: QR (bersebelahan)
    y += 20;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Hormat kami,', 15, y);
    
    // Add stamp if exists and enabled
    if (stamp && stampSettings.showStamp) {
        try {
            doc.addImage(stamp, 'PNG', 15, y + 5, 30, 30);
        } catch(e) {}
    }
    
    y += 40;
    doc.setFont('helvetica', 'bold');
    doc.text(teknisi, 15, y);
    
    // QR Code beside signature (on the same row as teknisi name)
    const qrY = y - 35; // Align QR with "Hormat kami" text
    try {
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=${encodeURIComponent(verifyUrl)}`;
        const response = await fetch(qrApiUrl);
        const blob = await response.blob();
        
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    // QR code beside the signature (not below)
                    doc.addImage(e.target.result, 'PNG', 165, qrY, 25, 25);
                } catch(err) {}
                const pdfOutput = doc.output('blob');
                resolve(pdfOutput);
            };
            reader.readAsDataURL(blob);
        });
    } catch(e) {
        const pdfOutput = doc.output('blob');
        return Promise.resolve(pdfOutput);
    }
}

// Format rupiah
function formatRupiah(angka) {
    return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Print surat
function printSurat(suratId) {
    const surat = getSuratById(suratId);
    if (!surat) {
        showAlert('Surat tidak ditemukan!', 'danger');
        return;
    }
    
    const kop = getKopSurat();
    const layout = getLayoutSettings();
    const html = generateSuratHTML(surat, kop, layout);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
}

// Download PDF
async function downloadSuratPDF(suratId) {
    const surat = getSuratById(suratId);
    if (!surat) {
        showAlert('Surat tidak ditemukan!', 'danger');
        return;
    }
    
    const kop = getKopSurat();
    
    try {
        const pdfBlob = await generateSuratPDF(surat, kop);
        
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = surat.nomor + '.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return true;
    } catch(e) {
        console.error('PDF error:', e);
        printSurat(suratId);
        return false;
    }
}

// Export functions
window.getDefaultKopSurat = getDefaultKopSurat;
window.getKopSurat = getKopSurat;
window.saveKopSurat = saveKopSurat;
window.getStamp = getStamp;
window.saveStamp = saveStamp;
window.getLayoutSettings = getLayoutSettings;
window.saveLayoutSettings = saveLayoutSettings;
window.getLayanan = getLayanan;
window.generateNomorSurat = generateNomorSurat;
window.generateQRData = generateQRData;
window.getVerifyUrl = getVerifyUrl;
window.verifySurat = verifySurat;
window.saveSurat = saveSurat;
window.getAllSurats = getAllSurats;
window.getSuratsByUser = getSuratsByUser;
window.getSuratById = getSuratById;
window.deleteSurat = deleteSurat;
window.generateSuratHTML = generateSuratHTML;
window.generateSuratPDF = generateSuratPDF;
window.formatRupiah = formatRupiah;
window.printSurat = printSurat;
window.downloadSuratPDF = downloadSuratPDF;

