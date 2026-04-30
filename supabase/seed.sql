-- =========================================================
-- Seed data — matches the current hardcoded frontend content
-- Run AFTER schema.sql
-- Note: image_url values reference local /src/assets paths.
-- For production, upload to Supabase Storage and replace URLs.
-- =========================================================

-- Categories
insert into public.categories (id, label) values
  ('oil',       'Oil'),
  ('digital',   'Digital'),
  ('sculpture', 'Sculpture'),
  ('mixed',     'Mixed Media')
on conflict (id) do nothing;

-- Artists
insert into public.artists (id, name, role, bio, image_url, works_count) values
  ('elena-vance',  'Elena Vance',  'DIGITAL NEO-CLASSICAL', 'Florence-based painter exploring the intersection of digital abstraction and classical renaissance techniques.', 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&q=80', 142),
  ('elena-rossi',  'Elena Rossi',  'DIGITAL SURREALISM',    'Blends classical techniques with digital innovation to create dreamscapes.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80', 98),
  ('hideo-tanaka', 'Hideo Tanaka', 'KINETIC SCULPTURE',     'Creates movement and light using metal, glass, and magnetic forces.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', 67),
  ('aria-voss',    'Aria Voss',    'DIGITAL SURREALISM',    'Dreamlike compositions exploring the subconscious and human consciousness.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80', 55),
  ('chen-wei',     'Chen Wei',     'FOREST ETHEREAL',       'Captures the spiritual essence of nature in expansive oil and ink works.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80', 89),
  ('lena-bach',    'Lena Bach',    'GOLD ABSTRACTIONS',     'Contemporary minimalism fused with metallic textures and geometric form.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80', 73)
on conflict (id) do nothing;

-- Artworks (image_url uses /src/assets paths — TEMP. Replace with Storage URLs.)
insert into public.artworks (id, title, medium, artist_name, year, price, size, style, category_id, image_url) values
  ('p1', 'Ethereal Horizon',    'Acrylic on Canvas', 'MARCUS THOMAS', '2024', 12400, 'medium', 'Abstract',       'oil',       '/src/assets/i1.png'),
  ('p2', 'Fractured Silence',   'Mixed Media',       'ELENA VANCE',   '2023', 8900,  'medium', 'Abstract',       'mixed',     '/src/assets/i7.png'),
  ('p3', 'Obsidian Flow',       'Acrylic & Oil',     'JULIAN ARIS',   '2024', 15500, 'medium', 'Abstract',       'oil',       '/src/assets/i6.png'),
  ('p4', 'The Infinite Stair',  'Sculpture',         'SOREN KLEIN',   '2024', 4200,  'small',  'Minimalism',     'sculpture', '/src/assets/i3.png'),
  ('p5', 'Cosmic Flow',         'Mixed Media',       'HIDEO TANAKA',  '2024', 1950,  'small',  'Impressionist',  'mixed',     '/src/assets/i6.png'),
  ('p6', 'The Golden Tree',     'Oil on Canvas',     'CHEN WEI',      '2024', 2100,  'medium', 'Impressionist',  'oil',       '/src/assets/i4.png'),
  ('p7', 'Whispers of Silence', 'Oil on Canvas',     'LENA BACH',     '2025', 1700,  'small',  'Minimalism',     'oil',       '/src/assets/i5.png'),
  ('p8', 'Renaissance Study',   'Oil on Panel',      'ELENA ROSSI',   '2023', 5800,  'medium', 'Digital Fusion', 'oil',       '/src/assets/i8.png'),
  ('p9', 'Ocean Depths',        'Digital Print',     'HIDEO TANAKA',  '2024', 1200,  'small',  'Digital Fusion', 'digital',   '/src/assets/i7.png')
on conflict (id) do nothing;

-- Events
insert into public.events (title, status, starts_at, ends_at, location, description, image_url) values
  ('The Golden Age Exhibition', 'ongoing', '2025-05-15', '2025-06-30', 'Mumbai, India',     'A curated journey through contemporary Indian masters exploring gold as medium, metaphor, and memory.', '/src/assets/events/e4.png'),
  ('Silence in Motion',         'ongoing', '2025-06-05', '2025-07-20', 'Florence, Italy',   'Dynamic sculptures and kinetic installations that blur the boundary between stillness and movement.',   '/src/assets/events/e5.png'),
  ('Chromatic Resonance',       'ongoing', '2026-04-01', '2026-05-18', 'Paris, France',     'A symphony of colour — how pigment, light, and surface unite to create experiences that transcend the visual.', '/src/assets/events/e6.png'),
  ('Digital Frontiers',         'upcoming','2026-07-01', '2026-08-15', 'Berlin, Germany',   'Generative art and digital works redefining what it means to own and experience art in the modern era.',  '/src/assets/events/e7.png'),
  ('Monochrome Dialogues',      'upcoming','2026-09-01', '2026-10-15', 'London, UK',        'Exploring the infinite range of black, white, and shadow through photography, etching, and charcoal.',   '/src/assets/events/e8.png'),
  ('Ocean Meditations',         'upcoming','2026-10-05', '2026-11-30', 'Sydney, Australia', 'Works inspired by the sea — its depth, its fury, its silence.', '/src/assets/events/e9.png');
