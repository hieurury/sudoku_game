/**
 * Build script: biên dịch Tauri app và copy artifacts vào
 * D:\Programs\product_results\sudoku-game_@<version>
 *
 * Chạy: npm run build:release
 */

import { execSync } from 'child_process';
import { readFileSync, mkdirSync, existsSync, readdirSync, copyFileSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = resolve(__dirname, '..');

// Đọc version và productName từ tauri.conf.json
const tauriConf = JSON.parse(readFileSync(join(rootDir, 'src-tauri/tauri.conf.json'), 'utf-8'));
const version = tauriConf.version;
const productName = tauriConf.productName; // sudoku-game

const outputDir = `D:\\Programs\\product_results\\${productName}_@${version}`;

console.log(`\n========================================`);
console.log(` Building ${productName} v${version}`);
console.log(` Output: ${outputDir}`);
console.log(`========================================\n`);

// Chạy tauri build
execSync('npm run tauri -- build', { stdio: 'inherit', cwd: rootDir });

// Tạo thư mục output
mkdirSync(outputDir, { recursive: true });

// Helper: copy toàn bộ thư mục
function copyDir(src, dest) {
  if (!existsSync(src)) return false;
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
  return true;
}

let copied = false;

// Copy NSIS installer (.exe installer)
const nsisDir = join(rootDir, 'src-tauri/target/release/bundle/nsis');
if (copyDir(nsisDir, join(outputDir, 'installer'))) {
  console.log('✔ Đã copy: installer/ (NSIS)');
  copied = true;
}

// Copy MSI installer
const msiDir = join(rootDir, 'src-tauri/target/release/bundle/msi');
if (copyDir(msiDir, join(outputDir, 'msi'))) {
  console.log('✔ Đã copy: msi/');
  copied = true;
}

// Copy portable exe (nếu tồn tại)
// Tauri đặt tên exe theo productName (dấu - đổi thành _)
const exeName = productName.replace(/-/g, '_') + '.exe';
const exePath = join(rootDir, `src-tauri/target/release/${exeName}`);
if (existsSync(exePath)) {
  copyFileSync(exePath, join(outputDir, `${productName}.exe`));
  console.log(`✔ Đã copy: ${productName}.exe`);
  copied = true;
}

if (!copied) {
  console.warn('\n⚠ Không tìm thấy artifacts để copy. Kiểm tra lại quá trình build.');
  process.exit(1);
}

console.log(`\n✅ Build hoàn tất! Artifacts tại: ${outputDir}\n`);
