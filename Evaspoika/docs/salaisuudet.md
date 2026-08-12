# Salaisuudet ja tokenit

Miten Evaspoika-frontend käsittelee tunnisteita, ja mitä on tehtävä **ennen kuin
Netvisorin oikeat tuotantotunnukset otetaan käyttöön**.

## Tapahtunut vuoto (2026-05-28 – 2026-08-12)

Viisi API-tokenia oli kovakoodattuna tiedostoissa `eas.json` (build-profiilien
`env`-lohkot) ja `app.json` (`extra.apiAdminToken`), ja ne olivat julkisessa
GitHub-repositoriossa 76 päivän ajan. Mukana oli **`API_ADMIN_TOKEN`**, jolla on
kaikki scopet.

`.gitignore` esti `.env.local`-tiedoston oikein — vuoto tapahtui
buildikonfiguraation kautta, jota ei mielletty salaisuudeksi.

Historia on kirjoitettu uudelleen (`git filter-repo`) ja force-pushattu
2026-08-12. **Tämä ei ole korjaus** — arvot ehtivät olla julkisia yli kaksi
kuukautta ja on oletettava, että ne on kopioitu. Ainoa korjaus on rotaatio.

## Kaksi eri asiaa, joita molempia kutsutaan "Netvisor-tokeneiksi"

| | Mikä | Missä | Vuoti? |
|---|---|---|---|
| `EXPO_PUBLIC_NETVISOR_*_TOKEN` | **Oma** backend-scope, joka päästää `/api/netvisor/*`-läpivientireiteille | frontend, bundlessa | kyllä |
| `NETVISOR_AVAIN`, `NETVISOR_KUMPPANIAVAIN`, `NETVISOR_KAYTTAJATUNNISTE`… | Netvisorin ISV-tunnukset | backend `.env` Pi:llä | ei |

Nämä sekoittuvat helposti. Ensimmäiset ovat itse generoituja ja voi vaihtaa
milloin tahansa ilman että Netvisoriin tarvitsee koskea. Jälkimmäiset tulevat
Netvisor-portaalista, eivätkä ne ole koskaan olleet frontendissä.

## Perussääntö: `EXPO_PUBLIC_*` ei ole koskaan salaisuus

Expo **inlinettaa** jokaisen `EXPO_PUBLIC_`-alkuisen arvon JavaScript-bundleen
käännösaikana. Se on dokumentoitu ominaisuus, ei bugi. Arvo on luettavissa
purkamalla APK — riippumatta siitä onko se `.env.local`-tiedostossa,
EAS-ympäristömuuttujassa vai kovakoodattuna.

Siksi:

- EAS-ympäristömuuttujiin siirtyminen poistaa arvot **repositoriosta**, ei
  **sovelluspaketista**. Se on oikea askel mutta ei riitä yksin.
- `--visibility secret` EAS:ssa ei muuta tätä `EXPO_PUBLIC_`-muuttujien osalta.
- Ainoa tapa pitää tunniste poissa asiakkaalta on olla lähettämättä sitä sinne.

## Ennen Netvisorin tuotantotunnusten käyttöönottoa

Nykyinen Netvisor-integraatio osoittaa testiympäristöön. Kun oikeat tunnukset
otetaan käyttöön, **niillä kirjoitetaan aitoon kirjanpitoon** — silloin nykyinen
malli ei enää kelpaa. Tee nämä ensin:

1. **Poista `netvisorWrite` asiakkaalta.**
   Frontend käyttää sitä neljässä kohdassa: `createOrder`, `createOrderLine`,
   `deleteOrderLine` ja `syncOrdersFromNetvisor` /
   `syncCustomersFromNetvisor` / `syncNetvisorProducts`. Tee backendiin reitit,
   jotka tekevät nämä palvelinpuolella, ja jätä sovellukseen vain lukuscope.
   Netvisorin XML-läpivienti (`postNetvisorXml` / `putNetvisorXml`) ei kuulu
   asiakkaalle lainkaan — sitä ei tällä hetkellä kutsu mikään.

2. **Lyhytikäiset laitekohtaiset tokenit staattisten sijaan.**
   Backendin `apiSecurity.js` ei tunne vanhenemista: token on voimassa kunnes se
   vaihdetaan käsin joka laitteelta. Laitekohtainen token tekee kadonneesta
   tabletista revokoinnin, ei kaikkien laitteiden uudelleenasennuksen.

3. **HTTPS päälle.**
   Backendissä HTTPS on toteutettu ja sertifikaatit ovat olemassa, mutta
   `USE_HTTPS` puuttuu systemd-yksiköstä, joten palvelin ajaa HTTP:llä. Lisää
   `Environment=USE_HTTPS=true`, vaihda frontendin base-URL `https://`-muotoon ja
   poista `usesCleartextTraffic` `app.json`:sta. Ilman tätä jokainen token
   kulkee lähiverkossa selväkielisenä.

4. **Erilliset tunnukset test- ja tuotanto-Netvisorille.**
   Älä käytä samaa backend-scopea molempiin. Jos tuotantotunnukset otetaan
   käyttöön samalla tokenilla jota on käytetty testiin, testivaiheen vuodot
   periytyvät tuotantoon.

## Rotaatio

Generointi (sama tapa kuin backendin `.env.example` ohjeistaa):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Järjestys on tärkeä — backend ensin, muuten tabletit lakkaavat toimimasta
väärässä järjestyksessä:

1. Pi: uudet arvot `evaspoika_backend/.env`-tiedostoon, `sudo systemctl restart evaspoika`
2. Frontend: `Evaspoika/.env.local` (neljä tokenia — **ei** `API_ADMIN_TOKEN`)
3. EAS: `eas env:create --environment production --name … --value …`
4. Uusi build ja asennus tableteille

`API_ADMIN_TOKEN` ei kuulu frontendiin missään tilanteessa. Se pääsee myös
`POST /api/netvisor/clear-sync-orders` -reitille, joka poistaa kaikki tilaukset
ja tilausrivit pysyvästi.

## Suojaukset repositoriossa

- `.gitignore` kattaa `.env*.local` ja `*.env`
- `.githooks/pre-commit` estää tunnisteen näköisten merkkijonojen commitoinnin.
  Ota käyttöön joka kloonissa kerran:

  ```bash
  git config core.hooksPath .githooks
  ```

- `eas.json` ei sisällä `env`-lohkoja. Build-aikaiset arvot tulevat EAS:n
  ympäristömuuttujista (`environment`-kenttä profiilissa).

## Jos vuoto toistuu

1. Rotatoi heti — historian siivoaminen ei palauta salaisuutta.
2. Kirjoita historia uudelleen (`git filter-repo --replace-text`) ja force-pushaa.
3. Pyydä GitHub Supportia poistamaan välimuistissa olevat objektit: force-push
   **ei** poista vanhoja committeja, ja ne ovat yhä haettavissa SHA:lla.
4. Tarkista `logs/`-hakemistosta backendistä, onko tokenilla tehty pyyntöjä
   joita ei osata selittää.
