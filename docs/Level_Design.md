# Level Design Document

## Environments and Biomes
Instead of a flat map, regions dictate the 3D biome generated:
1. **Tropical (e.g., Brazil, Singapore)**: High greenery, scattered islands, plateaus, heavy rain weather modifiers.
2. **Desert (e.g., Egypt, Dubai)**: Golden dunes, flat expanses, heat-haze effects, sunny/clear weather.
3. **Alpine/Tundra (e.g., Russia, Canada)**: Snowy peaks, frozen lakes, persistent snow weather.
4. **Oceanic (e.g., Pacific, Atlantic)**: Vast blue expanses, small atolls, dynamic wave meshes.

## Dynamic Weather Impacts
*   **Sunny**: High visibility, standard flight controls.
*   **Rainy**: Reduced visibility (thick fog), mild turbulence (plane pitches slightly).
*   **Stormy**: Very low visibility, heavy turbulence, lightning flashes.
*   **Snowy**: Whiteout conditions, visual snow particles, smooth but heavy flight handling.

## Landmark Placement Strategy
Landmarks are distributed dynamically in a 100x100 grid. They act as "waypoints". 
*   **Primary Landmarks**: Huge bounding boxes, visible from afar (e.g., Eiffel Tower).
*   **Secondary Landmarks**: Discoverable through proximity, requiring the player to dive lower (e.g., hidden lakes or valleys).
