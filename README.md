# Chem Viewer 
Chem Viewer built on Ionic 5 with Angular 


> Find Chem Viewer on the Apple App Store [here](https://apps.apple.com/tt/app/chem-viewer/id1571068897?uo=2).

## Setup

From the root directory

```sh
npm install
ionic serve -c
```

## Web preview

The app builds to static files in `www/`, so the same UI runs in any browser without installing the native app:

```sh
npm start
npm run build
```

Serve `www/` with any static host. A GitHub Pages workflow template is in `docs/web-preview.workflow.yml`; copy it to `.github/workflows/web-preview.yml` (this requires a token with `workflow` scope), enable Pages for the repository, and push to `main`.

## Camera scan

Use the camera button next to the 2D search bar to photograph a chemical label. OCR runs in the browser through Tesseract.js (loaded on demand from a CDN) and the recognized candidates are resolved through PubChem. If OCR is unavailable, the normal typed search still works.

## AR and 3D snapshot

The 3D tab has an AR button. It exports the current molecule to glTF and opens it in `<model-viewer>`, which can launch the platform AR viewer on supported devices. The Capture button downloads a PNG snapshot of the rendered model. Compositing the model over the live AR camera feed and saving that photo requires the native ARCore/ARKit work tracked in the AR feature issue.
