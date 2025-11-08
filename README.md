# 🖥️ Ubuntu Desktop Online

Máy tính ảo Ubuntu trên trình duyệt với hạ tầng [E2B.dev](https://e2b.dev)

## ✨ Tính năng

- 🚀 **Khởi động nhanh**: Tạo sandbox E2B chỉ trong vài giây
- ⏱️ **Quản lý thời gian tự động**:
  - Thời gian mặc định: **59 phút** (Free Plan)
  - Có thể mở rộng lên **23 giờ 59 phút** (Pro Plan)
- ⏸️ **Auto-pause thông minh**: Tự động tạm dừng khi hết thời gian
- 🔔 **Banner cảnh báo**: Hiển thị đếm ngược 59 giây để người dùng quyết định
- 🗑️ **Auto-cleanup**: Tự động xóa sandbox nếu không có phản hồi
- 🐍 **Python Terminal**: Chạy code Python trực tiếp trong sandbox
- 🎨 **UI đẹp mắt**: Giao diện hiện đại với Tailwind CSS

## 🏗️ Kiến trúc

```
ubuntu-desktop-online/
├── src/
│   ├── components/           # React components
│   │   ├── PauseBanner.tsx   # Banner cảnh báo khi pause
│   │   ├── SessionControls.tsx # Điều khiển session
│   │   └── Terminal.tsx      # Terminal Python
│   ├── services/
│   │   └── E2BSessionManager.ts # Quản lý E2B session
│   ├── stores/
│   │   └── useSessionStore.ts # Zustand store
│   ├── types/
│   │   └── session.ts        # TypeScript types
│   ├── utils/
│   │   └── config.ts         # Configuration loader
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── .env.example             # Environment template
├── .gitignore              # Git ignore file
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── tailwind.config.js      # Tailwind CSS config
├── vite.config.ts          # Vite config
└── README.md              # Documentation
```

## 📋 Yêu cầu

- Node.js >= 18.0.0
- npm hoặc yarn
- E2B API Key (đăng ký tại [e2b.dev/dashboard](https://e2b.dev/dashboard))

## 🚀 Cài đặt

### 1. Clone repository

```bash
git clone https://github.com/your-username/ubuntu-desktop-online.git
cd ubuntu-desktop-online
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình môi trường

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env` và thêm E2B API Key của bạn:

```env
# E2B API Key - Get yours at https://e2b.dev/dashboard
E2B_API_KEY=your_e2b_api_key_here

# Optional: Cấu hình tùy chỉnh
# VITE_DEFAULT_SESSION_DURATION_MINUTES=59
# VITE_MAX_SESSION_DURATION_MINUTES=1439
# VITE_PAUSE_WARNING_SECONDS=59
```

### 4. Chạy ứng dụng

```bash
npm run dev
```

Truy cập: `http://localhost:3000`

## 📖 Hướng dẫn sử dụng

### Bước 1: Khởi động Sandbox

1. Nhập thời gian làm việc mong muốn (mặc định 59 phút)
2. Nhấn nút **"Khởi động"**
3. Đợi sandbox được tạo (thường mất 5-10 giây)

### Bước 2: Sử dụng Terminal

1. Viết code Python trong ô "Code"
2. Nhấn **"Chạy Code"** để thực thi
3. Xem kết quả trong ô "Output"

### Bước 3: Quản lý Session

- **Theo dõi thời gian**: Thanh progress bar hiển thị thời gian còn lại
- **Khi hết thời gian**:
  - Sandbox tự động pause
  - Banner cảnh báo xuất hiện
  - Bạn có **59 giây** để quyết định:
    - ✅ **Tiếp tục**: Khởi động lại session mới
    - 🛑 **Kết thúc**: Đóng sandbox ngay lập tức

### Bước 4: Cleanup

- Nếu không nhấn nút trong 59 giây, sandbox sẽ bị **xóa hoàn toàn**
- Bạn có thể nhấn **"Dừng Sandbox"** bất cứ lúc nào để kết thúc sớm

## 🔧 Cấu hình

### Environment Variables

| Variable | Mô tả | Mặc định |
|----------|-------|----------|
| `E2B_API_KEY` | API key từ E2B.dev | **Bắt buộc** |
| `VITE_DEFAULT_SESSION_DURATION_MINUTES` | Thời gian session mặc định | `59` |
| `VITE_MAX_SESSION_DURATION_MINUTES` | Thời gian tối đa (Pro Plan) | `1439` |
| `VITE_PAUSE_WARNING_SECONDS` | Thời gian cảnh báo sau pause | `59` |

### E2B Plans

| Plan | Thời gian tối đa | Giá |
|------|------------------|-----|
| **Free** | 59 phút | Miễn phí |
| **Pro** | 23 giờ 59 phút | [Xem giá](https://e2b.dev/pricing) |

## 🎯 Các trạng thái Session

- **🟢 ACTIVE**: Sandbox đang hoạt động
- **🔵 STARTING**: Đang khởi động sandbox
- **🟠 PAUSED**: Đã tạm dừng, chờ người dùng quyết định
- **🟡 RESUMING**: Đang khởi động lại
- **⚫ TERMINATING**: Đang đóng sandbox
- **⚪ TERMINATED**: Đã đóng
- **🔴 ERROR**: Có lỗi xảy ra

## 🏗️ Build Production

```bash
npm run build
```

Output sẽ được tạo trong thư mục `dist/`

## 🧪 Công nghệ sử dụng

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Sandbox Platform**: E2B.dev Code Interpreter

## 📝 E2B Session Manager API

### Constructor

```typescript
const manager = new E2BSessionManager(config: SessionConfig)
```

### Methods

#### `startSession(durationMinutes?: number)`
Khởi động sandbox với thời gian tùy chọn

```typescript
await manager.startSession(120); // 120 phút
```

#### `continueSession()`
Tiếp tục làm việc sau khi pause

```typescript
await manager.continueSession();
```

#### `terminateSession(auto?: boolean)`
Xóa hoàn toàn sandbox

```typescript
await manager.terminateSession();
```

#### `executeCode(code: string)`
Thực thi Python code

```typescript
const output = await manager.executeCode('print("Hello")');
```

#### `subscribe(listener: Function)`
Đăng ký nhận thông báo thay đổi trạng thái

```typescript
const unsubscribe = manager.subscribe((info: SessionInfo) => {
  console.log('Session state:', info.state);
});
```

## 🐛 Troubleshooting

### Lỗi: "E2B_API_KEY không được thiết lập"

**Giải pháp**:
1. Kiểm tra file `.env` đã được tạo chưa
2. Đảm bảo `E2B_API_KEY` có giá trị hợp lệ
3. Restart dev server: `npm run dev`

### Lỗi: "Không thể khởi tạo sandbox"

**Giải pháp**:
1. Kiểm tra API key có hợp lệ không tại [e2b.dev/dashboard](https://e2b.dev/dashboard)
2. Kiểm tra kết nối internet
3. Xem console logs để biết chi tiết lỗi

### Sandbox bị xóa quá nhanh

**Giải pháp**:
- Điều chỉnh `VITE_PAUSE_WARNING_SECONDS` trong `.env`
- Nâng cấp lên Pro Plan để có thời gian session dài hơn

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:

1. Fork repository
2. Tạo branch mới: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add some AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Mở Pull Request

## 📄 License

Dự án này được phát hành dưới giấy phép MIT. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 🔗 Links

- [E2B Documentation](https://e2b.dev/docs)
- [E2B Dashboard](https://e2b.dev/dashboard)
- [E2B Pricing](https://e2b.dev/pricing)

## 👨‍💻 Tác giả

Được xây dựng với ❤️ bởi [Your Name]

---

⭐ Nếu bạn thấy dự án hữu ích, hãy cho một star nhé!
