-- =========================================================
-- ART COLISEUM - PRODUCTION UPGRADE SQL
-- Run this in Supabase SQL Editor after schema.sql
-- =========================================================

-- ---------- Add role to profiles ----------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Update existing profiles to user role
UPDATE public.profiles SET role = 'user' WHERE role IS NULL;

-- ---------- Chat reads for notifications ----------
CREATE TABLE IF NOT EXISTS public.chat_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_key text NOT NULL,
  last_read_at timestamptz DEFAULT now(),
  UNIQUE(user_id, conversation_key)
);

-- ---------- Add user_id to artists table ----------
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- ---------- Add artwork images table for multiple images ----------
CREATE TABLE IF NOT EXISTS public.artwork_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id text REFERENCES public.artworks(id) ON DELETE CASCADE,
  url text NOT NULL,
  is_primary boolean DEFAULT false,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ---------- Add artist artworks view ----------
CREATE OR REPLACE VIEW public.artist_artworks AS
SELECT 
  a.*,
  ar.name as artist_name,
  ar.image_url as artist_image
FROM public.artworks a
LEFT JOIN public.artists ar ON a.artist_id = ar.id;

-- ---------- RLS for chat_reads ----------
ALTER TABLE public.chat_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_reads own" ON public.chat_reads FOR ALL 
USING (auth.uid() = user_id);

-- ---------- RLS for artwork_images ----------
ALTER TABLE public.artwork_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read artwork_images" ON public.artwork_images FOR SELECT USING (true);
CREATE POLICY "insert artwork_images" ON public.artwork_images FOR INSERT WITH CHECK (true);
CREATE POLICY "update artwork_images" ON public.artwork_images FOR UPDATE USING (true);
CREATE POLICY "delete artwork_images" ON public.artwork_images FOR DELETE USING (true);

-- ---------- Update artists table RLS ----------
DROP POLICY IF EXISTS "artists update own" ON public.artists;
CREATE POLICY "artists update own" ON public.artists FOR UPDATE USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
);

-- ---------- Function to get unread message count ----------
CREATE OR REPLACE FUNCTION public.get_unread_count(p_user_id uuid)
RETURNS int AS $$
DECLARE
  v_count int;
BEGIN
  SELECT COUNT(DISTINCT conversation_key)
  INTO v_count
  FROM public.chat_messages m
  LEFT JOIN public.chat_reads r 
    ON r.user_id = p_user_id AND r.conversation_key = m.conversation_key
  WHERE m.user_id = p_user_id
    AND (r.last_read_at IS NULL OR m.created_at > r.last_read_at)
    AND m.sender != 'me';
  
  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------- Function to mark conversation as read ----------
CREATE OR REPLACE FUNCTION public.mark_conversation_read(p_user_id uuid, p_conversation_key text)
RETURNS void AS $$
BEGIN
  INSERT INTO public.chat_reads (user_id, conversation_key, last_read_at)
  VALUES (p_user_id, p_conversation_key, now())
  ON CONFLICT (user_id, conversation_key) 
  DO UPDATE SET last_read_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------- Seed some sample data ----------
-- Insert sample categories if not exist
INSERT INTO public.categories (id, label) VALUES 
  ('paintings', 'Paintings'),
  ('sculptures', 'Sculptures'),
  ('photography', 'Photography'),
  ('digital', 'Digital Art'),
  ('mixed-media', 'Mixed Media')
ON CONFLICT (id) DO NOTHING;

-- Insert sample artists if not exist  
INSERT INTO public.artists (id, name, role, bio, image_url) VALUES 
  ('elena-vance', 'Elena Vance', 'artist', 'Contemporary artist based in Florence, Italy', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80'),
  ('hideo-tanaka', 'Hideo Tanaka', 'artist', 'Digital artist from Kyoto, Japan', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'),
  ('chen-wei', 'Chen Wei', 'artist', 'Sculptor from Shanghai, China', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80')
ON CONFLICT (id) DO NOTHING;

-- Insert sample artworks if not exist
INSERT INTO public.artworks (id, title, medium, artist_id, artist_name, year, price, size, style, category_id, image_url, description, in_stock) VALUES 
  ('p1', 'Solstice in Obsidian', 'Oil & Gold Leaf', 'elena-vance', 'Elena Vance', '2023', 18500, 'large', 'abstract', 'paintings', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80', 'A masterwork of tactile minimalism exploring celestial events', true),
  ('p2', 'Cosmic Flow', 'Digital Art', 'hideo-tanaka', 'Hideo Tanaka', '2024', 8500, 'medium', 'generative', 'digital', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80', 'Procedural generative art piece', true),
  ('p3', 'Eternal Grace', 'Bronze Sculpture', 'chen-wei', 'Chen Wei', '2022', 25000, 'large', 'sculptural', 'sculptures', 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&q=80', 'Bronze sculpture exploring human form', true)
ON CONFLICT (id) DO NOTHING;