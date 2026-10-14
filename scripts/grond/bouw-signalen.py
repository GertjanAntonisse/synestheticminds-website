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
    "id": "S1", "voorstel": "Leg vast wie naar een andere afdeling mag schuiven bij uitval en wie dat beslist.", "naam": "Eén controleur minder, terwijl de pickers hun dagdoel haalden",
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
    "id": "S2", "voorstel": "Leg vast welke piktijd een reden is om te kijken, en wie kijkt.", "naam": "Na 1 april daalde de piktijd op de drukste locaties en steeg hij op de rest",
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
    "id": "S3", "voorstel": "Leg vast wat er gebeurt met orders na een gemiste cut-off en wie de klant informeert.", "naam": "Containers na de cut-off op dagen met één verzendmedewerker",
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
    "id": "S4", "voorstel": "Leg vast wat de controleur doet bij een verschil: herpicken, melden of wachten.", "naam": "De controle legde vast dat niet alles klopte en keurde toch goed",
    "ziet": f"Bij {c1['cijfer']['teller']} van de {c1['cijfer']['noemer']} orders is het gepickte anders dan het gevraagde. De controle legde bij precies die orders vast dat niet alle artikelen klopten. Alle {c1['cijfer']['noemer']} orders zijn goedgekeurd.",
    "cijfer": {"teller": c1["cijfer"]["teller"], "noemer": c1["cijfer"]["noemer"], "omschrijving": "goedgekeurde orders met picks"},
    "verklaringen": ["De controleur zag het verschil en keurde goed, omdat er geen andere stap is.", "Het systeem staat goedkeuren toe ondanks het verschil.", "De vastlegging van de controle en de goedkeuring zijn twee losse handelingen."],
    "om_te_weten": ["Een log van de handelingen van de controleur tussen scannen en goedkeuren", "Een gesprek met een controleur: wat gebeurt er als het niet klopt?"],
    "si": {"ids": ["INS-07"], "tekst": "INS-07 zegt dat een order met een verschil niet door naar het inpakken gaat. Wat de controleur dan wel doet (herpicken, melden, wachten), staat nergens."},
    "bewijs_titel": "De orders die zijn goedgekeurd, met wat de controle zelf vastlegde",
    "bewijs": c1["bewijs"],
})

# S5 Een artikel zonder voorraadlocatie wordt toch gepickt (uit voorraad.json en picks.json).
voorraad = json.load(open(BRONNEN / "voorraad.json", encoding="utf-8"))
picks = json.load(open(BRONNEN / "picks.json", encoding="utf-8"))
zonder_locatie = [v for v in voorraad if v["locatie"] is None]
art = zonder_locatie[0]["artikel_id"]
picks_art = [p for p in picks if p["artikel_id"] == art]
picks_art_leeg = [p for p in picks_art if p["locatie"] is None]
signalen.append({
    "id": "S5", "naam": f"Een artikel zonder locatie in de voorraad wordt toch gepickt ({art})",
    "ziet": f"{art} staat met {zonder_locatie[0]['aantal']} stuks in de voorraad, zonder locatie. Er zijn {len(picks_art)} picks van vastgelegd en bij {len(picks_art_leeg)} daarvan is de locatie leeg.",
    "cijfer": {"teller": len(picks_art_leeg), "noemer": len(picks_art), "omschrijving": f"picks van {art} zonder vastgelegde locatie"},
    "verklaringen": ["Het artikel ligt op een losse of tijdelijke plek die niet is geregistreerd.", "De locatie is bij het binnenkomen niet ingevoerd.", "Pickers weten waar het ligt en het systeem niet."],
    "om_te_weten": ["Een log van de ontvangst: waar is het artikel neergelegd?", "Een gesprek met een picker: waar zoek je het?", "De pickmeldingen bij dit artikel (S6)"],
    "si": {"ids": [], "tekst": "Geen SI vastgelegd voor wat er gebeurt als een artikel geen locatie heeft."},
    "voorstel": "Leg vast waar een artikel zonder locatie wordt gezocht en wie de locatie invoert.",
    "bewijs_titel": f"De picks van {art}", "bewijs": [{"pick_id": p["pick_id"], "order_id": p["order_id"], "aantal": p["aantal"], "locatie": p["locatie"]} for p in picks_art][:30],
})

# S6 Twee pickers, dezelfde dag, een andere melding bij hetzelfde artikel (uit pickmeldingen.json).
meldingen = json.load(open(BRONNEN / "pickmeldingen.json", encoding="utf-8"))["meldingen"]
m_art = [m for m in meldingen if m["artikel_id"] == art]
per_dag = defaultdict(list)
for m in m_art:
    per_dag[m["datum"]].append(m)
tegenstrijdig = {d: ms for d, ms in per_dag.items() if {x["melding"] for x in ms} == {"gevonden op andere locatie", "niet gevonden"}}
gevonden = [m for m in m_art if m["melding"] == "gevonden op andere locatie"]
plekken = defaultdict(int)
for m in gevonden:
    plekken[m["gescande_locatie"]] += 1
top_plek, top_n = max(plekken.items(), key=lambda kv: kv[1])
signalen.append({
    "id": "S6", "naam": f"Twee pickers, dezelfde dag, een andere melding bij {art}",
    "ziet": f"Er zijn {len(m_art)} meldingen bij {art}. Op {len(tegenstrijdig)} van de {len(per_dag)} dagen met een melding vond de ene picker het artikel en pickte het, terwijl de andere het niet vond en 0 pickte. De controle bevestigde beide. Van de {len(gevonden)} keer dat het is gevonden, was dat {top_n} keer op {top_plek}.",
    "cijfer": {"teller": len(tegenstrijdig), "noemer": len(per_dag), "omschrijving": "dagen met een melding bij dit artikel"},
    "verklaringen": [f"Het artikel ligt op {top_plek} en niet elke picker zoekt daar.", "De ene picker weet iets dat de andere niet weet.", "Het artikel was op het ene moment wel en op het andere niet aanwezig."],
    "om_te_weten": ["Een log van de ontvangst en de aanvulling van dit artikel", "Een gesprek met beide pickers", "Of de order bij 0 gepickt is aangevuld of een dag later is geleverd"],
    "si": {"ids": [], "tekst": "Geen SI vastgelegd voor wat een picker doet als een artikel niet op de locatie ligt, en voor hoe een nulmelding wordt opgevolgd."},
    "voorstel": f"Leg {top_plek} vast als locatie van {art} en wat een picker doet bij een nulmelding.",
    "bewijs_titel": "De dagen met twee verschillende meldingen bij hetzelfde artikel",
    "bewijs": [{"datum": d, "melding_a": f"{ms[0]['medewerker_id']}: {ms[0]['melding']}, gepickt {ms[0]['gepickt']}", "melding_b": f"{ms[1]['medewerker_id']}: {ms[1]['melding']}, gepickt {ms[1]['gepickt']}", "controle": "beide bevestigd"} for d, ms in sorted(tegenstrijdig.items())],
})

# S7 Er lag minder dan gevraagd.
art2 = next(v for v in voorraad if v["aantal"] <= 3)
m2 = [m for m in meldingen if m["melding"] == "te weinig aanwezig"]
signalen.append({
    "id": "S7", "naam": f"Er lag minder dan gevraagd bij {art2['artikel_id']}",
    "ziet": f"{art2['artikel_id']} staat met {art2['aantal']} stuks op {art2['locatie']}. Er zijn {len(m2)} meldingen dat er minder lag dan gevraagd: gevraagd {sum(m['gevraagd'] for m in m2)}, gepickt {sum(m['gepickt'] for m in m2)}.",
    "cijfer": {"teller": sum(m["gevraagd"] - m["gepickt"] for m in m2), "noemer": sum(m["gevraagd"] for m in m2), "omschrijving": "stuks gevraagd maar niet gepickt"},
    "verklaringen": ["De voorraad werd niet op tijd aangevuld.", "De orders namen meer af dan de planning verwachtte.", "De voorraad klopte niet met wat er lag."],
    "om_te_weten": ["Een log van de aanvulling van deze locatie", "De verwachte afname van dit artikel"],
    "si": {"ids": [], "tekst": "Geen SI vastgelegd voor aanvullen of voor wat er met de rest van de order gebeurt."},
    "voorstel": "Leg vast bij welke voorraad een aanvulling wordt gestart en wie dat doet.",
    "bewijs_titel": "De meldingen dat er minder lag dan gevraagd",
    "bewijs": [{"datum": m["datum"], "medewerker_id": m["medewerker_id"], "gevraagd": m["gevraagd"], "gepickt": m["gepickt"]} for m in m2],
})

uit = {"toelichting": "Signalen in het gesimuleerde magazijn: wat een log laat zien, welke verklaringen mogelijk zijn, welke andere log of welk gesprek nodig is om te weten welke klopt, en wat een standaard instructie (SI) erover zegt. De logs wijzen een plek aan en sluiten verklaringen uit. De oorzaak volgt pas uit een tweede log of een gesprek. ", "signalen": signalen}
regels = ",\n".join(json.dumps(sig, ensure_ascii=False, separators=(",", ":")) for sig in signalen)
(BRONNEN / "signalen.json").write_text(f'{{"toelichting":{json.dumps(uit["toelichting"], ensure_ascii=False)},\n"signalen":[\n{regels}\n]}}\n', encoding="utf-8")
json.loads((BRONNEN / "signalen.json").read_text(encoding="utf-8"))
for s in signalen:
    print(s["id"], s["naam"], "|", s["cijfer"], "|", (s["ziet"] or "")[:200])
print(f"signalen.json {(BRONNEN / 'signalen.json').stat().st_size / 1024:.1f} kB")
