#!/bin/bash

# ==============================================================================
# SCRIPT DEPLOYMENT OTOMATIS - ABSENSI FUNGSIONAL STKIP USMAN SAFRI
# Server: cPanel (u1807837)
# ==============================================================================

echo "========================================================"
echo "🚀 MEMULAI PROSES DEPLOYMENT ABSENSI STKIP USMAN SAFRI..."
echo "========================================================"

PROJECT_DIR="/home/u1807837/absensistkipus"
PUBLIC_DIR="/home/u1807837/public_html/absensi.stkip-us.ac.id"

# 1. Pindah ke folder project
cd $PROJECT_DIR || { echo "❌ Folder $PROJECT_DIR tidak ditemukan!"; exit 1; }

# 2. Setup File .env jika belum ada
if [ ! -f .env ]; then
    echo "📄 Menyalin .env.example ke .env..."
    cp .env.example .env
fi

# 3. Set Permission Folder Storage & Cache
echo "🔒 Mengatur hak akses folder storage & bootstrap/cache..."
chmod -R 775 storage bootstrap/cache

# 4. Hubungkan Symlink ke Subdomain Public HTML
echo "🔗 Menghubungkan symlink subdomain public_html..."
if [ -d "$PUBLIC_DIR" ] && [ ! -L "$PUBLIC_DIR" ]; then
    echo "⚠️ Menghapus folder public lama yang kosong..."
    rm -rf "$PUBLIC_DIR"
fi

if [ ! -L "$PUBLIC_DIR" ]; then
    ln -s "$PROJECT_DIR/public" "$PUBLIC_DIR"
    echo "✅ Symlink berhasil dibuat: $PUBLIC_DIR -> $PROJECT_DIR/public"
else
    echo "ℹ️ Symlink subdomain sudah terpasang."
fi

# 5. Pasang Composer Dependencies jika diperlukan
if command -v composer &> /dev/null; then
    echo "📦 Menjalankan composer install..."
    composer install --optimize-autoloader --no-dev --no-interaction
fi

# 6. Generate Application Key jika kosong
echo "🔑 Memeriksa Application Key..."
php artisan key:generate --force

# 7. Migrasi Database dan Seeder
echo "🗄️ Menjalankan database migration & seeder..."
php artisan migrate --seed --force

# 8. Hubungkan Storage Link (Lampiran Dokumen Izin)
echo "📁 Menghubungkan storage link publik..."
php artisan storage:link

# 9. Optimalkan Cache Laravel Production
echo "⚡ Mengoptimalkan cache sistem..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo ""
echo "========================================================"
echo "🎉 DEPLOYMENT BERHASIL & SELESAI!"
echo "🌐 Akses Website: https://absensi.stkip-us.ac.id"
echo "========================================================"
