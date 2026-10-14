# Speeltuin: webshop voor kleding en schoenen (gesimuleerd)

Dit is een gesimuleerd magazijn van een webshop in kleding en schoenen. Alle gegevens zijn verzonnen en dienen om te oefenen met Grond.

## Het werk op papier

- `werkinstructies.json`: vijf instructies voor de pickers, met de aannames waarop ze rusten en de instructies waarmee ze samenhangen. Onderaan staat een wijziging van 1 april 2026.

## Wat er is vastgelegd

- `orders.json`, `picks.json`, `zendingen.json`, `retouren.json`, `voorraad.json`: de orders en wat daarmee in het magazijn is gedaan.

- `order-controle.json`: per order wat is gevraagd, wat is gepickt en wat de controle voor het inpakken heeft gedaan. Een afwijking is een order waarvan de gepickte artikelen of aantallen niet gelijk zijn aan wat is gevraagd.
- `verzendcontrole.json`: wat de controle voor het inpakken per order heeft vastgelegd.

## De scanregels van de pickers

Er zijn 26.234 scanregels: elke keer dat een picker een locatie scant, met tijd, route en piktijd. Die regels zijn te veel om als geheel te doorzoeken. Daarom zijn ze samengevat, en elke samenvatting is te herleiden tot de regels zelf:

- `kern-overzicht.json`: per instructie hoeveel scanregels voldoen, voor en na de wijziging.
- `scan-samenvatting.json`: hetzelfde met voorbeelden van afwijkende regels en de piktijd per week.
- `scan-per-medewerker.json`, `scan-per-week.json` en `scan-per-vak.json`: dezelfde cijfers uitgesplitst.

Op de pagina kun je per instructie de afwijkende scanregels zelf openklappen.

De scanregels vallen in twee periodes: A (1 januari tot en met 1 maart 2026) en B (1 april tot en met 30 mei 2026). In maart zijn geen scanregels. In de oorspronkelijke gegevens begon periode B op 2 maart. Hier zijn de tijdstippen van die periode 30 dagen opgeschoven, zodat zij begint op de wijzigingsdatum.

## Om mee te beginnen

- Welke instructies gelden er, en waarop rust elk van hen?
- Wat is er per 1 april 2026 veranderd, en welke andere instructies raakt dat?
- Welke aannames zijn er achter de wijziging gemaakt?
- Welke picker wijkt het meest af van de instructie over de piktijd?
- Waar in het magazijn volgen de scanregels de route niet?

Het is de bedoeling dat je zelf uitzoekt wat klopt. Grond laat bij elk antwoord zien op welke bron het rust.

## KPI's per proces

`kpi-orders.json` bevat per proces (orderpick, ordercontrole, keten) de KPI's met de verwachting en de bron daarvan, het cijfer met teller en noemer, en het bewijs. Waar in de bronnen geen norm is vastgelegd, staat dat erbij. De afspraken komen uit de Invariant Design-demo (INV-L3-05, INV-L4-04, INV-L5-01).

## Bezetting, ordercontrole en verzending

Deze gegevens zijn verzonnen, behalve de bezetting van het picken en het aantal pickregels per dag: die komen uit de scanregels. Het dagwerk van de controle en de verzending is niet gekoppeld aan de 120 orders, omdat die geen dagindeling hebben die bij de scanregels past. Elke dag is een werkdag, 120 dagen in totaal.

- `werkinstructies-afdelingen.json`: wat op papier staat voor bezetting (INS-06), volledige ordercontrole (INS-07), controletijd (INS-08), routes en containers (INS-09), de cut-off van de vervoerder (INS-10) en het dagdoel pickregels (INS-11).
- `bezetting.json`: per dag en afdeling hoeveel mensen er gepland en aanwezig waren, met ziek of verlof, zonder namen.
- `controle-log.json`: per dag de orders, de aanwezige controleurs, hoeveel orders volledig en hoeveel alleen met een steekproef zijn gecontroleerd, en de tijd per order.
- `verzend-log.json`: per dag en vervoerder de orders, wanneer routes en container klaar waren en hoeveel orders een dag later meegingen.
- `afdelingen-per-week.json`: dezelfde gegevens per week.
- `kpi-afdelingen.json`: de KPI's met verwachting, cijfer en bewijs.

Het bouwscript is `scripts/grond/bouw-afdelingen.py`. De uitkomsten zijn ingebouwd: met één controleur is de planning van 4 minuten per order niet haalbaar, en met één verzendmedewerker komen routes en containers later. Dat laat het mechanisme zien, niet hoe vaak het in een echt bedrijf gebeurt.
