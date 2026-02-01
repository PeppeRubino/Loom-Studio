# brand-guidelines.md — Giuseppe Rubino

Linee guida ufficiali di design e UI per tutte le app di **Giuseppe Rubino**  
(Web app React + App desktop Python / Qt / PySide6 / Tk / Pygame)

---

## Identità di brand

### Nome prodotto (pubblico)
**[Nome App] · Giuseppe Rubino**

### Nome visuale in UI
**[Nome App breve]**  
(es. “Voxel App”)

### Subtitle / About (una riga)
*Clear structure for complex systems.*  
(adattabile per singola app)

---

## 0) Posizionamento

### Promessa visiva (10 secondi)

**Uno strumento professionale che sembra un prodotto premium,  
non un gestionale, non un giocattolo.**

L’interfaccia deve comunicare:
- chiarezza
- controllo
- calma
- affidabilità

> Se un utente si sente “a suo agio”, l’app è fatta bene.

---

## 1) Filosofia generale

### Principio guida
> **Pro prima di bello.**  
> Se una scelta estetica riduce chiarezza, velocità o leggibilità, è sbagliata.

### Secondo principio
> **Oggetti, non record.**  
> Card, pannelli e viste devono sembrare *cose*, non righe di database.

### Signature budget
- **1–2 momenti firma per vista**
- Accento visivo totale: **< 5%**
- Il resto è aria, gerarchia, silenzio

### Da evitare (effetto “cheap”)
- Glow diffuso / gaming
- Troppi colori
- Bordi spessi
- UI “iper-gestionale”
- Spaziature casuali
- Font patchwork

---

## 2) Design Tokens (obbligatori)

Tutti i progetti **devono** usare token condivisi  
(`theme.ts`, `tokens.ts`, `Tokens.qml`, ecc.)

### 2.1 Spacing (8pt grid)

- `s1 = 8`
- `s2 = 12`
- `s3 = 16`
- `s4 = 24`
- `s5 = 32`
- `s6 = 40`

Regole pratiche:
- padding card/panel: **16–24**
- gap elementi: **12–16**
- gap sezioni: **24–32**

---

### 2.2 Radius (mac-like)

- `r1 = 8` → chip, small controls  
- `r2 = 12` → input, button  
- `r3 = 16` → card, panel  
- `r4 = 24` → app window / container

---

### 2.3 Border

- hairline: `1px`
- strong (solo focus/selection): `2px`

---

## 3) Tipografia

### Font
- **System font**
  - macOS: San Francisco
  - Windows: Segoe UI
  - Linux: Noto / DejaVu

- Monospace (tecnico): Menlo / Consolas / DejaVu Mono

### Scala tipografica

- H1 (page title): 20–22
- H2 (section): 16–18
- Body: 14–16 (default 15)
- Caption / hint: 12–13

Gerarchia = **dimensione + colore + spacing**  
(non solo grassetto)

---

## 4) Colori

### Filosofia colore
- neutri premium
- un solo accento emotivo
- zero neon urlato

---

### Palette Light

**Neutrali**
- `BG` `#FFFFFF`
- `PANEL` `#F7F7F8`
- `PANEL_2` `#F0F1F3`
- `BORDER` `#E6E6E8`
- `TEXT` `#111111`
- `MUTED` `#5E5E5E`
- `FAINT` `#8A8A8A`

**Accent (brand rubino)**
- `ACCENT` `#B11226`
- `ACCENT_SOFT` `#F6D6DA`
- `ACCENT_INK` `#FFFFFF`

**Semantic**
- `SUCCESS` `#1F7A3F`
- `WARNING` `#B76B00`
- `DANGER` `#C62828`
- `INFO` `#1769AA`

---

### Palette Dark (opzionale, premium)

- `BG_D` `#0F0F10`
- `PANEL_D` `#161618`
- `BORDER_D` `#2A2A2F`
- `TEXT_D` `#F2F2F2`

Layout identico → cambiano solo i token.

---

## 5) Layout & struttura (mac-like vero)

Mac-like ≠ grigio  
Mac-like = **gerarchia + ancore + ritmo**

### Pattern ammessi (scegline uno per app)

1. **Toolbar + Panels**
2. **Sidebar + Content**
3. **Grid fluida di card**
4. **List + Detail**

Non mischiare pattern senza motivo.

---

### App window (web & desktop)

- container centrale
- radius grande (24+)
- padding generoso
- bordo sottile
- **aria**

Su web:
- glass effect leggero
- backdrop blur soft
- gradient ambientale dietro

Su desktop:
- stessa struttura
- niente dipendenza dal blur (degrada bene)

---

## 6) Card (cuore del brand)

La card è **un oggetto**, non una tabella.

### Regole card
- background chiaro
- ombra quasi invisibile
- radius 16
- contenuto verticale
- pochi elementi
- chip morbidi

### Chip / tag
- pill
- background soft
- testo scuro
- no colori forti

---

## 7) Componenti base

### Button
- Primary = ACCENT (solo 1 per vista)
- Secondary = neutro
- Destructive = DANGER

### Input
- label sopra
- hint sotto
- focus ring visibile (accent soft)

### Dropdown / menu
- rounded
- ombra soft
- blur solo se disponibile

---

## 8) Motion

- hover: 80–120ms
- transizioni: 120–180ms
- easing naturale
- **mai** cartoon

Motion = conferma, non spettacolo.

---

## 9) Icone

- una sola famiglia
- outline coerente
- dimensioni: 16 / 20 / 24
- mai mix filled + outline

---

## 10) Web App (React)

- componenti modulari
- layout fluido
- grid responsive
- filtri progressivi (non dashboard)

La web app **deve sembrare una desktop app**.

---

## 11) App Desktop (PySide6 / Qt)

- tokens in `Tokens.qml`
- componenti wrapper:
  - AppButton
  - AppCard
  - AppInput
  - StatusChip

Zero colori hardcoded.

---

## 12) Checklist qualità

- [ ] layout unico e chiaro
- [ ] aria sufficiente
- [ ] accento < 5%
- [ ] card come oggetti
- [ ] focus visibile
- [ ] empty state curato
- [ ] UI calma
