# HanGak (한각) - Ứng dụng Học Tiếng Hàn Local

HanGak là ứng dụng web chạy trực tiếp trên trình duyệt, không cần cài đặt Node.js hay Python server. Ứng dụng tập trung vào 2 phương pháp học tiếng Hàn thực chiến: **Soi cấu trúc ngữ pháp (Sentence Glossing)** và **Luyện nghe chép chính tả qua video (Video Dictation)**.

---

## Tính năng chính

### 1. Tab 1: Phân tích & Soi từ vựng (Sentence Glossing)
- **Tách từ & Nhận diện từ loại (POS Tagging):**
  - Tự động tách câu tiếng Hàn thành các thành phần ngữ pháp.
  - Gạch chân từng từ với màu sắc trực quan:
    - **Danh từ (Noun):** Xanh lá
    - **Động từ (Verb):** Đỏ
    - **Tính từ (Adjective):** Xanh dương
    - **Tiểu từ / Trợ từ (Particle - Josa):** Tím
    - **Phó từ (Adverb):** Cam
    - **Đại từ (Pronoun):** Xanh ngọc
    - **Liên từ (Conjunction):** Chàm
    - **Số từ (Numeral):** Xanh lơ
  - Có bảng chú thích màu sắc (Color Legend) đi kèm, bấm vào từ loại để làm nổi bật các từ tương ứng trong câu.
- **Thẻ thông tin từ vựng tương tác (Popover & Sidebar):**
  - Bấm vào bất kỳ từ nào được gạch chân để mở thẻ nổi ngay phía trên từ:
    - **Dạng nguyên thể (Từ gốc):** Tự động khôi phục về dạng từ điển `~다` (như `좋네요` -> `좋다`, `마실까요` -> `마시다`, `공부해요` -> `공부하다`).
    - **Phát âm thực tế (Nối âm / Biến âm):** Hiển thị cách đọc nối âm Hangul thực tế `[발음]` (như `한국어` -> `[한구거]`, `좋은` -> `[조은]`) và phiên âm Latinh `[Romaja]`.
    - **Nghĩa tiếng Việt theo ngữ cảnh:** Giải nghĩa sát nghĩa câu kèm phân tích trợ từ đi kèm.
    - **Phát âm từ:** Bấm nút chiếc loa để nghe phát âm chuẩn của từ riêng lẻ.
    - **Ghim chi tiết:** Ghim thông tin từ lên bảng bên phải để tiện đối chiếu.
- **Phát âm cả câu (AI Voice):**
  - Tự động ưu tiên giọng đọc Neural AI tự nhiên của trình duyệt (như Microsoft Sun-Hi, Heami, Google Korean) với ngữ điệu đàm thoại tự nhiên, không yêu cầu nhập API key.
- **Bộ câu mẫu sẵn sàng:** Cung cấp sẵn các mẫu câu giao tiếp đa dạng để bấm thử nghiệm tức thì.

### 2. Tab 2: Luyện nghe chép chính tả qua Video (Video Dictation)
- **Dữ liệu mẫu tích hợp sẵn:**
  - Đi kèm video hội thoại tại quán cà phê (`media/sample.mp4`) và bộ phụ đề song ngữ Hàn - Việt theo mốc thời gian (`media/sample_subtitles.json`, `.srt`, `.vtt`).
  - Hỗ trợ tải lên video riêng của bạn (`.mp4`, `.webm`) và file phụ đề (`.json`, `.srt`, `.vtt`).
- **Luồng nghe chép từng từ (Word-by-word):**
  - Video phát trọn vẹn câu thoại rồi **tự động tạm dừng (auto-pause)** tại mốc kết thúc của câu.
  - Câu thoại được chia thành các ô từ nối tiếp (`[ Từ 1 ] [ Từ 2 ] ...`).
  - Người dùng gõ từ hiện tại, nhấn **Space** hoặc **Enter** để kiểm tra ngay:
    - **Đúng:** Ô từ chuyển sang màu xanh lá kèm dấu tích, tự động chuyển con trỏ sang ô từ kế tiếp.
    - **Sai:** Ô từ rung lắc cảnh báo đỏ, giữ nguyên cho phép sửa lại hoặc bấm nút **Xem gợi ý (Chữ cái đầu)**.
  - **Phím tắt nhanh:** Nhấn phím `F2` hoặc `Ctrl + Space` để nghe lại đoạn video hiện tại bất cứ lúc nào.
- **Hoàn thành câu & Chuyển tiếp:**
  - Khi hoàn thành tất cả các từ trong câu, hiển thị bảng chúc mừng kèm câu tiếng Hàn đầy đủ và bản dịch tiếng Việt.
  - **Nút "Đẩy sang Tab 1":** Chuyển câu vừa chép sang Tab 1 chỉ với 1 click để soi chi tiết từng từ loại và ngữ pháp.

---

## Cấu trúc thư mục

```
HanGak/
├── index.html                  # Giao diện chính của ứng dụng
├── README.md                   # Tài liệu hướng dẫn
├── css/
│   └── style.css               # Phong cách giao diện & hiệu ứng động
├── js/
│   ├── korean-nlp.js           # Bộ xử lý ngôn ngữ tiếng Hàn (Jamo, nối âm, từ loại, từ gốc, từ điển)
│   ├── speech.js               # Động cơ phát âm từ & giọng AI đọc câu
│   ├── sample-data.js          # Dữ liệu câu mẫu và phân đoạn video mẫu
│   ├── tab-glossing.js         # Logic Tab 1 (Soi từ vựng, gạch chân màu, popover, ghim bảng)
│   ├── tab-dictation.js        # Logic Tab 2 (Video player, timeline, word slots, kiểm tra từng từ)
│   └── app.js                  # Khởi chạy ứng dụng & điều hướng tab
└── media/
    ├── sample.mp4              # File video hội thoại mẫu (chuẩn H.264 / AAC)
    ├── sample_subtitles.json   # Phụ đề mẫu dạng JSON
    ├── sample_subtitles.srt    # Phụ đề mẫu dạng SRT
    └── sample_subtitles.vtt    # Phụ đề mẫu dạng WebVTT
```

---

## Hướng dẫn cài đặt & Khởi chạy

### Cách 1: Mở trực tiếp (Không cần cài đặt bất kỳ công cụ nào)
1. Tải hoặc sao chép thư mục `HanGak` về máy.
2. Nhấp đúp chuột vào file `index.html` để mở bằng trình duyệt web (Google Chrome, Microsoft Edge, Firefox, Brave...).
3. Ứng dụng đã sẵn sàng sử dụng ngay lập tức với dữ liệu mẫu.

### Cách 2: Chạy qua Local HTTP Server (Tùy chọn)
Nếu bạn muốn chạy qua giao thức HTTP nội bộ:
```bash
# Sử dụng Python (nếu máy có cài sẵn Python):
python -m http.server 8000

# Sau đó mở trình duyệt truy cập:
# http://localhost:8000
```
