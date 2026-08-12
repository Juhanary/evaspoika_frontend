---
name: evaspoika-yleiskuva
description: Evaspoika-järjestelmän kokonaiskuva - toimiala, tietomalli, molemmat projektit (frontend + backend), laitteisto ja tietovirrat. Lataa tämä aina uuden keskustelun alussa tai kun tarvitset kontekstia siitä mitä sovellus tekee, miten frontend ja backend liittyvät toisiinsa, mistä data tulee ja minne se menee.
---

# Evaspoika – järjestelmän yleiskuva

Kalanjalostamon (Evaspoika / Evasmiehet) varastonhallinta- ja tilausjärjestelmä.
Korvaa käsin tehdyn erä- ja painokirjanpidon ja automatisoi myyntitilausten
siirron Netvisor-taloushallintoon.

## Kaksi projektia

```
Evaspoika/
├── evaspoika_frontend/               git-repo
│   └── Evaspoika/                    Expo / React Native -sovellus (tabletti)
└── evaspoika_backend/                git-repo, Node.js + Express + SQLite
    └── ajossa Raspberry Pi 5:llä systemd-palveluna
```

Repot ovat erillisiä. Muutos rajapintaan koskee lähes aina molempia:
backendin `routes/` + frontendin `src/features/<feature>/infrastructure/*Api.ts`
ja `domain/types.ts`.

## Fyysinen kokoonpano

```
  ┌─────────────┐   USB    ┌──────────────────────┐
  │ Viivakoodi- │─────────>│  Raspberry Pi 5 B    │
  │ lukija      │          │  (ARM64, Linux)      │
  └─────────────┘          │                      │
                           │  evaspoika_backend   │
  ┌─────────────┐  HTTP    │  :3000  API (HTTPS)  │
  │ Vaaka       │─────────>│  :3080  vaaka (HTTP) │
  │ (verkossa)  │  XML     │  SQLite (WAL)        │
  └─────────────┘          └───────┬──────────────┘
                                   │ HTTP(S) lähiverkko
  ┌─────────────┐                  │            ┌──────────────┐
  │ Tabletti    │<─────────────────┘            │  Netvisor    │
  │ (frontend)  │                  └───────────>│  ISV API     │
  └─────────────┘                    XML/HTTPS  └──────────────┘
                                                        ▲
                                   Google Drive <───────┘ (päivittäinen
                                   (varmuuskopiot)         db-backup)
```

Tabletti ei koskaan puhu Netvisorille suoraan – kaikki kulkee backendin kautta
(`/api/netvisor/*`-läpivientireitit).

## Toimialan käsitteet

| Käsite | Backend-taulu | Selitys |
|---|---|---|
| **Tuote** (Product) | `PRODUCT` | Kalatuote. `netvisor_key` = Netvisorin tuoteavain, `product_code` = 1–99 vaa'an käyttämä lyhytkoodi |
| **Erä** (Batch) | `BATCH` | Yhden tuotteen yhden tuotantopäivän erä. Uniikki `(ProductId, production_date)`. `initial_weight` / `current_weight` grammoina |
| **Laatikko** (Box) | `BOX` | Yksittäinen punnittu laatikko erässä. `ean`, `weight`, `remaining_weight`, `status` (`in_stock`…) |
| **Eräloki** (BatchLog) | `BATCH_LOG` | Erän painomuutokset: `event_code`, `weight_change`, `total_weight` |
| **Asiakas** (Customer) | `CUSTOMER` | Synkronoidaan Netvisorista, `netvisor_code` linkittää |
| **Tilaus** (Order) | `ORDERS` | `netvisor_invoice_id`, `netvisor_status` (mm. `billed`, `archived`) |
| **Tilausrivi** (OrderLine) | `ORDER_LINE` | Viittaa erään ja laatikkoon (`box_id`) |

Suhteet: `Product 1─n Batch 1─n Box`, `Batch 1─n BatchLog`,
`Customer 1─n Order 1─n OrderLine`, `OrderLine n─1 Batch`.

**Soft delete kaikkialla:** rivejä ei poisteta, vaan `deleted_at` asetetaan.
Frontend saa listauksissa vain aktiiviset rivit.

**Kaikki painot ovat kokonaislukuja grammoina** koko putken läpi.

## Tietovirrat

**1. Punnitus (vaaka → varasto)**
Vaaka lähettää XML:n backendin porttiin 3080 → tuote tunnistetaan EAN-koodin
tuotekoodista → erä luodaan tai sen paino kasvaa → laatikko luodaan →
eräloki kirjautuu. Tabletti näkee tuloksen seuraavassa refetchissä.

**2. Netvisor → backend (ajastettu)**
Asiakkaat 5 min, tuotteet 10 min, tilaukset 5 min, tilausstatukset 5 min,
epäonnistuneiden uudelleenyritys 10 min.

**3. Backend → Netvisor**
Tilauksen luonti tabletilla → backend rakentaa myyntitilaus-XML:n → ISV API.
Epäonnistuneet jäävät jonoon ja yritetään uudelleen automaattisesti.

**4. Frontend → backend**
`apiRequest()` lisää Bearer-tokenin HTTP-metodin mukaan. React Query hoitaa
välimuistin (`staleTime` 10 s, `retry` 3, refetch kun appi palaa aktiiviseksi).

**5. Varmuuskopiot**
Backend kopioi SQLite-tiedoston päivittäin klo 20 ja lataa sen Google Driveen.

## Sovelluksen näytöt

| Reitti | Näyttö | Feature |
|---|---|---|
| `/` | koti / dashboard | `home` |
| `/orders` | tilauslista | `orders` |
| `/orders/new` | tilauksen luonti ja erien allokointi | `orders` |
| `/orders/[orderId]` | tilauksen tiedot | `orders` |
| `/inventory` | tuotelista / varasto | `products` |
| `/inventory/[productId]` | tuotteen erät | `batches` |
| `/inventory/batch/[batchId]` | erän tapahtumat | `batchEvents` |
| `/weighing` | punnitusnäkymä | `weighing` |
| `/logs` | loki | `logs` |
| `/more`, `/more/customers`, `/more/logs` | asetukset, asiakkaat | `more`, `customers` |

Tilausta luodessa erät voidaan allokoida käsin (valitse erät + painot) tai
automaattisesti (kokonaispaino jaetaan erille tuotantopäivän mukaan).

## Turvallisuusmalli

Backendissä viisi tokenia scopeineen: `API_READ_TOKEN` (`api:read`),
`API_WRITE_TOKEN` (`api:read`+`api:write`), `NETVISOR_READ_TOKEN`,
`NETVISOR_WRITE_TOKEN`, `API_ADMIN_TOKEN` (kaikki).

Frontend saa nämä `EXPO_PUBLIC_*`-muuttujina `.env.local`-tiedostosta ja valitsee
tokenin pyynnön mukaan (`resolveAuthToken` client.ts:ssä). Koska Expo paljastaa
`EXPO_PUBLIC_*`-arvot bundleen, ne **eivät ole salaisuuksia** – malli nojaa
siihen että laitteet ovat suljetussa lähiverkossa. Älä lisää `.env.local`-arvoja
git-historiaan äläkä laajenna tokenien käyttöä julkiseen verkkoon ilman
oikeaa autentikointia.
