# Wallpaper Cycler

A Chrome new tab page that shows the next wallpaper from your own set of images every time you open a tab, with a Google search box, a Google apps menu and your own shortcuts.

> Hobby project. Not affiliated with, endorsed by, or sponsored by Google. Google and the Google logo and app names are trademarks of Google LLC.

## Features

- **Cycling wallpapers:** each new tab shows the next of your images (1, 2, 3, 4, 5, then back to 1).
- **Search box:** type a search to use Google, or type a website address to go straight there.
- **Google apps menu:** the 9-dot menu in the top right, plus Gmail and Images links.
- **Your own shortcuts:** click **Add shortcut**, enter a name and a URL, and a tile appears with that site's icon. Hover a tile and click the three dots to edit or remove it. Up to 10 shortcuts.

## Install

1. Download this repository (green **Code** button, then **Download ZIP**) and unzip it.
2. Put your wallpapers in the `images` folder (see below).
3. Open `chrome://extensions` in Chrome and turn on **Developer mode** (top right).
4. Click **Load unpacked** and select this folder.
5. If Chrome asks whether to keep the new tab page, choose **Keep it**.

After you add, remove or rename images, click the reload icon on the extension in `chrome://extensions`.

## Wallpapers

Name your images `1`, `2`, `3`, `4`, `5` and put them in the `images` folder. Any common extension works: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif` or `.gif`. Mixed formats are fine. Use images of at least 1920x1080 and keep each under a few MB so they load instantly.

To use a different number of images, change `WALLPAPER_COUNT` at the top of `newtab.js`.

## Privacy

- Your shortcuts are stored locally in Chrome (`chrome.storage.local`). Nothing is sent to any server of mine, and there is no analytics or tracking.
- Site icons (for shortcuts and the Google apps menu) are loaded from Google's favicon service, so each site's address is sent to Google to fetch its icon. If an icon can't load, a colored letter is shown instead.

## Files

- `manifest.json`: extension settings
- `newtab.html`, `newtab.css`, `newtab.js`: the new tab page
- `images/`: put your wallpapers here (they are not tracked by git)

## License

MIT, see `LICENSE`.
