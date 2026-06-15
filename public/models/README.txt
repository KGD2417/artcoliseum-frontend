PLACEHOLDER STATUE MODEL
========================

statue.glb is a TEMPORARY placeholder used by the 3D exhibition corridor
(src/components/Gallery3D.jsx). It is the "Lee Perry-Smith" head scan that
ships with the three.js examples (head scan by Lee Perry-Smith / Infinite-
Realities, CC-BY 3.0). In the scene it is re-materialised as a pale marble bust.

TO SWAP IN YOUR OWN STATUE
--------------------------
1. Drop your model here as:  public/models/statue.glb   (a .glb / GLB binary)
2. That's it — the corridor loads "/models/statue.glb" automatically.

To point at a different path/URL instead, change STATUE_URL at the top of
src/components/Gallery3D.jsx.

If the model fails to load, the scene falls back to a simple lit plinth so the
page never breaks.
