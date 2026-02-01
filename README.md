# Wardrobe Studio

Base React + Vite per un inventario vestiario “mac-like”: struttura modulare, token coerenti, UI shell con topbar, sidebar opzionale e status bar, pronta per agganciare login Google nella fase 2.

## Highlights
- Layout dinamico (top bar + gradient content + sidebar blur) con gerarchia chiara.
- Routing: `/`, `/wardrobe`, `/wardrobe/:id`, `/settings`, `/login`, `404`.
- Componenti UI minimi: Button, Input, Card, Badge, Sheet, EmptyState, PageHeader.
- Design tokens centralizzati (`src/lib/theme-values.json`) e tailwind legato ai token.
- Mock dataset di items (`src/lib/mock-data.ts`) + filtri categoria/colore/tag.
- Auth scaffolding: `AuthProvider`, `useAuth`, `AuthGate` (mock login toggle).
- Alias `@/` per import puliti, ESLint/Prettier già configurati.

## Struttura cartelle
```
src/
  app/
    App.tsx
    providers/AppProviders.tsx
    router/AppRoutes.tsx
  components/
    layout/
    ui/
  features/auth/
  hooks/
  lib/
    brand.ts
    theme-values.json
    theme.ts
    mock-data.ts
  pages/
  styles/
  types/
```

## Comandi
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run format`

## Firestore rules
Nel repo è presente `firestore.rules` (accesso limitato a `users/{uid}` e subcollections).

Deploy (Firebase CLI):
1. `npm i -g firebase-tools`
2. `firebase login`
3. `firebase use --add loom-f82d6` (oppure seleziona il progetto corretto)
4. `firebase deploy --only firestore:rules`

## Realtime Database rules
Nel repo è presente `database.rules.json` (accesso limitato a `users/{uid}`).

Deploy (Firebase CLI):
1. `firebase deploy --only database`

## Estendere al login Google (fase 2)
1. Integra Google OAuth nel `AuthProvider` esponendo `signIn`/`signOut` e stato `loading`.
2. Usa `AuthGate` per proteggere rotte e gestire redirect verso `/login` con feedback.
3. Persiste i token (cookie sicuri o storage) e reidrata al mount.
4. Collega la sync dell’inventario e mostra uno stato di connessione nella top/status bar.
5. Aggiorna `LoginPage` con il bottone Google ufficiale e messaggi di errore/successo.
