# Self-hosting RadicalTrainingPlatform

This guide is for running the study platform **yourself** — on your own laptop, on a
classroom machine, on a school file server, or from a USB stick with no internet at all.

The short version: **the whole platform is a folder of files.** You copy the folder,
serve it with any static web server, and open it. There is no server program to install,
no database to create, no account to register, and nothing to configure.

---

## 1. What you need

- **A static file server.** Any of them. `python3 -m http.server` is built into Python
  and is enough. So is `nginx`, `caddy`, GitHub Pages, a shared drive with a web server
  in front of it — anything that hands files to a browser unchanged.
- **A modern browser.** Chrome, Edge, Firefox or Safari, from the last few years.

That is the entire list.

## 2. What it does *not* need

Worth stating plainly, because it is unusual and it is the reason this is easy:

- **No account, no sign-in, no email address.** The app never asks who you are and has
  nowhere to put the answer. It collects no identity of any kind.
- **No backend service.** There is no API to run and no cloud component.
- **No network at runtime.** Once the files are on the machine, the study loop works with
  the network unplugged. The one component that can talk to the network — an optional
  tutor feature — is **off by default** and runs in a recorded-example mode that makes no
  network calls at all.
- **No internet during setup**, if you already have the folder. Nothing is downloaded and
  no dependency is resolved at install time.

## 3. Run it locally, in about a minute

From the top of this repository:

```bash
python3 -m http.server -d RadicalTrainingPlatform.Web 8080
```

Then open <http://localhost:8080> in your browser.

If you are already inside the `RadicalTrainingPlatform.Web` folder, this does the same
thing:

```bash
python3 -m http.server 8080
```

### Do not open `index.html` directly

Double-clicking `index.html` loads it as a `file://` page. The app will look broken,
because browsers refuse to run JavaScript modules and service workers from `file://`.
It must be served over `http://` or `https://`. `localhost` counts — that is why the
command above works with no certificate and no setup.

## 4. Hosting it for a group

The folder is self-contained and has no build step, so "deploying" is "copying".

**A static host (GitHub Pages, Netlify, an S3 bucket, a school web server).**
Upload the contents of `RadicalTrainingPlatform.Web/` — not the folder itself, its
*contents* — to wherever the host serves from. It works from a subdirectory as well as
from a domain root, so a project page like `example.org/study/` is fine.

**A folder on a lab file server.**
Copy `RadicalTrainingPlatform.Web/` onto the share and point any web server at it. If
your site already serves a directory of static files, this is one more directory.

**A USB stick, or a site with no internet.**
Copy the folder onto the stick, and on the target machine run the Python command from
section 3 with the stick's path. Everything the app needs is in the folder. Nothing is
fetched at any point, so an air-gapped machine is a supported case rather than a
degraded one.

## 5. Installing it as an app (and working offline)

Open the site once, then use your browser's **Install** option (usually in the address
bar or the browser menu). You get an icon that opens the platform in its own window.

After that first visit it works **with no network**. A service worker caches the app's
files at install time, so the installed copy opens and runs offline.

Two things worth knowing:

- The first visit must reach the server, because that is when the files are cached.
- If the first visit is over the network and you then go offline, everything cached is
  available. A file that was *not* cached would fail to load — which is why the
  completeness of that cache is enforced by a gate (see section 6) rather than trusted.

## 6. Check that your copy is intact

If you have the source repository, two commands verify a copy before you hand it to
students:

```bash
python3 scripts/check-selfhost.py
python3 scripts/check-content-bundle.py
```

The first confirms the app's offline cache covers every file the app loads, that every
path it caches exists, and that the copy is servable from a subdirectory. The second
confirms the study content matches its recorded hashes — the file that carries them is
`content-manifest.json`.

If you copied only the web folder and not the repository, you can still check the content
by eye: `content-manifest.json` lists every content file with its SHA-256.

## 7. The one limitation you should know about

**Progress belongs to a browser profile, not to a person.**

Study progress — which questions you have answered, how many you got right, where you
left off — is stored in the browser, on the machine, in that browser's profile. There is
no account, so there is nothing to log into and nothing that follows a student around.

What that means in practice:

- **Your own laptop:** exactly what you want. Progress is there when you come back.
- **A shared lab machine:** everyone using the *same browser profile* shares one
  progress history. Student B sees Student A's answers.
- **Two devices:** progress does not move between them. There is no sync, by design.

If you are deploying to shared machines, pick one of these:

1. **Give each student their own browser profile** on the shared machine, so each has a
   separate store.
2. **Give each student their own copy** — a folder per student, or a stick per student.
3. **Use a machine each**, if that is an option.

There is no fourth option in this version. Cross-device sync does not exist, and this
guide will not pretend otherwise.

## 8. Updating a copy

Replace the folder with the newer one. Progress lives in the browser rather than in the
folder, so it is not lost by an update — item identities are stable across revisions
precisely so that recorded progress keeps pointing at the right question.

If you installed the app, the browser picks up the new version on the next visit.

## 9. Desktop builds

There are also native desktop shells, with packaging scripts for Linux (AppImage,
Flatpak) and macOS (`.dmg` or a `.zip` fallback) under `packaging/`. **No pre-built
binary is published** — this repository has no releases and no tags, so you build those
yourself. The build instructions are in the [README](../README.md).

The self-host path in this guide needs none of that. It is the web folder and a static
server.

## 10. What this guide does not cover

Stated so nothing here is mistaken for more than it is:

- **No accounts and no sync.** Progress does not follow a student between devices. That
  is a deliberate boundary, not an oversight, and section 7 is the honest version of it.
- **No cloud deployment.** There is no hosted offering to point you at.
- **No live AI tutor by default.** The optional tutor feature is off unless someone
  configures a gateway for it. The default mode uses recorded examples and makes no
  network calls.
- **No central reporting.** Because there are no accounts and no server, there is no
  dashboard that shows a class's results. A teacher cannot see student progress through
  this app.

---

## For the reader who wants the short version

```bash
python3 -m http.server -d RadicalTrainingPlatform.Web 8080
```

Open <http://localhost:8080>. Install it if you want it offline. That is the whole
deployment.
