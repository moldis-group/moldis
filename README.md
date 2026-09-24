# MolDis on GitHub Pages

Upload the **contents** of this folder to the root of a GitHub repository. The included `index.html` is the front page and `molecules-master/examples/index.html` is the molecule viewer from the supplied ZIP. The viewer uses its bundled `dist` and `lib` files; keep that directory structure intact.

## Before publishing

- The supplied ZIP did **not** include `datasets.html`, `developers.html`, `lab.html`, `Images/MolDis.png`, `Images/Logo.png`, or `moldis_final_credit_540.mp4`. Add the three HTML pages at repository root for those navigation links to work. The front page uses text in place of the absent images. Add the MP4 at repository root if you want the video to play, or remove its `<video>` element.
- If your other pages rely on PHP, Python, server-side search, a database, or absolute URLs to an old host, those features need separate conversion or hosting. GitHub Pages serves static files only.
- The search box uses Google site search. Newly published pages may take time to appear in Google's index.

## Publish

1. Create a public repository (for example `moldis`) and upload all files and folders here, including `index.html` at repository root.
2. In the repository open **Settings → Pages**. Under **Build and deployment**, select **Deploy from a branch**, branch **main**, folder **/(root)**, then save.
3. Open `https://YOUR-USERNAME.github.io/moldis/`. If the repository is named `YOUR-USERNAME.github.io`, open `https://YOUR-USERNAME.github.io/`.
4. Allow a few minutes for deployment. Check the Pages deployment in the repository's Actions tab if the URL does not load.

You can test locally from this folder with `python3 -m http.server 8000` and open `http://localhost:8000/`.
