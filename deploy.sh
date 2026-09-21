#!/bin/bash
# ==============================================================================
# Script Otomatis Deploy / Update Sistem Absensi STKIP Usman Safri di cPanel
# ==============================================================================

set -e

REPO_DIR="/home/u1807837/absensistkipus"
PUBLIC_DIR="/home/u1807837/public_html/absensi.stkip-us.ac.id"

echo "=========================================================="
echo "🚀 Memulai Otomasi Deployment Absensi STKIP Usman Safri..."
echo "=========================================================="

# 1. Pull pembaruan kode dari GitHub
echo "📦 1. Mengambil kode terbaru dari Git..."
cd "$REPO_DIR"
git pull origin main

# 2. Update dependency & cache backend
echo "⚙️ 2. Mengoptimasi Backend Laravel..."
cd "$REPO_DIR/backend"
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 3. Sinkronisasi Web Admin & Frontend Assets ke Document Root
echo "🌐 3. Menyinkronkan Web Admin ke Document Root..."
mkdir -p "$PUBLIC_DIR"
cp -rf "$REPO_DIR/admin/dist/"* "$PUBLIC_DIR/"

# 4. Buat file index.php bridge Laravel
echo "🔗 4. Mengonfigurasi index.php bridge..."
cat << 'EOF' > "$PUBLIC_DIR/index.php"
<?php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

require '/home/u1807837/absensistkipus/backend/vendor/autoload.php';

$app = require_once '/home/u1807837/absensistkipus/backend/bootstrap/app.php';

$kernel = $app->make(Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);
EOF

# 5. Konfigurasi .htaccess cerdas (API + SPA React + Storage)
echo "🛡️ 5. Memasang konfigurasi .htaccess..."
cat << 'EOF' > "$PUBLIC_DIR/.htaccess"
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # 1. Pastikan Header Authorization Bearer Token dikirim ke PHP
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # 2. Request ke /api/* dan /storage/* diproses index.php Laravel
    RewriteRule ^api(/.*)?$ index.php [L,QSA]
    RewriteRule ^storage(/.*)?$ index.php [L,QSA]

    # 3. File aset statis fisik (JS, CSS, Font, WebP, SVG, PNG) dilayani langsung
    RewriteCond %{REQUEST_FILENAME} -f
    RewriteRule ^ - [L]

    # 4. Folder fisik dilayani langsung
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteCond %{REQUEST_URI} !^/$
    RewriteRule ^ - [L]

    # 5. Semua rute halaman Admin SPA dialihkan ke index.html
    RewriteRule ^ index.html [L]
</IfModule>
EOF

# 6. Hubungkan Storage Link
echo "📂 6. Memastikan Symlink Storage aktif..."
ln -sfn "$REPO_DIR/backend/storage/app/public" "$PUBLIC_DIR/storage"

# 7. Set Permissions
echo "🔒 7. Mengatur hak akses folder & file..."
chmod 644 "$PUBLIC_DIR/.htaccess"
chmod 644 "$PUBLIC_DIR/index.php"
chmod -R 775 "$REPO_DIR/backend/storage"
chmod -R 775 "$REPO_DIR/backend/bootstrap/cache"

echo "=========================================================="
echo "✅ DEPLOYMENT BERHASIL & SISTEM 100% ONLINE!"
echo "🌐 URL Admin & API: https://absensi.stkip-us.ac.id"
echo "=========================================================="
