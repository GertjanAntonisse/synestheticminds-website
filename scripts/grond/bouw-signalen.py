"""
Bouwt de signalen voor de speeltuin: wat een log laat zien, welke verklaringen mogelijk zijn,
welke andere log of welk gesprek nodig is om te weten welke klopt, en wat een standaard instructie (SI) erover zegt.

Draai eerst bouw-scanbronnen.py en bouw-afdelingen.py.
Uitvoeren: /Users/gertjan/ai-projects/.venv/bin/python -I scripts/grond/bouw-signalen.py
"""
import json
import statistics
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path

BRON = Path("/Users/gertjan/ai-projects/invariant-design-demo")
BRONNEN = Path(__file__).resolve().parents[2] / "grond-bronnen"
HOOGVOLUME = {"R2-V2-L1", "R2-V2-L2", "R2-V2-L3", "R2-V1-L2", "R2-V3-L1"}  # WIJ-01: eerst de drukste locaties
DAGDOEL = 45

bezetting = json.load(open(BRONNEN / "bezetting.json", encoding="utf-8"))["bezetting"]
controle = {d["datum"]: d for d in json.load(open(BRONNEN / "controle-log.json", encoding="utf-8"))["dagen"]}
verzend = json.load(open(BRONNEN / "verzend-log.json", encoding="utf-8"))["dagen"]
kpi_orders = json.load(open(BRONNEN / "kpi-orders.json", encoding="utf-8"))
events = json.load(open(BRON / "data" / "scanner_events.json", encoding="utf-8"))

def minuten(hhmm):
    return int(hhmm[:2]) * 60 + int(hhmm[3:5])

picken = {r["datum"]: r for r in bezetting if r["afdeling"] == "picken"}
dagen = sorted(picken)
per_picker = {d: picken[d]["pickregels"] / picken[d]["aanwezig"] for d in dagen}
controle_onder = [d for d in dagen if controle[d]["controleurs_aanwezig"] < 2]

signalen = []

# S1 Herplannen: één controleur, terwijl de pickers hun dagdoel haalden.
ruim = [d for d in controle_onder if per_picker[d] >= DAGDOEL]
signalen.append({
    "id": "S1", "naam": "Eén controleur minder, terwijl de pickers hun dagdoel haalden",
    "ziet": f"Op {len(controle_onder)} dagen was er één controleur in plaats van twee. Op {len(ruim)} daarvan haalden de pickers gemiddeld minstens {DAGDOEL} pickregels per persoon, het dagdoel. Op die {len(ruim)} dagen kregen {sum(controle[d]['alleen_steekproef'] for d in ruim)} orders alleen een steekproef.",
    "cijfer": {"teller": len(ruim), "noemer": len(controle_onder), "omschrijving": "dagen met één controleur"},
    "verklaringen": ["Een picker had naar de controle kunnen schuiven en dat gebeurde niet.", "Een picker schoof wel, maar dat is nergens vastgelegd.", "De pickers hadden de ruimte niet, want ze halen het dagdoel pas met alle vijf."],
    "om_te_weten": ["Een log van wie op welke afdeling werkte, per uur", "Een gesprek met de teamleider over een dag als deze"],
    "si": {"ids": ["INS-06"], "tekst": "INS-06 zegt dat uitval binnen de afdeling wordt opgevangen. Of een picker naar de controle mag, en wie dat beslist, staat nergens."},
    "bewijs_titel": "De dagen met één controleur en wat de pickers die dag deden",
    "bewijs": [{"datum": d, "pickregels_per_picker": round(per_picker[d], 1), "orders": controle[d]["orders"], "alleen_steekproef": controle[d]["alleen_steekproef"]} for d in ruim],
})

# S2 Locatie: de piktijd per locatie voor en na de wijziging.
tijden = defaultdict(lambda: {"A": [], "B": []})
for e in events:
    tijden[e["locatie"]][e["periode"]].append(e["piktijd_seconden"])
gem = {l: {p: statistics.mean(v[p]) for p in "AB"} for l, v in tijden.items()}
rest = [l for l in gem if l not in HOOGVOLUME]
rest_a = statistics.mean(gem[l]["A"] for l in rest); rest_b = statistics.mean(gem[l]["B"] for l in rest)
hoog_a = statistics.mean(gem[l]["A"] for l in HOOGVOLUME); hoog_b = statistics.mean(gem[l]["B"] for l in HOOGVOLUME)
langer = sorted(rest, key=lambda l: gem[l]["B"] - gem[l]["A"], reverse=True)
langer_aantal = sum(1 for l in rest if gem[l]["B"] > gem[l]["A"])
spreiding_rest = max(gem[l]["B"] for l in rest) - min(gem[l]["B"] for l in rest)
spreiding_hoog = max(gem[l]["B"] for l in HOOGVOLUME) - min(gem[l]["B"] for l in HOOGVOLUME)
signalen.append({
    "id": "S2", "naam": "Na 1 april daalde de piktijd op de drukste locaties en steeg hij op de rest",
    "ziet": f"Buiten de vijf drukste locaties ging de gemiddelde piktijd van {rest_a:.0f} naar {rest_b:.0f} seconden. Op de vijf drukste locaties daalde die van {hoog_a:.0f} naar {hoog_b:.0f} seconden. Binnen elk van die twee groepen liggen de locaties dicht bij elkaar (na de wijziging {spreiding_rest:.0f} seconden verschil buiten de drukste locaties, {spreiding_hoog:.0f} seconden erbinnen). Er is geen losse locatie met een uitschieter.",
    "cijfer": {"teller": langer_aantal, "noemer": len(rest), "omschrijving": "locaties buiten de drukste vijf met een langere piktijd na de wijziging"},
    "verklaringen": ["De nieuwe volgorde (drukste locaties eerst) geeft meer looptijd tussen de overige locaties.", "Pickers wachten bij de drukste locaties op elkaar, en dat telt niet mee in de daling.", "Iets anders veranderde in dezelfde periode."],
    "om_te_weten": ["Een log van de looptijd tussen twee scans, apart van de piktijd", "Wat er in april verder veranderde in het magazijn", "Een gesprek met een picker"],
    "si": {"ids": ["INS-01", "INS-02"], "tekst": "INS-02 geeft 60 tot 120 seconden per pick onder de aanname dat de route wordt gevolgd (INS-01). Wat een picker doet als de piktijd structureel hoger ligt, staat nergens."},
    "bewijs_titel": "De tien locaties met de grootste stijging van de piktijd",
    "bewijs": [{"locatie": l, "piktijd_voor": round(gem[l]["A"], 1), "piktijd_na": round(gem[l]["B"], 1)} for l in langer[:10]],
})

# S3 Verzending: een gemiste cut-off op een dag met één verzendmedewerker.
gemist = [v for v in verzend if minuten(v["container_klaar_om"]) > minuten(v["cutoff"])]
onder_verzend = {r["datum"] for r in bezetting if r["afdeling"] == "verzending" and r["aanwezig"] < r["gepland"]}
gemist_onder = [v for v in gemist if v["datum"] in onder_verzend]
signalen.append({
    "id": "S3", "naam": "Containers na de cut-off op dagen met één verzendmedewerker",
    "ziet": f"{len(gemist_onder)} van de {len(gemist)} gemiste cut-offs vielen op de {len(onder_verzend)} dagen met één verzendmedewerker. Samen gingen {sum(v['orders_naar_volgende_dag'] for v in gemist)} orders een dag later mee.",
    "cijfer": {"teller": len(gemist_onder), "noemer": len(gemist), "omschrijving": "gemiste cut-offs"},
    "verklaringen": ["Met één medewerker lopen routes en containers uit.", "De routes werden later vastgesteld doordat de controle later klaar was.", "De vervoerder hield de cut-off strakker aan dan op papier."],
    "om_te_weten": ["Een log van wanneer de gecontroleerde orders bij de verzending aankwamen", "Wat de vervoerder zegt over de cut-off", "Een gesprek met de verzendafdeling"],
    "si": {"ids": ["INS-09", "INS-10"], "tekst": "INS-10 zegt dat wat later komt de volgende dag meegaat. Wie een klant daarover informeert, en of een andere vervoerder mag, staat nergens."},
    "bewijs_titel": "De gemiste cut-offs op dagen met één verzendmedewerker",
    "bewijs": [{"datum": v["datum"], "vervoerder": v["vervoerder"], "klaar_om": v["container_klaar_om"], "cutoff": v["cutoff"], "orders_naar_volgende_dag": v["orders_naar_volgende_dag"]} for v in gemist_onder],
})

# S4 Controle: de controle legt vast dat niet alles klopt en keurt toch goed.
c1 = next(k for k in kpi_orders["ordercontrole"] if k["id"] == "C1")
signalen.append({
    "id": "S4", "naam": "De controle legde vast dat niet alles klopte en keurde toch goed",
    "ziet": f"Bij {c1['cijfer']['teller']} van de {c1['cijfer']['noemer']} orders is het gepickte anders dan het gevraagde. De controle legde bij precies die orders vast dat niet alle artikelen klopten. Alle {c1['cijfer']['noemer']} orders zijn goedgekeurd.",
    "cijfer": {"teller": c1["cijfer"]["teller"], "noemer": c1["cijfer"]["noemer"], "omschrijving": "goedgekeurde orders met picks"},
    "verklaringen": ["De controleur zag het verschil en keurde goed, omdat er geen andere stap is.", "Het systeem staat goedkeuren toe ondanks het verschil.", "De vastlegging van de controle en de goedkeuring zijn twee losse handelingen."],
    "om_te_weten": ["Een log van de handelingen van de controleur tussen scannen en goedkeuren", "Een gesprek met een controleur: wat gebeurt er als het niet klopt?"],
    "si": {"ids": ["INS-07"], "tekst": "INS-07 zegt dat een order met een verschil niet door naar het inpakken gaat. Wat de controleur dan wel doet (herpicken, melden, wachten), staat nergens."},
    "bewijs_titel": "De orders die zijn goedgekeurd, met wat de controle zelf vastlegde",
    "bewijs": c1["bewijs"],
})

# S5 Een signaal dat de logs nog niet kunnen geven.
signalen.append({
    "id": "S5", "naam": "Twee pickers, dezelfde order, een andere melding",
    "ziet": None, "kan_nog_niet": True,
    "cijfer": None,
    "verklaringen": ["Een artikel dat op een andere locatie ligt.", "Een locatie zonder voorraad.", "Een scan die iets anders vastlegt dan er gebeurde."],
    "om_te_weten": ["Een log waarin een picker kan vastleggen dat er niets is gepickt, en waarom", "De uitkomst van de controle per pickregel in plaats van per order"],
    "si": {"ids": [], "tekst": "Geen SI vastgelegd voor wat een picker doet als een artikel niet op de locatie ligt."},
    "bewijs_titel": "", "bewijs": [],
})

uit = {"toelichting": "Signalen in het gesimuleerde magazijn: wat een log laat zien, welke verklaringen mogelijk zijn, welke andere log of welk gesprek nodig is om te weten welke klopt, en wat een standaard instructie (SI) erover zegt. De logs wijzen een plek aan en sluiten verklaringen uit. De oorzaak volgt pas uit een tweede log of een gesprek. Een signaal met 'nog niet te zien' kan met de huidige logs niet worden gegeven.", "signalen": signalen}
(BRONNEN / "signalen.json").write_text(json.dumps(uit, ensure_ascii=False, indent=1), encoding="utf-8")
for s in signalen:
    print(s["id"], s["naam"], "|", s["cijfer"], "|", (s["ziet"] or "")[:200])
print(f"signalen.json {(BRONNEN / 'signalen.json').stat().st_size / 1024:.1f} kB")
