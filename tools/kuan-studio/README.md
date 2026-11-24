# Kuan API Image Studio

This is the corresponding React source for the Android asset `studio.js`.
The starting point is the reviewed classic workbench from 2026-10-25;
building that baseline produced the live JS and CSS SHA-256 prefixes
`f348c8d913a7a581` and `f3197f00f7f75ed8`. The Android host changes the
account, picker, download, and navigation boundaries; it does not fork the
prompt library or create another image API service.

```powershell
npm --prefix tools/kuan-studio ci
npm --prefix tools/kuan-studio test
npm --prefix tools/kuan-studio run build
Copy-Item tools/kuan-studio/dist/studio.js,tools/kuan-studio/dist/studio.css app/src/main/assets/kuan-studio/
```

The versioned content lives under `app/src/main/assets/kuan-studio/library/`.
It includes the upstream MIT license and the audit import's
`content-version.json`, including the pinned repository revision and original
asset hashes. The catalog's original artwork and comparison images are served
from the existing workbench asset path, with a pinned raw GitHub fallback for
the original case images. Credentials are not sent to these hosts.

`licenses/` contains the runtime copyright notices. GSAP and its React adapter
are used under the [GSAP Standard License](https://gsap.com/standard-license/);
they are not relicensed by this project. DOMPurify binaries are distributed
under its Apache-2.0 option. Build-only dependencies remain pinned in the npm
lockfile but are not shipped as build tools in the APK.
