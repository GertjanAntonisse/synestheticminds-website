# Speelmap: webshop voor kleding en schoenen (gesimuleerd)

Dit is een gesimuleerd magazijn van een webshop in kleding en schoenen. Alle gegevens zijn verzonnen en dienen om te oefenen met Grond.

## Wat er in zit

- `werkinstructies.json`: het werk op papier. Vijf instructies voor de pickers, met de aannames waarop ze rusten en de instructies die er met elkaar mee samenhangen. Onderaan staat een wijziging van 1 april 2026.
- `orders.json`, `picks.json`, `zendingen.json`, `retouren.json`, `voorraad.json`: wat er in het magazijn is vastgelegd.

## Wat er nog niet in zit

De scanregels zelf (ruim 26.000) zitten er niet in, alleen een samenvatting ervan (zie onderaan). Je kunt dus de cijfers per instructie bevragen, maar nog niet de afzonderlijke regels doorzoeken of zelf nieuwe berekeningen maken. Dat komt in een volgende stap.

## Om mee te beginnen

- Welke instructies gelden er, en waarop rust elk van hen?
- Wat is er per 1 april 2026 veranderd, en welke andere instructies raakt dat?
- Welke aannames zijn er achter de wijziging gemaakt?
- Wat zegt de vastlegging over retouren, en waar zie je dat terug in de instructies?

Het is de bedoeling dat je zelf uitzoekt wat klopt. Grond laat bij elk antwoord zien op welke bron het rust.

## Scanregels (samenvatting)

`scan-samenvatting.json` vat de ruim 26.000 scanregels van de pickers samen: per instructie hoeveel regels voldoen aan wat op papier staat, voor en na de wijziging van 1 april 2026, met voorbeelden van afwijkende regels en de gemiddelde piktijd per week.

Let op: in de oorspronkelijke gesimuleerde gegevens begon de periode na de wijziging op 2 maart. In deze speelmap zijn de tijdstippen van die periode 30 dagen opgeschoven, zodat zij begint op de wijzigingsdatum.
