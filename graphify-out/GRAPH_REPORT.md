# Graph Report - .  (2026-05-06)

## Corpus Check
- Large corpus: 138 files · ~1,930,563 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 372 nodes · 410 edges · 80 communities (42 shown, 38 thin omitted)
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 63 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Icon Library|Icon Library]]
- [[_COMMUNITY_Auth & Chat Contexts|Auth & Chat Contexts]]
- [[_COMMUNITY_WebGL Circular Gallery|WebGL Circular Gallery]]
- [[_COMMUNITY_Navigation & Search|Navigation & Search]]
- [[_COMMUNITY_Artist & Admin Portal|Artist & Admin Portal]]
- [[_COMMUNITY_Artwork Browsing & AR|Artwork Browsing & AR]]
- [[_COMMUNITY_Hero Gallery Assets|Hero Gallery Assets]]
- [[_COMMUNITY_Artwork Estimation|Artwork Estimation]]
- [[_COMMUNITY_App Shell|App Shell]]
- [[_COMMUNITY_Events & Registrations|Events & Registrations]]
- [[_COMMUNITY_Shopping Cart|Shopping Cart]]
- [[_COMMUNITY_Circular Testimonials|Circular Testimonials]]
- [[_COMMUNITY_Code Review Tools|Code Review Tools]]
- [[_COMMUNITY_Contact Form & DB|Contact Form & DB]]
- [[_COMMUNITY_Entry Point|Entry Point]]
- [[_COMMUNITY_Support Tickets|Support Tickets]]
- [[_COMMUNITY_Singleton 46|Singleton 46]]
- [[_COMMUNITY_Singleton 47|Singleton 47]]
- [[_COMMUNITY_Singleton 48|Singleton 48]]
- [[_COMMUNITY_Singleton 49|Singleton 49]]
- [[_COMMUNITY_Singleton 50|Singleton 50]]
- [[_COMMUNITY_Singleton 51|Singleton 51]]
- [[_COMMUNITY_Singleton 52|Singleton 52]]
- [[_COMMUNITY_Singleton 53|Singleton 53]]
- [[_COMMUNITY_Singleton 54|Singleton 54]]
- [[_COMMUNITY_Singleton 55|Singleton 55]]
- [[_COMMUNITY_Singleton 56|Singleton 56]]
- [[_COMMUNITY_Singleton 57|Singleton 57]]
- [[_COMMUNITY_Singleton 58|Singleton 58]]
- [[_COMMUNITY_Singleton 59|Singleton 59]]
- [[_COMMUNITY_Singleton 60|Singleton 60]]
- [[_COMMUNITY_Singleton 61|Singleton 61]]
- [[_COMMUNITY_Singleton 62|Singleton 62]]
- [[_COMMUNITY_Singleton 63|Singleton 63]]
- [[_COMMUNITY_Singleton 64|Singleton 64]]
- [[_COMMUNITY_Singleton 65|Singleton 65]]
- [[_COMMUNITY_Singleton 66|Singleton 66]]
- [[_COMMUNITY_Singleton 67|Singleton 67]]
- [[_COMMUNITY_Singleton 68|Singleton 68]]
- [[_COMMUNITY_Singleton 69|Singleton 69]]
- [[_COMMUNITY_Singleton 70|Singleton 70]]
- [[_COMMUNITY_Singleton 71|Singleton 71]]
- [[_COMMUNITY_Singleton 72|Singleton 72]]
- [[_COMMUNITY_Singleton 73|Singleton 73]]
- [[_COMMUNITY_Singleton 74|Singleton 74]]
- [[_COMMUNITY_Singleton 75|Singleton 75]]
- [[_COMMUNITY_Singleton 76|Singleton 76]]
- [[_COMMUNITY_Singleton 77|Singleton 77]]
- [[_COMMUNITY_Singleton 78|Singleton 78]]
- [[_COMMUNITY_Singleton 79|Singleton 79]]

## God Nodes (most connected - your core abstractions)
1. `base()` - 29 edges
2. `useAuth()` - 20 edges
3. `App` - 16 edges
4. `Home Page` - 14 edges
5. `Hero Gallery (HERO_GALLERY)` - 11 edges
6. `useLocale()` - 9 edges
7. `artworks table` - 8 edges
8. `Media` - 7 edges
9. `categories table` - 7 edges
10. `useAuth Hook` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Art Medium Image m1 (Paintings)` --semantically_similar_to--> `categories table`  [INFERRED] [semantically similar]
  src/assets/mediums/m1.png → supabase/schema.sql
- `Art Coliseum - Art Marketplace Platform` --references--> `profiles table`  [INFERRED]
  README.md → supabase/schema.sql
- `HTML Entry Point` --references--> `App Router`  [INFERRED]
  index.html → src/App.jsx
- `SEARCH_INDEX (static artwork/artist catalog)` --semantically_similar_to--> `artworks table`  [INFERRED] [semantically similar]
  src/components/Navigation.jsx → supabase/schema.sql
- `Supabase Setup Guide` --references--> `profiles table`  [INFERRED]
  supabase/SETUP.md → supabase/schema.sql

## Hyperedges (group relationships)
- **Preservation Artwork Collection (Carousel)** — p1_preservation_artwork, p2_preservation_artwork, p3_preservation_artwork, p4_preservation_artwork, p5_preservation_artwork, p6_preservation_artwork, p7_preservation_artwork, p8_preservation_artwork [EXTRACTED 1.00]
- **Events Image Collection** — e1_event_image, e2_event_image, e3_event_image, e4_event_image, e5_event_image, e6_event_image, e7_event_image, e8_event_image, e9_event_image [INFERRED 0.85]
- **Art Medium Category Images** — m1_medium_image, m2_medium_image, m3_medium_image, m4_medium_image [INFERRED 0.95]
- **Hero Gallery Artwork Images** — i1_gallery_image, i2_gallery_image, i3_gallery_image, i4_gallery_image, i5_gallery_image, i6_gallery_image, i7_gallery_image, i8_gallery_image [EXTRACTED 1.00]
- **E-commerce Data Tables** — schema_artworks, schema_orders, schema_order_items, schema_artists [EXTRACTED 1.00]
- **Core React Context Providers** — auth_authprovider, chatnotifications_chatnotificationsprovider, locale_localeprovider [INFERRED 0.85]
- **App Shell Components** — layout_layout, navigation_navigation, footer_footer, chatbotwidget_chatbotwidget [EXTRACTED 1.00]
- **Animated Gallery UI Components** — ui_circulartestimonials, ui_ctasectiongallery, ui_flipgallery, coliseumcarousel_coliseumcarousel, circulargallery_circulargallery [INFERRED 0.85]
- **Legal / Policy Pages** — refund_refund, privacypolicy_privacypolicy [INFERRED 0.85]
- **Admin Management Pages** — admindashboard_admindashboard, admininbox_admininbox [INFERRED 0.95]

## Communities (80 total, 38 thin omitted)

### Community 0 - "Icon Library"
Cohesion: 0.07
Nodes (30): ArEyeIcon(), ArtistFigureIcon(), ArtSolutionsIcon(), base(), CameraIcon(), CheckIcon(), ChipIcon(), ChiselIcon() (+22 more)

### Community 1 - "Auth & Chat Contexts"
Cohesion: 0.06
Nodes (11): ChatModal(), AuthProvider(), useAuth(), ChatNotificationsProvider(), LocaleProvider(), AdminDashboard(), MessagesTab(), AdminInbox() (+3 more)

### Community 2 - "WebGL Circular Gallery"
Cohesion: 0.1
Nodes (7): App, autoBind(), createTextTexture(), debounce(), lerp(), Media, Title

### Community 3 - "Navigation & Search"
Cohesion: 0.09
Nodes (9): LangButton(), useLocale(), Cart(), Checkout(), Profile(), addToCart(), getCart(), removeFromCart() (+1 more)

### Community 4 - "Artist & Admin Portal"
Cohesion: 0.09
Nodes (28): AdminDashboard Page, AdminInbox Page, ArtistChat Page, ArtistPortal (Become an Artist) Page, AuthContext, AuthProvider, useAuth Hook, ChatNotificationsProvider (+20 more)

### Community 5 - "Artwork Browsing & AR"
Cohesion: 0.08
Nodes (28): About Page Image a1, AR Page (Augmented Reality viewer), ArtistProfile Page, Artists Page, ArtTypeDescription Page, Banner Image b2, Categories Page, ColiseumCarousel (+20 more)

### Community 6 - "Hero Gallery Assets"
Cohesion: 0.18
Nodes (11): Hero Gallery (HERO_GALLERY), Gallery Artwork Image i1, Gallery Artwork Image i2, Preservation Artwork p1, Preservation Artwork p2, Preservation Artwork p3, Preservation Artwork p4, Preservation Artwork p5 (+3 more)

### Community 8 - "Artwork Estimation"
Cohesion: 0.31
Nodes (5): Estimate(), EstimateReveal(), flatEstimate(), fmt(), sculptureEstimate()

### Community 9 - "App Shell"
Cohesion: 0.25
Nodes (8): ChatbotWidget, Footer, Layout, LocaleProvider, Art Coliseum Logo, LangButton, MobileSearch, Navigation

### Community 14 - "Events & Registrations"
Cohesion: 0.5
Nodes (5): Event Image e1, Event Image e2, Events Page, event_registrations table, events table

### Community 15 - "Shopping Cart"
Cohesion: 0.6
Nodes (5): Cart Page, addToCart, getCart, removeFromCart, setCart

### Community 19 - "Code Review Tools"
Cohesion: 0.67
Nodes (3): code-review-graph CLI, fastmcp CLI, mcp CLI

## Knowledge Gaps
- **79 isolated node(s):** `Preservation Artwork p1`, `Preservation Artwork p2`, `Preservation Artwork p3`, `Preservation Artwork p4`, `Preservation Artwork p5` (+74 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **38 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `Auth & Chat Contexts` to `Icon Library`, `Navigation & Search`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Why does `CheckIcon()` connect `Icon Library` to `Navigation & Search`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Are the 10 inferred relationships involving `useAuth()` (e.g. with `ChatNotificationsProvider()` and `ChatModal()`) actually correct?**
  _`useAuth()` has 10 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Preservation Artwork p1`, `Preservation Artwork p2`, `Preservation Artwork p3` to the rest of the system?**
  _79 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Icon Library` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Auth & Chat Contexts` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `WebGL Circular Gallery` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._