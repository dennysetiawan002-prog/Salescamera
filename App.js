// Konfigurasi IndexedDB
const DB_NAME = 'SalesVisitDB';
const DB_VERSION = 1;
let db;

function initDB() {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
        db = e.target.result;
        if (!db.objectStoreNames.contains('photos')) {
            db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('stores')) {
            db.createObjectStore('stores', { keyPath: 'name' });
        }
    };
    request.onsuccess = (e) => { db = e.target.result; loadStoreSuggestions(); };
    request.onerror = (e) => console.error('IndexedDB Error:', e);
}
initDB();

// Variabel Global
let currentStream = null;
let rawImage = new Image();
let finalPhotoBlob = null;
let currentPhotoFilename = "";

// Element UI
const screens = ['setup', 'home', 'form', 'camera', 'preview', 'history'].reduce((acc, id) => {
    acc[id] = document.getElementById(`${id}-section`);
    return acc;
}, {});

function showScreen(screenId) {
    Object.values(screens).forEach(s => s.classList.add('hidden'));
    screens[screenId].classList.remove('hidden');
}

// 1. SETUP & HOME
window.onload = () => {
    const savedSales = localStorage.getItem('salesName');
    if (savedSales) {
        document.getElementById('display-sales-name').innerText = savedSales;
        showScreen('home');
    } else {
        showScreen('setup');
    }
};

document.getElementById('btn-save-setup').onclick = () => {
    const salesName = document.getElementById('setup-sales-name').value.trim();
    const company = document.getElementById('setup-company-name').value.trim();
    if (!salesName) return alert('Nama Sales wajib diisi!');
    localStorage.setItem('salesName', salesName);
    localStorage.setItem('companyName', company);
    document.getElementById('display-sales-name').innerText = salesName;
    showScreen('home');
};

document.getElementById('btn-settings').onclick = () => {
    document.getElementById('setup-sales-name').value = localStorage.getItem('salesName') || '';
    document.getElementById('setup-company-name').value = localStorage.getItem('companyName') || '';
    showScreen('setup');
};

// 2. FORMULIR KUNJUNGAN
document.getElementById('btn-new-visit').onclick = () => {
    document.getElementById('visit-sales').value = localStorage.getItem('salesName') || '';
    document.getElementById('visit-store').value = '';
    document.getElementById('visit-location').value = '';
    setDateTime();
    showScreen('form');
};

document.getElementById('btn-back-home').onclick = () => showScreen('home');
document.getElementById('btn-reset-time').onclick = setDateTime;

function setDateTime() {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    document.getElementById('visit-date').value = dateStr;
    document.getElementById('visit-time').value = timeStr;
}

// GPS Geolocation
document.getElementById('btn-get-location').onclick = () => {
    const locInput = document.getElementById('visit-location');
    locInput.value = 'Mencari lokasi...';
    if (!navigator.geolocation) return locInput.value = 'GPS tidak didukung browser';
    
    navigator.geolocation.getCurrentPosition(
        (pos) => { locInput.value = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`; },
        (err) => { locInput.value = ''; alert('Gagal mendapatkan lokasi. Pastikan izin GPS diberikan.'); },
        { enableHighAccuracy: true, timeout: 10000 }
    );
};

// 3. KAMERA
document.getElementById('btn-to-camera').onclick = async () => {
    if (!document.getElementById('visit-store').value.trim()) return alert('Nama toko wajib diisi!');
    showScreen('camera');
    try {
        currentStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        document.getElementById('camera-view').srcObject = currentStream;
    } catch (err) {
        alert('Gagal mengakses kamera: ' + err.message);
        showScreen('form');
    }
};

document.getElementById('btn-cancel-camera').onclick = () => {
    stopCamera();
    showScreen('form');
};

function stopCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
}

// 4. AMBIL FOTO & WATERMARK
document.getElementById('btn-take-photo').onclick = () => {
    const video = document.getElementById('camera-view');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    rawImage.src = canvas.toDataURL('image/jpeg', 0.9);
    rawImage.onload = () => {
        stopCamera();
        syncEditForm();
        renderWatermark();
        showScreen('preview');
    };
};

function syncEditForm() {
    document.getElementById('edit-store').value = document.getElementById('visit-store').value;
    document.getElementById('edit-sales').value = document.getElementById('visit-sales').value;
    document.getElementById('edit-location').value = document.getElementById('visit-location').value;
    document.getElementById('edit-date').value = document.getElementById('visit-date').value;
    document.getElementById('edit-time').value = document.getElementById('visit-time').value;
}

document.getElementById('btn-update-watermark').onclick = renderWatermark;

function renderWatermark() {
    const canvas = document.getElementById('photo-canvas');
    canvas.width = rawImage.width;
    canvas.height = rawImage.height;
    const ctx = canvas.getContext('2d');
    
    // Gambar foto asli
    ctx.drawImage(rawImage, 0, 0, canvas.width, canvas.height);
    
    // Ambil data
    const store = document.getElementById('edit-store').value.toUpperCase();
    const sales = document.getElementById('edit-sales').value.toUpperCase();
    const loc = document.getElementById('edit-location').value;
    const date = document.getElementById('edit-date').value;
    const time = document.getElementById('edit-time').value;
    const company = (localStorage.getItem('companyName') || '').toUpperCase();
    
    // Panel Watermark Semi-transparan di bawah
    const panelHeight = canvas.height * 0.18; 
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, canvas.height - panelHeight, canvas.width, panelHeight);
    
    // Teks Styling
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'top';
    
    const fontSizeLg = Math.floor(canvas.height * 0.035);
    const fontSizeSm = Math.floor(canvas.height * 0.025);
    const padX = canvas.width * 0.03;
    let padY = canvas.height - panelHeight + (canvas.height * 0.02);

    // Render Teks
    ctx.font = `bold ${fontSizeLg}px sans-serif`;
    ctx.fillText(`KUNJUNGAN SALES ${company ? '- ' + company : ''}`, padX, padY);
    
    padY += fontSizeLg * 1.5;
    ctx.font = `bold ${fontSizeSm}px sans-serif`;
    ctx.fillStyle = '#ffdf00'; // Warna kuning untuk penekanan toko
    ctx.fillText(`TOKO: ${store}`, padX, padY);
    
    padY += fontSizeSm * 1.4;
    ctx.fillStyle = '#ffffff';
    ctx.font = `${fontSizeSm}px sans-serif`;
    ctx.fillText(`SALES: ${sales}  |  TANGGAL: ${date} ${time} WIB`, padX, padY);
    
    if (loc) {
        padY += fontSizeSm * 1.4;
        ctx.fillText(`LOKASI: ${loc}`, padX, padY);
    }

    // Simpan ke blob untuk diunduh/dibagikan
    canvas.toBlob((blob) => {
        finalPhotoBlob = blob;
        const rawDate = date.split('-').reverse().join('');
        const rawTime = time.replace(':', '');
        const safeStoreName = store.replace(/[^a-zA-Z0-9]/g, '_');
        currentPhotoFilename = `${rawDate}_${safeStoreName}_${rawTime}.jpg`;
    }, 'image/jpeg', 0.85);
}

document.getElementById('btn-retake').onclick = () => { showScreen('camera'); document.getElementById('btn-to-camera').click(); };

// 5. SIMPAN DAN BAGIKAN
document.getElementById('btn-save-photo').onclick = () => {
    saveToIndexedDB();
    const url = URL.createObjectURL(finalPhotoBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentPhotoFilename;
    a.click();
    URL.revokeObjectURL(url);
    alert('Foto berhasil diunduh dan disimpan di riwayat.');
    showScreen('home');
};

document.getElementById('btn-share-photo').onclick = async () => {
    saveToIndexedDB();
    if (navigator.share && navigator.canShare) {
        const file = new File([finalPhotoBlob], currentPhotoFilename, { type: 'image/jpeg' });
        if (navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({ files: [file], title: 'Kunjungan Sales', text: 'Laporan Kunjungan' });
                showScreen('home');
            } catch (err) { console.log('Batal berbagi', err); }
        } else {
            alert('Browser tidak mendukung pembagian file secara langsung. Silakan gunakan tombol Simpan.');
        }
    } else {
        alert('Fitur berbagi tidak didukung di browser ini. Silakan Simpan foto terlebih dahulu lalu kirim manual melalui WhatsApp.');
    }
};

// 6. RIWAYAT & PENYIMPANAN LOKAL
function saveToIndexedDB() {
    const store = document.getElementById('edit-store').value;
    const tx = db.transaction(['photos', 'stores'], 'readwrite');
    
    // Simpan foto
    const reader = new FileReader();
    reader.onload = () => {
        const photoData = {
            store: store,
            sales: document.getElementById('edit-sales').value,
            date: document.getElementById('edit-date').value,
            time: document.getElementById('edit-time').value,
            loc: document.getElementById('edit-location').value,
            image: reader.result // Base64
        };
        tx.objectStore('photos').add(photoData);
    };
    reader.readAsDataURL(finalPhotoBlob);

    // Simpan nama toko untuk auto-suggest
    tx.objectStore('stores').put({ name: store });
}

function loadStoreSuggestions() {
    const tx = db.transaction('stores', 'readonly');
    const storeList = document.getElementById('store-list');
    storeList.innerHTML = '';
    tx.objectStore('stores').openCursor().onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
            const option = document.createElement('option');
            option.value = cursor.value.name;
            storeList.appendChild(option);
            cursor.continue();
        }
    };
}

// Buka halaman riwayat
document.getElementById('btn-history').onclick = () => {
    showScreen('history');
    const gallery = document.getElementById('history-gallery');
    gallery.innerHTML = '<p>Memuat riwayat...</p>';
    
    const tx = db.transaction('photos', 'readonly');
    const req = tx.objectStore('photos').getAll();
    req.onsuccess = () => {
        gallery.innerHTML = '';
        const photos = req.result.reverse(); // Terbaru di atas
        if (photos.length === 0) return gallery.innerHTML = '<p>Riwayat kosong.</p>';
        
        photos.forEach(p => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <img src="${p.image}" alt="${p.store}">
                <div class="history-details">
                    <strong>Toko: ${p.store}</strong><br>
                    Waktu: ${p.date} ${p.time}<br>
                    Sales: ${p.sales}
                </div>
            `;
            gallery.appendChild(div);
        });
    };
};

document.getElementById('btn-back-from-history').onclick = () => showScreen('home');
document.getElementById('btn-clear-history').onclick = () => {
    if(confirm('Hapus seluruh riwayat foto dari HP ini?')) {
        const tx = db.transaction('photos', 'readwrite');
        tx.objectStore('photos').clear();
        document.getElementById('history-gallery').innerHTML = '<p>Riwayat kosong.</p>';
    }
};

// Registrasi Service Worker PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js').catch(err => console.log('SW Reg failed:', err));
    });
}
