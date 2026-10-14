"""Bouwt de scanbronnen voor de Grond-speeltuin uit de gesimuleerde scanregels.

Invoer:  invariant-design-demo/data/scanner_events.json (ruim 26.000 regels)
Uitvoer: grond-bronnen/  kleine bestanden die Grond leest en kan aanhalen
         grond-regels/   de volledige regels, voor het openklappen van het bewijs

In de brongegevens begon periode B op 2 maart, terwijl de wijziging op 1 april staat.
Hier worden de tijdstippen van periode B 30 dagen opgeschoven, zodat B begint op de wijzigingsdatum.
"""
import json
from datetime import datetime, timedelta
from pathlib import Path
from statistics import mean

HIER = Path(__file__).resolve().parent.parent.parent
BRON = HIER.parent / "invariant-design-demo"
BRONNEN = HIER / "grond-bronnen"
REGELS = HIER / "grond-regels"
VERSCHUIVING = timedelta(days=30)

events = json.load(open(BRON / "data" / "scanner_events.json", encoding="utf-8"))
papier = {i["id"]: i for i in json.load(open(BRONNEN / "werkinstructies.json", encoding="utf-8"))["instructies"]}

for e in events:
    if e["periode"] == "B":
        for k in ("tijdstip_start", "tijdstip_einde"):
            e[k] = (datetime.fromisoformat(e[k]) + VERSCHUIVING).isoformat()


def reden_route(e):
    if e["volgorde_in_ronde"] == 1: return None
    if e["route_index_actueel"] < e["route_index_verwacht"] - 3:
        return f"Locatie {e['locatie']} staat op route-positie {e['route_index_actueel']}, de vorige scan verwachtte positie {e['route_index_verwacht']}"
def reden_piktijd(e):
    t = e["piktijd_seconden"]
    if t < 60: return f"Piktijd {t} seconden, onder de 60"
    if t > 120: return f"Piktijd {t} seconden, boven de 120"
def reden_ronde(e):
    if e["picks_in_ronde"] > 15: return f"Ronde {e['ronde_id']} heeft {e['picks_in_ronde']} picks"
def reden_scan(e):
    if not e["voor_scan"] and not e["na_scan"]: return f"Voor- en na-scan ontbreken bij {e['locatie']}"
    if not e["voor_scan"]: return f"Voor-scan ontbreekt bij {e['locatie']}"
    if not e["na_scan"]: return f"Na-scan ontbreekt bij {e['locatie']}"
def reden_wissel(e):
    if e["route_wissel"]: return f"Routewissel van {e['medewerker_id']} in ronde {e['ronde_id']}"

TOETSEN = [
    ("INS-01", "De locatie volgt in de looproute op de vorige scan (marge van 3 posities)", reden_route),
    ("INS-02", "De piktijd ligt tussen 60 en 120 seconden", reden_piktijd),
    ("INS-03", "De ronde heeft hoogstens 15 picks", reden_ronde),
    ("INS-04", "Bij de locatie is voor en na de pick gescand", reden_scan),
    ("INS-05", "De picker blijft binnen de ronde op dezelfde route", reden_wissel),
]
VELDEN = ["event_id", "medewerker_id", "locatie", "tijdstip_start", "piktijd_seconden", "route_index_verwacht", "route_index_actueel", "voor_scan", "na_scan", "route_wissel", "picks_in_ronde"]

# per regel: welke instructies worden niet gevolgd, en waarom
for e in events:
    e["afwijkt"] = {iid: r for iid, _, fn in TOETSEN if (r := fn(e))}

def week_van(e):
    d = datetime.fromisoformat(e["tijdstip_start"]).date()
    return str(d - timedelta(days=d.weekday()))

def stat(sel, iid):
    afw = sum(1 for e in sel if iid in e["afwijkt"])
    return {"scanregels": len(sel), "afwijkend": afw, "percentage_voldoet": round((len(sel) - afw) / len(sel) * 100, 1) if sel else None}

per = {p: [e for e in events if e["periode"] == p] for p in ("A", "B")}

# 1. samenvatting per instructie, met voorbeelden
samenvatting = {
    "toelichting": "Samenvatting van de scanregels van de pickers in het gesimuleerde magazijn. Per instructie staat hoeveel scanregels voldoen aan wat op papier staat, voor en na de wijziging van 1 april 2026. Bij elke periode staan voorbeelden van afwijkende regels. De tijdstippen van de periode na de wijziging zijn in deze speelmap 30 dagen opgeschoven, zodat die periode begint op de wijzigingsdatum.",
    "periodes": {p: {"van": min(e["tijdstip_start"] for e in sel)[:10], "tot": max(e["tijdstip_start"] for e in sel)[:10], "scanregels": len(sel)} for p, sel in per.items()},
    "wijziging": {"datum": "2026-04-01", "instructie": "INS-01"},
    "instructies": [],
}
for iid, toets, _ in TOETSEN:
    rec = {"instructie_id": iid, "titel": papier[iid]["titel"], "op_papier": papier[iid]["omschrijving"], "toets": toets, "periodes": {}}
    for p, sel in per.items():
        afw = [e for e in sel if iid in e["afwijkt"]]
        rec["periodes"][p] = {**stat(sel, iid), "voldoen": len(sel) - len(afw),
                              "voorbeelden_afwijkend": [{**{k: e[k] for k in VELDEN}, "wat_viel_op": e["afwijkt"][iid]} for e in afw[:3]]}
    samenvatting["instructies"].append(rec)
weken = {}
for e in events: weken.setdefault(week_van(e), []).append(e["piktijd_seconden"])
samenvatting["piktijd_per_week"] = [{"week_vanaf": w, "gemiddelde_piktijd_seconden": round(mean(v), 1), "scanregels": len(v)} for w, v in sorted(weken.items())]
samenvatting["piktijd_per_periode"] = {p: round(mean(e["piktijd_seconden"] for e in sel), 1) for p, sel in per.items()}
json.dump(samenvatting, open(BRONNEN / "scan-samenvatting.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# 2. kern-overzicht: klein, hoort bij elke vraag
kern = {
    "toelichting": "Kort overzicht van het werk op papier naast de scanregels. Voor een uitsplitsing zie scan-per-medewerker.json, scan-per-week.json en scan-per-locatie.json.",
    "wijziging": samenvatting["wijziging"],
    "periodes": samenvatting["periodes"],
    "gemiddelde_piktijd_seconden": samenvatting["piktijd_per_periode"],
    "per_instructie": [{
        "instructie_id": r["instructie_id"], "titel": r["titel"], "op_papier": r["op_papier"], "gemeten_als": r["toets"],
        "voor_wijziging": {k: r["periodes"]["A"][k] for k in ("scanregels", "afwijkend", "percentage_voldoet")},
        "na_wijziging": {k: r["periodes"]["B"][k] for k in ("scanregels", "afwijkend", "percentage_voldoet")},
    } for r in samenvatting["instructies"]],
}
json.dump(kern, open(BRONNEN / "kern-overzicht.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# 3. uitsplitsingen: compact, een record per regel, elk bestand kleiner dan 16000 tekens, in de vraag in stukken van 7500
# (zoveel van een passage gaat er in de vraag naar het model)
def kort(sel, iid):
    afw = sum(1 for e in sel if iid in e["afwijkt"])
    return {"afwijkend": afw, "percentage_voldoet": round((len(sel) - afw) / len(sel) * 100, 1)}

def record(sleutel_naam, sleutel, deel_per_periode):
    rij = {sleutel_naam: sleutel}
    for p, deel in deel_per_periode.items():
        if not deel: continue
        rij[f"periode_{p}"] = {"scanregels": len(deel), "gemiddelde_piktijd_seconden": round(mean(e["piktijd_seconden"] for e in deel), 1),
                               **{iid: kort(deel, iid) for iid, _, _ in TOETSEN}}
    return rij

def schrijf(naam, toelichting, lijstnaam, records):
    regels = ",\n".join(json.dumps(r, ensure_ascii=False, separators=(",", ":")) for r in records)
    tekst = f'{{"toelichting":{json.dumps(toelichting, ensure_ascii=False)},\n"{lijstnaam}":[\n{regels}\n]}}\n'
    assert len(tekst) < 16000, (naam, len(tekst))
    json.loads(tekst)
    (BRONNEN / naam).write_text(tekst, encoding="utf-8")

PERIODE_TXT = "Periode A is voor de wijziging van 1 april 2026, periode B erna. Per instructie: aantal afwijkende scanregels en het percentage dat voldoet."
medewerkers = sorted({e["medewerker_id"] for e in events})
schrijf("scan-per-medewerker.json", f"Scanregels per medewerker (picker). {PERIODE_TXT}", "per_medewerker",
        [record("medewerker", m, {p: [e for e in sel if e["medewerker_id"] == m] for p, sel in per.items()}) for m in medewerkers])
vakken = sorted({e["locatie"][:5] for e in events})
schrijf("scan-per-vak.json", f"Scanregels per vak in het magazijn (rij en vak, bijvoorbeeld R2-V2). Op de plek R2-V2 liggen de hoogvolume-locaties. {PERIODE_TXT}", "per_vak",
        [record("vak", v, {p: [e for e in sel if e["locatie"].startswith(v)] for p, sel in per.items()}) for v in vakken])
weeklijst = sorted(weken)
per_week_records = []
for w in weeklijst:
    deel = [e for e in events if week_van(e) == w]
    per_week_records.append({"week_vanaf": w, "periode": deel[0]["periode"], "scanregels": len(deel),
                             "gemiddelde_piktijd_seconden": round(mean(e["piktijd_seconden"] for e in deel), 1),
                             **{iid: kort(deel, iid) for iid, _, _ in TOETSEN}})
schrijf("scan-per-week.json", f"Scanregels per week (maandag als begin). In maart zijn geen scanregels. {PERIODE_TXT}", "per_week", per_week_records)

# 4. volledige regels (compact), voor het openklappen van het bewijs
REGELS.mkdir(exist_ok=True)
json.dump([{**{k: e[k] for k in VELDEN}, "periode": e["periode"], "week": week_van(e), "afwijkt": e["afwijkt"]} for e in events],
          open(REGELS / "scanregels.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
for p in sorted(BRONNEN.glob("*.json")): print(f"{p.stat().st_size/1024:7.1f} kB  {p.name}")
print(f"{(REGELS / 'scanregels.json').stat().st_size/1024/1024:7.1f} MB  grond-regels/scanregels.json")
