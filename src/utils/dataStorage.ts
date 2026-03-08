/**
 * Lưu trữ dữ liệu game vào thư mục data/ cạnh file exe (chỉ hoạt động trong Tauri).
 * Fallback: không làm gì (dữ liệu web chỉ qua localStorage).
 */
import { invoke } from '@tauri-apps/api/core';

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export async function writeDataFile(filename: string, content: string): Promise<void> {
  if (!isTauri()) return;
  await invoke('write_data_file', { filename, content });
}

export async function readDataFile(filename: string): Promise<string | null> {
  if (!isTauri()) return null;
  try {
    return await invoke<string | null>('read_data_file', { filename });
  } catch {
    return null;
  }
}

export async function removeDataFile(filename: string): Promise<void> {
  if (!isTauri()) return;
  try {
    await invoke('remove_data_file', { filename });
  } catch {
    // file không tồn tại → bỏ qua
  }
}
