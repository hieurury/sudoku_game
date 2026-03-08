# Cấu hình tauri

## Về việc lưu trữ
Tiếp tục cấu hình hoàn thành việc lưu trữ tiến độ trò chơi ở bản desktop bằng việc lưu trữ qua file. Dữ liệu lưu trữ giống cách lưu bằng pinia trên web.

Cấu hình đường dẫn và cách build game hợp lý, tôi muốn sau khi build ra file exe tất cả thứ liên quan đến game được đặt vào 1 thư mục duy nhất tên là `sudoku-game_@<version>`, vị trí build đặt ở `D:\Programs\product_results`

> tất cả dữ liệu bao gồm: file chạy game .exe, các file json lưu trữ tiến độ, các file cấu hình khác nếu có.
