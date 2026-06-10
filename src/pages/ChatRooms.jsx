import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/Auth";

/* ─── Data ─────────────────────────────────────────── */
const ROOMS = [
  { id: "oil", emoji: "🎨", name: "Oil Painting Techniques", online: 24, color: "#8B4513" },
  { id: "sculpture", emoji: "🗿", name: "Sculpture Materials", online: 12, color: "#5A4B2C" },
  { id: "photo", emoji: "📸", name: "Photography & Light", online: 18, color: "#2C4A6E" },
  { id: "digital", emoji: "💻", name: "Digital & AI Art", online: 31, color: "#4A2C6E" },
  { id: "framing", emoji: "🖼️", name: "Framing & Preservation", online: 8, color: "#2C5A3A" },
  { id: "new", emoji: "🌟", name: "New Artists Showcase", online: 15, color: "#6E5A2C" },
  { id: "collect", emoji: "💰", name: "Collecting & Investment", online: 22, color: "#2C6E5A" },
  { id: "theory", emoji: "🎭", name: "Art History & Theory", online: 9, color: "#6E2C4A" },
];

const ONLINE_USERS = {
  oil: [
    { name: "Elena Vance", role: "Artist", active: true },
    { name: "Marcus Reyes", role: "Artist", active: true },
    { name: "Yuki Tanaka", role: "Collector", active: true },
    { name: "Sophia Brennan", role: "Artist", active: false },
    { name: "Robert Klein", role: "Collector", active: true },
    { name: "Isabelle Morin", role: "Artist", active: false },
  ],
  sculpture: [
    { name: "Daniel Hoffmann", role: "Collector", active: true },
    { name: "Chen Wei", role: "Artist", active: true },
    { name: "Aria Patel", role: "Curator", active: false },
    { name: "James O'Brien", role: "Artist", active: true },
  ],
  photo: [
    { name: "Sophia Brennan", role: "Artist", active: true },
    { name: "Aria Patel", role: "Curator", active: true },
    { name: "Nathan Cole", role: "Collector", active: true },
    { name: "Zara Mbeki", role: "Artist", active: false },
  ],
  digital: [
    { name: "Marcus Reyes", role: "Artist", active: true },
    { name: "Yuki Tanaka", role: "Collector", active: true },
    { name: "Lena Bach", role: "Curator", active: true },
    { name: "Dev Sharma", role: "Artist", active: true },
    { name: "Aria Patel", role: "Curator", active: false },
  ],
  framing: [
    { name: "Daniel Hoffmann", role: "Collector", active: true },
    { name: "Robert Klein", role: "Collector", active: false },
    { name: "Isabelle Morin", role: "Artist", active: true },
  ],
  new: [
    { name: "Sophia Brennan", role: "Artist", active: true },
    { name: "Dev Sharma", role: "Artist", active: true },
    { name: "Zara Mbeki", role: "Artist", active: true },
    { name: "James O'Brien", role: "Artist", active: false },
  ],
  collect: [
    { name: "Yuki Tanaka", role: "Collector", active: true },
    { name: "Daniel Hoffmann", role: "Collector", active: true },
    { name: "Robert Klein", role: "Collector", active: true },
    { name: "Lena Bach", role: "Curator", active: false },
    { name: "Nathan Cole", role: "Collector", active: true },
  ],
  theory: [
    { name: "Aria Patel", role: "Curator", active: true },
    { name: "Lena Bach", role: "Curator", active: true },
    { name: "Elena Vance", role: "Artist", active: false },
  ],
};

const MESSAGES = {
  oil: [
    { id: 1, author: "Elena Vance", role: "Artist", time: "2:14 PM", text: "Has anyone worked with lead white recently? I've been thinking about going back to it for the highlights in my current piece — the luminosity is unmatched." },
    { id: 2, author: "Marcus Reyes", role: "Artist", time: "2:16 PM", text: "I use a modern lead-free alternative — Cremnitz White. Still heavy and remarkably translucent. You might find it interesting." },
    { id: 3, author: "Yuki Tanaka", role: "Collector", time: "2:18 PM", text: "As a collector I'm always curious about archival stability. Are either of those reliable over decades?" },
    { id: 4, author: "Elena Vance", role: "Artist", time: "2:19 PM", text: "Traditional lead white is extraordinarily stable — Vermeer's paintings attest to that. The synthetic alternatives are still relatively young, so the jury is out on centuries-long archival performance." },
    { id: 5, author: "Isabelle Morin", role: "Artist", time: "2:22 PM", text: "I've been doing fat-over-lean strictly for the last two years and my paint film has never been healthier. Seems obvious but it took me years to truly internalize it." },
    { id: 6, author: "Robert Klein", role: "Collector", time: "2:25 PM", text: "What's the rule of thumb for fat-over-lean? I see it mentioned constantly but never explained simply." },
    { id: 7, author: "Marcus Reyes", role: "Artist", time: "2:26 PM", text: "Each successive layer should contain more oil than the one beneath it. Lean (thin, fast-drying) layers go down first, progressively richer layers on top. Prevents cracking as the upper layers dry slower." },
    { id: 8, author: "Elena Vance", role: "Artist", time: "2:28 PM", text: "Exactly. And always let each layer skin over before the next. Patience is the underrated technique." },
    { id: 9, author: "Sophia Brennan", role: "Artist", time: "2:31 PM", text: "For underpainting, does anyone use oil paint diluted with mineral spirits exclusively, or genuine turpentine? I've heard turpentine has better tooth but the fumes are difficult." },
    { id: 10, author: "Marcus Reyes", role: "Artist", time: "2:33 PM", text: "Odourless mineral spirits have improved enormously. I made the switch when I moved to a smaller studio and honestly can't tell the difference in the finished work." },
    { id: 11, author: "Elena Vance", role: "Artist", time: "2:35 PM", text: "I still swear by genuine gum turpentine for the first wash. Something about it being a natural resin alongside the oil feels right to me. Maybe that's superstition." },
    { id: 12, author: "Isabelle Morin", role: "Artist", time: "2:37 PM", text: "Not superstition — it dries slightly differently and does have better tooth. But odourless is fine for most stages." },
  ],
  sculpture: [
    { id: 1, author: "Daniel Hoffmann", role: "Collector", time: "11:02 AM", text: "I'm in the process of acquiring a medium bronze and the foundry is offering me a choice of patina — liver of sulfur or ferric nitrate. Any sculptors here with strong opinions?" },
    { id: 2, author: "Chen Wei", role: "Artist", time: "11:05 AM", text: "Liver of sulfur gives you those warm golden-browns transitioning to deep blue-black. Ferric nitrate is more reliably even — cooler tones, almost grey-green. What's the work's subject?" },
    { id: 3, author: "Daniel Hoffmann", role: "Collector", time: "11:07 AM", text: "Abstract figurative — very dynamic, with a lot of interior negative space. The artist uses high polish on the convex surfaces." },
    { id: 4, author: "Chen Wei", role: "Artist", time: "11:08 AM", text: "Then liver of sulfur. The variation and warmth will play beautifully against the polished areas. Ferric nitrate would compete visually with the polish rather than complement it." },
    { id: 5, author: "James O'Brien", role: "Artist", time: "11:11 AM", text: "Agreed with Chen. Also consider the environment — bronze patinas shift over time with humidity. A darker initial patina gives you more latitude." },
    { id: 6, author: "Aria Patel", role: "Curator", time: "11:14 AM", text: "From a curatorial perspective, I'd also ask the foundry about waxing — a microcrystalline wax after patination helps stabilize it and adds a beautiful depth." },
    { id: 7, author: "Daniel Hoffmann", role: "Collector", time: "11:16 AM", text: "This is exactly what I needed to know. Thank you all — this community is worth more than any consultant." },
    { id: 8, author: "Chen Wei", role: "Artist", time: "11:18 AM", text: "One more thing — if you're placing it outdoors even occasionally, ask specifically about the clear coat they use. Some are better than others for UV protection." },
    { id: 9, author: "James O'Brien", role: "Artist", time: "11:20 AM", text: "I've been experimenting with verde antico patina on steel recently — similar depth to bronze but with more blue-green intensity. Worth exploring for architectural-scale work." },
    { id: 10, author: "Daniel Hoffmann", role: "Collector", time: "11:22 AM", text: "Is the conservation more demanding for steel patina versus bronze?" },
    { id: 11, author: "Chen Wei", role: "Artist", time: "11:24 AM", text: "Significantly more demanding if not sealed properly. Steel is less forgiving than bronze. But the aesthetic range is remarkable when done well." },
  ],
  photo: [
    { id: 1, author: "Sophia Brennan", role: "Artist", time: "3:40 PM", text: "Working on a portrait series in very low light — existing light only, no flash. ISO 6400, f/1.4. The grain is becoming compositional rather than incidental. Has anyone leaned into this deliberately?" },
    { id: 2, author: "Aria Patel", role: "Curator", time: "3:42 PM", text: "That's the entire language of Graciela Iturbide's work — grain as texture, as atmosphere. Embrace it completely." },
    { id: 3, author: "Nathan Cole", role: "Collector", time: "3:44 PM", text: "From a market perspective, high-grain fine art photography has been climbing steadily. There's a reaction against digital clinical perfection." },
    { id: 4, author: "Sophia Brennan", role: "Artist", time: "3:46 PM", text: "That's reassuring but I'm more interested in what it does to the emotional register of the image. Grain creates a kind of uncertainty — you can't quite resolve everything and I think that's honest." },
    { id: 5, author: "Aria Patel", role: "Curator", time: "3:48 PM", text: "Grain as epistemological humility. I love that framing." },
    { id: 6, author: "Zara Mbeki", role: "Artist", time: "3:51 PM", text: "I've been pushing contrast in the same direction — crushing blacks and letting highlights blow. The image becomes more about feeling than documentation." },
    { id: 7, author: "Sophia Brennan", role: "Artist", time: "3:53 PM", text: "Do you print on fibre-base or RC? I find fibre-base lets grain sit differently — more embedded, less surface." },
    { id: 8, author: "Zara Mbeki", role: "Artist", time: "3:55 PM", text: "Fibre-base exclusively, printed by hand in a darkroom. I can't see returning to digital printing for this work. The process is part of the meaning." },
    { id: 9, author: "Nathan Cole", role: "Collector", time: "3:57 PM", text: "Darkroom prints have been commanding significant premiums lately. The market understands that the process encodes value in a way that isn't just sentimental." },
    { id: 10, author: "Aria Patel", role: "Curator", time: "3:59 PM", text: "Process as authenticity. Though I'd caution against making process-fetishism the work itself — the image must still carry." },
    { id: 11, author: "Sophia Brennan", role: "Artist", time: "4:01 PM", text: "Entirely agree. The darkroom is invisible when it's working. You should feel the image, not the method." },
  ],
  digital: [
    { id: 1, author: "Marcus Reyes", role: "Artist", time: "10:15 AM", text: "I've been using Stable Diffusion XL as a starting point for textures, then overpainting entirely in Procreate. At what point does an AI-assisted piece become 'mine'? Genuinely asking." },
    { id: 2, author: "Lena Bach", role: "Curator", time: "10:17 AM", text: "The authorship question in AI-assisted work is the most pressing conceptual issue in contemporary art right now. My position: intention and curation are authorial acts. Using AI is like using a camera — the tool doesn't make the artist." },
    { id: 3, author: "Dev Sharma", role: "Artist", time: "10:19 AM", text: "I disagree partially — a camera captures what's there. Generative AI introduces material that the artist didn't originate. It's more like collaboration with a very strange co-author." },
    { id: 4, author: "Yuki Tanaka", role: "Collector", time: "10:21 AM", text: "As someone who collects, I want to know the full process. I'm comfortable collecting AI-assisted work if the artist's hand is genuinely present and meaningful." },
    { id: 5, author: "Marcus Reyes", role: "Artist", time: "10:23 AM", text: "I think 'meaningful hand' is the key phrase. If I'm just prompting and selecting, that's curatorial. If I'm overpainting, compositing, transforming — that's something closer to making." },
    { id: 6, author: "Aria Patel", role: "Curator", time: "10:25 AM", text: "Refik Anadol has made this question central to his practice — the AI is trained on specific datasets he curates, and the output is installed in specific spaces he designs. Every layer is authored." },
    { id: 7, author: "Dev Sharma", role: "Artist", time: "10:27 AM", text: "That's the most intellectually rigorous use of AI I've seen. The training data curation is where the artistic decisions actually live." },
    { id: 8, author: "Lena Bach", role: "Curator", time: "10:30 AM", text: "The market is still figuring this out. Beeple's sale normalized the price point but not the critical framework. We're still writing the vocabulary." },
    { id: 9, author: "Marcus Reyes", role: "Artist", time: "10:32 AM", text: "What concerns me is the eventual impossibility of distinguishing heavily AI-assisted work from 'pure' digital painting. Do we need a disclosure standard?" },
    { id: 10, author: "Yuki Tanaka", role: "Collector", time: "10:34 AM", text: "Absolutely. I'd advocate for process transparency as a standard. Not to gatekeep but to allow collectors to make informed decisions about what they're acquiring." },
    { id: 11, author: "Dev Sharma", role: "Artist", time: "10:36 AM", text: "Some galleries are already requiring AI disclosure. I think it becomes industry standard within five years." },
    { id: 12, author: "Aria Patel", role: "Curator", time: "10:38 AM", text: "And then we'll argue about what 'disclosure' means. How many prompts before it's AI-assisted? This conversation isn't ending soon." },
  ],
  framing: [
    { id: 1, author: "Daniel Hoffmann", role: "Collector", time: "1:05 PM", text: "I'm reframing three works from the 1970s — all on canvas, slightly yellowed varnish. The current frames are simple aluminium. I want something that respects the period without being period-costume. Suggestions?" },
    { id: 2, author: "Isabelle Morin", role: "Artist", time: "1:08 PM", text: "For 1970s work, I'd avoid anything too ornate. A natural linen or unbleached cotton liner with a simple dark wenge or walnut float frame would be my first instinct." },
    { id: 3, author: "Robert Klein", role: "Collector", time: "1:11 PM", text: "Is conservation framing significantly more expensive? I've always been told it's worth it but I've never actually priced it out." },
    { id: 4, author: "Isabelle Morin", role: "Artist", time: "1:13 PM", text: "Typically 40-80% more than standard framing. For works with any value — monetary or sentimental — it's not optional. Acid-free materials, UV glass, reversible mounting. It's insurance." },
    { id: 5, author: "Daniel Hoffmann", role: "Collector", time: "1:15 PM", text: "The UV glass question — museum glass or Optium acrylic? I've read arguments both ways." },
    { id: 6, author: "Isabelle Morin", role: "Artist", time: "1:16 PM", text: "Optium acrylic is significantly lighter and nearly non-reflective, which is visually superior. But it scratches more easily. For transit I'd use glass; for permanent installation, acrylic." },
    { id: 7, author: "Robert Klein", role: "Collector", time: "1:19 PM", text: "What about works on paper? I've been told paper is significantly more vulnerable." },
    { id: 8, author: "Isabelle Morin", role: "Artist", time: "1:20 PM", text: "Works on paper are the most demanding to frame correctly. They need to breathe — hinged mounting only, never dry-mounted. And more conservative UV protection. The acidity of cheap mats can destroy paper in decades." },
  ],
  new: [
    { id: 1, author: "Dev Sharma", role: "Artist", time: "9:00 AM", text: "Just finished my first complete body of work — 14 pieces across 8 months. Has anyone gone through the experience of seeing a series as a whole for the first time? It's disorienting in the best way." },
    { id: 2, author: "Sophia Brennan", role: "Artist", time: "9:03 AM", text: "Congratulations. Yes — you suddenly see what you were actually thinking for the past months. The series reveals its logic to you only after it's done." },
    { id: 3, author: "Zara Mbeki", role: "Artist", time: "9:06 AM", text: "The moment of seeing a body of work together is when the work stops being yours and starts becoming itself. Strange and beautiful." },
    { id: 4, author: "James O'Brien", role: "Artist", time: "9:09 AM", text: "What's the series about? Or rather — what did you discover it's about, now that it's done?" },
    { id: 5, author: "Dev Sharma", role: "Artist", time: "9:11 AM", text: "I thought I was making work about migration. Now I think it's about the sensation of being between languages — not quite fluent in either place. It surprised me." },
    { id: 6, author: "Sophia Brennan", role: "Artist", time: "9:13 AM", text: "That gap — the space between languages — is one of the richest territories in contemporary art right now. You're in genuinely interesting territory." },
    { id: 7, author: "Zara Mbeki", role: "Artist", time: "9:15 AM", text: "Are you documenting the work professionally? Quality photographs are absolutely essential before doing anything else." },
    { id: 8, author: "Dev Sharma", role: "Artist", time: "9:16 AM", text: "I have a friend who's a commercial photographer. Is that sufficient or do I need someone who specifically photographs artwork?" },
    { id: 9, author: "James O'Brien", role: "Artist", time: "9:18 AM", text: "Specifically artwork photography if at all possible. The colour fidelity requirements are extremely specific — accurate reproduction of your actual colours affects everything that comes after." },
    { id: 10, author: "Sophia Brennan", role: "Artist", time: "9:20 AM", text: "And shoot with a grey card and colour profile target. Any competent art photographer will know what this means. Don't let anyone tell you it doesn't matter." },
  ],
  collect: [
    { id: 1, author: "Yuki Tanaka", role: "Collector", time: "4:00 PM", text: "Genuinely curious — how do experienced collectors think about the relationship between aesthetic conviction and investment thesis when acquiring? I find they often pull in opposite directions." },
    { id: 2, author: "Daniel Hoffmann", role: "Collector", time: "4:03 PM", text: "My rule: never buy anything you wouldn't be content to live with for 20 years regardless of value trajectory. If the investment rationale is carrying the acquisition, don't acquire." },
    { id: 3, author: "Lena Bach", role: "Curator", time: "4:06 PM", text: "The most durable collections I've seen were built entirely on taste. The financial returns followed, often significantly — but they were never the primary driver." },
    { id: 4, author: "Nathan Cole", role: "Collector", time: "4:08 PM", text: "I disagree slightly — I think being informed about market dynamics makes you a better collector, not a more mercenary one. Understanding why prices move helps you identify undervalued work that your eye responds to anyway." },
    { id: 5, author: "Yuki Tanaka", role: "Collector", time: "4:10 PM", text: "I've found that the acquisitions I've most regretted were ones where I let market enthusiasm override a nagging aesthetic uncertainty. And the ones I've most treasured were pure gut responses." },
    { id: 6, author: "Daniel Hoffmann", role: "Collector", time: "4:12 PM", text: "There's also the question of what you owe to artists. Buying speculative work and flipping immediately is harmful to the primary market ecosystem. The most respected collectors hold and genuinely support careers." },
    { id: 7, author: "Lena Bach", role: "Curator", time: "4:14 PM", text: "Exactly. The best collectors function almost as patrons — they take positions in careers, not just individual objects. That relationship benefits both parties over decades." },
    { id: 8, author: "Nathan Cole", role: "Collector", time: "4:16 PM", text: "The ARRT Coliseum model I appreciate — the direct collector-artist relationship enabled here is genuinely different from the gallery system. Less intermediation, more conversation." },
    { id: 9, author: "Yuki Tanaka", role: "Collector", time: "4:18 PM", text: "That's exactly why I started collecting through this platform. Knowing the artist personally changes everything about how you experience the work." },
  ],
  theory: [
    { id: 1, author: "Aria Patel", role: "Curator", time: "12:00 PM", text: "I've been re-reading Rosalind Krauss's 'Sculpture in the Expanded Field' and it strikes me as more relevant now than in 1979. The dissolution of categorical boundaries she was tracking then has essentially become total." },
    { id: 2, author: "Lena Bach", role: "Curator", time: "12:03 PM", text: "Agreed. Though I think the expanded field has expanded past the point Krauss could have anticipated — the digital completely changes the coordinate system she was using." },
    { id: 3, author: "Elena Vance", role: "Artist", time: "12:06 PM", text: "As someone who makes paintings, I sometimes feel the theoretical pressure to justify working in a 'traditional' medium is exhausting. There's an implicit demand that painting needs a conceptual alibi." },
    { id: 4, author: "Aria Patel", role: "Curator", time: "12:08 PM", text: "That demand is real but I think it's easing. The 'death of painting' discourse has itself died. What I see now is genuine curiosity about what painting can do that nothing else can." },
    { id: 5, author: "Lena Bach", role: "Curator", time: "12:10 PM", text: "The haptic argument — what paint does as physical matter — is underexplored theoretically. Benjamin was writing about mechanical reproduction but he didn't anticipate what the loss of the haptic would feel like culturally." },
    { id: 6, author: "Elena Vance", role: "Artist", time: "12:13 PM", text: "Painters know this intuitively. There's a reason people still stand very close to canvases in museums and look at the surface. They're not looking at the image — they're reading the making." },
    { id: 7, author: "Aria Patel", role: "Curator", time: "12:15 PM", text: "The 'making visible' quality of paint is its irreducible advantage. You see decisions, revisions, time. Digital renders are resolved — paint is perpetually in the process of arriving." },
    { id: 8, author: "Lena Bach", role: "Curator", time: "12:17 PM", text: "Which might explain the premium on impasto work, on clearly hand-made marks. The market is responding to a cultural hunger for evidence of human presence." },
    { id: 9, author: "Elena Vance", role: "Artist", time: "12:20 PM", text: "I find that both flattering and slightly unsettling. I don't want to be valued as an artifact of humanness. I want the work to be interesting." },
  ],
};

/* ─── Sub-components ─────────────────────────────── */
function RoleColors(role) {
  const map = {
    Artist: "#c8956a",
    Collector: "#6fa0c8",
    Curator: "#6fc8a0",
  };
  return map[role] || "#D4AF37";
}

function UserDot({ active }) {
  return (
    <span style={{
      display: "inline-block",
      width: 7, height: 7, borderRadius: "50%",
      background: active ? "#4CAF50" : "rgba(200,191,160,0.2)",
      flexShrink: 0,
    }} />
  );
}

function NewRoomModal({ onClose }) {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.8)", display: "flex",
        alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={onClose}>
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: "#12100d",
          border: "1px solid rgba(212,175,55,0.25)",
          borderRadius: 20, padding: "36px 40px",
          width: "100%", maxWidth: 480,
        }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <h3 style={{
            fontFamily: "'Cormorant Garamond',serif", fontSize: 26,
            fontWeight: 700, color: "#fff",
          }}>Create a Room</h3>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(200,191,160,0.5)", fontSize: 22,
          }}>×</button>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontFamily: "'Raleway',sans-serif", fontSize: 11,
            letterSpacing: "0.1em", color: "#D4AF37", marginBottom: 8,
          }}>ROOM NAME</div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Watercolor Fundamentals"
            style={{
              width: "100%", background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(212,175,55,0.2)", borderRadius: 8,
              padding: "12px 16px", color: "#e8e0d0",
              fontFamily: "'Raleway',sans-serif", fontSize: 14, outline: "none",
            }}
          />
        </div>
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontFamily: "'Raleway',sans-serif", fontSize: 11,
            letterSpacing: "0.1em", color: "#D4AF37", marginBottom: 8,
          }}>TOPIC DESCRIPTION</div>
          <textarea
            value={topic}
            onChange={e => setTopic(e.target.value)}
            rows={3}
            placeholder="What will be discussed in this room?"
            style={{
              width: "100%", background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(212,175,55,0.2)", borderRadius: 8,
              padding: "12px 16px", color: "#e8e0d0",
              fontFamily: "'Raleway',sans-serif", fontSize: 14,
              outline: "none", resize: "vertical",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{
            padding: "11px 22px", background: "transparent",
            color: "rgba(200,191,160,0.5)",
            border: "1px solid rgba(212,175,55,0.2)", borderRadius: 999,
            fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.14em",
            cursor: "pointer",
          }}>CANCEL</button>
          <button onClick={onClose} style={{
            padding: "11px 28px",
            background: name.trim() ? "linear-gradient(135deg,#D4AF37,#e8c53a)" : "rgba(212,175,55,0.2)",
            color: name.trim() ? "#0e0c0a" : "rgba(200,191,160,0.3)",
            border: "none", borderRadius: 999,
            fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.14em",
            cursor: name.trim() ? "pointer" : "not-allowed",
          }}>CREATE ROOM</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main ──────────────────────────────────────────── */
export default function ChatRooms() {
  const { role } = useAuth();
  const [activeRoom, setActiveRoom] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState({});
  const [joined, setJoined] = useState({});
  const [showNewRoom, setShowNewRoom] = useState(false);
  const [mobileRoomOpen, setMobileRoomOpen] = useState(false);
  const scrollRef = useRef(null);

  // Initialise messages from data
  useEffect(() => {
    const init = {};
    Object.keys(MESSAGES).forEach(k => { init[k] = [...MESSAGES[k]]; });
    setMessages(init);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeRoom, messages]);

  const room = ROOMS.find(r => r.id === activeRoom);
  const roomMessages = activeRoom ? (messages[activeRoom] || []) : [];
  const roomUsers = activeRoom ? (ONLINE_USERS[activeRoom] || []) : [];

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !activeRoom) return;
    const newMsg = {
      id: Date.now(),
      author: "You",
      role: "Collector",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text,
    };
    setMessages(prev => ({ ...prev, [activeRoom]: [...(prev[activeRoom] || []), newMsg] }));
    setInput("");
  };

  const toggleJoin = () => {
    if (!activeRoom) return;
    setJoined(prev => ({ ...prev, [activeRoom]: !prev[activeRoom] }));
  };

  return (
    <div className="app-fullscreen" style={{ background: "#080808", height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{
        height: 72, flexShrink: 0,
        background: "rgba(8,8,6,0.95)",
        borderBottom: "1px solid rgba(212,175,55,0.15)",
        display: "flex", alignItems: "center",
        padding: "0 32px", gap: 16,
        marginTop: 72, // below navbar
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: "'Cinzel',serif", fontSize: 10,
            letterSpacing: "0.22em", color: "#D4AF37",
          }}>
            ARRT COLISEUM
          </div>
          <div style={{
            fontFamily: "'Cormorant Garamond',serif", fontSize: 20,
            fontWeight: 700, color: "#fff", lineHeight: 1,
          }}>
            {room ? room.emoji + " " + room.name : "Chat Rooms"}
          </div>
        </div>
        {room && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              fontFamily: "'Raleway',sans-serif", fontSize: 12,
              color: "rgba(200,191,160,0.5)", display: "flex", alignItems: "center", gap: 6,
            }}>
              <UserDot active={true} />
              {room.online} online
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={toggleJoin}
              style={{
                padding: "8px 20px",
                background: joined[activeRoom]
                  ? "rgba(212,175,55,0.1)"
                  : "linear-gradient(135deg,#D4AF37,#e8c53a)",
                color: joined[activeRoom] ? "#D4AF37" : "#0e0c0a",
                border: `1px solid ${joined[activeRoom] ? "rgba(212,175,55,0.35)" : "transparent"}`,
                borderRadius: 999,
                fontFamily: "'Cinzel',serif", fontSize: 9,
                letterSpacing: "0.18em", cursor: "pointer",
              }}>
              {joined[activeRoom] ? "LEAVE ROOM" : "JOIN ROOM"}
            </motion.button>
          </div>
        )}
        {role === "admin" && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowNewRoom(true)}
            style={{
              padding: "8px 16px",
              background: "transparent",
              color: "rgba(200,191,160,0.6)",
              border: "1px solid rgba(212,175,55,0.2)",
              borderRadius: 999,
              fontFamily: "'Cinzel',serif", fontSize: 9,
              letterSpacing: "0.14em", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            NEW ROOM
          </motion.button>
        )}
      </div>

      {/* Body: sidebar + chat + users */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── ROOMS SIDEBAR ── */}
        <div style={{
          width: 280, flexShrink: 0,
          borderRight: "1px solid rgba(212,175,55,0.12)",
          background: "rgba(10,8,6,0.8)",
          overflowY: "auto",
          display: "flex", flexDirection: "column",
        }}>
          <div style={{
            padding: "16px 20px 12px",
            fontFamily: "'Cinzel',serif", fontSize: 9,
            letterSpacing: "0.22em", color: "rgba(212,175,55,0.6)",
            borderBottom: "1px solid rgba(212,175,55,0.08)",
          }}>
            DISCUSSION ROOMS — {ROOMS.length}
          </div>
          {ROOMS.map(r => {
            const isActive = activeRoom === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setActiveRoom(r.id)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  width: "100%", textAlign: "left",
                  padding: "14px 20px",
                  background: isActive ? "rgba(212,175,55,0.08)" : "transparent",
                  borderLeft: isActive ? "2px solid #D4AF37" : "2px solid transparent",
                  border: "none", borderRight: "none", borderTop: "none", borderBottom: "none",
                  borderLeft: isActive ? "2px solid #D4AF37" : "2px solid transparent",
                  cursor: "pointer",
                  borderBottom: "1px solid rgba(212,175,55,0.06)",
                  transition: "all 0.2s",
                }}>
                <span style={{ fontSize: 20, lineHeight: 1.2, flexShrink: 0 }}>{r.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: "'Cormorant Garamond',serif", fontSize: 15,
                    color: isActive ? "#fff" : "rgba(200,191,160,0.75)",
                    lineHeight: 1.3, marginBottom: 4,
                  }}>
                    {r.name}
                  </div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 5,
                    fontFamily: "'Raleway',sans-serif", fontSize: 10,
                    color: "rgba(200,191,160,0.35)",
                  }}>
                    <UserDot active={true} />
                    {r.online} online
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── CHAT AREA ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {!activeRoom ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: 40, textAlign: "center",
              }}>
              <div style={{ fontSize: 56, marginBottom: 24 }}>🎭</div>
              <h2 style={{
                fontFamily: "'Cormorant Garamond',serif", fontSize: 36,
                fontWeight: 700, color: "#fff", marginBottom: 14,
              }}>
                Select a Room
              </h2>
              <p style={{
                fontFamily: "'Raleway',sans-serif", fontSize: 14,
                color: "rgba(200,191,160,0.5)", maxWidth: 360, lineHeight: 1.7,
              }}>
                Choose a discussion room from the left to join the conversation. Hundreds of artists, collectors, and curators are talking right now.
              </p>
              <div style={{
                display: "flex", flexWrap: "wrap", gap: 10, marginTop: 32,
                justifyContent: "center", maxWidth: 500,
              }}>
                {ROOMS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setActiveRoom(r.id)}
                    style={{
                      padding: "8px 16px",
                      background: "rgba(212,175,55,0.05)",
                      border: "1px solid rgba(212,175,55,0.15)",
                      borderRadius: 999,
                      fontFamily: "'Raleway',sans-serif", fontSize: 12,
                      color: "rgba(200,191,160,0.65)",
                      cursor: "pointer", transition: "all 0.2s",
                    }}>
                    {r.emoji} {r.name}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <>
              {/* Messages */}
              <div
                ref={scrollRef}
                style={{
                  flex: 1, overflowY: "auto",
                  padding: "24px 28px",
                  display: "flex", flexDirection: "column", gap: 20,
                }}>
                <AnimatePresence initial={false}>
                  {roomMessages.map((msg, i) => {
                    const isMe = msg.author === "You";
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          display: "flex", gap: 12,
                          flexDirection: isMe ? "row-reverse" : "row",
                          alignItems: "flex-start",
                        }}>
                        {/* Avatar */}
                        <div style={{
                          width: 36, height: 36, borderRadius: "50%",
                          background: isMe ? "linear-gradient(135deg,#D4AF37,#e8c53a)" : "rgba(212,175,55,0.12)",
                          border: "1.5px solid rgba(212,175,55,0.25)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "'Cinzel',serif", fontSize: 11,
                          color: isMe ? "#0e0c0a" : "#D4AF37",
                          flexShrink: 0,
                          fontWeight: 700,
                        }}>
                          {msg.author.split(" ").map(s => s[0]).join("").slice(0, 2)}
                        </div>
                        {/* Bubble */}
                        <div style={{ maxWidth: "65%" }}>
                          {!isMe && (
                            <div style={{
                              display: "flex", alignItems: "center", gap: 8,
                              marginBottom: 5,
                            }}>
                              <span style={{
                                fontFamily: "'Cormorant Garamond',serif", fontSize: 14,
                                color: "#e8e0d0",
                              }}>{msg.author}</span>
                              <span style={{
                                fontFamily: "'Cinzel',serif", fontSize: 8,
                                letterSpacing: "0.1em",
                                color: RoleColors(msg.role),
                                background: `${RoleColors(msg.role)}18`,
                                border: `1px solid ${RoleColors(msg.role)}40`,
                                borderRadius: 999, padding: "2px 8px",
                              }}>{msg.role?.toUpperCase()}</span>
                              <span style={{
                                fontFamily: "'Raleway',sans-serif", fontSize: 10,
                                color: "rgba(200,191,160,0.3)",
                              }}>{msg.time}</span>
                            </div>
                          )}
                          <div style={{
                            padding: "12px 16px",
                            background: isMe
                              ? "linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.1))"
                              : "rgba(255,255,255,0.04)",
                            border: `1px solid ${isMe ? "rgba(212,175,55,0.3)" : "rgba(212,175,55,0.1)"}`,
                            borderRadius: isMe ? "14px 14px 4px 14px" : "4px 14px 14px 14px",
                            fontFamily: "'Cormorant Garamond',serif", fontSize: 16,
                            color: isMe ? "#e8e0d0" : "rgba(200,191,160,0.85)",
                            lineHeight: 1.7,
                          }}>
                            {msg.text}
                          </div>
                          {isMe && (
                            <div style={{
                              fontFamily: "'Raleway',sans-serif", fontSize: 10,
                              color: "rgba(200,191,160,0.3)", textAlign: "right",
                              marginTop: 4,
                            }}>{msg.time}</div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Input */}
              <div style={{
                padding: "16px 28px",
                borderTop: "1px solid rgba(212,175,55,0.12)",
                background: "rgba(8,8,6,0.6)",
                display: "flex", gap: 10, alignItems: "flex-end",
              }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    rows={1}
                    placeholder={
                      joined[activeRoom]
                        ? `Message ${room?.name}… (Enter to send)`
                        : "Join the room to participate in the conversation"
                    }
                    disabled={!joined[activeRoom]}
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(212,175,55,0.2)",
                      borderRadius: 12,
                      padding: "12px 16px",
                      color: "#e8e0d0",
                      fontFamily: "'Cormorant Garamond',serif", fontSize: 16,
                      outline: "none", resize: "none",
                      lineHeight: 1.5,
                      opacity: joined[activeRoom] ? 1 : 0.5,
                    }}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || !joined[activeRoom]}
                  style={{
                    width: 44, height: 44,
                    background: input.trim() && joined[activeRoom]
                      ? "linear-gradient(135deg,#D4AF37,#e8c53a)"
                      : "rgba(212,175,55,0.1)",
                    border: "none", borderRadius: 12,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: input.trim() && joined[activeRoom] ? "pointer" : "not-allowed",
                    flexShrink: 0,
                    transition: "all 0.2s",
                  }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke={input.trim() && joined[activeRoom] ? "#0e0c0a" : "rgba(212,175,55,0.35)"}
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── ONLINE USERS PANEL ── */}
        {activeRoom && (
          <div style={{
            width: 220, flexShrink: 0,
            borderLeft: "1px solid rgba(212,175,55,0.12)",
            background: "rgba(10,8,6,0.8)",
            overflowY: "auto",
          }}>
            <div style={{
              padding: "16px 16px 12px",
              fontFamily: "'Cinzel',serif", fontSize: 9,
              letterSpacing: "0.2em", color: "rgba(212,175,55,0.6)",
              borderBottom: "1px solid rgba(212,175,55,0.08)",
            }}>
              ONLINE — {roomUsers.filter(u => u.active).length}
            </div>
            <div style={{ padding: "12px 0" }}>
              {/* Active first */}
              {[...roomUsers].sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0)).map((u, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 16px",
                  borderBottom: "1px solid rgba(212,175,55,0.05)",
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%",
                    background: u.active ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${u.active ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.08)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Cinzel',serif", fontSize: 9,
                    color: u.active ? "#D4AF37" : "rgba(200,191,160,0.3)",
                    flexShrink: 0,
                    position: "relative",
                  }}>
                    {u.name.split(" ").map(s => s[0]).join("")}
                    <span style={{
                      position: "absolute", bottom: -1, right: -1,
                      width: 8, height: 8, borderRadius: "50%",
                      background: u.active ? "#4CAF50" : "rgba(200,191,160,0.2)",
                      border: "1.5px solid #080808",
                    }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: "'Raleway',sans-serif", fontSize: 12,
                      color: u.active ? "rgba(200,191,160,0.9)" : "rgba(200,191,160,0.35)",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {u.name.split(" ")[0]}
                    </div>
                    <div style={{
                      fontFamily: "'Cinzel',serif", fontSize: 7,
                      letterSpacing: "0.1em",
                      color: u.active ? RoleColors(u.role) : "rgba(200,191,160,0.2)",
                    }}>
                      {u.role?.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
              {/* You */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 16px",
                background: "rgba(212,175,55,0.04)",
                borderTop: "1px solid rgba(212,175,55,0.08)",
                marginTop: 8,
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%",
                  background: "linear-gradient(135deg,#D4AF37,#e8c53a)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Cinzel',serif", fontSize: 9,
                  color: "#0e0c0a", flexShrink: 0,
                  position: "relative",
                }}>
                  YO
                  <span style={{
                    position: "absolute", bottom: -1, right: -1,
                    width: 8, height: 8, borderRadius: "50%",
                    background: "#4CAF50", border: "1.5px solid #080808",
                  }} />
                </div>
                <div>
                  <div style={{
                    fontFamily: "'Raleway',sans-serif", fontSize: 12,
                    color: "#D4AF37",
                  }}>You</div>
                  <div style={{
                    fontFamily: "'Cinzel',serif", fontSize: 7,
                    letterSpacing: "0.1em", color: "rgba(212,175,55,0.5)",
                  }}>
                    {joined[activeRoom] ? "MEMBER" : "OBSERVER"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Room Modal */}
      <AnimatePresence>
        {showNewRoom && <NewRoomModal onClose={() => setShowNewRoom(false)} />}
      </AnimatePresence>
    </div>
  );
}
