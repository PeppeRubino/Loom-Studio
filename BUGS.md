# Bug Log (Loom Studio)

Ogni voce ha: **orario**, **bug**, **causa**, **fix applicato** (se fatto), **come verificare**.

## 2026-02-01 18:45 (CET) - GitHub Pages: pagina bianca + asset 404 su subpath

**Bug**
- Su `https://pepperubino.github.io/Loom-Studio/` la home risultava bianca.
- In console 404 su `icon.ico` / `icon.png` (cercati in root dominio).

**Causa**
- Deploy su GitHub Pages sotto subpath `/Loom-Studio/` senza configurare `base` di Vite.
- Link alle icone in `index.html` con path assoluti (`/icon.png`, `/icon.ico`) non compatibili con subpath.
- SPA con `BrowserRouter` senza `basename` e senza `404.html` per deep-link/refresh.

**Fix applicato**
- Impostato `base: '/Loom-Studio/'` in `vite.config.ts`.
- Resi base-aware i riferimenti alle icone in `index.html` usando `%BASE_URL%`.
- Aggiunto `public/404.html` per redirect dei deep-link e script in `index.html` per ripristinare il path dopo redirect.
- Impostato `basename` su `BrowserRouter` usando `import.meta.env.BASE_URL`.

**Come verificare**
- Aprire `https://pepperubino.github.io/Loom-Studio/` e controllare che JS/CSS e icone siano richiesti sotto `/Loom-Studio/`.
- Provare refresh su un deep-link tipo `/Loom-Studio/app/profile` senza ottenere 404/pagina bianca.

## 2026-02-01 18:55 (CET) - Deploy gh-pages: worktree rotto / push su branch sbagliato

**Bug**
- `git worktree remove dist-gh-pages` falliva (`.git does not exist`).
- Deploy veniva committato su `main` invece che su `gh-pages`.

**Causa**
- `robocopy ... /MIR` ha cancellato anche `dist-gh-pages/.git` (file) durante la copia, rompendo il worktree.
- Branch `origin/gh-pages` inizialmente non esisteva.

**Fix applicato**
- Creato e pushato `origin/gh-pages` correttamente.
- Corretto il comando di copia includendo esclusione di `.git` (`/XF .git /XD .git`) per non distruggere il worktree.

**Come verificare**
- `git branch -a` mostra `remotes/origin/gh-pages`.
- Deploy successivo non crea commit su `main` e `git worktree remove dist-gh-pages` funziona.

## 2026-02-01 19:10 (CET) - Filtri (Capo/Colore/Stagione): dropdown multipli + trasparenza + overflow mobile

**Bug**
- Aprendo un filtro, gli altri restavano aperti (piu dropdown contemporanei).
- Alcuni dropdown risultavano troppo trasparenti.
- Su mobile i dropdown potevano uscire fuori dallo schermo (ancorati a sinistra/destra).

**Causa**
- `FilterPill` gestiva `open` localmente senza coordinamento tra pill.
- Menu con `bg-white/80` (trasparente) e posizionamento `right-0` fisso.

**Fix applicato**
- Aggiunto controllo "un solo dropdown aperto" via stato unico `openFilter` in `HomePage`.
- `FilterPill` ora supporta modalita controllata (`open`/`onOpenChange`), chiusura su click fuori ed `Escape`.
- Dropdown reso opaco (`bg-white`) e posizionamento calcolato: centrato sul bottone e clampato nella viewport.

**Come verificare**
- Aprire "Capo", poi "Colore": il primo si chiude automaticamente.
- Su mobile: aprire un filtro vicino al bordo sinistro: il menu resta dentro lo schermo.

## 2026-02-01 19:20 (CET) - Profilo: "foto profilo custom" non persistente dopo refresh

**Bug**
- Dopo aver selezionato una foto profilo custom, al refresh (o riapertura) puo sparire o risultare non caricabile.

**Causa**
- In `compressImage()` il valore chiamato `dataUrl` e' in realta un `blob:` URL creato con `URL.createObjectURL(...)`.
- Un `blob:` URL non e' persistente tra refresh, ma viene salvato in localStorage come se lo fosse.

**Fix applicato**
- 2026-02-01 20:10 (CET): `compressImage()` ora produce un vero Data URL (`data:image/...;base64,...`) invece di un `blob:` URL, quindi il valore salvato in localStorage resta valido anche dopo refresh.

**Come verificare**
- In Profile: caricare un avatar custom, poi refresh della pagina, verificare se l'avatar resta.

## 2026-02-01 19:25 (CET) - Login Google: funziona in localhost ma non su GitHub Pages

**Bug**
- Il login Google non funziona quando l'app gira su `https://pepperubino.github.io/Loom-Studio/`.

**Causa**
- Configurazione Firebase Auth/OAuth non allineata al dominio di produzione (GitHub Pages).

**Fix applicato**
- Risolto manualmente dall'utente (configurazione Firebase Auth/OAuth lato console).

**Come verificare**
- Aprire l'app su GitHub Pages e tentare "Continua con Google"; controllare l'errore in console/network.

## 2026-02-01 19:30 (CET) - Immagini capi: se provider "local", le immagini non sono persistenti dopo refresh

**Bug**
- Se il progetto non ha una chiave di upload (es. ImgBB), l'app salva le immagini come URL "local".
- Dopo refresh/riapertura, le immagini di alcuni capi possono non caricarsi piu.

**Causa**
- Nel fallback "local" di `uploadImage()`, l'URL e' un `blob:` URL creato con `URL.createObjectURL(...)`.
- I `blob:` URL non sono persistenti tra refresh, ma l'item viene comunque salvato (localStorage/Firestore) con quell'URL.

**Fix applicato**
- 2026-02-01 20:10 (CET): nel fallback `uploadImage()` senza provider remoto, l'URL ora e' un vero Data URL persistente (non piu `blob:`).

**Come verificare**
- Caricare un capo con immagine senza usare un provider remoto, poi refresh e verificare se l'immagine resta visibile.
