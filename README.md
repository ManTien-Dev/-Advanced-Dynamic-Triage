# Interactive Presentation & Triage Simulator

Thư mục này chứa toàn bộ mã nguồn của slide thuyết trình tương tác và **Trình giả lập điều phối phòng chờ cấp cứu (Simulator)** dành cho hệ thống phân loại bệnh nhân cấp cứu lũy tiến (Advanced Dynamic Triage).

---

## 🎨 Các Thành Phần Công Nghệ

Ứng dụng được xây dựng hoàn toàn bằng các công nghệ Web lõi (không phụ thuộc thư viện ngoài) để đảm bảo tốc độ tải nhanh nhất và khả năng tương thích cao:
1. **Core**: HTML5 cấu trúc các slide và giao diện giả lập.
2. **Styling**: Vanilla CSS3 với hệ thống biến số màu sắc, bo góc phát sáng (glassmorphism), và hoạt ảnh chuyển trang so le (Staggered Animations).
3. **Logic**: Javascript thuần điều phối các sự kiện bấm phím, điều chỉnh tăng giảm thời gian, và mô phỏng chính xác thuật toán hàng đợi Priority Queues bằng cách phân nhóm bệnh nhân theo 3 giai đoạn.

---

## 📂 Danh Sách Các File

*   **`index.html`**: Chứa khung sườn của 9 slide và các phần tử giao diện của mô phỏng ( queues, console log, popup thông báo).
*   **`style.css`**: Định hình chủ đề tối (medical dark mode) phối xanh dương - tím neon, hiệu ứng hover, lưới nền chìm và hoạt ảnh bay lên mượt mà của nội dung.
*   **`script.js`**:
    *   Logic điều khiển lật trang (sử dụng chuột hoặc phím mũi tên).
    *   Mô phỏng lớp `Patient`, tính toán điểm triage động và so sánh tìm người ưu tiên nhất theo đúng thuật toán Java.
    *   Cập nhật thời gian giả lập và chuyển tiếp bệnh nhân giữa các queue (Lazy Migration).

---

## 🚀 Cách Khởi Chạy

### Cách 1: Click đúp trực tiếp
Nhấp đúp chuột trực tiếp vào file **`index.html`** trên hệ điều hành của bạn. File sẽ được mở trực tiếp dưới dạng giao diện cục bộ trên các trình duyệt Chrome, Edge hoặc Firefox.

### Cách 2: Khởi động Server Python
Mở Terminal/Powershell trong thư mục `presentation` và chạy:
```bash
python -m http.server 8000
```
Sau đó, truy cập trình duyệt theo địa chỉ: [http://localhost:8000](http://localhost:8000)

---

## 🕹 Hướng Dẫn Thao Tác Trình Chiếu

### 1. Điều khiển Slide
*   Bấm phím **Mũi tên bên phải** hoặc phím **Space** để đi tới slide tiếp theo.
*   Bấm phím **Mũi tên bên trái** để quay lại slide trước đó.
*   *Lưu ý:* Khi bạn đang gõ chữ vào các ô nhập liệu của Simulator trên Slide 9, phím lật trang sẽ tự động bị vô hiệu hóa để tránh chuyển trang ngoài ý muốn.

### 2. Sử dụng Trình giả lập (Slide 9)
*   **Nạp kịch bản mẫu 1:** Tự động tạo dữ liệu mẫu theo đề bài ($R_1=1, R_2=2, R_3=5$, bệnh nhân **An** vào ở phút thứ 0, bệnh nhân **Binh** vào ở phút 120).
*   **Thêm bệnh nhân mới (IN):** Nhập tên (chữ cái tiếng Anh viết liền) và chọn mức độ ưu tiên lâm sàng (Level 1 tới 5), sau đó nhấn nút thêm. Bệnh nhân sẽ ngay lập tức được đẩy vào Queue 1.
*   **Tăng thời gian (+5 phút):** Giả lập thời gian trôi đi. Điểm triage của mọi người sẽ tăng tương ứng. Nếu bệnh nhân nào đợi quá 60 phút hoặc 120 phút, bạn sẽ thấy hệ thống tự động di dời họ sang Queue 2 và Queue 3 (được ghi nhận ở Console nhật ký).
*   **Gọi khám (CALL):** Bác sĩ trống tay gọi người. Hệ thống tìm bệnh nhân ở đỉnh 3 Queue có điểm triage lớn nhất (người được đánh dấu viền xanh dương và nhãn `TOP` nhấp nháy), hiển thị loa phát thanh thông báo.
