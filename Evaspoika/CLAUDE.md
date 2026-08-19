# Evaspoika – frontend

Makkaroita ja hampurilaispihvejä valmistavan elintarvikeyrityksen varastonhallinta- ja tilausjärjestelmä. Tämä on **frontend**:
Expo / React Native -sovellus, joka ajetaan tabletilla varastossa.
Järjestelmä koostuu kahdesta erillisestä git-repositoriosta:

| Projekti | Polku | Mitä |
|---|---|---|
| **Frontend** (tämä) | `evaspoika_frontend/Evaspoika/` | Expo SDK 54, React Native 0.81, expo-router, React Query, TypeScript strict |
| **Backend** | `../../evaspoika_backend/` | Node.js + Express + Sequelize/SQLite REST-API, Netvisor-integraatio, vaakaliittymä |

Backend ajetaan **Raspberry Pi 5** -laitteella samassa lähiverkossa. Tabletti
puhuu sille suoraan IP-osoitteella (`EXPO_PUBLIC_API_BASE_URL`).

Käyttöliittymän tekstit ovat **suomeksi**. Koodi, muuttujanimet ja kommentit englanniksi
paitsi missä ympäröivä koodi tekee toisin.

## Syvempi konteksti (skillit)

Lataa tarvittaessa `.claude/skills/`-hakemistosta:

- **evaspoika-yleiskuva** – koko järjestelmä, toimialue, tietovirrat, molemmat repot
- **frontend-arkkitehtuuri** – feature-rakenne, API-kerros, React Query, navigointi, UI-konventiot

## Pikakelaus

```bash
npm start           # expo start
npm run android     # expo run:android
npm run lint        # expo lint
```

Ei testejä. Ei omaa buildskriptiä – julkaisu EAS:llä (`eas.json`, projectId `app.json`:ssa).

**Hakemistot:**
```
app/                        expo-router, vain reititys – näytöt importataan src:stä
  _layout.tsx               fontit, QueryProvider, ErrorBoundary, portrait-lukitus
  (tabs)/                   piilotettu tab-navigaatio (tabBar display: none)
src/
  config/env.ts             ympäristömuuttujien luku ja validointi
  infrastructure/api/       client.ts (fetch + auth), endpoints.ts, error.ts
  providers/QueryProvider   React Query -asetukset
  features/<nimi>/          domain/ · infrastructure/ · presentation/{hooks,screens}
  shared/                   ui/ · styles/ · constants/ · hooks/ · navigation/ · utils/
  assets/
```

## Ehdottomat konventiot

- **Feature-rakenne on kolmikerroksinen.** `domain/types.ts` (tyypit) →
  `infrastructure/<nimi>Api.ts` (`apiRequest`-kutsut) → `presentation/hooks/`
  (React Query) → `presentation/screens/`. Näyttö ei kutsu `apiRequest`ia suoraan.
- **Kaikki HTTP kulkee `apiRequest`in läpi** (`src/infrastructure/api/client.ts`).
  Se hoitaa base-URLin, query-parametrit, timeoutin (30 s), Bearer-tokenin ja
  `ApiError`-heiton. Älä käytä `fetch`iä suoraan.
- **Polut `endpoints`-objektista**, ei merkkijonoina näyttökoodissa.
- **Importit `@/`-aliaksella** juuresta: `@/src/shared/...`.
- **Tyylit `src/shared/styles/`- ja `src/shared/constants/`-tiedostoista.**
  Ei värejä eikä välejä kovakoodattuna komponentteihin – käytä `colors`, `spacing`,
  `radii`, `typography` ja `components`/`dark`-tyylejä.
- **Näyttö kääritään `ScreenLayout`iin** – se tuo taustan, `AppHeader`in,
  lasikortin, varastosaldo- ja ilmoitusmodaalit.
- **Navigointi `routes`-objektin kautta** (`src/shared/navigation/routes.ts`),
  ei literaaleja polkuja.
- **Paino on grammoja (kokonaisluku)** kaikessa API-liikenteessä, kuten backendissä.
  Muunnos näytettävään muotoon `src/shared/utils/weight.ts`.

## Kun backend muuttuu

Rajapintamuutos backendin `routes/`-hakemistossa vaatii lähes aina päivityksen
vastaavan featuren `domain/types.ts`- ja `infrastructure/*Api.ts`-tiedostoihin.
TypeScript ei huomaa tätä – vastaukset tyypitetään käsin.
