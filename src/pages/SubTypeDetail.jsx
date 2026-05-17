import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SafeImage from "../components/SafeImage";
import ArtworkHoverCard from "../components/ArtworkHoverCard";

const SUBTYPE_DATA = {
  paintings: {
    oil: {
      label: "Oil on Canvas",
      sublabel: "THE DOMINANT MEDIUM",
      heroImg: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1600&q=80",
      origin: [
        "Oil on canvas is the supreme medium of Western painting — a technology so perfectly suited to the representation of reality that it remained unchallenged for five centuries. Since Jan van Eyck refined the technique in 15th-century Flanders, oil's slow drying time has allowed painters to blend, glaze, and layer pigment with a subtlety that no other medium can match. The result is a surface capable of depicting velvet, skin, water, and candlelight with almost supernatural fidelity.",
        "Oil painting superseded tempera in 15th-century Flanders, where painters discovered that linseed and walnut oils could bind pigment with a luminosity and flexibility no egg-based medium could match. Italian masters Titian and Giorgione brought oil to Venice, where its sensuous qualities — deep shadows, warm flesh, atmospheric haze — found their ideal expression. By the 17th century, Rembrandt and Velázquez had pushed the medium to psychological depths that still stun modern viewers.",
        "The 19th century brought oil painting to a crisis and a renaissance simultaneously. The Impressionists took oil outdoors, loosening the brushwork that academic tradition had tightened for centuries. Post-Impressionism exploded technique further: van Gogh's turbulent impasto, Cézanne's geometric analysis of form. Today, painters like Gerhard Richter and Lucian Freud have proved that oil on canvas remains the most demanding and rewarding medium available — ancient, inexhaustible, and radically alive.",
      ],
      pioneers: ["Jan van Eyck", "Titian", "Rembrandt van Rijn", "Johannes Vermeer", "J.M.W. Turner", "John Singer Sargent", "Claude Monet", "Vincent van Gogh", "Gerhard Richter", "Lucian Freud"],
    },
    acrylic: {
      label: "Acrylic",
      sublabel: "THE VERSATILE MEDIUM",
      heroImg: "https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=1600&q=80",
      origin: [
        "Acrylic paint represents one of the great artistic revolutions of the 20th century — a synthetic medium that offers the visual richness of oil without its weeks-long drying time. Developed in the 1950s, acrylics can be thinned to translucent washes, worked in gestural impasto, or applied as flat, graphic planes of pure colour. This extraordinary range has made acrylic paint the medium of choice for artists working across every style and tradition.",
        "Acrylic paint was first developed in the 1940s through the work of chemists and Mexican muralists who needed a durable, weather-resistant medium for large-scale public works. By the 1960s, American Pop artists and Color Field painters had embraced the medium for its flat, even surfaces and vivid, unwavering hues. David Hockney's blue swimming pools, painted in acrylic, became among the most iconic images of the 20th century.",
        "Contemporary acrylic practice encompasses extremes that would have been unimaginable to the medium's inventors. Artists use acrylics for hyper-realistic portraiture, gestural abstraction, large-scale installation, and digital-age pattern work. The medium's forgiving nature — mistakes can be painted over within minutes — has also made it the first choice for countless emerging artists worldwide, while masters continue to push its expressive ceiling.",
      ],
      pioneers: ["David Hockney", "Mark Rothko", "Helen Frankenthaler", "Roy Lichtenstein", "Andy Warhol", "Bridget Riley", "Frank Stella", "Peter Doig", "Cecily Brown"],
    },
    watercolor: {
      label: "Watercolor",
      sublabel: "THE LUMINOUS MEDIUM",
      heroImg: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1600&q=80",
      origin: [
        "Watercolor demands a quality that few other media require: the courage of absolute commitment. Because water-soluble pigment on paper is essentially permanent once dry, each mark must be made with confidence and precision. This urgency — combined with the medium's capacity for luminous, atmospheric washes that seem lit from within — has made watercolor the choice of masters from Dürer to Turner to Sargent.",
        "Watercolor's history spans centuries and continents. Albrecht Dürer used it with extraordinary botanical precision in the late 15th century. In 18th-century England, the medium achieved the status of a national art form — with Turner producing landscape watercolors of breathtaking ambition and scale. The English Watercolour Society, founded in 1804, was the first institution in Europe dedicated entirely to a single medium.",
        "The 20th century expanded watercolor beyond its traditional association with landscape and botanical illustration. Paul Klee used it with the delicacy of a poet. Contemporary practitioners work in virtuosic improvisatory modes — large, loose, and dazzlingly atmospheric — while others exploit watercolor's capacity for microscopically fine detail in works that rival photography for precision.",
      ],
      pioneers: ["Albrecht Dürer", "J.M.W. Turner", "John Singer Sargent", "Paul Klee", "Paul Cézanne", "Winslow Homer", "Charles Demuth", "Edward Hopper"],
    },
    "mixed-media": {
      label: "Mixed Media",
      sublabel: "THE BOUNDARY-BREAKING MEDIUM",
      heroImg: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1600&q=80",
      origin: [
        "Mixed media art is defined by its refusal to be defined — works that transcend categorical boundaries by combining paint with collage, photography, textile, found objects, and digital output. This pluralism is not merely aesthetic preference; it reflects a fundamental conviction that the complexity of contemporary experience demands a complexity of means.",
        "The roots of mixed media practice lie in the Cubist collages of Picasso and Braque, who in 1912 first glued newspaper and wallpaper directly to their canvases, shattering the centuries-old distinction between painting and the material world. The Dadaists took this further — assembling photomontages, ready-mades, and found objects into works that challenged every assumption about what art could be made from.",
        "Today, mixed media is arguably the dominant mode of contemporary art-making. Artists combine oil paint with digital projection, embroidery with photography, sculpture with sound. The question is no longer what materials an artist may use but what combination of materials can most precisely express a specific vision — a freedom that is simultaneously exhilarating and demanding.",
      ],
      pioneers: ["Pablo Picasso", "Georges Braque", "Robert Rauschenberg", "Joseph Cornell", "Cy Twombly", "Kara Walker", "Jean-Michel Basquiat", "Wangechi Mutu"],
    },
    tempera: {
      label: "Tempera",
      sublabel: "THE ANCIENT MEDIUM",
      heroImg: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1600&q=80",
      origin: [
        "Egg tempera is one of the oldest painting mediums still in active use — a mixture of ground pigment and egg yolk that dries almost instantly to a jewel-like, permanent surface. Used by the painters of ancient Egypt and Byzantine icon makers, it became the primary medium of Italian panel painting from the 12th through the 15th centuries, producing works of extraordinary clarity, luminosity, and durability.",
        "The great masters of early Italian painting — Duccio, Giotto, Fra Angelico, and Botticelli — all worked primarily in egg tempera. The medium's rapid drying time demanded a meticulous, disciplined technique: colours could not be blended on the surface but had to be built up through thousands of fine, overlapping strokes. This hatching technique, perfected over generations of workshop practice, produced tonal modelling of remarkable delicacy.",
        "Tempera was largely displaced by oil paint in the 15th and 16th centuries, but it underwent a significant revival in the 20th century. Andrew Wyeth made egg tempera his primary medium, using it to achieve a quality of stillness and psychological depth that was uniquely his own. Contemporary artists continue to work in the medium, drawn to its permanence, precision, and the direct, almost meditative quality of its execution.",
      ],
      pioneers: ["Giotto di Bondone", "Fra Angelico", "Sandro Botticelli", "Duccio di Buoninsegna", "Piero della Francesca", "Andrew Wyeth", "Luca Signorelli"],
    },
    fresco: {
      label: "Fresco",
      sublabel: "THE MONUMENTAL MEDIUM",
      heroImg: "https://images.unsplash.com/photo-1567359781514-3b964e2b04d6?w=1600&q=80",
      origin: [
        "Fresco — painting applied directly to wet plaster — is the most demanding and most permanent of all painting techniques. Because the pigment bonds chemically with the plaster as it dries, a true fresco (buon fresco) becomes part of the wall itself, capable of surviving for millennia. This permanence, combined with its inherently architectural scale, has made fresco the medium of humanity's most ambitious decorative programmes.",
        "The great tradition of Italian fresco painting runs from the Byzantine mosaicists through Cimabue and Giotto, reaching its absolute apex in the Sistine Chapel ceiling — Michelangelo's four-year labour of genius, completed in 1512. Raphael's Vatican Stanze and the frescoes of Piero della Francesca in Arezzo represent the supreme achievement of the Renaissance in this most demanding of mediums.",
        "The 20th century saw fresco reborn in the hands of the Mexican muralists — Diego Rivera, José Clemente Orozco, and David Alfaro Siqueiros — who used the medium's monumental public scale for political and social statement. Their vast compositions covering the walls of public buildings redefined the relationship between art and civic life in ways that continue to influence artists today.",
      ],
      pioneers: ["Michelangelo Buonarroti", "Raphael Sanzio", "Giotto di Bondone", "Piero della Francesca", "Diego Rivera", "José Clemente Orozco", "Fra Angelico"],
    },
  },
  sculptures: {
    bronze: {
      label: "Bronze",
      sublabel: "THE ENDURING MEDIUM",
      heroImg: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80",
      origin: [
        "Cast bronze has been the preeminent sculptural material for over five millennia — prized for its tensile strength, rich patina, and ability to capture the finest detail of the artist's model. The lost-wax casting process, essentially unchanged since its invention in ancient Mesopotamia, transforms a fragile wax original into an object capable of enduring for thousands of years.",
        "The ancient Greeks elevated bronze casting to an art of the highest order, producing works of idealised athletic beauty that represented the human form at its most perfect. Roman sculptors inherited and extended this tradition, using bronze for portraits of extraordinary psychological penetration. The Renaissance brought a new ambition to the medium: Ghiberti's bronze doors for the Florence Baptistery — described by Michelangelo as the Gates of Paradise — remain among the supreme achievements of Western sculpture.",
        "Auguste Rodin revolutionised bronze sculpture in the 19th century, abandoning academic idealism for psychological and physical rawness. His rough, unfinished surfaces — where the material itself seems alive with energy — opened the door for the expressive bronze work of the 20th century. Today, bronze remains the medium of choice for monumental public sculpture and intimate studio work alike.",
      ],
      pioneers: ["Donatello", "Lorenzo Ghiberti", "Auguste Rodin", "Constantin Brâncuși", "Alberto Giacometti", "Henry Moore", "Louise Bourgeois", "Antony Gormley"],
    },
    marble: {
      label: "Marble",
      sublabel: "THE MATERIAL OF GODS",
      heroImg: "https://images.unsplash.com/photo-1565035010268-a3816f98589a?w=1600&q=80",
      origin: [
        "Marble has been the material of gods, emperors, and artistic ambition since antiquity. Its translucency — the way light penetrates a few millimetres into the surface before reflecting back — gives carved flesh an uncanny warmth that no other stone can match. This quality, combined with marble's hardness and capacity to hold the finest detail, has made it the supreme medium of figurative sculpture for over two thousand years.",
        "The ancient Greeks quarried Pentelic and Parian marble for their greatest temple sculptures, developing a canon of idealised human form that would define Western aesthetics for millennia. Roman sculptors replicated Greek masterpieces and created a tradition of portraiture in marble of extraordinary realism. The Renaissance rediscovered this classical tradition: Michelangelo's David, carved from a flawed block of Carrara marble, remains the paradigm of artistic ambition.",
        "Gian Lorenzo Bernini brought marble to the peak of its technical possibilities in the 17th century, carving the material into impossible lightness — billowing drapery, flowing hair, the quivering flesh of a nymph transforming into a tree. Modern sculptors have continued to challenge marble's apparent solidity, cutting into it, polishing it to mirror-brightness, and juxtaposing it with industrial materials.",
      ],
      pioneers: ["Michelangelo Buonarroti", "Gian Lorenzo Bernini", "Antonio Canova", "Donatello", "Praxiteles", "Auguste Rodin", "Hiram Powers", "Camille Claudel"],
    },
    kinetic: {
      label: "Kinetic",
      sublabel: "THE LIVING SCULPTURE",
      heroImg: "https://images.unsplash.com/photo-1577720580479-7d839d829c73?w=1600&q=80",
      origin: [
        "Kinetic sculpture introduces time as a formal element — works that move under their own power or in response to air, light, or human interaction. By incorporating motion, kinetic artists collapse the boundary between sculpture and performance, object and event. The viewer's experience of a kinetic work is never fixed but constantly changing, making each encounter with the work unique.",
        "The history of kinetic art begins in earnest with Alexander Calder's mobiles of the 1930s — delicately balanced wire and metal shapes that moved in response to air currents with an elegance that seemed to make visible the invisible forces of wind and gravity. Marcel Duchamp's Rotoreliefs and László Moholy-Nagy's Light-Space Modulator were parallel explorations of motion and optical effect that laid the theoretical groundwork for kinetic art as a defined practice.",
        "The 1950s and 1960s saw kinetic art emerge as an international movement. Jean Tinguely built elaborate machines that performed — and destroyed themselves. George Rickey's stainless steel blades moved with hypnotic slowness in the open air. Today, kinetic artists work with robotics, electromagnets, and computational systems to create works of breathtaking complexity and formal beauty.",
      ],
      pioneers: ["Alexander Calder", "Jean Tinguely", "George Rickey", "László Moholy-Nagy", "Marcel Duchamp", "Naum Gabo", "Pol Bury", "Takis"],
    },
    ceramic: {
      label: "Ceramic",
      sublabel: "THE PRIMORDIAL MEDIUM",
      heroImg: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1600&q=80",
      origin: [
        "Clay has been shaped by human hands for over 25,000 years — making ceramic among the oldest of all art forms. The transformation of soft clay into hard, permanent ceramic through fire is one of the fundamental miracles of craft, and the range of forms, surfaces, and glazes that ceramicists have developed across cultures and centuries is essentially infinite.",
        "Every major civilisation has produced a distinctive ceramic tradition: the burnished black-figure vessels of ancient Greece, the refined white porcelain of Song Dynasty China, the tin-glazed majolica of Renaissance Italy, the salt-glazed stoneware of 17th-century Germany. Each tradition reflects the specific materials, techniques, and aesthetic values of its culture, making ceramic history a map of human civilisation itself.",
        "Contemporary ceramic sculpture has completely abandoned any distinction between craft and fine art. Artists like Ai Weiwei, Edmund de Waal, and Theaster Gates use ceramic as a vehicle for investigating history, identity, and political memory. The material's ancient associations and its capacity for both extreme fragility and great permanence give contemporary ceramic work a resonance that few other media can match.",
      ],
      pioneers: ["Lucie Rie", "Hans Coper", "Peter Voulkos", "Beatrice Wood", "Edmund de Waal", "Ai Weiwei", "Theaster Gates", "Betty Woodman"],
    },
    wood: {
      label: "Wood",
      sublabel: "THE INTIMATE MEDIUM",
      heroImg: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=1600&q=80",
      origin: [
        "Wood carries within it the memory of living things — grain patterns, growth rings, the record of seasons and weather. This organic quality gives wood sculpture a warmth and intimacy that stone and metal cannot replicate. Whether carved, assembled, burned, or left in its natural state, wood retains its essential character as a material shaped by time before the artist even touches it.",
        "The great traditions of wood carving span every continent: the Gothic limewood altarpieces of southern Germany, the lacquered wood sculpture of Tang Dynasty China, the ceremonial masks and totemic figures of West Africa and the Pacific Northwest. In medieval Europe, the craft of wood carving reached extraordinary technical heights in the elaborately carved choir stalls and religious figures that filled cathedrals across the continent.",
        "Modern and contemporary artists have approached wood with radical freedom — accumulating timber fragments into vast installations (Louise Nevelson), burning and charring surfaces to create dramatic contrasts (David Nash), or slicing trees into precise geometric forms that preserve and reveal the wood's internal structure. Wood remains one of the most direct and physically engaging of all sculptural materials.",
      ],
      pioneers: ["Tilman Riemenschneider", "Louise Nevelson", "David Nash", "Martin Puryear", "Constantin Brâncuși", "Barbara Hepworth", "Ursula von Rydingsvard"],
    },
    steel: {
      label: "Steel",
      sublabel: "THE INDUSTRIAL MEDIUM",
      heroImg: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=1600&q=80",
      origin: [
        "Steel's combination of tensile strength, reflective surface, and capacity for fabrication at architectural scale has made it the dominant material of monumental public sculpture. Its industrial associations carry meaning — connecting art to labour, manufacture, and the built environment — while its polished surfaces engage the landscape and sky, making the work part of its surroundings rather than separate from them.",
        "The history of steel sculpture begins in earnest with the constructivists of 1920s Russia, who saw industrial materials as appropriate vehicles for a revolutionary art that belonged to the working class rather than the aristocracy. David Smith brought welded steel sculpture to maturity in mid-20th-century America, creating works that fused the gestural energy of Abstract Expressionism with the formal rigour of constructed form.",
        "Richard Serra's monumental Cor-Ten steel sculptures — massive curving walls that the viewer must navigate as spatial experiences — represent perhaps the most extreme development of the medium's architectural possibilities. Anish Kapoor's Cloud Gate in Chicago, a vast polished steel bean that reflects and distorts the city skyline, has become one of the most visited public artworks in the world.",
      ],
      pioneers: ["David Smith", "Richard Serra", "Anish Kapoor", "Alexander Calder", "Anthony Caro", "John Chamberlain", "Richard Deacon", "Bernar Venet"],
    },
  },
  photography: {
    "fine-art": {
      label: "Fine Art Photography",
      sublabel: "THE AUTONOMOUS IMAGE",
      heroImg: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1600&q=80",
      origin: [
        "Fine art photography is photography conceived and executed as an autonomous aesthetic object — where the image is not a document of something else but complete in itself, existing to be contemplated rather than consumed. This distinction — between photography as record and photography as art — has been debated since the medium's invention and remains productive precisely because it is never fully resolved.",
        "Photography's claim to fine art status was long contested. Early pictorialists deliberately manipulated their prints to look like paintings — blurring focus, adding brushwork — as if apologising for the camera. It was Alfred Stieglitz who most powerfully argued that photography's mechanical nature was not a limitation but a virtue: that the straight, unmanipulated photograph could achieve an expressive truth unavailable to any other medium.",
        "Contemporary fine art photography encompasses an extraordinary range of practice: the staged cinematic tableaux of Gregory Crewdson, the conceptual self-portraits of Cindy Sherman, the vast typological series of Bernd and Hilla Becher, the sublime large-format landscapes of Edward Burtynsky. What unites them is the conviction that the photographic image can bear the weight of serious artistic intention.",
      ],
      pioneers: ["Alfred Stieglitz", "Edward Weston", "Ansel Adams", "Cindy Sherman", "Andreas Gursky", "Gregory Crewdson", "Hiroshi Sugimoto", "Wolfgang Tillmans"],
    },
    documentary: {
      label: "Documentary",
      sublabel: "PHOTOGRAPHY AS WITNESS",
      heroImg: "https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?w=1600&q=80",
      origin: [
        "Documentary photography carries a moral weight that distinguishes it from all other photographic genres. To document is to witness — to place oneself in front of reality and produce an accurate record of what was seen. The great documentary photographs are not merely images; they are evidence, testimony, and in many cases the closest thing to truth that any historical record can provide.",
        "The history of documentary photography is inseparable from the history of social reform. Jacob Riis photographed the slums of New York in the 1880s to shock a comfortable public into action. Lewis Hine's images of child labour contributed directly to changes in American law. Dorothea Lange's Migrant Mother, made for the Farm Security Administration during the Great Depression, became the defining image of an era.",
        "Henri Cartier-Bresson's concept of the decisive moment — the instant when all formal and psychological elements of a scene come into perfect alignment — gave documentary photography a theoretical framework that has shaped the practice for decades. Today, documentary photographers work across multiple platforms, from long-term book projects to social media, and continue to hold power accountable through the act of sustained looking.",
      ],
      pioneers: ["Dorothea Lange", "Henri Cartier-Bresson", "Robert Capa", "Sebastião Salgado", "James Nachtwey", "Diane Arbus", "Jacob Riis", "Lewis Hine"],
    },
    landscape: {
      label: "Landscape Photography",
      sublabel: "THE NATURAL SUBLIME",
      heroImg: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1600&q=80",
      origin: [
        "Landscape photography navigates the boundary between the natural sublime and the documentary record — between the desire to convey the overwhelming scale and beauty of the natural world and the necessity of translating that experience into a rectangle of light-sensitive material. At its best, a landscape photograph does something that no amount of description can: it returns the viewer, however briefly, to the presence of a specific place at a specific moment in time.",
        "Ansel Adams developed a systematic approach to landscape photography — the Zone System — that allowed photographers to control tonal values with unprecedented precision. His images of Yosemite, the Sierra Nevada, and the American Southwest established a visual language for wilderness photography that remains influential today. His work also contributed directly to the environmental movement, demonstrating the power of photographic beauty as a force for conservation.",
        "Contemporary landscape photography has moved far beyond Adams's romantic wilderness aesthetic. Edward Burtynsky photographs industrial landscapes — oil fields, shipbreaking yards, mining operations — with a formal beauty that implicates the viewer in the environmental destruction depicted. Nadav Kander's photographs of the Yangtze River record a civilisation in the process of transforming itself at incomprehensible speed.",
      ],
      pioneers: ["Ansel Adams", "Edward Weston", "Carleton Watkins", "Edward Burtynsky", "Nadav Kander", "Michael Kenna", "Peter Lik", "Charlie Waite"],
    },
    abstract: {
      label: "Abstract Photography",
      sublabel: "BEYOND REPRESENTATION",
      heroImg: "https://images.unsplash.com/photo-1502691876148-a84978e59af8?w=1600&q=80",
      origin: [
        "Abstract photography pushes the medium beyond its documentary function — into light, texture, shadow, and form. By isolating fragments of the visible world or manipulating the photographic process itself, abstract photographers find the painterly within the mechanical, transforming the camera from a recording device into a tool for pure visual research.",
        "The pioneers of abstract photography — Man Ray, László Moholy-Nagy, and the Hungarian constructivists — approached the camera with a radical freedom, creating photograms (cameraless images made by placing objects directly on photosensitive paper), extreme close-ups, and multiple exposures. These techniques revealed the photograph's capacity to produce images that owed nothing to conventional pictorial representation.",
        "Contemporary abstract photography benefits from digital technology's expansion of the possible — layering, colour-shifting, and resolution manipulation that would have been technically impossible in the darkroom. Yet many abstract photographers continue to work with analogue processes, drawn to the unpredictability and material richness of chemical photography. The essential question — what makes a photograph distinctly photographic when it no longer documents anything? — remains as generative as ever.",
      ],
      pioneers: ["Man Ray", "László Moholy-Nagy", "Aaron Siskind", "Minor White", "Barbara Kasten", "Wolfgang Tillmans", "Hiroshi Sugimoto", "Uta Barth"],
    },
    portrait: {
      label: "Portrait Photography",
      sublabel: "THE HUMAN FACE",
      heroImg: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1600&q=80",
      origin: [
        "The human face is photography's greatest subject — endlessly variable, endlessly revealing, and endlessly resistant to full interpretation. Portrait photography at its finest does not merely record likeness but penetrates to character, context, and the ineffable mystery of individual existence. A great portrait makes the viewer feel that they have encountered not an image but a person.",
        "The history of portrait photography begins almost with the medium itself — the daguerreotype was immediately used for likenesses that had previously required a painted portrait. Nadar, in 19th-century Paris, made portraits of writers, artists, and performers that established the genre's possibilities: natural light, close physical proximity, and a quality of concentrated attention that drew out his subjects' essential qualities.",
        "Richard Avedon and Irving Penn, working in the mid-20th century, defined the terms of modern portrait photography — the stark white background, the unflinching direct gaze, the sense of a psychological encounter conducted in public. Today's portrait photographers work across advertising, documentary, and fine art, and the question of what a portrait can reveal — and what it always conceals — remains photography's most searching inquiry.",
      ],
      pioneers: ["Nadar", "Julia Margaret Cameron", "Richard Avedon", "Irving Penn", "Diane Arbus", "Yousuf Karsh", "Annie Leibovitz", "Cindy Sherman"],
    },
  },
  digital: {
    generative: {
      label: "Generative Art",
      sublabel: "ART THROUGH ALGORITHM",
      heroImg: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1600&q=80",
      origin: [
        "Generative art is created through algorithmic processes — where code, mathematics, and controlled randomness collaborate to produce works that no human hand could draw and no human mind could fully predict. The artist defines a system of rules; the work emerges from the execution of those rules. This displacement of the artist's hand from the immediate act of mark-making raises fundamental questions about authorship, intention, and what creativity actually is.",
        "Generative art's history begins in the 1960s with mathematicians and engineers who recognised the aesthetic potential of algorithmic processes. Vera Molnár, Frieder Nake, and Georg Nees — working with early plotters and mainframe computers — produced drawings of remarkable formal sophistication from simple mathematical instructions. Their work demonstrated that beauty could emerge from systems as well as from inspiration.",
        "The development of Processing in the early 2000s democratised generative art, giving artists without engineering backgrounds the tools to write code for visual ends. The NFT explosion of 2021 brought generative art to a global audience — projects like Art Blocks demonstrated that collectors would pay substantial sums for unique outputs from shared algorithms. Today, generative art sits at the intersection of computer science, mathematics, and visual culture.",
      ],
      pioneers: ["Vera Molnár", "Frieder Nake", "Georg Nees", "Casey Reas", "Ben Fry", "Tyler Hobbs", "Dmitri Cherniak", "Refik Anadol"],
    },
    nft: {
      label: "NFT Art",
      sublabel: "THE BLOCKCHAIN CANVAS",
      heroImg: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1600&q=80",
      origin: [
        "NFT (non-fungible token) art combines the expressive freedom of digital media with a technological solution to the digital art world's oldest problem: how to create scarcity and verifiable ownership of an infinitely reproducible file. By recording provenance and ownership on a blockchain — a permanent, decentralised ledger — NFTs allow digital artworks to be bought and sold with the same clarity of ownership as a physical painting.",
        "The NFT art market crystallised with remarkable speed. In March 2021, Beeple's 'Everydays: The First 5000 Days' sold at Christie's for $69 million — instantly repositioning digital art within the mainstream art market and introducing millions of people to concepts of blockchain, wallet addresses, and digital scarcity. The cultural impact was seismic: suddenly, digital artists who had struggled to monetise their work had access to a global collector market.",
        "The NFT moment has been followed by significant market correction and considerable debate about sustainability, speculation, and artistic quality. But the underlying innovation — verifiable provenance for digital works — has permanently changed how digital art can be collected and traded. Many of the most significant digital artists of the present moment work within NFT frameworks, and institutions from MoMA to the Louvre have begun acquiring NFT works for their permanent collections.",
      ],
      pioneers: ["Beeple (Mike Winkelmann)", "Pak", "xcopy", "FEWOCiOUS", "Refik Anadol", "Tyler Hobbs", "Dmitri Cherniak", "Claire Silver"],
    },
    "ar-ready": {
      label: "AR Ready",
      sublabel: "ART IN AUGMENTED SPACE",
      heroImg: "https://images.unsplash.com/photo-1633437039415-f3d6611db4d5?w=1600&q=80",
      origin: [
        "Augmented reality art inhabits the physical world through a screen — transforming any space into a gallery, any surface into a canvas, any environment into an exhibition. AR-ready artworks are designed to exist in the overlap between the digital and physical, seen through a device but experienced as if present in the room. This collapse of boundaries between the virtual and real represents one of the most genuinely new artistic territories of the 21st century.",
        "The early history of AR art is inseparable from the history of mobile computing. As smartphones became sufficiently powerful to overlay digital images on live camera feeds in real time, artists began to explore the possibilities of site-specific works that existed only through devices. Layar, one of the first AR platforms, launched in 2009 and was immediately adopted by artists and galleries experimenting with location-aware digital exhibitions.",
        "Today, AR art ranges from intimate experiences designed for a single viewer in a domestic space to large-scale public works that transform monuments, facades, and urban environments. The medium raises fundamental questions about presence, place, and what it means to experience a work of art that exists only in a specific combination of physical location and digital overlay.",
      ],
      pioneers: ["Refik Anadol", "Keiichi Matsuda", "John Gerrard", "Cao Fei", "teamLab", "Marshmallow Laser Feast", "Olafur Eliasson"],
    },
    "ai-assisted": {
      label: "AI Assisted",
      sublabel: "THE COLLABORATIVE MACHINE",
      heroImg: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=1600&q=80",
      origin: [
        "AI-assisted art represents a new kind of collaboration — between human artist and machine intelligence trained on vast archives of human visual culture. The artist curates, directs, refines, and selects; the AI generates, interpolates, and surprises. The result is work that neither party could produce alone, raising urgent questions about authorship, originality, and the nature of creative intelligence.",
        "The history of AI art begins with Harold Cohen's AARON in the 1970s — a rule-based system that could generate original drawings in a recognisable style. The development of Generative Adversarial Networks (GANs) in the 2010s dramatically expanded AI's visual capabilities, producing images of photographic realism from nothing but learned statistical patterns. Works generated by GAN-based systems began appearing in galleries and auction houses.",
        "The emergence of diffusion models — Midjourney, Stable Diffusion, DALL-E — has made AI image generation accessible to millions of artists and non-artists simultaneously, triggering heated debates about the relationship between AI-generated images and human creativity, the use of training data, and the future of visual culture. The most compelling AI-assisted artists treat these tools not as shortcuts but as new creative territories with their own aesthetic logic.",
      ],
      pioneers: ["Harold Cohen", "Refik Anadol", "Memo Akten", "Holly Herndon", "Sofia Crespo", "Sougwen Chung", "Mario Klingemann", "Robbie Barrat"],
    },
    "3d-rendered": {
      label: "3D Rendered",
      sublabel: "SCULPTURE FOR THE DIGITAL ERA",
      heroImg: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&q=80",
      origin: [
        "3D rendered art occupies the space between sculpture and photography — computer-generated three-dimensional imagery that can achieve either extraordinary photographic realism or deliberate surrealism impossible in physical media. Working in virtual space, the 3D artist builds form, light, texture, and environment with tools borrowed from film VFX and video game development, then renders the result as a still image or animation.",
        "The history of 3D rendering in art begins with early CGI experiments in the 1970s and 1980s. Pixar's short films and the work of computer graphics pioneers like Jim Blinn and Robert Abel demonstrated that computer-generated imagery could achieve aesthetic qualities beyond the merely technical. As rendering technology advanced through the 1990s and 2000s, the gap between CGI and photography narrowed to near-invisibility.",
        "Contemporary 3D art has exploded as tools like Cinema 4D, Blender, and Octane render have become increasingly powerful and accessible. Artists like Beeple built careers producing a 3D rendered image every day for years, while others like Andrés Reisinger have created virtual furniture and spaces that exist only as rendered images yet sell for prices that challenge the physical art market.",
      ],
      pioneers: ["Beeple (Mike Winkelmann)", "Andrés Reisinger", "Quayola", "Universal Everything", "James Turrell", "teamLab", "Ryoichi Kurokawa"],
    },
  },
  drawings: {
    charcoal: {
      label: "Charcoal",
      sublabel: "THE ELEMENTAL MEDIUM",
      heroImg: "https://images.unsplash.com/photo-1520420097861-e4959843b682?w=1600&q=80",
      origin: [
        "Charcoal is the most elemental of drawing materials — a stick of burned wood pressed to a surface — yet in skilled hands it produces tonal ranges of extraordinary richness and depth. Capable of the darkest blacks and the most delicate greys, of bold gestural marks and whisper-fine lines, charcoal responds to the artist's touch with an immediacy that makes it the perfect medium for working through ideas, capturing gesture, and exploring the dramatic possibilities of light and shadow.",
        "Charcoal was the first drawing medium used by prehistoric artists — the cave paintings of Lascaux and Altamira were made in part with sticks of charred bone and wood. Renaissance artists used charcoal for preparatory studies, working on toned paper and heightening with white chalk to create tonal compositions of great sophistication. Michelangelo's surviving charcoal studies demonstrate a mastery of the medium that has rarely been equalled.",
        "The 19th century saw charcoal elevated to a medium worthy of exhibition. Odilon Redon used it to create dreamlike visions of extraordinary tonal depth. Today, artists like William Kentridge use charcoal's capacity for erasure — drawing and erasing in sequence — as a fundamental part of their conceptual practice, treating the smudged trace of the erased mark as equivalent in meaning to the mark itself.",
      ],
      pioneers: ["Michelangelo Buonarroti", "Odilon Redon", "Edgar Degas", "William Kentridge", "Käthe Kollwitz", "Rico Lebrun", "Frank Auerbach"],
    },
    graphite: {
      label: "Graphite",
      sublabel: "THE PRECISE MEDIUM",
      heroImg: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1600&q=80",
      origin: [
        "The graphite pencil is among the most technically demanding of all drawing media — capable of extraordinary precision and soft, atmospheric passages in equal measure, its marks building through layers of overlapping strokes into tonal fields of remarkable subtlety. In the hands of draughtsmen working at the highest level, graphite can produce work that rivals photography for detail and surpasses it for psychological depth.",
        "Pure graphite was first discovered in Borrowdale, England in the 16th century, and was initially mistaken for a form of lead — giving us the enduring misnomer 'pencil lead.' By the 18th century, graphite sticks were being encased in wood to produce the familiar pencil form. The great academic draughtsmen of the 19th century — Ingres above all — elevated graphite portraiture to a level of sensitivity and precision that has never been surpassed.",
        "Contemporary graphite drawing encompasses both the extreme technical ambition of hyperrealists like Diego Fazio and Paul Cadden — whose work is indistinguishable from photography until examined closely — and the gestural, expressive approaches of artists like Julie Mehretu, who use drawing as a means of thinking through complex spatial and conceptual problems at architectural scale.",
      ],
      pioneers: ["Jean-Auguste-Dominique Ingres", "Albrecht Dürer", "Leonardo da Vinci", "Diego Fazio", "Paul Cadden", "Julie Mehretu", "Vija Celmins"],
    },
    pastel: {
      label: "Pastel",
      sublabel: "BETWEEN DRAWING AND PAINTING",
      heroImg: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1600&q=80",
      origin: [
        "Pastel occupies a unique position among art media — technically a drawing material, visually a painting medium, practically a discipline that demands qualities of both. Its powdery, luminous surface is capable of both bold colour and delicate sfumato effects that seem to dissolve solid form into light. Degas made it his primary medium late in his career, using it to capture the movement of dancers and bathers with a directness and physicality that oil painting could not match.",
        "Pastel was developed in the 16th century and achieved its first great flowering in the 18th, when portraitists such as Maurice-Quentin de La Tour and Jean-Baptiste Perronneau used it to capture the powdered-wig elegance of French aristocracy with extraordinary freshness and immediacy. The medium's great weakness — its fragility, the ease with which the unfixed pigment can smear — also contributes to its peculiar luminosity, since the pigment particles scatter light differently from those bound in oil or gum.",
        "The Impressionists rediscovered pastel as a medium for capturing fleeting atmospheric effects that the slower-drying oil medium could not preserve. Mary Cassatt used pastel for her intimate domestic scenes with a warmth and directness that perfectly suited her subjects. Contemporary pastel artists work at both large and intimate scales, exploring the medium's capacity for rich, saturated colour and for the softest possible transitions between tones.",
      ],
      pioneers: ["Edgar Degas", "Mary Cassatt", "Maurice-Quentin de La Tour", "Odilon Redon", "Eugène Delacroix", "Rosalba Carriera", "Gustav Klimt"],
    },
    ink: {
      label: "Ink",
      sublabel: "THE MEDIUM OF COMMITMENT",
      heroImg: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=80",
      origin: [
        "Ink is the medium of absolute commitment — permanent, unforgiving, and capable of breathtaking spontaneity. From the brushed calligraphy of East Asian masters to the engraved lines of Rembrandt's etchings, ink has been the preferred medium for capturing immediate observations and for works of the most painstaking technical control. Its permanent nature means every mark must be made with intention.",
        "The history of ink drawing spans virtually every major artistic tradition in the world. Chinese and Japanese ink painting — sumi-e — is perhaps the most refined of all ink traditions, where centuries of practice have developed techniques for achieving the maximum expressiveness from the fewest possible marks. In the West, pen-and-ink illustration developed in parallel with printmaking, sharing techniques and practitioners from the Renaissance forward.",
        "Contemporary ink artists work in traditions as diverse as Japanese brush painting, Western illustration, comic art, and abstract mark-making. The medium's association with directness, decision, and irreversibility gives ink work a quality of authentic gesture that digital media is still working to match. Many contemporary artists choose ink precisely for its resistance — as a discipline that cannot be undone.",
      ],
      pioneers: ["Rembrandt van Rijn", "Hokusai", "Hiroshige", "Egon Schiele", "Georges Rouault", "Cy Twombly", "Raymond Pettibon", "Julie Mehretu"],
    },
    "colored-pencil": {
      label: "Colored Pencil",
      sublabel: "THE RECLAIMED MEDIUM",
      heroImg: "https://images.unsplash.com/photo-1548438294-1ad5d5f4f063?w=1600&q=80",
      origin: [
        "Colored pencil has been systematically underestimated throughout its history — dismissed as a children's medium, a hobbyist's tool, or a lesser cousin of more prestigious graphic media. Contemporary artists have definitively reclaimed it, demonstrating through works of astonishing technical mastery that colored pencil is capable of layered colour intensity, tonal depth, and surface richness that rivals any other drawing medium.",
        "The development of modern colored pencils began in the early 20th century, when manufacturers developed wax-based pigment formulas that could be layered to build up rich, saturated colour. The medium found early champions among graphic designers and illustrators, for whom its precision and control were practical virtues. Fine artists working in colored pencil tended to work in isolation, without the critical infrastructure that supported other media.",
        "The colored pencil renaissance of recent decades has been driven by artists who treat the medium's limitations — its inability to be erased or blended like paint, its requirement for extensive layering — as creative opportunities. Works by artists like Paul Cadden and Cynthia Viteri demonstrate that colored pencil can achieve photographic realism while also producing surfaces of distinctive tactile beauty that photography cannot replicate.",
      ],
      pioneers: ["Juan Dorado", "Paul Cadden", "Cynthia Viteri", "Marco Mazzoni", "Ester Roi", "Ann Kullberg", "Vera Cvetkov"],
    },
  },
  prints: {
    giclee: {
      label: "Giclée",
      sublabel: "ARCHIVAL PRECISION",
      heroImg: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1600&q=80",
      origin: [
        "Giclée — from the French verb 'to spray' — refers to museum-quality archival inkjet prints produced on fine art paper or canvas using professional-grade pigment inks. Unlike commercial printing, which uses four basic inks, giclée printing uses eight to twelve pigment inks to achieve a gamut of colour that can reproduce the subtlest tonal gradations of original works with extraordinary fidelity. When printed on acid-free paper with archival inks, giclées can maintain their quality for over 200 years.",
        "The development of giclée printing in the late 1980s and early 1990s was driven by printmaking pioneer Jack Duganne, who coined the term to describe high-quality digital prints being produced on the IRIS inkjet printer. The technology allowed artists and photographers to produce limited-edition prints of their work with a quality that had previously required specialist printing firms and significant capital investment.",
        "Today, giclée is the dominant technique for producing fine art prints from digital files, whether those files represent digitised paintings, photographs, or works created entirely in digital media. The ability to produce prints on demand, in any edition size, and on a wide range of surfaces has fundamentally changed how artists distribute and sell their work, making original art accessible to collectors at a range of price points.",
      ],
      pioneers: ["Jack Duganne", "Graham Nash", "Charles Csuri", "Iris printing traditions"],
    },
    lithograph: {
      label: "Lithograph",
      sublabel: "THE PAINTERLY PRINT",
      heroImg: "https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=1600&q=80",
      origin: [
        "Lithography — invented by Alois Senefelder in Munich in 1796 — is based on the simple chemical principle that oil and water repel each other. The artist draws on a flat limestone block or metal plate with a greasy medium; the surface is then dampened with water, and oil-based ink applied. The ink adheres only to the drawn marks, and the image can be printed in large editions. The result is a uniquely painterly print quality unmatched by intaglio or relief techniques.",
        "Lithography was immediately embraced by artists who recognised its capacity to reproduce the gestural quality of drawing and painting more faithfully than any existing printmaking technique. Théodore Géricault and Eugène Delacroix used it for dramatic narrative prints. Francisco Goya created some of his last and most powerful works as lithographs. But it was the poster artists of the 1890s — Toulouse-Lautrec above all — who demonstrated lithography's capacity for bold, flat colour and graphic immediacy.",
        "The 20th century brought lithography into the centre of fine art practice. Print workshops like Tamarind in Los Angeles and Gemini G.E.L. collaborated with leading artists — Jasper Johns, David Hockney, Robert Rauschenberg — to produce prints that were genuine extensions of their studio practice rather than mere reproductions. Stone lithography remains one of the most demanding and rewarding of all printmaking disciplines.",
      ],
      pioneers: ["Toulouse-Lautrec", "Édouard Manet", "Francisco Goya", "Jasper Johns", "David Hockney", "Robert Rauschenberg", "Joan Miró", "Marc Chagall"],
    },
    etching: {
      label: "Etching",
      sublabel: "THE EXPRESSIVE BITE",
      heroImg: "https://images.unsplash.com/photo-1586941962765-d3896cc85ac6?w=1600&q=80",
      origin: [
        "Etching — in which acid bites lines into a metal plate that has been covered in a protective ground — allows for a quality of mark unique in all printmaking: a line that has been eaten by chemistry into metal, with a crispness and variation of depth that cannot be achieved by direct engraving. The technique gives the etching needle great freedom, allowing the artist to draw on the plate with a spontaneity closer to pen-on-paper than any other intaglio process.",
        "Rembrandt van Rijn is the undisputed master of etching — a practitioner who explored every technical possibility of the medium with a thoroughness and expressive range that has never been equalled. His etchings of Amsterdam, of biblical subjects, and of himself span the full range of the medium from fine, delicate lines to rich, velvety aquatint passages. Francisco Goya's Los Caprichos, published in 1799, used etching as a vehicle for devastating social and political satire.",
        "The 19th century saw etching experience a major revival as a fine art medium. James McNeill Whistler and his followers elevated the etched line to the status of pure aesthetic object — the print as poem. Contemporary etchers continue to develop the medium's possibilities, combining traditional acid-bite techniques with photographic processes, digital elements, and innovative inking and printing approaches.",
      ],
      pioneers: ["Rembrandt van Rijn", "Francisco Goya", "James McNeill Whistler", "Käthe Kollwitz", "Edgar Degas", "Charles Meryon", "Paula Rego"],
    },
    screen: {
      label: "Screen Print",
      sublabel: "THE GRAPHIC MEDIUM",
      heroImg: "https://images.unsplash.com/photo-1486162928267-e6274cb3106f?w=1600&q=80",
      origin: [
        "Screen printing — forcing ink through a fine mesh screen using a squeegee, with non-printing areas blocked by stencil — produces the bold, flat colour and graphic precision that define the visual language of the 20th century. From Warhol's Factory to street art studios, screen printing has been the dominant technique of limited-edition art publishing and the medium that most completely embodies the intersection of art and mass culture.",
        "Screen printing has roots in Asian stencil printing traditions dating back centuries, but its development as an industrial and fine art medium belongs to the 20th century. Commercial screen printing established itself in the 1910s and 1920s; fine art application followed in the 1930s and 1940s, when artists working for the Works Progress Administration in America used the technique — then called serigraphy — for poster and print production.",
        "Andy Warhol's silkscreen portraits of Marilyn Monroe, Mao Zedong, and Campbell's Soup cans used the technique's inherent repetition and mechanical flatness as artistic statements about consumer culture, celebrity, and the conditions of mass production. This conceptual identification of the medium with its content — the method as message — gave screen printing a cultural meaning that continues to resonate in contemporary practice.",
      ],
      pioneers: ["Andy Warhol", "Roy Lichtenstein", "Eduardo Paolozzi", "Corita Kent", "Shepard Fairey", "Barbara Kruger", "Jasper Johns"],
    },
    woodblock: {
      label: "Woodblock",
      sublabel: "THE OLDEST PRINT",
      heroImg: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=1600&q=80",
      origin: [
        "Woodblock printing is the oldest of all printmaking techniques — a method of cutting a design in relief into a wooden block, inking the surface, and pressing it to paper or fabric that has been in use for over 2,000 years. In Japan, the tradition of ukiyo-e woodblock printing produced some of the most formally beautiful and technically accomplished images in the history of any art form — works whose influence on Western art, when they were first encountered in the 19th century, was nothing less than transformative.",
        "The Japanese ukiyo-e tradition reached its peak in the late 18th and early 19th centuries with masters like Hokusai and Hiroshige, whose prints of Mount Fuji, the Tōkaidō highway, and the Edo pleasure quarters combined superb draughtsmanship with printing of extraordinary technical sophistication — dozens of blocks for a single image, each registering perfectly, producing colour harmonies of a refinement never achieved in the Western print tradition.",
        "The encounter with Japanese prints electrified a generation of Western artists — Van Gogh copied Hiroshige, Monet collected ukiyo-e, Toulouse-Lautrec adopted their bold compositional strategies and flat colour fields. Contemporary woodblock artists work both within the Japanese tradition and in dialogue with Western art history, and the medium's characteristic qualities — the grain of the wood, the pressure variation of the print — remain as compelling as ever.",
      ],
      pioneers: ["Katsushika Hokusai", "Hiroshige", "Utamaro", "Albrecht Dürer", "Ernst Ludwig Kirchner", "Edvard Munch", "Munakata Shiko"],
    },
  },
};

const SUBTYPE_GALLERY = {
  paintings: {
    oil: [
      { id: "o1", title: "The Golden Meadow", medium: "Oil on Canvas", artist: "CLAIRE BOUCHARD", year: "2024", img: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80", dimensions: "120 × 90 cm", description: "A luminous pastoral landscape rendered in layered glazes of cadmium yellow and viridian, evoking the golden light of late afternoon." },
      { id: "o2", title: "Storm Over the Valley", medium: "Oil on Linen", artist: "HENRY ASHFORD", year: "2023", img: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&q=80", dimensions: "150 × 100 cm", description: "Churning cloud formations rendered in thick impasto, the canvas surface alive with the physical urgency of the mark." },
      { id: "o3", title: "Interior with Red", medium: "Oil on Canvas", artist: "MARTA VOSS", year: "2025", img: "https://images.unsplash.com/photo-1541680670548-88e8cd23c0f4?w=800&q=80", dimensions: "80 × 80 cm", description: "A meditation on domestic space — the room as psychological interior, the red as both colour and feeling." },
      { id: "o4", title: "Portrait of the Afternoon", medium: "Oil on Board", artist: "ELENA ROSSI", year: "2024", img: "https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=800&q=80", dimensions: "60 × 50 cm", description: "Loosely painted figures dissolve into the warm light of a summer afternoon, form surrendering to atmosphere." },
      { id: "o5", title: "The Old Harbour", medium: "Oil on Canvas", artist: "JAMES CALLOWAY", year: "2023", img: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80", dimensions: "100 × 70 cm", description: "Working boats at rest in the harbour, the still water a mirror of masts and sky — a study in horizontal calm." },
      { id: "o6", title: "Nocturne in Blue", medium: "Oil on Canvas", artist: "LENA BACH", year: "2024", img: "https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=800&q=80", dimensions: "90 × 90 cm", description: "A nocturnal composition of deep Prussian blue and silver, the night reduced to its most essential tonal architecture." },
      { id: "o7", title: "The Ancient Tree", medium: "Oil on Linen", artist: "CHEN WEI", year: "2025", img: "https://images.unsplash.com/photo-1567359781514-3b964e2b04d6?w=800&q=80", dimensions: "140 × 100 cm", description: "A solitary oak recorded with the patient attention of the naturalist and the emotional depth of the romantic." },
      { id: "o8", title: "Figure Study No. 7", medium: "Oil on Canvas", artist: "MARCUS THOMAS", year: "2024", img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80", dimensions: "70 × 50 cm", description: "The human form in repose — painted with the directness of Freud and the tonal sensitivity of Rembrandt." },
      { id: "o9", title: "Seascape at Dusk", medium: "Oil on Canvas", artist: "INGRID HALVOR", year: "2023", img: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&q=80", dimensions: "110 × 80 cm", description: "The horizon line as the painting's true subject — a thin band of gold between the weight of sea and sky." },
    ],
  },
};

const DEFAULT_GALLERY = [
  { id: "d1", title: "Ethereal Horizon", medium: "Mixed Media", artist: "MARCUS THOMAS", year: "2024", img: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80", dimensions: "120 × 90 cm", description: "A sweeping composition that dissolves the boundary between sky and sea." },
  { id: "d2", title: "Fractured Silence", medium: "Mixed Media", artist: "ELENA VANCE", year: "2023", img: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&q=80", dimensions: "100 × 80 cm", description: "Layered textures coalesce into a meditation on memory and the spaces between sound." },
  { id: "d3", title: "Obsidian Flow", medium: "Mixed Media", artist: "JULIAN ARIS", year: "2024", img: "https://images.unsplash.com/photo-1541680670548-88e8cd23c0f4?w=800&q=80", dimensions: "150 × 100 cm", description: "Dark pigments pour and solidify across the canvas, channelling the raw energy of volcanic geology." },
  { id: "d4", title: "The Golden Tree", medium: "Mixed Media", artist: "CHEN WEI", year: "2024", img: "https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=800&q=80", dimensions: "90 × 70 cm", description: "An ancient form rendered in luminous gold and amber, standing as a symbol of endurance." },
  { id: "d5", title: "Whispers of Silence", medium: "Mixed Media", artist: "LENA BACH", year: "2025", img: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&q=80", dimensions: "50 × 50 cm", description: "A near-monochromatic study where barely perceptible marks create an atmosphere of profound stillness." },
  { id: "d6", title: "Renaissance Study", medium: "Mixed Media", artist: "ELENA ROSSI", year: "2023", img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80", dimensions: "80 × 60 cm", description: "Old-master technique meets contemporary subject matter." },
];

const TAB_ICONS = ["✦", "◆", "✳", "◈"];

const PREDEFINED_SIZES = [
  { label: "Small", dims: "30 × 25 cm", desc: "Perfect for intimate spaces", multiplier: 0.65 },
  { label: "Standard", dims: "60 × 50 cm", desc: "The most versatile format", multiplier: 1.0 },
  { label: "Large", dims: "90 × 70 cm", desc: "Statement wall presence", multiplier: 1.45 },
  { label: "Monumental", dims: "120 × 90 cm", desc: "Gallery-grade installation", multiplier: 2.1 },
];

function ArtworkTags({ item }) {
  const tags = [
    `#${item.medium?.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "") || "Art"}`,
    `#${item.artist?.split(" ").pop() || "Artist"}`,
    `#${item.year || "2024"}`,
    `#ArtColiseum`,
    `#${item.dimensions?.includes("×") ? item.dimensions.split("×")[0].trim().replace(" ", "") + "cm" : "Original"}`,
    `#FinArt`,
  ];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
      {tags.map((tag, i) => (
        <span key={i} style={{
          fontFamily: "'Raleway',sans-serif", fontSize: 10,
          color: i === 3 ? "#D4AF37" : "rgba(200,191,160,0.55)",
          letterSpacing: "0.02em", cursor: "pointer",
        }}
          onMouseEnter={e => (e.currentTarget.style.color = "#D4AF37")}
          onMouseLeave={e => (e.currentTarget.style.color = i === 3 ? "#D4AF37" : "rgba(200,191,160,0.55)")}>
          {tag}
        </span>
      ))}
    </div>
  );
}

function MentionBubble({ item }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: 6 }}
      transition={{ duration: 0.18 }}
      style={{
        position: "absolute", bottom: 14, left: 14, zIndex: 10,
        background: "rgba(8,8,8,0.88)", backdropFilter: "blur(12px)",
        border: "1px solid rgba(212,175,55,0.35)", borderRadius: 12,
        padding: "10px 14px", pointerEvents: "none",
        boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
        minWidth: 160,
      }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.14em", color: "#D4AF37", marginBottom: 4 }}>
        @{item.artist?.toLowerCase().replace(/\s+/g, "_")}
      </div>
      <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.8)", marginBottom: 2 }}>{item.medium}</div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
        <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.12em", color: "rgba(200,191,160,0.45)" }}>{item.year}</span>
        <span style={{ width: 2, height: 2, borderRadius: "50%", background: "rgba(212,175,55,0.4)", display: "inline-block" }} />
        <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.1em", color: "rgba(200,191,160,0.45)" }}>{item.dimensions}</span>
      </div>
    </motion.div>
  );
}

export default function SubTypeDetail() {
  const { medium, sub } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [collectionTab, setCollectionTab] = useState("predefined");
  const [mention, setMention] = useState(null);

  const data = SUBTYPE_DATA[medium]?.[sub];
  const galleryItems = SUBTYPE_GALLERY[medium]?.[sub] ?? DEFAULT_GALLERY;

  useEffect(() => { window.scrollTo(0, 0); }, [medium, sub]);

  if (!data) {
    return (
      <div style={{ background: "#080808", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(200,191,160,0.5)", fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: "0.2em" }}>COLLECTION NOT FOUND</p>
      </div>
    );
  }

  const tabs = [
    { label: "About the Art",     heading: data.label,              body: data.origin[0] },
    { label: "History & Origins", heading: "Ancient Beginnings",    body: data.origin[1] },
    { label: "Modern Era",        heading: "Into the Modern Era",   body: data.origin[2] },
    { label: "Pioneers & Masters",heading: "The Great Masters",     isPioneers: true },
  ];

  const current = tabs[activeTab];
  const go = (dir) => setActiveTab(i => Math.max(0, Math.min(tabs.length - 1, i + dir)));

  return (
    <div style={{ background: "#080808", minHeight: "100vh" }}>

      {/* HERO */}
      <div className="art-hero" style={{ position: "relative", height: 440, overflow: "hidden" }}>
        <img src={data.heroImg} alt={data.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(8,8,8,0.25) 0%, rgba(8,8,8,0.55) 50%, rgba(8,8,8,1) 100%)" }} />
        <div className="art-hero-padding" style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 56px 48px", maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.5)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <Link to="/categories" style={{ color: "rgba(200,191,160,0.5)", textDecoration: "none" }}>Collections</Link>
            <span style={{ color: "rgba(212,175,55,0.4)" }}>›</span>
            <Link to={`/categories/${medium}`} style={{ color: "rgba(200,191,160,0.5)", textDecoration: "none", textTransform: "capitalize" }}>{medium}</Link>
            <span style={{ color: "rgba(212,175,55,0.4)" }}>›</span>
            <span style={{ color: "#D4AF37" }}>{data.label}</span>
          </div>
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.24em", color: "#D4AF37", marginBottom: 12 }}>{data.sublabel}</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(52px,6vw,84px)", fontWeight: 700, color: "#fff", lineHeight: 0.95, letterSpacing: "-0.01em", margin: 0 }}>
              {data.label}
            </h1>
          </motion.div>
        </div>
      </div>

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

            {/* Left: Image */}
            <div className="art-slide-img" style={{ position: "relative", overflow: "hidden", background: "#0d0b08", display: "flex", alignItems: "center", justifyContent: "center", padding: 36 }}>
              <div style={{ width: "100%", height: "100%", position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(212,175,55,0.06) 0%, transparent 70%)" }} />
              <motion.img
                key={data.heroImg}
                initial={{ scale: 1.06, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                src={data.heroImg}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12, display: "block", position: "relative", zIndex: 1, boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}
              />
              <div style={{ position: "absolute", bottom: 28, left: 28, zIndex: 2, display: "flex", alignItems: "center", gap: 8, background: "rgba(8,8,8,0.75)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 999, padding: "7px 16px" }}>
                <span style={{ color: "#D4AF37", fontSize: 9 }}>◆</span>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: "#D4AF37" }}>{current.label.toUpperCase()}</span>
              </div>
            </div>

            {/* Right: Content */}
            <div className="art-slide-content" style={{ padding: "40px 52px", display: "flex", flexDirection: "column", justifyContent: "space-between", borderLeft: "1px solid rgba(212,175,55,0.1)", height: "100%", boxSizing: "border-box" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: "rgba(212,175,55,0.5)", fontStyle: "italic" }}>{String(activeTab + 1).padStart(2, "0")}</span>
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.22em", color: "#D4AF37" }}>{current.label.toUpperCase()}</span>
                </div>
                <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(32px,3vw,46px)", fontWeight: 700, color: "#fff", lineHeight: 1.05, margin: "0 0 20px", letterSpacing: "-0.01em" }}>
                  {current.heading}
                </h2>
                {current.isPioneers ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                    {data.pioneers.map(name => (
                      <span key={name} style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, fontStyle: "italic", color: "rgba(200,191,160,0.75)", background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 999, padding: "5px 14px" }}>{name}</span>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontStyle: "italic", color: "rgba(200,191,160,0.78)", lineHeight: 1.8, margin: "0 0 24px" }}>
                    {current.body}
                  </p>
                )}
                <div style={{ width: 64, height: 2, background: "linear-gradient(90deg,#D4AF37,transparent)" }} />
              </div>

              {/* Navigation */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 24 }}>
                <motion.button onClick={() => go(-1)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} disabled={activeTab === 0}
                  style={{ width: 44, height: 44, borderRadius: "50%", background: activeTab === 0 ? "rgba(255,255,255,0.03)" : "rgba(212,175,55,0.08)", border: `1px solid ${activeTab === 0 ? "rgba(212,175,55,0.1)" : "rgba(212,175,55,0.35)"}`, color: activeTab === 0 ? "rgba(200,191,160,0.2)" : "#D4AF37", cursor: activeTab === 0 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "serif", fontSize: 18, transition: "all 0.2s" }}>←</motion.button>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", color: "rgba(200,191,160,0.4)" }}>
                  {String(activeTab + 1).padStart(2, "0")} / {String(tabs.length).padStart(2, "0")}
                </span>
                <motion.button onClick={() => go(1)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} disabled={activeTab === tabs.length - 1}
                  style={{ width: 44, height: 44, borderRadius: "50%", background: activeTab === tabs.length - 1 ? "rgba(255,255,255,0.03)" : "rgba(212,175,55,0.08)", border: `1px solid ${activeTab === tabs.length - 1 ? "rgba(212,175,55,0.1)" : "rgba(212,175,55,0.35)"}`, color: activeTab === tabs.length - 1 ? "rgba(200,191,160,0.2)" : "#D4AF37", cursor: activeTab === tabs.length - 1 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "serif", fontSize: 18, transition: "all 0.2s" }}>→</motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* GALLERY */}
        <div style={{ marginTop: 72 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
            <div style={{ width: 32, height: 1, background: "rgba(212,175,55,0.4)" }} />
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.24em", color: "#D4AF37" }}>THE COLLECTION</span>
            <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.15)" }} />
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, fontStyle: "italic", color: "rgba(200,191,160,0.4)" }}>
              {galleryItems.length} works
            </span>
          </div>

          {/* Collection Tabs */}
          <div style={{ display: "flex", gap: 0, marginBottom: 36, borderRadius: 999, overflow: "hidden", border: "1px solid rgba(212,175,55,0.2)", width: "fit-content" }}>
            {[
              { key: "predefined", label: "Predefined Sizes" },
              { key: "customization", label: "Customization" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setCollectionTab(key)}
                style={{
                  padding: "10px 24px",
                  background: collectionTab === key ? "linear-gradient(135deg,#D4AF37,#e8c53a)" : "transparent",
                  border: "none", cursor: "pointer",
                  fontFamily: "'Cinzel',serif", fontSize: 10,
                  letterSpacing: "0.14em",
                  color: collectionTab === key ? "#111" : "rgba(200,191,160,0.55)",
                  fontWeight: collectionTab === key ? 700 : 400,
                  transition: "all 0.2s",
                }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 22 }}>
            {galleryItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.07 }}
                style={{ cursor: "pointer" }}>
                <ArtworkHoverCard artwork={item}>
                  <div
                    style={{ width: "100%", aspectRatio: "1/1", borderRadius: 6, overflow: "hidden", background: "rgba(255,255,255,0.03)", position: "relative" }}
                    onClick={(e) => { e.stopPropagation(); setMention(mention === item.id ? null : item.id); }}>
                    <SafeImage
                      src={item.img}
                      alt={item.title}
                      fallbackIndex={i}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1)" }}
                      onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                      onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                    />
                    <AnimatePresence>
                      {mention === item.id && <MentionBubble item={item} />}
                    </AnimatePresence>
                    <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(8,8,8,0.6)", borderRadius: 6, padding: "4px 8px", pointerEvents: "none" }}>
                      <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.1em", color: "rgba(212,175,55,0.7)" }}>@ TAP</span>
                    </div>
                  </div>
                </ArtworkHoverCard>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 19, fontWeight: 600, color: "#f0e8d8" }}>{item.title}</div>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: "rgba(200,191,160,0.55)", marginTop: 4 }}>{item.artist}</div>
                  </div>
                  <button
                    onClick={() => navigate(`/product/${item.id}${collectionTab === "predefined" ? "?mode=predefined" : ""}`)}
                    style={{ background: "transparent", border: "none", fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", fontWeight: 600, color: "#D4AF37", whiteSpace: "nowrap", alignSelf: "flex-start", cursor: "pointer", padding: 0, paddingTop: 4 }}>
                    ENQUIRE →
                  </button>
                </div>
                <ArtworkTags item={item} />
              </motion.div>
            ))}
          </div>

          <div style={{ margin: "60px auto 0", maxWidth: 360, textAlign: "center", paddingTop: 30, borderTop: "1px solid rgba(212,175,55,0.18)" }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.18em", color: "rgba(200,191,160,0.55)", marginBottom: 14 }}>SHOWING {galleryItems.length} OF 152 MASTERPIECES</div>
            <button style={{ padding: "12px 26px", background: "transparent", border: "1px solid rgba(212,175,55,0.3)", color: "#D4AF37", fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", borderRadius: 999, cursor: "pointer" }}>LOAD MORE ARTWORKS ⌄</button>
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexWrap: "wrap", paddingTop: 48, borderTop: "1px solid rgba(212,175,55,0.1)", marginTop: 48 }}>
          <Link to={`/categories/${medium}`} style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.18em", color: "rgba(200,191,160,0.4)", textDecoration: "none" }}>
            ← BACK TO {medium?.toUpperCase()}
          </Link>
        </div>
      </div>
    </div>
  );
}
