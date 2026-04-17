"use client";

import { Camera, Hand, Keyboard, Loader2, Mouse } from "lucide-react";

type Props = {
  onEnable: () => void;
  loading?: boolean;
  denied?: boolean;
  errorMessage?: string | null;
};

export function PermissionGate({ onEnable, loading, denied, errorMessage }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 rounded-3xl border border-eoi-border bg-white/80 p-8 text-center shadow-sm backdrop-blur">
      <div className="flex items-center justify-center gap-3">
        <div className="rounded-2xl bg-eoi-pink-light p-3 text-eoi-pink-dark">
          <Hand className="h-6 w-6 animate-wave" />
        </div>
        <div className="h-px w-10 bg-eoi-border" />
        <div className="rounded-2xl bg-eoi-blue-light p-3 text-eoi-blue-dark">
          <Camera className="h-6 w-6" />
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-eoi-ink">
          Vẫy tay để chọn đèn
        </h2>
        <p className="text-sm text-eoi-ink2">
          Bật webcam và vẫy tay trái/phải trước màn hình — slider sẽ lướt theo. Mọi xử lý hình
          ảnh chạy hoàn toàn trên máy bạn, không gửi đi đâu.
        </p>
      </div>

      <button
        type="button"
        onClick={onEnable}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full bg-eoi-ink px-6 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
        {loading ? "Đang khởi động..." : "Bật camera"}
      </button>

      {(denied || errorMessage) && (
        <div className="w-full rounded-xl border border-amber-300/60 bg-eoi-amber-light/60 px-4 py-3 text-left text-[13px] text-eoi-amber-dark">
          {denied ? (
            <>
              Bạn đã từ chối quyền camera. Có thể mở lại trong thiết lập trình
              duyệt, hoặc cứ dùng phím mũi tên / kéo chuột bên dưới để lướt.
            </>
          ) : (
            <>Không thể mở camera: {errorMessage}. Dùng phím mũi tên hoặc chuột thay thế nhé.</>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-eoi-ink2">
        <span className="inline-flex items-center gap-1">
          <Mouse className="h-3.5 w-3.5" /> Kéo / click
        </span>
        <span className="inline-flex items-center gap-1">
          <Keyboard className="h-3.5 w-3.5" /> ← →
        </span>
      </div>
    </div>
  );
}
