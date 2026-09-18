---
name: frontend-arkkitehtuuri
description: Evaspoika-frontendin rakenne ja koodikonventiot - feature-kerrokset (domain/infrastructure/presentation), API-client ja tokenit, React Query -hookit, levylle tallennettu välimuisti ja yhteystila, expo-router-navigointi, laatikon jaon luonnos, jaetut UI-komponentit ja tyylit. Lataa tämä kun lisäät tai muutat näyttöjä, hookkeja, API-kutsuja tai UI-komponentteja Expo-sovelluksessa.
---

# Frontend – arkkitehtuuri ja konventiot

Expo SDK 54, React Native 0.81, React 19, expo-router 6, TanStack Query 5,
TypeScript strict. Ei testejä. `npm run lint` (eslint-config-expo) on ainoa
automaattinen tarkistus.

Kokeelliset asetukset päällä `app.json`:ssa: `typedRoutes`, `reactCompiler`.
Sovellus on **lukittu pystyasentoon** (`app/_layout.tsx`).

## Kerrosmalli

`app/` sisältää **vain reitityksen**. Jokainen tiedosto on ohut kääre:

```tsx
// app/(tabs)/weighing/index.tsx
import WeighingScreen from '@/src/features/weighing/presentation/screens/WeighingScreen';
export default WeighingScreen;
```

Kaikki logiikka on `src/features/<nimi>/` alla:

```
src/features/orders/
  domain/types.ts                    TypeScript-tyypit (käsin kirjoitetut)
  infrastructure/ordersApi.ts        apiRequest-kutsut, palauttaa domain-tyyppejä
  presentation/hooks/useOrders.ts    React Query -hookit
  presentation/screens/*.tsx         näytöt
  presentation/components/*.tsx      näytön osat, kun näyttö kasvaa liian isoksi
```

**Näyttö ei kutsu `apiRequest`ia eikä `fetch`iä.** Se käyttää hookia, hook kutsuu
infrastructure-funktiota, joka kutsuu `apiRequest`ia.

Nykyiset featuret: `batchEvents`, `batches`, `boxes`, `customers`, `home`,
`invoices`, `logs`, `netvisor`, `orderLines`, `orders`, `products`, `trace`,
`weighing`.

Kaikilla ei ole kaikkia kerroksia, ja se on kunnossa:

- `trace` on API + tyypit + hookit **ilman omaa näyttöä** – sen käyttöliittymä on
  `logs`-featuren välilehdissä `CodeTraceTab.tsx` ja `CustomerTraceTab.tsx`.
  Älä "korjaa" tätä puuttuvaksi näytöksi.
- `home` on käytännössä pelkkä näyttö.
- `presentation/components/` on käytössä toistaiseksi vain `logs`- ja
  `batches`-featureissa.

## API-kerros

### `src/infrastructure/api/client.ts`

`apiRequest<T>(path, options)` hoitaa kaiken:

- base-URL `API_BASE_URL`, query-parametrit `options.query`
  (taulukot pilkulla, boolean → `1`/`0`, `null`/`undefined` jätetään pois)
- 30 s timeout `AbortController`illa, kutsujan `signal` yhdistetään
- `Accept: application/json`, `Content-Type` automaattisesti bodylle
- Bearer-token scopen mukaan
- `204` → `undefined`, ei-ok → `throw new ApiError(status, payload)`
- konsolilokit `[API] -->` / `OK` / `ERR` / `FAIL`

Token valitaan `options.auth`illa: `'apiRead' | 'apiWrite' | 'netvisorRead' |
'netvisorWrite' | false | { token }`. Ilman sitä oletus tulee metodista:
GET/HEAD → `apiRead`, muut → `apiWrite`. Backendin `/orders`- ja
`/order-lines`-kirjoitukset vaativat `netvisor:write`-scopen, joten se on
annettava eksplisiittisesti – muuten vastaus on 403.

### `endpoints.ts`

Kaikki polut yhdessä objektissa: `products`, `customers`, `batches`,
`batchEvents`, `orders`, `orderLines`, `users`, `netvisor`, `weighing`, `boxes`,
`trace`. Alipolut rakennetaan template-literaalilla: `` `${endpoints.orders}/${id}` ``.

### Netvisor-läpivienti

`src/features/netvisor/infrastructure/netvisorApi.ts` tarjoaa
`fetchNetvisorResource`, `postNetvisorXml`, `putNetvisorXml`. Nämä käyttävät
`netvisorRead`/`netvisorWrite`-scopea ja osuvat backendin `/api/netvisor/*`
-reitteihin.

### `src/config/env.ts`

`API_BASE_URL` on pakollinen (`requireEnv` heittää jos puuttuu) ja siitä
poistetaan lopun kauttaviivat. Tokenit ovat valinnaisia (`optionalEnv`).
Arvot tulevat `.env.local`-tiedostosta `EXPO_PUBLIC_*`-nimillä.

> `app.json`:n `extra.apiBaseUrl` on **kuollutta konfiguraatiota**. Mikään koodi
> ei lue sitä – `expo-constants`ia ei importoida missään. Älä päivitä sitä äläkä
> "pidä sitä synkassa": se vain näyttää korjatulta. Osoite muutetaan yksinomaan
> `.env.local`-tiedoston `EXPO_PUBLIC_API_BASE_URL`-muuttujasta.

## React Query

`src/providers/QueryProvider.tsx`:

- `retry: shouldRetry` – enintään 3 yritystä, **eikä yhtään 4xx-vastaukselle**.
  Väärä token tai uudelleennimetty reitti ei siis moninkertaistu, vaan virhe
  näkyy heti.
- `retryDelay` eksponentiaalinen backoff (max 15 s), `staleTime: 10_000`,
  `refetchOnWindowFocus: true`, `gcTime: 7 vrk`.
- `focusManager` on kytketty React Nativen `AppState`iin.

### Välimuisti levyllä

`PersistQueryClientProvider` + `createAsyncStoragePersister`
(avain `EVASPOIKA_QUERY_CACHE`, `maxAge` 7 vrk, `throttleTime` 2 s).
Tallennettavat kyselyt rajataan: `shouldDehydrateQuery` päästää läpi vain
onnistuneet kyselyt joiden avain kelpaa `isBackendQueryKey`ille.

`src/shared/constants/queryKeys.ts` on tämä rajaus:

```ts
export const BACKEND_QUERY_KEYS = ['orders','orderLines','products','batches','customers','boxes'];
```

**Sääntö:** jos lisäät uuden backend-resurssin jonka on näyttävä myös verkon
ulkopuolella, lisää sen avain tänne. Jos lisäät kyselyn joka lukee **vain
laitteelta** (kuten `splitDraft`), **älä** lisää sitä – muuten se näyttäisi
onnistuvan katkon aikana ja yhteyspalkki valehtelisi. `batchEvents` ja
`netvisor` on jätetty tarkoituksella pois (`batchEvents` haetaan limitillä 9999
ja täyttäisi AsyncStoragen).

### Yhteystila

`src/shared/hooks/useSyncStatus.ts` päättelee yhteyden **kyselyiden omasta
tuloksesta**, ei NetInfosta – varaston wifissä voi olla yhteys vaikka Pi on
tavoittamattomissa. Katko julistetaan vasta kun yksikään backend-kysely ei ole
onnistunut kolmeen minuuttiin (`OFFLINE_GRACE_MS`); sen jälkeen taustalla
yritetään uudelleen 20 s välein. `ScreenLayout` näyttää tuloksena
offline-palkin ja datan kellonajan.

### Hook-konventio

Nimi `use<Resurssi>`, `queryKey` taulukkona resurssista tarkentuen, `enabled`
puuttuvalle parametrille:

```ts
export function useOrder(orderId?: number) {
  return useQuery({
    queryKey: ['orders', orderId ?? null],
    queryFn: () => fetchOrder(orderId as number),
    enabled: typeof orderId === 'number',
  });
}
```

Netvisor-kyselyt käyttävät prefiksiä `['netvisor', ...]`.

`useRefreshAll()` antaa `refreshing`, `onRefresh` (pull-to-refresh, invalidoi
kaikki) ja `withRefresh(fn)` (suorittaa operaation ja refetchaa).

## Navigointi

Kaikki polut `src/shared/navigation/routes.ts`:stä, ei literaaleja:

```ts
router.push(routes.orderDetail(order.id));
router.push(routes.splitBox);
```

Tab-navigaatio on **piilotettu** (`tabBarStyle: { display: 'none' }`) – se toimii
vain reittiryhmittelynä. `goBackOrHome()` palaa takaisin tai kotiin jos historiaa
ei ole; `params.ts` täydentää. `/more`-juurireittiä ei ole enää olemassa,
alisivuille (`moreCustomers`, `moreLogs`) navigoidaan suoraan.

## UI ja tyylit

Näyttö kääritään `ScreenLayout`iin:

```tsx
<ScreenLayout title="Tilaukset" leftAction="back" headerSearch={{ value, onChangeText }}>
```

Se tuo taustakuvan, `AppHeader`in, `GlassCard`-kortin (`wrapInCard`, oletus
`true`), hakukentän, ilmoitus- ja varastosaldomodaalit sekä **kaksi palkkia**:
offline-palkin (`useSyncStatus`) ja kesken olevan laatikkojaon muistutuksen
(`useSplitDraft`). Molemmat näkyvät siis joka näytöllä automaattisesti – älä
toteuta niitä uudelleen näytöissä.

Jaetut komponentit `src/shared/ui/`: `AppHeader`, `AppModal`, `Button`
(sisältää `ActionButton.tsx`), `EmptyState`, `ErrorBoundary`, `GlassCard`,
`GlassModal`, `InventorySummaryModal`, `NotificationsModal`, `ProductList`,
`ScreenLayout`, `SearchInput`, `SelectableSearchList`.
`ScreenCloseButton/` on tyhjä hakemisto – komponentti on siirretty
`_to_delete/`-hakemistoon, älä importoi sitä.

Design-tokenit `src/shared/constants/`: `colors.ts`, `spacing.ts`
(`xs 4, sm 8, md 12, lg 16, xl 24, xxl 32`), `radii.ts`, `typography.ts`.
`queryKeys.ts` on samassa hakemistossa mutta ei ole tyyliasia.

Tyylit `src/shared/styles/`: `components.ts` on tyylitehdas (`base`,
`button({ variant, size, disabled })`, valmiit `components`- ja `dark`-oliot),
`styleFactory.ts` sen apuri, ja näyttökohtaiset `batches.ts`, `boxSplit.ts`,
`errorBoundary.ts`, `glassModal.ts`, `home.ts`, `layout.ts`, `logs.ts`,
`orders.ts`, `products.ts`, `scale.ts`, `screen.ts`.

**Älä kovakoodaa värejä, välejä tai fonttikokoja komponentteihin.**

Fontti on Montserrat (`@expo-google-fonts/montserrat`), ladataan
`app/_layout.tsx`:ssä ennen splashin piilotusta.

## Laatikon jakaminen (frontendin puoli)

`src/features/boxes/` toteuttaa ohjatun jaon, koska vaaka ei tiedä olemassa
olevista laatikoista: purettu laatikko kahdentaisi sekä painon että
laatikkomäärän.

- `domain/splitDraft.ts` – luonnos AsyncStoragessa (`@evaspoika_split_draft_v1`),
  `splitBalance()` laskee täsmääkö osien summa.
- `presentation/hooks/useSplitDraft.ts` – luonnos react-queryn välimuistissa ja
  levyllä yhtä aikaa, avain `['splitDraft']`. **Ei** `BACKEND_QUERY_KEYS`:issä.
- `presentation/hooks/useNewBoxes.ts` – pollaa `GET /boxes/recent` 3 s välein ja
  poimii vaa'alta tulleet laatikot jaon osiksi. Avain on `['boxesRecent', …]` eikä
  `['boxes', …]`: `BACKEND_QUERY_KEYS`-listalla oleva avain kirjoitettaisiin
  AsyncStorageen parin sekunnin välein koko jaon ajan.
  **Pollaus ja poiminta ovat `scaleConfirmed`in takana.** Ennen kuittausta vaa'alta
  tuleva laatikko on jonkun muun punnitsema, ja backendin `boxSplitter` päästäisi sen
  läpi (sama tuote, punnittu jaon alkamisen jälkeen, hyllyssä, ei tilauksella).
- `presentation/screens/SplitBoxScreen.tsx` – nelivaiheinen polku: skannaa vanha
  tarra → kuittaa erän vaihto vaa'alle → punnitse osat → tallenna.

> `SPLIT_WEIGHT_TOLERANCE = 200` on kirjoitettu **kahteen kertaan**: tänne ja
> backendin `services/boxSplitter.js`:ään, jossa se on ympäristömuuttuja
> (`SPLIT_WEIGHT_TOLERANCE`, oletus 200). Jos muutat toista, muuta toinenkin –
> muuten näyttö näyttää painojen täsmäävän ja tallennus kaatuu 400:aan.

## Painot ja muotoilu

`src/shared/utils/weight.ts` – kaikki API-painot ovat **grammoja**:
`kgToGrams`, `parseWeightToGrams` (hyväksyy pilkun), `formatKg`, `formatKgLabel`,
`parseGramsToBoxes`, `MIN_REMAINING_GRAMS = 500`.
Muut apurit: `date.ts`, `inventory.ts` (`buildInventorySummary`,
`needsBoxCountFallback`), `orderSummary.ts`.

## Uuden featuren lisääminen

1. `domain/types.ts` – tyypit
2. `infrastructure/<nimi>Api.ts` – `apiRequest`-kutsut, polku `endpoints`iin
3. `presentation/hooks/use<Nimi>.ts` – React Query
4. `presentation/screens/<Nimi>Screen.tsx` – `ScreenLayout` sisällä
5. `app/(tabs)/...` – ohut re-export
6. `src/shared/navigation/routes.ts` – reitti
7. jos näkymän on toimittava verkon ulkopuolella: avain `queryKeys.ts`:ään

## Sudenkuopat

- **Tyypit eivät ole generoituja.** Backendin vastauksen muutos ei aiheuta
  käännösvirhettä – tarkista `domain/types.ts` käsin kun backend muuttuu.
- **`app.json`:n `extra.apiBaseUrl` on kuollutta konfiguraatiota** (ks. yllä).
- **HTTP lähiverkossa** vaatii Androidilla `usesCleartextTraffic: true`
  (on jo `app.json`:ssa). Jos backend siirtyy HTTPS:ään itse allekirjoitetulla
  sertifikaatilla, laitteen on luotettava siihen.
- **Backendin rate limit** on 120 pyyntöä/min API:lle ja 30/min Netvisorille –
  vältä hookkeja jotka pollaavat tiheästi. Jaon 3 s pollaus on rajattu
  jakonäytölle eikä ole päällä muualla.
- `ErrorBoundary` nappaa renderöintivirheet, mutta `ApiError`it on käsiteltävä
  hookin tai näytön tasolla.
- `_to_delete/` juuressa sisältää kuollutta koodia (mm. `serializers.ts`,
  `closeCurrentScreen.ts`). Älä lue sitä elävänä koodina.
