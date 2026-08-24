# BRIX Publish Scheduler production storyboard

Interactive snapshot of the Designer Extension UI published for internal testing on August 21, 2026.

Open [the complete storyboard](./overview.html) or [the interactive panel](./panel.html?state=fullsite).

## Fidelity contract

- `storyboard.js` is compiled from the production `FinalPanel.tsx` component.
- `production.css` and `assets/` are copied from `extension/public/`, the source of the uploaded Webflow bundle.
- The storyboard adds only deterministic fixture state and safe local callbacks. It does not call Webflow or the production Worker.
- Frames are 380 × 500. Webflow's native Designer title bar is outside the extension bundle and is therefore not duplicated in the frames.

Rebuild from the project root with:

```bash
npm run storyboard:build
```
