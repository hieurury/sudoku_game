use std::path::PathBuf;

fn get_data_dir() -> Result<PathBuf, String> {
  let exe_dir = std::env::current_exe()
    .map_err(|e| e.to_string())?
    .parent()
    .ok_or_else(|| "Cannot get exe parent dir".to_string())?
    .to_path_buf();
  Ok(exe_dir.join("data"))
}

#[tauri::command]
fn write_data_file(filename: String, content: String) -> Result<(), String> {
  let data_dir = get_data_dir()?;
  std::fs::create_dir_all(&data_dir).map_err(|e| e.to_string())?;
  std::fs::write(data_dir.join(&filename), content).map_err(|e| e.to_string())
}

#[tauri::command]
fn read_data_file(filename: String) -> Result<Option<String>, String> {
  let data_dir = get_data_dir()?;
  let path = data_dir.join(&filename);
  if path.exists() {
    std::fs::read_to_string(path).map(Some).map_err(|e| e.to_string())
  } else {
    Ok(None)
  }
}

#[tauri::command]
fn remove_data_file(filename: String) -> Result<(), String> {
  let data_dir = get_data_dir()?;
  let path = data_dir.join(&filename);
  if path.exists() {
    std::fs::remove_file(path).map_err(|e| e.to_string())
  } else {
    Ok(())
  }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(tauri::generate_handler![
      write_data_file,
      read_data_file,
      remove_data_file,
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
