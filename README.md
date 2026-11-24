# AI Meal Planner – Frontend

[![Frontend CI](https://github.com/HH-DarkMode/Meal-Planner-Frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/HH-DarkMode/Meal-Planner-Frontend/actions/workflows/ci.yml)

## Tärkeimmät ominaisuudet

Käyttäjä voi esimerkiksi:

* rekisteröityä ja kirjautua sovellukseen
* määrittää päivittäisen kalorimääränsä
* määrittää proteiini-, hiilihydraatti- ja rasvatavoitteensa
* määrittää ruokavalioon liittyviä rajoitteita
* ilmoittaa kotona olevia raaka-aineita
* hakea elintarvikkeita
* luoda tekoälyn avulla reseptejä
* muodostaa yhden tai useamman päivän meal planin
* tarkastella aterioiden ravintoarvoja
* vaihtaa yksittäisen aterian uuteen
* tarkastella reseptien valmistusohjeita
* muodostaa ostoslistan viikon meal planin perusteella

## Käyttöliittymä

Sovelluksen alustava käyttöliittymä sisältää esimerkiksi:

### Dashboard

Käyttäjä näkee päivän ateriat sekä ravitsemustavoitteiden etenemisen.

### Meal Planner

Viikko- tai kalenterinäkymä, josta käyttäjä voi tarkastella ja muokata viikon aterioita.

### Recipe

Reseptin nimi, ainesosat, valmistusohjeet sekä ravintoarvot.

### Shopping List

Automaattisesti meal planin perusteella muodostettu ostoslista.

## Ravintotavoitteiden laskenta

Profiilisivu laskee käyttäjän tiedoista arvion päivittäisistä tavoitteista
([src/Profile.tsx](src/Profile.tsx)). Arvoja voi muokata käsin ennen tallennusta.

1. **Perusaineenvaihdunta** Mifflin-St Jeorin kaavalla ilman ikätermiä, koska
   ikää ei kysytä: 10 × paino (kg) + 6,25 × pituus (cm) + 5 (mies) tai − 161 (nainen).
2. **Kalorit** = perusaineenvaihdunta × 1,4 (aktiivisuuskerroin) × tavoitteen
   kerroin, pyöristettynä 50 kcal:n tarkkuuteen.

   | Tavoite | Kerroin |
   |---|---|
   | Aggressive bulk | 1,2 |
   | Bulk | 1,1 |
   | Healthy diet | 1,0 |
   | Cut | 0,85 |
   | Aggressive cut | 0,75 |

3. **Proteiini** 2,0 g painokiloa kohden. Bulk ja aggressive bulk 1,8 g/kg.
   High protein -ruokavalio 2,2 g/kg tavoitteesta riippumatta.
4. **Rasva** 0,8 g/kg.
5. **Hiilihydraatit** saavat loput kalorit (proteiini ja hiilihydraatit 4 kcal/g, rasva 9 kcal/g).
6. **Low carb** rajaa hiilihydraatit enintään 20 %:iin kaloreista. Silloin rasva
   saa loput kalorit.

Esimerkiksi 70 kg, 180 cm, mies, aggressive bulk ja low carb:
3050 kcal, proteiini 126 g, hiilihydraatit 153 g, rasva 215 g.

Kun painoa, pituutta, sukupuolta, tavoitetta, low carbia tai high proteinia
muutetaan, tavoitteet lasketaan uudelleen ja käsin syötetyt arvot korvautuvat.
Muut ruokavaliot (esim. vegan) eivät vaikuta tavoitteisiin.

Ruokavaliot vaikuttavat myös reseptiehdotuksiin. Backend ehdottaa low carb
-käyttäjälle vain reseptejä, joissa hiilihydraateista tulee enintään 20 %
energiasta, ja high protein -käyttäjälle reseptejä, joissa proteiinista tulee
vähintään 25 % energiasta.

## Toteutusteknologiat

Frontendin alustavasti suunnitellut teknologiat ovat:

* **React**
* **TypeScript**
* **Vite** tai **Next.js**
* **Tailwind CSS**
* REST API
* mahdollisesti Axios tai Fetch API backend-kommunikaatioon

Teknologiat voivat muuttua projektin edetessä.

## Testit

Frontendin Vitest-testit kattavat API-apufunktioita, ja Playwrightin E2E-testi
varmistaa kirjautumisen sekä profiilin avaamisen selaimessa. Komennot:

```powershell
npm test
npm run test:e2e
```

Molempien testitasojen ajaminen on määritetty myös GitHub Actions
CI-workflow'hun push- ja pull request -tapahtumille `main`-haaraan.

## Backend-autentikointi

Kirjautuminen ja rekisteröityminen palauttavat käyttäjänimen ja JWT-tokenin.
Frontend tallentaa tokenin selaimen paikalliseen tallennustilaan ja liittää sen
suojattuihin backend-pyyntöihin otsakkeella
`Authorization: Bearer <token>`. Pyyntöihin sisältyvät myös evästeet, joten
backendin aiempaan HttpOnly-evästeautentikointiin perustuva toiminta säilyy.


## Tiimi

* **ghostinth3w1re95-cyber** — [GitHub-profiili](https://github.com/ghostinth3w1re95-cyber)
* **SamuelFizumSemere** — [GitHub-profiili](https://github.com/SamuelFizumSemere)
* **tanjavatka** — [GitHub-profiili](https://github.com/tanjavatka)
* **cofitabs** — [GitHub-profiili](https://github.com/cofitabs)


## Projektin tila

Projekti on tällä hetkellä suunnitteluvaiheessa. Projektin edetessä README-tiedostoa tullaan päivittämään vastaamaan toteutettua sovellusta ja käytettyjä teknologioita.

## Projektin julkaisu linkki
[AI-Meal-Planner](https://ai-meal-planner-darkmode.onrender.com/)

## Lisenssi

Tämä projekti on lisensoitu GNU General Public License v3.0 -lisenssillä.

Lisätietoja lisenssin ehdoista löytyy [LICENSE](LICENSE)-tiedostosta.
