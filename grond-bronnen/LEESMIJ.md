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
