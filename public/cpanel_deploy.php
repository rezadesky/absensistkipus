<?php
/**
 * Auto-Deployer Web Script - STKIP Usman Safri
 * Akses via browser untuk menjalankan artisan migrate, storage link, symlink, dan cache.
 */

// Keamanan: Hanya izinkan dengan kunci akses
$secretKey = 'stkip2026';
if (!isset($_GET['key']) || $_GET['key'] !== $secretKey) {
    die('<h3 style="color:red;font-family:sans-serif;">Akses Ditolak! Gunakan: ?key=stkip2026</h3>');
}

$projectDir = realpath(__DIR__ . '/..');
$publicDir = '/home/u1807837/public_html/absensi.stkip-us.ac.id';

echo "<pre style='background:#0F2747;color:#fff;padding:20px;border-radius:12px;font-family:monospace;font-size:13px;line-height:1.6;'>";
echo "🚀 <b>MEMULAI AUTO DEPLOYMENT WEB...</b>\n\n";

// 1. Hubungkan Symlink jika belum
if (!is_link($publicDir) && is_dir($projectDir . '/public')) {
    if (is_dir($publicDir)) {
        @rmdir($publicDir);
    }
    @symlink($projectDir . '/public', $publicDir);
    echo "✅ Symlink Subdomain: Terhubung ke {$projectDir}/public\n";
} else {
    echo "ℹ️ Symlink Subdomain: Sudah aktif.\n";
}

// 2. Chmod permissions
@chmod($projectDir . '/storage', 0775);
@chmod($projectDir . '/bootstrap/cache', 0775);
echo "✅ Folder Permission: storage & bootstrap/cache (0775)\n";

// 3. Jalankan Artisan Commands
chdir($projectDir);

echo "\n--- Menjalankan PHP Artisan Commands ---\n";

function runArtisan($command) {
    $output = [];
    exec("php artisan {$command} 2>&1", $output, $status);
    echo "<b>> php artisan {$command}</b>\n";
    echo implode("\n", $output) . "\n\n";
}

runArtisan('key:generate --force');
runArtisan('storage:link');
runArtisan('migrate --seed --force');
runArtisan('config:cache');
runArtisan('route:cache');
runArtisan('view:cache');

echo "\n🎉 <b>DEPLOYMENT SELESAI!</b>\n";
echo "🌐 Kunjungi Website: <a href='https://absensi.stkip-us.ac.id' style='color:#F28C28;font-weight:bold;'>https://absensi.stkip-us.ac.id</a>\n";
echo "</pre>";
