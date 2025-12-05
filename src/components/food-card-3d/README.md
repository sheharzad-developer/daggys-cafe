## FoodCard3D Demo

Implements a “slide to order” interaction with a 3D react-three-fiber card and a DOM-based 2D fallback.

### Thresholds
- `DISPLACEMENT`: 100px drag to the right triggers toss.
- `VELOCITY`: 0.5 px/ms drag speed also triggers toss.
- `MAX_TILT`: 15° cap while dragging.
- `DRAG_SCALE`: 1.05 scale-up on drag.
- Toss duration: ~700ms ease-out; spring-back: ~400ms.

Adjust these in `src/components/food-card-3d/types.ts`.

### WebGL vs 2D
- Automatic detection via `isWebGLAvailable()`.
- 3D path: `FoodCard3DWrapper` → `FoodCard3D` (react-three-fiber).
- 2D fallback: `FoodCard2DFallback` (Framer Motion + use-gesture).
- Keyboard: focus card + Enter triggers add/toss.

### Reduced Motion
- Respects `prefers-reduced-motion`; skips flight and directly adds to cart with an accessible live region message.

### How to run
```bash
npm install
npm run dev
# Open /demo-3d for the interaction demo
```

### Tests
```bash
npm run test
```
Unit tests cover the toss thresholds and animation config (`__tests__/food-card-3d.test.ts`).

### Performance tips
- Uses low-poly rounded plane with a baked texture (use an atlas for many items).
- Keep textures small; lazy-load images where possible.
- Keep animation duration under 900ms; early-return for reduced-motion users.
- Shadows kept minimal; avoid heavy post-processing.

