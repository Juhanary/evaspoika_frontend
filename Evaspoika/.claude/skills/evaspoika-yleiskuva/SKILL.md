---
name: evaspoika-yleiskuva
description: Evaspoika-järjestelmän kokonaiskuva - toimiala, tietomalli, molemmat projektit (frontend + backend), laitteisto ja tietovirrat. Lataa tämä aina uuden keskustelun alussa tai kun tarvitset kontekstia siitä mitä sovellus tekee, miten frontend ja backend liittyvät toisiinsa, mistä data tulee ja minne se menee.
---

# Evaspoika – järjestelmän yleiskuva

**Lihajalostamon** (Evaspoika / Evasmiehet) varastonhallinta- ja tilausjärjestelmä.
Yritys valmistaa makkaroita ja hampurilaispihvejä. Järjestelmä korvaa käsin tehdyn
erä- ja painokirjanpidon ja automatisoi myyntitilausten siirron
Netvisor-taloushallintoon.

> Toimiala on **liha**, ei kala. Tämä skill väitti aiemmin toisin; jos näet
> koodissa tai dokumentissa "kalatuote", se on virhe eikä toinen tuotelinja.

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
ja `domain/types.ts`. TypeScript ei huomaa eroa – tyypit on kirjoitettu käsin.

## Fyysinen kokoonpano

```
  ┌─────────────┐   USB    ┌────────────────────────┐
  │ Viivakoodi- │─────────>│  Raspberry Pi 5 B      │
  │ lukija      │          │  (ARM64, Linux)        │
  └─────────────┘          │                        │
                           │  evaspoika_backend     │
  ┌─────────────┐   TCP    │  :3000  API            │
  │ Vaaka       │─────────>│  :3080  QuickSend TCP  │
  │ DPS800s     │   XML    │  :3082  vaaka-HTTP     │
  └─────────────┘          │  SQLite (WAL)          │
                           └───────────┬────────────┘
  ┌─────────────┐                      │ HTTP lähiverkko
  │ Tabletti    │<─────────────────────┘        ┌──────────────┐
  │ (frontend)  │                      └───────>│  Netvisor    │
  └─────────────┘            XML/HTTPS          │  ISV API     │
                                                └──────┬───────┘
                              Google Drive <───────────┘
                              (varmuuskopiot)
```

**Portit ovat tuotannossa eri kuin koodin oletukset.** Vaaka oli valmiiksi
konfiguroitu porttiin 3080, joten QuickSend-TCP-kuuntelija siirrettiin sinne ja
vaa'an HTTP-reitti väistyi porttiin 3082. Arvot ovat `evaspoika.service`-
tiedostossa (`SCALE_TCP_PORT=3080`, `HTTP_SCALE_PORT=3082`). Koodin oletukset
ovat 3081 ja 3080 – älä käytä niitä kun puhut tuotannosta.

Tabletti ei koskaan puhu Netvisorille suoraan – kaikki kulkee backendin kautta
(`/api/netvisor/*`-läpivientireitit).

## Toimialan käsitteet

| Käsite | Backend-taulu | Selitys |
|---|---|---|
| **Tuote** (Product) | `PRODUCT` | Lihatuote. `netvisor_key` = Netvisorin tuoteavain, `product_code` = 1–99 vaa'an käyttämä lyhytkoodi |
| **Erä** (Batch) | `BATCH` | Yhden tuotteen yhden tuotantopäivän erä. Uniikki `(ProductId, production_date)`. `initial_weight` / `current_weight` grammoina |
| **Laatikko** (Box) | `BOX` | Yksittäinen punnittu laatikko erässä. `ean`, `weight`, `remaining_weight`, `status`: `in_stock` → `sold` / `written_off` / `split`. `split_from_box_id` säilyttää jaon ketjun |
| **Eräloki** (BatchLog) | `BATCH_LOG` | Erän painomuutokset: `event_code`, `weight_change`, `total_weight` |
| **Asiakas** (Customer) | `CUSTOMER` | Synkronoidaan Netvisorista, `netvisor_code` linkittää |
| **Tilaus** (Order) | `ORDERS` | `netvisor_invoice_id`, `netvisor_status` (mm. `billed`, `archived`) |
| **Tilausrivi** (OrderLine) | `ORDER_LINE` | **Yksi erä = yksi rivi tilauksella** (uniikki-indeksi `unique_order_batch_active`). Saman erän laatikot kasvattavat rivin `sold_weight`ia |
| **Rivin laatikot** | `ORDER_LINE_BOX` | Liitostaulu: mitkä laatikot juuri tälle riville menivät. `ORDER_LINE.box_id` on vain ensimmäisen laatikon pikaviite – **jäljitys kulkee tämän taulun kautta** |

Suhteet: `Product 1─n Batch 1─n Box`, `Batch 1─n BatchLog`,
`Customer 1─n Order 1─n OrderLine`, `OrderLine n─1 Batch`,
`OrderLine n─n Box` (`ORDER_LINE_BOX`).

**Soft delete kaikkialla:** rivejä ei poisteta, vaan `deleted_at` asetetaan.
Frontend saa listauksissa vain aktiiviset rivit. Poikkeus: `SCALE_MESSAGE`
(vaa'an kuittausrekisteri) on teknistä kirjanpitoa ja vanhenee itsestään.

**Kaikki painot ovat kokonaislukuja grammoina** koko putken läpi.

## Tietovirrat

**1. Punnitus (vaaka → varasto)**
Vaaka avaa TCP-yhteyden backendin QuickSend-kuuntelijaan (tuotannossa :3080) ja
kirjoittaa XML:n. Tuote tunnistetaan EAN-koodin tuotekoodista → erä luodaan tai
sen paino kasvaa → laatikko luodaan → eräloki kirjautuu. Tabletti näkee tuloksen
seuraavassa refetchissä. **Kuittaukset ovat tässä asennuksessa pois päältä**,
joten epäonnistunutta punnitusta ei lähetetä uudelleen.

**2. Netvisor → backend (ajastettu)**
Asiakkaat 5 min, tuotteet 10 min, tilaukset 5 min, tilausstatukset 5 min,
epäonnistuneiden uudelleenyritys 10 min.

**3. Backend → Netvisor**
Tilauksen luonti tabletilla → backend rakentaa myyntitilaus-XML:n → ISV API.
Epäonnistuneet jäävät jonoon ja yritetään uudelleen automaattisesti.

**4. Frontend → backend**
`apiRequest()` lisää Bearer-tokenin HTTP-metodin mukaan. React Query hoitaa
välimuistin, ja se **kirjoitetaan levylle** (AsyncStorage): viimeksi haettu
tilanne näkyy myös varaston verkon ulkopuolella. Ks. `frontend-arkkitehtuuri`.

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
| `/weighing/split` | laatikon jakaminen | `boxes` |
| `/logs` | loki, sis. jäljitysvälilehdet | `logs` + `trace` |
| `/more/customers`, `/more/logs` | asiakkaat, asiakaskohtainen loki | `customers`, `logs` |

`/more`-juurinäkymä on poistettu (`MoreScreen` ja `routes.more` eivät ole enää
olemassa); alisivuille navigoidaan suoraan. Tilausta luodessa erät voidaan
allokoida käsin tai automaattisesti tuotantopäivän mukaan.

## Turvallisuusmalli

Backendissä viisi tokenia scopeineen: `API_READ_TOKEN` (`api:read`),
`API_WRITE_TOKEN` (`api:read`+`api:write`), `NETVISOR_READ_TOKEN`,
`NETVISOR_WRITE_TOKEN`, `API_ADMIN_TOKEN` (kaikki).

Frontend saa nämä `EXPO_PUBLIC_*`-muuttujina `.env.local`-tiedostosta ja valitsee
tokenin pyynnön mukaan (`resolveAuthToken` client.ts:ssä). Koska Expo paljastaa
`EXPO_PUBLIC_*`-arvot bundleen, ne **eivät ole salaisuuksia** – malli nojaa
siihen että laitteet ovat suljetussa lähiverkossa.

> **Avoin asia:** viisi tokenia, `API_ADMIN_TOKEN` mukaan lukien, oli julkisessa
> GitHub-repositoriossa 2026-05-28 – 2026-08-12. Historia on kirjoitettu
> uudelleen, mutta **rotaatiota ei ole tehty**. Lue `docs/salaisuudet.md` ennen
> kuin kosket tokeneihin, tunnuksiin tai Netvisorin tuotantoympäristöön. Älä
> laajenna tokenien käyttöä julkiseen verkkoon ilman oikeaa autentikointia.
