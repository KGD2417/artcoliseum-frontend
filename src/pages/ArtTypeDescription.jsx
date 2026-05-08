import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const MEDIUM_DATA = {
  paintings: {
    title: "Paintings",
    label: "THE ART OF PAINTING",
    heroImg: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1600&q=80",
    origin: [
      "Painting is one of humanity's oldest art forms, with origins in prehistoric cave art over 40,000 years ago. The Lascaux caves of France and Altamira in Spain bear witness to our ancestors' compulsion to depict the world around them — using natural pigments of ochre, charcoal, and hematite on rock faces. These earliest paintings were not mere decoration; they were ritual, memory, and identity rendered visible.",
      "The ancient Egyptians refined painting into a sacred practice, developing strict conventions of proportion and symbolism that persisted for three millennia. The Greeks brought naturalism, the Romans mastered fresco and mosaic, and Byzantium elevated icon painting to a spiritual science. Then came the Renaissance — spanning the 14th through 17th centuries — when European masters such as Leonardo, Michelangelo, and Raphael elevated painting to the absolute pinnacle of cultural achievement, fusing mathematical perspective, anatomical precision, and divine aspiration.",
      "The centuries that followed saw painting reinvent itself repeatedly: the dramatic chiaroscuro of Caravaggio, the luminous interiors of Vermeer, the revolutionary brushwork of the Impressionists, the psychological intensity of Expressionism, the radical abstraction of Rothko and Pollock. Today, painting remains among the most vital and contested of all art forms — simultaneously ancient and radically contemporary, speaking a language that no other medium can fully replicate.",
    ],
    pioneers: [
      "Leonardo da Vinci", "Michelangelo Buonarroti", "Rembrandt van Rijn",
      "Claude Monet", "Pablo Picasso", "Jackson Pollock", "Mark Rothko",
      "Johannes Vermeer", "Caravaggio", "Jean-Michel Basquiat",
    ],
    subtypes: [
      {
        slug: "oil",
        label: "Oil on Canvas",
        count: "920+",
        desc: "The dominant medium of Western painting since the 15th century. Oil's slow drying time allows for rich blending, layering, and extraordinary tonal depth.",
        img: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80",
      },
      {
        slug: "acrylic",
        label: "Acrylic",
        count: "640+",
        desc: "Fast-drying, versatile and vibrant. Acrylics allow for everything from thin, translucent washes to thick impasto textures — beloved by contemporary artists worldwide.",
        img: "https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=800&q=80",
      },
      {
        slug: "watercolor",
        label: "Watercolor",
        count: "320+",
        desc: "Prized for its delicate luminosity and spontaneity. Watercolor demands confidence — each wash permanent, each mark decisive — making it a medium of rare elegance.",
        img: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&q=80",
      },
      {
        slug: "mixed-media",
        label: "Mixed Media",
        count: "520+",
        desc: "Works that transcend categorical boundaries, combining paint with collage, photography, textile, or found objects. Mixed media reflects the pluralism of contemporary art-making.",
        img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80",
      },
      {
        slug: "tempera",
        label: "Tempera",
        count: "180+",
        desc: "One of the oldest painting mediums, using egg yolk as a binder. Tempera's jewel-like clarity and permanence made it the preferred medium of the early Italian masters.",
        img: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80",
      },
      {
        slug: "fresco",
        label: "Fresco",
        count: "90+",
        desc: "Painting applied directly to wet plaster — the medium of the Sistine Chapel ceiling and the great muralists of the 20th century. Permanent, monumental, and deeply architectural.",
        img: "https://images.unsplash.com/photo-1567359781514-3b964e2b04d6?w=800&q=80",
      },
    ],
  },
  sculptures: {
    title: "Sculptures",
    label: "THE ART OF SCULPTURE",
    heroImg: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80",
    origin: [
      "Sculpture is among the oldest art forms in human history, with examples dating back over 40,000 years to the Venus of Hohle Fels — a small ivory figurine carved by early Homo sapiens in what is now southern Germany. From these primal beginnings, sculpture evolved across every civilization: the colossal monuments of ancient Egypt, the idealized athleticism of Greek marble, the psychological complexity of Roman portraiture.",
      "The Renaissance rekindled the ancient fascination with three-dimensional form. Michelangelo's David — carved from a single flawed block of Carrara marble — remains the paradigm of artistic ambition transmuted into physical perfection. Bernini brought the Baroque to life in stone with a theatricality that seems to defy the very nature of the material. Rodin, working in the 19th century, shattered academic convention with his raw, unfinished surfaces and existential intensity.",
      "The 20th century exploded the definition of sculpture entirely. Brâncuși reduced form to its most essential contour. Giacometti stretched the human figure into existential anguish. Louise Bourgeois made sculpture from private memory and psychological terror. Today, sculptors work in everything from stainless steel to light to living organisms, and the discipline continues to expand its understanding of what occupying physical space can mean.",
    ],
    pioneers: [
      "Michelangelo Buonarroti", "Auguste Rodin", "Constantin Brâncuși",
      "Alberto Giacometti", "Louise Bourgeois", "Richard Serra",
      "Gian Lorenzo Bernini", "Henry Moore", "Donatello",
    ],
    subtypes: [
      {
        slug: "bronze",
        label: "Bronze",
        count: "240+",
        desc: "Cast bronze has been the preeminent sculptural material for over five millennia. Its tensile strength, rich patina, and durability make it ideal for monumental and intimate works alike.",
        img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      },
      {
        slug: "marble",
        label: "Marble",
        count: "180+",
        desc: "The material of gods and emperors. Marble's translucency gives carved flesh an uncanny warmth, while its hardness demands absolute precision from the sculptor's hand.",
        img: "https://images.unsplash.com/photo-1565035010268-a3816f98589a?w=800&q=80",
      },
      {
        slug: "kinetic",
        label: "Kinetic",
        count: "120+",
        desc: "Sculpture that moves — driven by motors, air currents, or viewer interaction. Kinetic art collapses the boundary between object and performance, space and time.",
        img: "https://images.unsplash.com/photo-1577720580479-7d839d829c73?w=800&q=80",
      },
      {
        slug: "ceramic",
        label: "Ceramic",
        count: "300+",
        desc: "Among the most ancient of materials, clay has been shaped by human hands for over 25,000 years. Contemporary ceramic sculpture reclaims this prehistoric material as a site of radical formal experiment.",
        img: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80",
      },
      {
        slug: "wood",
        label: "Wood",
        count: "160+",
        desc: "Carved, assembled, or burned — wood carries the grain and memory of living things. Its warmth and organic quality make it one of the most intimate sculptural materials.",
        img: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=80",
      },
      {
        slug: "steel",
        label: "Steel",
        count: "140+",
        desc: "Industrial and monumental, steel's reflective surfaces and structural properties allow sculptors to work at architectural scale — transforming public space through raw, imposing form.",
        img: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=800&q=80",
      },
    ],
  },
  photography: {
    title: "Photography",
    label: "THE ART OF PHOTOGRAPHY",
    heroImg: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1600&q=80",
    origin: [
      "Photography was invented in the 1820s and 1830s through the parallel experiments of Joseph Nicéphore Niépce and Louis Daguerre in France, and William Henry Fox Talbot in England. Niépce's heliograph of 1826 — the oldest surviving photograph — required an eight-hour exposure. By 1839, the daguerreotype had reduced that to minutes, and the world was transformed forever. A machine could now draw.",
      "The immediate question photography posed to painting — why paint when a machine can record? — proved ultimately liberating for both forms. Photography freed painting from the obligation of documentation. And photography, in its turn, struggled to establish itself as a legitimate fine art. Early pictorialists deliberately blurred and manipulated their prints to look like paintings. It was only with the 'straight photography' movement — championed by Alfred Stieglitz, Edward Weston, and later Ansel Adams — that the medium embraced its own mechanical nature as an aesthetic virtue.",
      "The 20th century produced photographic masterpieces that changed how humanity understood itself: Dorothea Lange's Migrant Mother, Henri Cartier-Bresson's decisive moments, Robert Frank's raw American vision. Today, digital technology has democratized the camera while simultaneously intensifying the debate about authenticity, manipulation, and what, in an age of infinite images, a truly great photograph actually is.",
    ],
    pioneers: [
      "Ansel Adams", "Henri Cartier-Bresson", "Dorothea Lange",
      "Cindy Sherman", "Andreas Gursky", "Richard Avedon",
      "Diane Arbus", "Robert Frank", "Edward Weston",
    ],
    subtypes: [
      {
        slug: "fine-art",
        label: "Fine Art",
        count: "420+",
        desc: "Photography conceived and executed as autonomous art — where the image is not a document of something else, but an aesthetic object complete in itself.",
        img: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80",
      },
      {
        slug: "documentary",
        label: "Documentary",
        count: "260+",
        desc: "Photography as witness. Documentary work records the world with unflinching honesty — social conditions, conflict, culture — and carries the weight of moral responsibility.",
        img: "https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?w=800&q=80",
      },
      {
        slug: "landscape",
        label: "Landscape",
        count: "320+",
        desc: "From Ansel Adams' majestic Sierra Nevada to contemporary environmental work, landscape photography navigates the boundary between the sublime and the ecological.",
        img: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80",
      },
      {
        slug: "abstract",
        label: "Abstract",
        count: "200+",
        desc: "Photography pushed beyond representation — into light, texture, shadow, and form. Abstract photography finds the painterly within the mechanical.",
        img: "https://images.unsplash.com/photo-1502691876148-a84978e59af8?w=800&q=80",
      },
      {
        slug: "portrait",
        label: "Portrait",
        count: "380+",
        desc: "The human face as territory. Portrait photography at its finest reveals character, context, and the ineffable mystery of individual existence.",
        img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80",
      },
    ],
  },
  digital: {
    title: "Digital Art",
    label: "THE ART OF THE DIGITAL AGE",
    heroImg: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1600&q=80",
    origin: [
      "Digital art emerged in the 1960s with the first computer-generated graphics produced by pioneers such as Vera Molnár, Frieder Nake, and Georg Nees — mathematicians and engineers who recognized the aesthetic potential of algorithmic processes. Their plotted line drawings, generated by rule-based systems, inaugurated an entirely new relationship between artist and medium: one in which the work is not made by hand but authored through code.",
      "The 1980s brought personal computers and the first graphic design software, democratizing digital image-making. The 1990s saw the World Wide Web transform how digital art could be distributed and experienced. Harold Cohen's AARON — an artificial intelligence trained to paint — raised fundamental questions about authorship and creativity that remain unresolved today. By the 2000s, artists like Casey Reas and Ben Fry were developing Processing, an open-source programming environment that became the lingua franca of generative art.",
      "The 2020s brought seismic disruption with the rise of NFTs (non-fungible tokens), enabling digital artworks to be bought and sold with a verifiable record of ownership on the blockchain. Beeple's 'Everydays: The First 5000 Days' sold at Christie's for $69 million, instantly repositioning digital art within the mainstream art market. Refik Anadol's AI-powered data sculptures — trained on millions of images and rendered as immersive architectural projections — represent a new frontier in which art is inseparable from machine learning and real-time computation.",
    ],
    pioneers: [
      "Vera Molnár", "Harold Cohen", "Casey Reas",
      "Beeple (Mike Winkelmann)", "Refik Anadol",
      "Frieder Nake", "Georg Nees", "Joshua Davis",
    ],
    subtypes: [
      {
        slug: "generative",
        label: "Generative",
        count: "880+",
        desc: "Art created through algorithmic processes — where code, mathematics, and randomness collaborate to produce infinite variations of a defined aesthetic system.",
        img: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&q=80",
      },
      {
        slug: "nft",
        label: "NFT",
        count: "1,400+",
        desc: "Digital works authenticated on the blockchain — combining the irreproducibility of traditional art with the native capabilities of digital media.",
        img: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80",
      },
      {
        slug: "ar-ready",
        label: "AR Ready",
        count: "640+",
        desc: "Works designed to exist in augmented reality — inhabiting the physical world through a screen, transforming any space into a gallery.",
        img: "https://images.unsplash.com/photo-1633437039415-f3d6611db4d5?w=800&q=80",
      },
      {
        slug: "ai-assisted",
        label: "AI Assisted",
        count: "520+",
        desc: "Artworks created in collaboration with machine learning systems — where the artist curates, directs, and refines outputs from trained neural networks.",
        img: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800&q=80",
      },
      {
        slug: "3d-rendered",
        label: "3D Rendered",
        count: "340+",
        desc: "Computer-generated three-dimensional imagery of extraordinary photographic realism or deliberate surrealism — sculpture for the digital era.",
        img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
      },
    ],
  },
  drawings: {
    title: "Drawings",
    label: "THE ART OF DRAWING",
    heroImg: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1600&q=80",
    origin: [
      "Drawing is the most fundamental of all visual arts, predating painting by millennia. The cave drawings of Chauvet — over 35,000 years old — demonstrate a mastery of line, contour, and shading that remains astonishing today. Drawing is where all visual thinking begins: the sketch, the study, the gesture that precedes the finished work. In this sense, it is not merely a medium but the very grammar of visual intelligence.",
      "In the Renaissance, drawing (disegno) was elevated by theorists like Giorgio Vasari to the status of highest intellectual activity among the arts. Leonardo da Vinci's notebooks — filled with anatomical studies, mechanical inventions, landscape observations, and portrait sketches — represent perhaps the greatest sustained act of visual thinking in Western cultural history. For Renaissance artists, drawing was the primary tool of investigation: the means by which they understood the world well enough to reinvent it.",
      "From Dürer's precise botanical studies to Rembrandt's rapid pen sketches, from Ingres's silky graphite portraits to Egon Schiele's tortured line — drawing has always offered a direct connection to the artist's hand and mind that more laborious media cannot. Contemporary drawing practices have expanded dramatically: artists work at monumental scale, use non-traditional materials, and treat drawing as a complete mode of artistic expression rather than a preparatory step.",
    ],
    pioneers: [
      "Leonardo da Vinci", "Michelangelo Buonarroti", "Raphael Sanzio",
      "Egon Schiele", "Gustav Klimt", "Albrecht Dürer",
      "Rembrandt van Rijn", "Jean-Auguste-Dominique Ingres", "Käthe Kollwitz",
    ],
    subtypes: [
      {
        slug: "charcoal",
        label: "Charcoal",
        count: "240+",
        desc: "Rich, velvety, and deeply expressive. Charcoal's capacity for dramatic tonal range makes it the preferred medium for powerful figurative and gestural works.",
        img: "https://images.unsplash.com/photo-1520420097861-e4959843b682?w=800&q=80",
      },
      {
        slug: "graphite",
        label: "Graphite",
        count: "180+",
        desc: "The pencil in its most refined form. Graphite allows for extraordinary precision alongside soft, atmospheric passages — the medium of hyperrealism and intimate study.",
        img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80",
      },
      {
        slug: "pastel",
        label: "Pastel",
        count: "160+",
        desc: "Degas made pastel his own — its powdery, luminous surface capable of both bold colour and delicate sfumato. Pastel occupies the intersection between drawing and painting.",
        img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
      },
      {
        slug: "ink",
        label: "Ink",
        count: "370+",
        desc: "From East Asian brush painting to Western pen-and-ink illustration, ink is the medium of absolute commitment — permanent, unforgiving, and capable of breathtaking spontaneity.",
        img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
      },
      {
        slug: "colored-pencil",
        label: "Colored Pencil",
        count: "220+",
        desc: "Once considered a children's medium, colored pencil has been reclaimed by contemporary artists for its extraordinary layering capacity and jewel-like color intensity.",
        img: "https://images.unsplash.com/photo-1548438294-1ad5d5f4f063?w=800&q=80",
      },
    ],
  },
  prints: {
    title: "Prints",
    label: "THE ART OF PRINTMAKING",
    heroImg: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1600&q=80",
    origin: [
      "Printmaking has roots in ancient China with woodblock printing dating to approximately 200 AD — originally used for textile decoration and later for reproducing texts and images. The technology reached Europe in the 14th century, where it rapidly transformed culture: Gutenberg's moveable type press, itself a printmaking technology, made books affordable for the first time, catalyzing the Renaissance, the Reformation, and the Scientific Revolution. Albrecht Dürer, working in Nuremberg at the turn of the 16th century, elevated woodcut and engraving to the status of fine art, producing prints of astonishing technical virtuosity and conceptual depth.",
      "Etching — in which acid bites lines into a metal plate — allowed for finer marks and greater tonal range than woodcut or engraving. Rembrandt mastered etching as completely as he mastered oil paint, producing some of his most profound works in this medium. Francisco Goya's 'Los Caprichos' etchings stand as one of the first examples of printmaking deployed as a vehicle for social and political critique — a tradition that runs through Daumier, Käthe Kollwitz, and into the present.",
      "The 20th century brought lithography and screen printing to the forefront. Andy Warhol's silkscreen portraits of Marilyn Monroe and Mao Zedong used printmaking's inherent capacity for repetition and variation as a statement about consumer culture and the mass-production of celebrity. Today, giclée — archival inkjet printing on fine art paper or canvas — has made high-quality limited-edition prints accessible to a new generation of collectors while raising important questions about originality and the nature of the multiple.",
    ],
    pioneers: [
      "Albrecht Dürer", "Francisco Goya", "Andy Warhol",
      "Robert Rauschenberg", "Katsushika Hokusai",
      "Rembrandt van Rijn", "Käthe Kollwitz", "Jasper Johns",
    ],
    subtypes: [
      {
        slug: "giclee",
        label: "Giclée",
        count: "880+",
        desc: "Museum-quality archival inkjet prints on fine art paper or canvas. Giclée reproduces the subtlest tonal gradations of original works with extraordinary fidelity.",
        img: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80",
      },
      {
        slug: "lithograph",
        label: "Lithograph",
        count: "420+",
        desc: "Based on the principle that oil and water repel, lithography produces a uniquely painterly quality in print — the medium of Toulouse-Lautrec, Daumier, and countless modern masters.",
        img: "https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=800&q=80",
      },
      {
        slug: "etching",
        label: "Etching",
        count: "320+",
        desc: "Acid-bitten lines on copper or zinc plate, yielding a richness and expressiveness unique to this medium. The preferred printmaking technique of Rembrandt, Goya, and Whistler.",
        img: "https://images.unsplash.com/photo-1586941962765-d3896cc85ac6?w=800&q=80",
      },
      {
        slug: "screen",
        label: "Screen Print",
        count: "480+",
        desc: "Bold, flat colour and graphic precision define screen printing — the medium made iconic by Warhol and still the dominant technique of contemporary limited-edition art publishing.",
        img: "https://images.unsplash.com/photo-1486162928267-e6274cb3106f?w=800&q=80",
      },
      {
        slug: "woodblock",
        label: "Woodblock",
        count: "200+",
        desc: "The oldest printmaking technique. Japanese ukiyo-e woodblock masters like Hokusai and Hiroshige produced prints of such formal beauty that they transformed Western art when first encountered in the 19th century.",
        img: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=800&q=80",
      },
    ],
  },
};

const TAB_ICONS = ["✦", "◆", "✳", "◈", "❖", "◇"];

export default function ArtTypeDescription() {
  const { medium } = useParams();
  const navigate = useNavigate();
  const data = MEDIUM_DATA[medium] || MEDIUM_DATA.paintings;
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      label: "About the Art",
      heading: `The Art of ${data.title}`,
      body: data.origin[0],
      img: data.heroImg,
    },
    {
      label: "History & Origins",
      heading: "Ancient Beginnings",
      body: data.origin[1] || data.origin[0],
      img: data.heroImg,
    },
    {
      label: "Modern Era",
      heading: "Into the Modern Era",
      body: data.origin[2] || data.origin[1],
      img: data.heroImg,
    },
    {
      label: "Pioneers & Masters",
      heading: "The Great Masters",
      body: data.pioneers.join("  ·  "),
      img: data.heroImg,
      isPioneers: true,
    },
  ];

  const current = tabs[activeTab];
  const go = (dir) => setActiveTab(i => Math.max(0, Math.min(tabs.length - 1, i + dir)));

  return (
    <div style={{ background: "#080808", minHeight: "100vh" }}>

      {/* HERO */}
      <div className="art-hero" style={{ position: "relative", height: 440, overflow: "hidden" }}>
        <img src={data.heroImg} alt={data.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(8,8,8,0.25) 0%, rgba(8,8,8,0.55) 50%, rgba(8,8,8,1) 100%)" }} />
        <div className="art-hero-padding" style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 56px 48px", maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.5)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <Link to="/categories" style={{ color: "rgba(200,191,160,0.5)", textDecoration: "none" }}>Collections</Link>
            <span style={{ color: "rgba(212,175,55,0.4)" }}>›</span>
            <span style={{ color: "#D4AF37" }}>{data.title}</span>
          </div>
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.24em", color: "#D4AF37", marginBottom: 12 }}>{data.label}</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(52px,6vw,84px)", fontWeight: 700, color: "#fff", lineHeight: 0.95, letterSpacing: "-0.01em", margin: 0 }}>
              {data.title}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* TABBED SECTION */}
      <div className="art-main-container" style={{ maxWidth: 1320, margin: "0 auto", padding: "48px 56px 100px" }}>

        {/* Tab pills */}
        <div className="art-tabs-row" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 36 }}>
          {tabs.map((tab, i) => (
            <motion.button
              key={i}
              onClick={() => setActiveTab(i)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 20px",
                background: activeTab === i ? "rgba(212,175,55,0.08)" : "transparent",
                border: `1px solid ${activeTab === i ? "#D4AF37" : "rgba(212,175,55,0.2)"}`,
                borderRadius: 999, cursor: "pointer",
                fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.14em",
                color: activeTab === i ? "#D4AF37" : "rgba(200,191,160,0.45)",
                transition: "all 0.2s",
              }}>
              <span style={{ fontSize: 9 }}>{TAB_ICONS[i]}</span>
              {tab.label.toUpperCase()}
              <span style={{ fontSize: 9, opacity: 0.6 }}>{String(i + 1).padStart(2, "0")}</span>
            </motion.button>
          ))}
        </div>

        {/* Slide panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="art-slide-panel"
            style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              border: "1px solid rgba(212,175,55,0.15)",
              borderRadius: 20, overflow: "hidden",
              background: "rgba(255,255,255,0.018)",
              height: 560,
            }}>

            {/* Left: Image panel */}
            <div className="art-slide-img" style={{
              position: "relative", overflow: "hidden",
              background: "#0d0b08",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 36,
            }}>
              <div style={{
                width: "100%", height: "100%", position: "absolute", inset: 0,
                background: "radial-gradient(ellipse at center, rgba(212,175,55,0.06) 0%, transparent 70%)",
              }} />
              <motion.img
                key={current.img}
                initial={{ scale: 1.06, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                src={current.img}
                alt=""
                style={{
                  width: "100%", height: "100%", objectFit: "cover",
                  borderRadius: 12, display: "block", position: "relative", zIndex: 1,
                  boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
                }}
              />
              {/* Bottom label */}
              <div style={{
                position: "absolute", bottom: 28, left: 28, zIndex: 2,
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(8,8,8,0.75)",
                border: "1px solid rgba(212,175,55,0.3)",
                borderRadius: 999, padding: "7px 16px",
              }}>
                <span style={{ color: "#D4AF37", fontSize: 9 }}>◆</span>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: "#D4AF37" }}>
                  {current.label.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Right: Content panel */}
            <div className="art-slide-content" style={{
              padding: "40px 52px",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              borderLeft: "1px solid rgba(212,175,55,0.1)",
              height: "100%",
              boxSizing: "border-box",
            }}>
              {/* Centered content block */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                {/* Section label */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: "rgba(212,175,55,0.5)", fontStyle: "italic" }}>
                    {String(activeTab + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.22em", color: "#D4AF37" }}>
                    {current.label.toUpperCase()}
                  </span>
                </div>

                {/* Heading */}
                <h2 style={{
                  fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(32px,3vw,46px)",
                  fontWeight: 700, color: "#fff", lineHeight: 1.05,
                  margin: "0 0 20px", letterSpacing: "-0.01em",
                }}>
                  {current.heading}
                </h2>

                {/* Body */}
                {current.isPioneers ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                    {data.pioneers.map((name) => (
                      <span key={name} style={{
                        fontFamily: "'Cormorant Garamond',serif", fontSize: 14, fontStyle: "italic",
                        color: "rgba(200,191,160,0.75)",
                        background: "rgba(212,175,55,0.06)",
                        border: "1px solid rgba(212,175,55,0.15)",
                        borderRadius: 999, padding: "5px 14px",
                      }}>{name}</span>
                    ))}
                  </div>
                ) : (
                  <p style={{
                    fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontStyle: "italic",
                    color: "rgba(200,191,160,0.78)", lineHeight: 1.8, margin: "0 0 24px",
                  }}>
                    {current.body}
                  </p>
                )}

                {/* Gold accent line */}
                <div style={{ width: 64, height: 2, background: "linear-gradient(90deg,#D4AF37,transparent)" }} />
              </div>

              {/* Navigation — pinned to bottom */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 24 }}>
                <motion.button
                  onClick={() => go(-1)}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                  disabled={activeTab === 0}
                  style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: activeTab === 0 ? "rgba(255,255,255,0.03)" : "rgba(212,175,55,0.08)",
                    border: `1px solid ${activeTab === 0 ? "rgba(212,175,55,0.1)" : "rgba(212,175,55,0.35)"}`,
                    color: activeTab === 0 ? "rgba(200,191,160,0.2)" : "#D4AF37",
                    cursor: activeTab === 0 ? "default" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "serif", fontSize: 18, transition: "all 0.2s",
                  }}>←</motion.button>

                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", color: "rgba(200,191,160,0.4)" }}>
                  {String(activeTab + 1).padStart(2, "0")} / {String(tabs.length).padStart(2, "0")}
                </span>

                <motion.button
                  onClick={() => go(1)}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                  disabled={activeTab === tabs.length - 1}
                  style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: activeTab === tabs.length - 1 ? "rgba(255,255,255,0.03)" : "rgba(212,175,55,0.08)",
                    border: `1px solid ${activeTab === tabs.length - 1 ? "rgba(212,175,55,0.1)" : "rgba(212,175,55,0.35)"}`,
                    color: activeTab === tabs.length - 1 ? "rgba(200,191,160,0.2)" : "#D4AF37",
                    cursor: activeTab === tabs.length - 1 ? "default" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "serif", fontSize: 18, transition: "all 0.2s",
                  }}>→</motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* STYLES & FORMS — separate section */}
        <div style={{ marginTop: 72 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36 }}>
            <div style={{ width: 32, height: 1, background: "rgba(212,175,55,0.4)" }} />
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.24em", color: "#D4AF37" }}>STYLES & FORMS</span>
            <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.15)" }} />
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, fontStyle: "italic", color: "rgba(200,191,160,0.4)" }}>
              {data.subtypes.length} Distinct Styles
            </span>
          </div>
          <div className="art-styles-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {data.subtypes.map(s => (
              <div
                key={s.slug}
                onClick={() => navigate(`/categories/${medium}/${s.slug}`)}
                style={{
                  position: "relative", overflow: "hidden",
                  borderRadius: 14, cursor: "pointer",
                  border: "1px solid rgba(212,175,55,0.12)",
                  aspectRatio: "4/3",
                  transition: "border-color 0.25s, transform 0.25s, box-shadow 0.25s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgba(212,175,55,0.5)";
                  e.currentTarget.style.transform = "scale(1.025)";
                  e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.5)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(212,175,55,0.12)";
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}>
                <img src={s.img} alt={s.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,8,0.9) 0%, rgba(8,8,8,0.15) 60%)" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px 16px" }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>{s.label}</div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.14em", color: "#D4AF37", marginTop: 4 }}>{s.count} WORKS</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexWrap: "wrap", paddingTop: 48, borderTop: "1px solid rgba(212,175,55,0.1)", marginTop: 48 }}>
          <Link to="/categories" style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.18em", color: "rgba(200,191,160,0.4)", textDecoration: "none" }}>
            ← BACK TO COLLECTIONS
          </Link>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 12px 36px rgba(212,175,55,0.3)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/gallery?medium=${medium}`)}
            style={{ padding: "14px 40px", background: "linear-gradient(135deg,#D4AF37,#e8c53a)", color: "#0e0c0a", border: "none", borderRadius: 999, fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.2em", fontWeight: 600, cursor: "pointer" }}>
            EXPLORE ALL {data.title.toUpperCase()}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
