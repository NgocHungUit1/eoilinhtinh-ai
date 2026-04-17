import type { HandLandmarker as HandLandmarkerType } from "@mediapipe/tasks-vision";

/**
 * Lazy-load MediaPipe tasks-vision. Bundle ~8-10MB nên ta chỉ gọi
 * khi user thực sự bấm "Bật camera".
 */
let landmarker: HandLandmarkerType | null = null;
let loading: Promise<HandLandmarkerType> | null = null;

/**
 * WASM files được copy từ node_modules sang public/mediapipe/wasm
 * bởi scripts/copy-mediapipe.mjs (chạy ở postinstall/predev/prebuild),
 * nên path này luôn khớp với version package đã cài.
 */
const WASM_BASE = "/mediapipe/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task";

export async function getHandLandmarker(): Promise<HandLandmarkerType> {
  if (landmarker) return landmarker;
  if (loading) return loading;

  loading = (async () => {
    const vision = await import("@mediapipe/tasks-vision");
    const fileset = await vision.FilesetResolver.forVisionTasks(WASM_BASE);
    const instance = await vision.HandLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: 1,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    landmarker = instance;
    return instance;
  })();

  return loading;
}

export function disposeHandLandmarker() {
  if (landmarker) {
    landmarker.close();
    landmarker = null;
  }
  loading = null;
}
