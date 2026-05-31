/**
 * SegFormer Web Worker — runs in a separate thread via Vite's worker bundling.
 * Import via: new Worker(new URL('./segmentation.worker.js', import.meta.url), { type: 'module' })
 */
import { pipeline, env } from "@huggingface/transformers";

// Use the CDN ONNX wasm runtime so we don't need to configure wasm paths manually
env.allowLocalModels = false;

let segmenter = null;

self.onmessage = async ({ data }) => {
  const { id, imageDataURL } = data;

  try {
    if (!segmenter) {
      segmenter = await pipeline(
        "image-segmentation",
        "Xenova/segformer-b2-finetuned-ade-512-512",
        {
          device: "wasm",
          progress_callback: (info) => {
            self.postMessage({ id, type: "progress", info });
          },
        }
      );
    }

    const result = await segmenter(imageDataURL);
    // result: [{ label, score, mask: RawImage }]
    const segments = result.map((seg) => ({
      label: seg.label,
      score: seg.score,
      mask: Array.from(seg.mask.data), // plain array for structured clone
      width: seg.mask.width,
      height: seg.mask.height,
    }));
    self.postMessage({ id, type: "result", segments });
  } catch (err) {
    self.postMessage({ id, type: "error", message: err.message });
  }
};
