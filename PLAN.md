# EOI Linh Tinh AI — Plan (Draft v0)

> Web demo: sản phẩm đèn in 3D, user điều khiển slider bằng cử chỉ tay qua webcam.
> Scope: **Frontend-only** (no BE).

---

## 1. Mục tiêu MVP

- **Core experience**: Một trang duy nhất hiển thị slider các mẫu đèn 3D. User vẫy tay trái/phải trước webcam → slider tự chạy theo.
- **Fallback**: Vẫn có thể kéo chuột / swipe touch / nút mũi tên khi webcam bị từ chối.
- **Visual identity**: Kế thừa hệ màu `eoi-*` từ dự án [eoilinhtinh](../eoilinhtinh) (pink, blue, amber, nền beige `#f5f3ef`), font Inter, card `rounded-2xl`.

---

## 2. Tech stack đề xuất

| Layer | Lựa chọn đề xuất | Lý do | Phương án thay thế |
|---|---|---|---|
| Framework | **Next.js 15 + TS** | Giữ nhịp với repo gốc, dễ reuse token | Vite + React (nhẹ hơn nếu chắc chắn 1 page) |
| Styling | **Tailwind 3.4** + CSS vars `eoi-*` | Copy nguyên `globals.css` + `tailwind.config.ts` từ repo gốc | — |
| Hand tracking | **MediaPipe Tasks Vision (HandLandmarker)** | Google maintained, WASM + WebGL, ~30fps trên laptop, 21 điểm/bàn tay, chạy hoàn toàn client | TensorFlow.js handpose (cũ hơn), Handtrack.js (kém chính xác) |
| Slider | **Embla Carousel** (`embla-carousel-react`) | API programmatic `scrollTo`/`scrollProgress`, nhẹ, mượt, dễ sync với input ngoài | Swiper.js (nặng hơn), custom với Framer Motion (linh hoạt nhưng tốn effort) |
| Animation | **Framer Motion** | Spring physics cho hiệu ứng "nảy" khi thả tay | GSAP |
| 3D product (tùy chọn) | **react-three-fiber + drei** | Nếu muốn xoay model GLTF khi slide | Ảnh tĩnh 4:5 (đơn giản hơn, khuyến nghị cho MVP) |

---

## 3. Cơ chế gesture → slider

### 3a. Detect
- MediaPipe `HandLandmarker` trả về 21 landmarks. Dùng **điểm giữa lòng bàn tay** (wrist `0` hoặc trung bình của MCP các ngón) làm anchor.
- Lấy toạ độ `x` đã normalize (0..1) của anchor mỗi frame.

### 3b. Mapping → slider
Hai mode để thử nghiệm, chọn 1 sau khi chạy thực tế:

**Mode A — "Pointer mode" (absolute)**
- `x` tay trực tiếp map 1-1 vào `slider.scrollProgress`.
- Cảm giác như kéo thước, trực quan nhưng dễ rung.

**Mode B — "Swipe mode" (velocity)** ← khuyến nghị
- Tính `vx = x_now - x_prev` mỗi frame.
- Khi `|vx|` vượt threshold → trigger `slider.scrollNext()` / `scrollPrev()` rồi khoá ~400ms chống lặp.
- Tự nhiên giống lướt điện thoại.

### 3c. Làm mượt
- **Exponential moving average** (alpha ~0.3) cho toạ độ tay để giảm jitter.
- Nếu confidence < threshold → giữ vị trí cũ.
- Dead-zone ở giữa màn hình ±5% để tay "đứng yên" không gây noise.

---

## 4. UX flow

```
[Landing]
  ├─ Hero: logo + tagline "Vẫy tay để chọn đèn"
  ├─ Nút "Bật camera" (yêu cầu permission rõ ràng)
  │    ├─ Denied → fallback keyboard/touch, hiện toast hướng dẫn
  │    └─ Granted → vào Experience
  │
[Experience]
  ├─ Webcam preview nhỏ (góc dưới phải, có thể ẩn)
  ├─ Slider đèn (full width, card 4:5 per slide)
  ├─ Thông tin đèn đang chọn (tên, giá, mô tả)
  ├─ Progress dots
  ├─ Hint overlay: animation tay vẫy (chỉ hiện 3s đầu)
```

---

## 5. Cấu trúc thư mục dự kiến

```
src/
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx                 # Landing + Experience (SPA-style)
│  └─ globals.css              # copy eoi-* CSS vars
├─ components/
│  ├─ LampSlider.tsx           # Embla slider
│  ├─ LampCard.tsx             # Card 1 mẫu đèn
│  ├─ WebcamPreview.tsx        # <video> góc phải
│  ├─ PermissionGate.tsx       # Xin quyền camera
│  └─ GestureHint.tsx          # Overlay tutorial
├─ hooks/
│  ├─ useHandTracking.ts       # MediaPipe + stream
│  ├─ useGestureToSlider.ts    # Map x/vx → Embla API
│  └─ useEmaSmoothing.ts
├─ lib/
│  ├─ mediapipe.ts             # init HandLandmarker
│  └─ lamps.ts                 # data đèn (id, name, price, images)
└─ public/
   └─ lamps/                   # ảnh/mock-up
```

---

## 6. Milestones

1. **M1 — Scaffold (0.5 ngày)**: Next.js + Tailwind + token `eoi-*` + layout cơ bản + dữ liệu mock 5-6 mẫu đèn.
2. **M2 — Slider thuần (0.5 ngày)**: Embla chạy mượt với chuột/touch/keyboard. Chưa có camera.
3. **M3 — Webcam + permission flow (0.5 ngày)**: `getUserMedia`, preview, fallback UX.
4. **M4 — Hand tracking (1 ngày)**: Tích hợp MediaPipe, overlay debug dots trên video để xác nhận detect ổn.
5. **M5 — Gesture → slider (1 ngày)**: Mode B velocity, smoothing, tune thresholds trên máy thật.
6. **M6 — Polish (0.5 ngày)**: Hint animation, loading, error states, responsive.

Tổng ~4 ngày làm việc cho 1 người. Làm song song M3/M4 được.

---

## 7. Rủi ro & lưu ý

- **MediaPipe bundle size** ~8-10MB WASM+model — cần lazy load, chỉ load khi user bấm "Bật camera".
- **Quyền camera HTTPS**: dev ok với `localhost`, deploy phải HTTPS.
- **Hiệu năng**: trên máy yếu có thể tụt fps. Cân nhắc chạy detect mỗi 2 frame (~15fps đủ cho swipe).
- **Ánh sáng kém**: MediaPipe detect kém → cần hint "ngồi nơi đủ sáng" khi confidence thấp liên tục.
- **Accessibility**: gesture KHÔNG thay thế keyboard/touch — luôn để song song.

---

## 8. Câu hỏi cần chốt (để anh trả lời trước khi code)

1. **Số lượng đèn** hiển thị trong slider? 3-5 hay nhiều hơn? Đã có ảnh sản phẩm chưa hay dùng placeholder?
2. **Hình thức đèn**: ảnh tĩnh đủ chưa, hay muốn model 3D xoay được (dùng react-three-fiber)? → ảnh hưởng khá lớn đến công sức M1.
3. **Gesture mode** ưu tiên thử mode nào trước: **Swipe (velocity)** hay **Pointer (absolute)**? Tôi đề xuất Swipe.
4. **Ngoài slide trái/phải**, có muốn gesture khác không? VD: nắm tay = chọn, xoè tay = quay lại?
5. **Framework**: giữ Next.js cho đồng bộ, hay muốn Vite cho nhẹ?
6. **Deploy**: Vercel? (bắt buộc HTTPS cho camera)
7. **Copy visual identity** 100% từ repo cũ (header eoi logo, bottom nav) hay đây là landing riêng tối giản?

---

*Sau khi chốt các câu hỏi ở mục 8, tôi sẽ update plan thành v1 và bắt đầu scaffold.*
