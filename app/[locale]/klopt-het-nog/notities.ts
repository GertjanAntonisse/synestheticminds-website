// Inhoud van de Klopt het nog?-notities, per slug. Eén bron voor zowel de
// publieke pagina als (later) de e-mail. Nieuwe editie = nieuw item hier.

export interface Notitie {
  slug: string;
  /** Weergavedatum, bv. "9 juni 2026". */
  date: string;
  /** Titel als vraag, zonder het "Klopt het nog? "-voorvoegsel. */
  title: string;
  /** Cursieve reeks-intro. */
  intro: string;
  /** De alinea's van de body, zonder titel/intro/afsluiter. */
  paragraphs: string[];
  /** De slotzin(nen) na het vette "Klopt het nog?". */
  closer: string;
  /** Bronnen, als HTML (sta <em> toe voor titels). */
  bronnenHtml: string;
  /** Publieke URL van de tekst-visual (ook de Open Graph-afbeelding). */
  visualUrl: string;
  /** Korte teaser, gebruikt als deel-omschrijving (og:description). */
  ogDescription: string;
}

export const notities: Record<string, Notitie> = {
  'lost-een-beter-model-het-op': {
    slug: 'lost-een-beter-model-het-op',
    date: '9 juni 2026',
    title: 'Lost een beter AI-model de onbetrouwbaarheid op?',
    intro:
      'Een notitie uit de reeks. Ik leg een veelgehoorde aanname naast de werkelijkheid en kijk of ze nog klopt.',
    paragraphs: [
      'Je hoort het vaak: AI is nu nog wat wisselvallig, maar de volgende generatie modellen lost dat op. Even wachten op iets groters, dan komt de betrouwbaarheid vanzelf. Anthropic, het bedrijf achter het AI-model Claude, zet daar in een recent onderzoek een nuchter beeld tegenover. Opvallend genoeg laat het zijn eigen model zien op het moment dat het tekortschiet.',
      'De onderzoekers stelden een AI-systeem drie keer exact dezelfde vraag: haal alle bekende genetische varianten van een ebolavirus op. Het juiste antwoord was 266. De drie pogingen leverden 106, 15 en 5 op. Dezelfde vraag, hetzelfde model, drie keer een ander antwoord. Niet omdat het model slecht zijn best deed, maar omdat de laag eronder, de plek waar de data vandaan kwam, niet voorspelbaar werkte.',
      'Over een hele test, 120 realistische zoekvragen over 40 ziekteverwekkers, liep de nauwkeurigheid van de losse modellen uiteen van 16,9 tot 91,3 procent. De verleiding is dan om naar het beste model te grijpen. Maar de onderzoekers voegden één ding toe: een laag die het ophalen voorspelbaar en herhaalbaar maakte, en die wist welk antwoord eronder hoorde. Elk model steeg daarmee boven de 90 procent, met een uitschieter naar 99,7. In hun eigen woorden maakte die laag de modelkeuze veel minder belangrijk.',
      'Het verschil is niet academisch. Met de wisselende data schatte dezelfde berekening de oorsprong van een uitbraak ergens tussen 1922 en april 2014. De zorgvuldige schatting kwam op januari 2014. Het beeld dat uit de AI rolde, week tot bijna een eeuw af van de werkelijkheid, en zag er even overtuigend uit.',
      'Daar zit de aanname die niet klopt: dat betrouwbaarheid in het model zit, en dat een groter model het oplost. Ze zit in de laag eronder, de laag die weet wat het werk werkelijk is. Een sterker model maakt een onbetrouwbare bron niet betrouwbaar. Het maakt de afwijking alleen overtuigender verpakt.',
    ],
    closer:
      'De belofte “het volgende model lost het op” houdt geen stand waar het telt. Voor je op iets groters wacht: kijk eerst of de laag eronder weet wat het juiste antwoord hoort te zijn.',
    bronnenHtml:
      'Anthropic, <em>Paving the Way for Agents in Biology</em> (2026). Bij een identieke vraag naar een ebolavirus gaf hetzelfde model over drie runs 106, 15 en 5 sequenties, waar 266 het juiste aantal was. Op de VirBench-test (120 zoekvragen, 40 ziekteverwekkers, NCBI Virus) liep de nauwkeurigheid uiteen van 16,9% tot 91,3%; met een voorspelbare ophaallaag (gget virus) steeg die naar boven de 90%, met een piek van 99,7%. Een fylogenetische schatting van een uitbraakoorsprong verschoof door onbetrouwbare data tot 1922 of april 2014, tegen januari 2014 bij zorgvuldige samenstelling.',
    visualUrl: 'https://synestheticminds.com/klopt-het-nog/lost-een-beter-model-het-op.png',
    ogDescription:
      'Dezelfde vraag, drie keer een ander antwoord. Waarom een groter AI-model de betrouwbaarheid niet oplost, en wat wel.',
  },
};
