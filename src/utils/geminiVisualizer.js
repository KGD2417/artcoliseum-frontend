/**
 * Smart placement powered by Gemini 2.5 Flash (free tier, vision).
 *
 * We DON'T generate an image (that model needs billing). Instead we send the
 * room photo to the free vision model and ask it WHERE the artwork should go —
 * it returns a normalized bounding region, obeying the user's placement prompt.
 * The canvas then composites the artwork into that region.
 *
 * Free tier: get a key at https://aistudio.google.com/apikey
 *   VITE_GEMINI_API_KEY=your_key_here
 */

const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export function hasGeminiKey() {
  return !!import.meta.env.VITE_GEMINI_API_KEY;
}

function splitDataURL(dataURL) {
  const m = /^data:([^;]+);base64,(.*)$/.exec(dataURL || "");
  if (!m) throw new Error("Room image is not a base64 data URL");
  return { mimeType: m[1], data: m[2] };
}

const TYPE_WORD = {
  painting: "framed painting (hung flat on a wall)",
  mural: "large mural (painted across most of a wall)",
  wallpaper: "wallpaper (covering an entire wall)",
  sculpture: "sculpture (standing on the floor)",
};

/**
 * Ask Gemini for the best placement region in the room photo.
 *
 * @param {Object} args
 * @param {string} args.roomDataURL - data: URL of the room photo
 * @param {string} args.artType     - painting | mural | wallpaper | sculpture
 * @param {string} args.prompt      - optional placement guidance
 * @param {number} args.artAspect   - artwork width / height
 * @returns {Promise<{x:number,y:number,w:number,h:number,reason:string}>}
 *          region as fractions (0..1) of the image — top-left x,y and size w,h
 */
export async function analyzeRoomPlacement({ roomDataURL, artType, prompt, artAspect = 1 }) {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) throw new Error("No Gemini API key — add VITE_GEMINI_API_KEY to .env");

  const room = splitDataURL(roomDataURL);
  const word = TYPE_WORD[artType] || TYPE_WORD.painting;

  const fill = artType === "mural" || artType === "wallpaper";

  const instruction =
    `You are an expert interior designer. The attached image is a room photo. ` +
    `Decide the single best location to place a ${word} in this room.\n` +
    (prompt && prompt.trim()
      ? `User's placement request (obey it precisely): "${prompt.trim()}".\n`
      : "") +
    `Rules:\n` +
    (fill
      ? `- Choose the largest suitable wall; the region should cover MOST of that wall, edge to edge.\n`
      : artType === "sculpture"
      ? `- Choose a clear, uncluttered spot on the FLOOR, not on a wall.\n`
      : `- Choose an empty, well-lit WALL area at roughly eye level. Do NOT overlap windows, doors, shelves, plants, furniture, or the floor.\n`) +
    `- The region should suit an artwork whose width/height aspect ratio is about ${artAspect.toFixed(2)}.\n` +
    `Return the region as fractions of the image: x,y = top-left corner; w,h = width,height. Each value between 0 and 1.`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: instruction },
          { inline_data: { mime_type: room.mimeType, data: room.data } },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          x: { type: "number" },
          y: { type: "number" },
          w: { type: "number" },
          h: { type: "number" },
          reason: { type: "string" },
        },
        required: ["x", "y", "w", "h"],
      },
      temperature: 0.2,
    },
  };

  let res;
  try {
    res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new Error("Network error reaching Gemini: " + e.message);
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error?.message || `${res.status} ${res.statusText}`);
  }

  const text = json?.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text;
  if (!text) throw new Error("Gemini returned no placement");

  let box;
  try {
    box = JSON.parse(text);
  } catch {
    throw new Error("Could not parse placement JSON");
  }

  // Clamp to sane bounds so a bad answer can never invert the quad.
  const clamp01 = (v, d) => (Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : d);
  let x = clamp01(box.x, 0.3);
  let y = clamp01(box.y, 0.3);
  let w = clamp01(box.w, 0.4);
  let h = clamp01(box.h, 0.4);
  if (w < 0.05) w = 0.05;
  if (h < 0.05) h = 0.05;
  if (x + w > 1) w = 1 - x;
  if (y + h > 1) h = 1 - y;

  return { x, y, w, h, reason: box.reason || "" };
}
