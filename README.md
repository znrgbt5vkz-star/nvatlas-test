# NVAtlas Test

A practice project for organising English and Chinese terms.

## Purpose

This repository contains materials for learning Git and GitHub. It now also hosts a small static website for exploring a 500-entry NV Atlas test sample.

## What is included

- `index.html` — the website entry page.
- `assets/styles.css` — responsive site styling.
- `assets/app.js` — search, filtering, and pagination.
- `data/nvatlas.json` — structured corpus data used by the site.
- `data/NVAtlas-AI-Agent.csv` — the source CSV supplied for the exercise.

## Website features

- Search across English, Chinese, nominal terms, verb labels, and entry IDs.
- Clear no-results feedback.
- Responsive layout for desktop and phone-sized screens.
- Relative paths suitable for GitHub Pages.
- Attribution and a link to the NV Atlas project.

## Local preview

Because the website loads its JSON data with `fetch`, serve the folder over HTTP instead of opening `index.html` directly from the file system. For example:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/`.

## Data

The sample contains 500 aligned English-Chinese entries with the fields `id`, `English`, `Chinese`, `English_Nominal`, and `Chinese_Verb`.

## Attribution

The sample data comes from the [NV Atlas project](https://nvatlas.tra.cuhk.edu.hk/). This is a classroom test website, not a reproduction of the complete NV Atlas site.
