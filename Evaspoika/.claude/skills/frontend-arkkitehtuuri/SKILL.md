---
name: frontend-arkkitehtuuri
description: Evaspoika-frontendin rakenne ja koodikonventiot - feature-kerrokset (domain/infrastructure/presentation), API-client ja tokenit, React Query -hookit ja queryKeyt, expo-router-navigointi, jaetut UI-komponentit ja tyylit. Lataa tämä kun lisäät tai muutat näyttöjä, hookkeja, API-kutsuja tai UI-komponentteja Expo-sovelluksessa.
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

Kaikki logiikka on `src/features/<nimi>/` alla neljässä kerroksessa:

```
src/features/orders/
  domain/types.ts                    TypeScript-tyypit (käsin kirjoitetut)
  infrastructure/ordersApi.ts        apiRequest-kutsut, palauttaa domain-tyyppejä
  presentation/hooks/useOrders.ts    React Query -hookit
  presentation/screens/*.tsx         näytöt
```

**Näyttö ei kutsu `apiRequest`ia eikä `fetch`iä.** Se käyttää hookia, hook kutsuu
infrastructure-funktiota, joka kutsuu `apiRequest`ia.

Nykyiset featuret: `batchEvents`, `batches`, `boxes`, `customers`, `home`,
`invoices`, `logs`, `more`, `netvisor`, `orderLines`, `orders`, `products`,
`settings`, `weighing`. Kaikilla ei ole kaikkia kerroksia – `boxes` on pelkkä
API-tiedosto, `home` pelkkä näyttö.

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
GET/HEAD → `apiRead`, muut → `apiWrite`. Read-scope putoaa takaisin
write-tokeniin jos read puuttuu.

```ts
export function fetchOrders() {
  return apiRequest<Order[]>(endpoints.orders);
}

export function createOrder(input: CreateOrderInput) {
  return apiRequest<Order>(endpoints.orders, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
```

### `endpoints.ts`

Kaikki polut yhdessä objektissa (`products`, `customers`, `batches`,
`batchEvents`, `orders`, `orderLines`, `users`, `netvisor`, `weighing`, `boxes`).
Alipolut rakennetaan template-literaalilla: `` `${endpoints.orders}/${id}` ``.

### Netvisor-läpivienti

`src/features/netvisor/infrastructure/netvisorApi.ts` tarjoaa
`fetchNetvisorResource`, `postNetvisorXml`, `putNetvisorXml`. Nämä käyttävät
`netvisorRead`/`netvisorWrite`-scopea ja osuvat backendin `/api/netvisor/*`
-reitteihin. Osa tuoteoperaatioista lähettää **XML:ää merkkijonona** –
backend välittää sen Netvisorille sellaisenaan.

### `src/config/env.ts`

`API_BASE_URL` on pakollinen (`requireEnv` heittää jos puuttuu) ja siitä
poistetaan lopun kauttaviivat. Tokenit ovat valinnaisia (`optionalEnv`).
Arvot tulevat `.env.local`-tiedostosta `EXPO_PUBLIC_*`-nimillä.
`app.json`:n `extra.apiBaseUrl` on erillinen, vanhempi kopio samasta osoitteesta –
pidä ne synkassa jos muutat Pi:n IP:tä.

## React Query

`src/providers/QueryProvider.tsx`: `retry: 3`, eksponentiaalinen backoff
(max 15 s), `staleTime: 10_000`, `refetchOnWindowFocus: true`.
`focusManager` on kytketty React Nativen `AppState`iin, joten data päivittyy
kun appi palaa taustalta.

Hook-konventio – nimi `use<Resurssi>`, `queryKey` taulukkona resurssista
tarkentuen, `enabled` puuttuvalle parametrille:

```ts
export function useOrders() {
  return useQuery({ queryKey: ['orders'], queryFn: fetchOrders });
}

export function useOrder(orderId?: number) {
  return useQuery({
    queryKey: ['orders', orderId ?? null],
    queryFn: () => fetchOrder(orderId as number),
    enabled: typeof orderId === 'number',
  });
}
```

Netvisor-kyselyt käyttävät prefiksiä `['netvisor', ...]`.

`useRefreshAll()` (`src/shared/hooks/`) antaa `refreshing`, `onRefresh`
(pull-to-refresh, invalidoi kaikki) ja `withRefresh(fn)` (suorittaa operaation ja
refetchaa – yksi latausindikaattori molemmille).

## Navigointi

Kaikki polut `src/shared/navigation/routes.ts`:stä, ei literaaleja:

```ts
router.navigate(routes.home);
router.push(routes.orderDetail(order.id));
router.push(routes.inventoryBatch(batch.id, batch.batch_number));
```

Tab-navigaatio on **piilotettu** (`tabBarStyle: { display: 'none' }`) – se toimii
vain reittiryhmittelynä. Navigointi tapahtuu näyttöjen sisäisistä painikkeista.

`goBackOrHome()` palaa takaisin tai kotiin jos historiaa ei ole.
`closeCurrentScreen.ts` ja `params.ts` täydentävät.

## UI ja tyylit

Näyttö kääritään `ScreenLayout`iin:

```tsx
<ScreenLayout title="Tilaukset" leftAction="back" headerSearch={{ value, onChangeText }}>
  {...}
</ScreenLayout>
```

Se tuo taustakuvan, `AppHeader`in koti-/takaisin-painikkeineen, `GlassCard`-kortin
(`wrapInCard`, oletus `true`), hakukentän sekä oikean yläkulman
ilmoitus- ja varastosaldomodaalit. Propsit: `title`, `leftAction`
(`'home' | 'back' | 'none'`), `onBack`, `rightActions`, `headerSearch`,
`showInventoryAction`, `wrapInCard`, `cardStyle`.

Jaetut komponentit `src/shared/ui/`: `AppHeader`, `AppModal`, `GlassCard`,
`GlassModal`, `ActionButton`, `SearchInput`, `SelectableSearchList`,
`ProductList`, `ScreenCloseButton`, `InventorySummaryModal`,
`NotificationsModal`, `ErrorBoundary`.

Design-tokenit `src/shared/constants/`:

| Tiedosto | Sisältö |
|---|---|
| `colors.ts` | koko paletti, ml. `dark*`-teemavärit ja tila-värit |
| `spacing.ts` | `xs 4, sm 8, md 12, lg 16, xl 24, xxl 32` |
| `radii.ts` | pyöristykset |
| `typography.ts` | `sizes` (xs–5xl) ja `weights` |

`src/shared/styles/components.ts` on tyylitehdas: `base` (row, center, flex1,
card), `button({ variant, size, disabled })`, sekä valmiit `components`- ja
`dark`-tyyliobjektit. Näyttökohtaiset tyylit `home.ts`, `orders.ts`, `logs.ts`,
`glassModal.ts`.

**Älä kovakoodaa värejä, välejä tai fonttikokoja komponentteihin** – lisää tarvittaessa
uusi token tai tyyli näihin tiedostoihin.

Fontti on Montserrat (`@expo-google-fonts/montserrat`), ladataan
`app/_layout.tsx`:ssä ennen splashin piilotusta.

## Painot ja muotoilu

`src/shared/utils/weight.ts` – kaikki API-painot ovat **grammoja**:

- `kgToGrams(kg)`, `parseWeightToGrams(str)` (hyväksyy pilkun desimaalierottimena)
- `formatKg(grams)` → näytettävä kilomerkkijono
- `parseGramsToBoxes(grams, boxSize)`
- `MIN_REMAINING_GRAMS = 500`

Muut apurit: `date.ts`, `inventory.ts` (`buildInventorySummary`),
`orderSummary.ts`.

## Uuden featuren lisääminen

1. `src/features/<nimi>/domain/types.ts` – tyypit
2. `src/features/<nimi>/infrastructure/<nimi>Api.ts` – `apiRequest`-kutsut,
   polku `endpoints`iin jos uusi resurssi
3. `src/features/<nimi>/presentation/hooks/use<Nimi>.ts` – React Query
4. `src/features/<nimi>/presentation/screens/<Nimi>Screen.tsx` – `ScreenLayout` sisällä
5. `app/(tabs)/...` – ohut re-export
6. `src/shared/navigation/routes.ts` – reitti

## Sudenkuopat

- **Tyypit eivät ole generoituja.** Backendin vastauksen muutos ei aiheuta
  käännösvirhettä – tarkista `domain/types.ts` käsin kun backend muuttuu.
- **`app.json`:n `extra.apiBaseUrl` ja `.env.local`:n `EXPO_PUBLIC_API_BASE_URL`
  ovat kaksi eri paikkaa.** Koodi lukee jälkimmäisen.
- **HTTP lähiverkossa** vaatii Androidilla `usesCleartextTraffic: true`
  (on jo `app.json`:ssa). Jos backend siirtyy HTTPS:ään itse allekirjoitetulla
  sertifikaatilla, laitteen on luotettava siihen.
- **Backendin rate limit** on 120 pyyntöä/min API:lle ja 30/min Netvisorille –
  vältä hookkeja jotka pollaavat tiheästi.
- `ErrorBoundary` nappaa renderöintivirheet, mutta `ApiError`it on käsiteltävä
  hookin tai näytön tasolla.
