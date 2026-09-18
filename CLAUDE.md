# Evaspoika – frontend (repon juuri)

Varsinainen sovellus on alihakemistossa **`Evaspoika/`** – siellä ovat
`package.json`, `app/`, `src/` sekä projektin oma `CLAUDE.md` ja
`.claude/skills/`-hakemisto. Aja komennot sieltä käsin:

```bash
cd Evaspoika
npm start
```

Tämä on Expo / React Native -tablettisovellus **lihajalostamon**
varastonhallintaan (makkarat ja hampurilaispihvit). Pari on erillinen
backend-repo `../evaspoika_backend/` (Node.js + Express + SQLite, ajossa
Raspberry Pi 5:llä).

Kokonaiskuvan saat lataamalla skillin **evaspoika-yleiskuva**
(`Evaspoika/.claude/skills/evaspoika-yleiskuva/`); frontendin rakenne on
skillissä **frontend-arkkitehtuuri**. Päivittäinen ohjeistus on tiedostossa
[Evaspoika/CLAUDE.md](Evaspoika/CLAUDE.md).

**Ennen kuin kosket tokeneihin, `.env`-tiedostoihin, `eas.json`:iin tai
Netvisorin tuotantotunnuksiin:** lue
[Evaspoika/docs/salaisuudet.md](Evaspoika/docs/salaisuudet.md). Viisi API-tokenia
oli julkisessa GitHub-repositoriossa 76 päivän ajan kesällä 2026 eikä rotaatiota
ole vielä tehty.
