# Supabase setup — Art Coliseum

## 1. Run the schema

Open Supabase dashboard → **SQL Editor → New query**, paste the contents of
[`schema.sql`](./schema.sql), then **Run**.

## 2. Seed the data

Same place — paste [`seed.sql`](./seed.sql) and **Run**.

## 2b. Chat tables

Run [`chat.sql`](./chat.sql). It adds `chat_messages`, RLS, and enables the
table for Realtime so messages stream live to the browser.

## 2c. Admin chat + read tracking

Run [`chat_admin.sql`](./chat_admin.sql). It adds:
- `is_admin` flag on `profiles`
- RLS policies so admins can read/insert any chat
- `chat_reads` table for unread badges

Make yourself an admin (after signing up at least once):

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'you@example.com');
```

Then visit **/admin/inbox** to see all conversations and reply on behalf
of artists/curators. Replies stream live to the user's chat modal and
to the **Messages** tab on their profile.

## 2d. Artist role + artist-to-artist chat

Run [`artist_role.sql`](./artist_role.sql). It adds:
- `role` column on `profiles` (`'user' | 'artist' | 'admin'`)
- `user_id` link on `artist_applications`
- Trigger that auto-promotes a signed-in user to `role = 'artist'` when they
  submit the Artist Portal form
- Peer-chat RLS so artists can read/write conversations keyed
  `peer:<uuidA>:<uuidB>` (sorted UUIDs)

After this, the flow is:
- User fills the Artist Portal form → DB trigger sets `role = 'artist'`
- Auth context picks up the role change live → app redirects them to
  **/artist-chat**, which lists every other artist and opens a private
  per-pair thread.

Regular users can still chat with admin support from the product detail
page; that path uses `admin:<artwork-id>` keys and goes to /admin/inbox.

## 2e. Admin Panel

Run [`admin_panel.sql`](./admin_panel.sql). It adds:
- `featured` flag on artworks (used by Highlights tab)
- `status` on artworks (`'draft' | 'pending' | 'published' | 'rejected'`)
- Helper functions `is_admin_role()` and `is_artist_role()`
- Admin RLS for full read/write on artworks, events, orders, contact,
  support, applications, and profiles
- Artist RLS: insert/update artworks where `artist_id = auth.uid()`,
  cannot delete (per spec)
- Backfills any legacy `is_admin = true` users into `role = 'admin'`

Visit **/admin** to access the unified dashboard with tabs for:
Overview · Artworks · Highlights · Events · Orders · Messages · Contact · Support.
Live counts/badges update via Realtime subscriptions on every operational table.

> Image URLs in the seed point to `/src/assets/...`. They work in dev because
> Vite serves those paths. For production, upload images to Supabase Storage
> (see step 4) and `UPDATE` the `image_url` columns to the public Storage URLs.

## 3. Auth settings

Dashboard → **Authentication → Providers → Email**:
- Enable Email provider
- For dev: turn OFF "Confirm email" so signup works without an inbox
- For prod: turn it ON; users will need to click the confirmation link

## 4. Storage (for artist uploads + artwork images)

Dashboard → **Storage → New bucket**:
- Name: `artworks` (public read, authenticated write)
- Name: `artists`  (public read, authenticated write)

Add policy on each bucket: public `SELECT`, authenticated `INSERT`.

## 5. Payments (Razorpay/Stripe) — TODO

The Checkout currently writes orders to the DB with `status='pending'`.
The frontend cannot hold the payment provider's secret key. Next steps:

1. Create a Supabase **Edge Function** (`create-payment`) that:
   - reads the order from `orders`
   - calls Razorpay/Stripe with the secret key (set as a function secret)
   - returns the gateway order_id / client_secret
2. From `Checkout.placeOrder`, after inserting the order, call the function:
   ```js
   const { data } = await supabase.functions.invoke('create-payment', { body: { order_id } });
   ```
3. Open the gateway widget with that token.
4. On success webhook → another Edge Function updates `orders.status='paid'`.

## 6. Local dev

`.env.local` already has the project URL + anon key. Restart `npm run dev`
after the SQL is run so the seed data shows up in the UI.

## What's wired

| Page                 | Behaviour |
|----------------------|-----------|
| Signin / Signup      | `supabase.auth` (email + password) |
| Profile              | reads `profiles` + own `orders`; redirects to /signin if logged out |
| Artists              | `artists` table |
| Gallery              | `artworks` table |
| Events               | `events` table; form → `event_registrations` |
| Contact              | → `contact_messages` |
| HelpDesk             | → `support_tickets` |
| Artist Portal        | → `artist_applications` (no file upload yet) |
| Checkout             | inserts `orders` + `order_items` (payment is stubbed) |

## Still hardcoded

These pages still read from local arrays and can be migrated to Supabase later
using the same pattern as Gallery/Artists:

- `ProductDetail.jsx` (look-up by id; can fetch from `artworks`)
- `Categories.jsx` / `SubCategories.jsx` (can read from `categories`)
- `ArtistProfile.jsx` (can read from `artists` + filter `artworks` by artist)
- `Home.jsx` (carousel/featured sections)
- Notifications + cart-on-profile (mock data)
