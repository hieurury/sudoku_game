/**
 * Lưu trữ dữ liệu game vào thư mục data/ cạnh file exe (chỉ hoạt động trong Tauri).
 * Fallback: không làm gì (dữ liệu web chỉ qua localStorage).
 */
import { invoke } from '@tauri-apps/api/core';

export function isTauriRuntime(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export async function writeDataFile(filename: string, content: string): Promise<void> {
  if (!isTauriRuntime()) return;
  await invoke('write_data_file', { filename, content });
}

export async function readDataFile(filename: string): Promise<string | null> {
  if (!isTauriRuntime()) return null;
  try {
    return await invoke<string | null>('read_data_file', { filename });
  } catch {
    return null;
  }
}

export async function removeDataFile(filename: string): Promise<void> {
  if (!isTauriRuntime()) return;
  try {
    await invoke('remove_data_file', { filename });
  } catch {
    // file không tồn tại → bỏ qua
  }
}
