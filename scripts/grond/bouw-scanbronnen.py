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

# 5. orders: wat gevraagd is, wat gepickt is en wat de controle voor het inpakken zei.
# De afwijkingen worden hier zelf afgeleid uit orders en picks. De labels uit de bron
# (artikel_correct, locatie_correct, goedgekeurd_met_fout, verkeerde_picks) blijven buiten de speeltuin.
from collections import defaultdict
orders = json.load(open(BRON / "data" / "orders.json", encoding="utf-8"))
picks = json.load(open(BRON / "data" / "picks.json", encoding="utf-8"))
bevestigingen = {v["order_id"]: v for v in json.load(open(BRON / "data" / "verzendbevestigingen.json", encoding="utf-8"))}
voorraad = {v["artikel_id"]: v["locatie"] for v in json.load(open(BRON / "data" / "voorraad.json", encoding="utf-8"))}

gepickt = defaultdict(lambda: defaultdict(int))
picks_per_order = defaultdict(list)
for p in picks:
    gepickt[p["order_id"]][p["artikel_id"]] += p["aantal"]
    picks_per_order[p["order_id"]].append(p)

afwijkende_orders = []
zonder_picks = 0
goedgekeurd_totaal = 0
for o in orders:
    gevraagd = defaultdict(int)
    for r in o["regels"]: gevraagd[r["artikel_id"]] += r["aantal"]
    g = gepickt.get(o["order_id"])
    if not g:
        zonder_picks += 1
        continue
    b = bevestigingen.get(o["order_id"])
    if b and b["goedgekeurd"]: goedgekeurd_totaal += 1
    verschil = {a: {"gevraagd": gevraagd.get(a, 0), "gepickt": g.get(a, 0)} for a in sorted(set(gevraagd) | set(g)) if gevraagd.get(a, 0) != g.get(a, 0)}
    if verschil:
        afwijkende_orders.append({"order_id": o["order_id"], "datum": o["datum"], "verschil_per_artikel": verschil,
                                  "controle_voor_inpakken": ("goedgekeurd" if b["goedgekeurd"] else "afgekeurd") if b else "geen controle vastgelegd"})

niet_gevraagd = [p for p in picks if p["artikel_id"] not in {r["artikel_id"] for o in orders if o["order_id"] == p["order_id"] for r in o["regels"]}]
goedgekeurd_afwijkend = [a for a in afwijkende_orders if a["controle_voor_inpakken"] == "goedgekeurd"]

order_controle = {
    "toelichting": "Per order: wat is gevraagd (de order), wat is gepickt (de picks) en wat de controle voor het inpakken heeft vastgelegd. Een afwijking is hier een order waarvan de gepickte artikelen of aantallen niet gelijk zijn aan wat is gevraagd. De afwijkingen zijn berekend uit orders.json en picks.json.",
    "totalen": {
        "orders": len(orders),
        "orders_met_picks": len(orders) - zonder_picks,
        "orders_zonder_picks": zonder_picks,
        "orders_met_afwijking_tussen_gevraagd_en_gepickt": len(afwijkende_orders),
        "daarvan_goedgekeurd_bij_de_controle_voor_het_inpakken": len(goedgekeurd_afwijkend),
        "daarvan_afgekeurd_bij_de_controle": sum(1 for a in afwijkende_orders if a["controle_voor_inpakken"] == "afgekeurd"),
        "picks_in_totaal": len(picks),
        "picks_van_een_artikel_dat_niet_in_de_order_staat": len(niet_gevraagd),
    },
    "afwijkende_orders": afwijkende_orders,
}
(BRONNEN / "order-controle.json").write_text(json.dumps(order_controle, ensure_ascii=False, indent=1), encoding="utf-8")
(BRONNEN / "verzendcontrole.json").write_text(
    '{"toelichting":"Wat de controle voor het inpakken per order heeft vastgelegd: of alle artikelen volgens de controle klopten en of de order is goedgekeurd.",\n"controles":[\n' +
    ",\n".join(json.dumps({"order_id": v["order_id"], "alle_artikelen_correct": v["alle_artikelen_correct"], "goedgekeurd": v["goedgekeurd"]}, separators=(",", ":")) for v in bevestigingen.values()) + "\n]}\n", encoding="utf-8")
json.loads((BRONNEN / "verzendcontrole.json").read_text(encoding="utf-8"))
print(json.dumps(order_controle["totalen"], ensure_ascii=False, indent=1))
print(f"order-controle.json {(BRONNEN / 'order-controle.json').stat().st_size/1024:.1f} kB, verzendcontrole.json {(BRONNEN / 'verzendcontrole.json').stat().st_size/1024:.1f} kB")

# 6. KPI-overzicht voor orderpick, ordercontrole en de keten.
# Elke KPI heeft de verwachting met bron, het cijfer met teller en noemer, en het bewijs.
# Waar in de bronnen geen norm is vastgelegd, staat dat erbij en wordt er geen doel verzonnen.
zendingen = json.load(open(BRON / "data" / "zendingen.json", encoding="utf-8"))
retouren = json.load(open(BRON / "data" / "retouren.json", encoding="utf-8"))
verzonden_orders = {z["order_id"] for z in zendingen}
order_artikelen = {o["order_id"]: {r["artikel_id"] for r in o["regels"]} for o in orders}
afwijkend_ids = {a["order_id"] for a in afwijkende_orders}
zonder_pick_verzonden = sorted(o for o in verzonden_orders if o not in gepickt)

AFSPRAKEN = {
    "INV-L3-05": "Een gepickt artikel staat op de order.",
    "INV-L4-04": "Een verzendbevestiging wordt alleen gegeven als alle artikelen correct zijn.",
    "INV-L5-01": "Een retour met reden 'verkeerd artikel' is herleidbaar naar een pick.",
}
def kpi(kid, naam, verwachting, bron, teller, noemer, noemer_tekst, bewijs, bewijs_titel):
    return {"id": kid, "naam": naam, "verwachting": verwachting, "bron_verwachting": bron,
            "cijfer": {"teller": teller, "noemer": noemer, "omschrijving": noemer_tekst},
            "bewijs_titel": bewijs_titel, "bewijs": bewijs}

niet_op_order = [p for p in picks if p["artikel_id"] not in order_artikelen.get(p["order_id"], set())]
afwijkend_per_id = {a["order_id"]: a for a in afwijkende_orders}
def order_bewijs(oid):
    a = afwijkend_per_id[oid]
    b = bevestigingen.get(oid, {})
    verschil = "; ".join(f"{art}: gevraagd {v['gevraagd']}, gepickt {v['gepickt']}" for art, v in a["verschil_per_artikel"].items())
    return {"order_id": oid, "verschil": verschil, "controle_alle_artikelen_correct": b.get("alle_artikelen_correct"), "controle_goedgekeurd": b.get("goedgekeurd")}

verzonden_afwijkend = sorted(afwijkend_ids & verzonden_orders)
retour_orders = {r["order_id"] for r in retouren}
retour_afwijkend = sorted(afwijkend_ids & retour_orders)
verkeerd_artikel = [r for r in retouren if r["reden"] == "verkeerd artikel"]
verkeerd_zonder_afwijking = [r for r in verkeerd_artikel if r["order_id"] not in afwijkend_ids]

kpi_orders = {
    "toelichting": "KPI-overzicht voor het orderpickproces, het controleproces voor het inpakken en de keten daaromheen. Elke KPI heeft een verwachting met bron, een cijfer met teller en noemer, en het bewijs. Waar geen norm is vastgelegd, staat dat erbij. De cijfers zijn berekend uit orders, picks, verzendcontroles, zendingen en retouren.",
    "afspraken": [{"id": k, "tekst": v, "herkomst": "Eerder vastgelegde afspraak in de Invariant Design-demo"} for k, v in AFSPRAKEN.items()],
    "orderpick_aanvulling": [
        kpi("P6", "Gepickt artikel staat op de order", AFSPRAKEN["INV-L3-05"], "INV-L3-05", len(picks) - len(niet_op_order), len(picks), "picks",
            [{"pick_id": p["pick_id"], "order_id": p["order_id"], "artikel_id": p["artikel_id"], "aantal": p["aantal"]} for p in niet_op_order], "De picks van een artikel dat niet op de order staat"),
    ],
    "ordercontrole": [
        kpi("C1", "Goedgekeurd terwijl niet alle artikelen klopten", AFSPRAKEN["INV-L4-04"], "INV-L4-04", len(afwijkende_orders), goedgekeurd_totaal, "goedgekeurde orders met picks",
            [order_bewijs(o) for o in sorted(afwijkend_ids)], "De orders die zijn goedgekeurd, met wat de controle zelf vastlegde"),
        kpi("C2", "Verschil gezien door de controle", None, None, sum(1 for o in afwijkend_ids if bevestigingen.get(o, {}).get("alle_artikelen_correct") is False), len(afwijkend_ids), "orders waar gepickt is wat niet gevraagd was",
            [order_bewijs(o) for o in sorted(afwijkend_ids)], "De orders met het verschil en de vastlegging van de controle"),
        kpi("C3", "Verschil tegengehouden voor het inpakken", None, None, sum(1 for o in afwijkend_ids if bevestigingen.get(o, {}).get("goedgekeurd") is False), len(afwijkend_ids), "orders waar gepickt is wat niet gevraagd was",
            [order_bewijs(o) for o in sorted(afwijkend_ids)], "Dezelfde orders: allemaal goedgekeurd"),
    ],
    "keten": [
        kpi("K1", "Afwijkende orders die bij de klant kwamen", None, None, len(verzonden_afwijkend), len(afwijkend_ids), "orders waar gepickt is wat niet gevraagd was",
            [{"order_id": o} for o in verzonden_afwijkend], "De verzonden orders met een pickafwijking"),
        kpi("K2", "Afwijkende orders met een retour", None, None, len(retour_afwijkend), len(afwijkend_ids), "orders waar gepickt is wat niet gevraagd was",
            [{"order_id": o, "reden_retour": ", ".join(r["reden"] for r in retouren if r["order_id"] == o)} for o in retour_afwijkend], "De orders met een pickafwijking en een retour"),
        kpi("K3", "Retour 'verkeerd artikel' zonder pickafwijking", AFSPRAKEN["INV-L5-01"], "INV-L5-01", len(verkeerd_zonder_afwijking), len(verkeerd_artikel), "retouren met reden 'verkeerd artikel'",
            [{"retour_id": r["retour_id"], "order_id": r["order_id"], "reden": r["reden"]} for r in verkeerd_zonder_afwijking], "De retouren waarvan de picks wel klopten met de order"),
        kpi("K4", "Verzonden orders zonder vastgelegde pick", None, None, len(zonder_pick_verzonden), len(verzonden_orders), "verzonden orders",
            [{"order_id": o} for o in zonder_pick_verzonden], "De verzonden orders waarvan geen pick is vastgelegd"),
    ],
}
(BRONNEN / "kpi-orders.json").write_text(json.dumps(kpi_orders, ensure_ascii=False, indent=1), encoding="utf-8")
for sectie in ("orderpick_aanvulling", "ordercontrole", "keten"):
    for k in kpi_orders[sectie]: print(f"{k['id']}: {k['cijfer']['teller']} van {k['cijfer']['noemer']} {k['cijfer']['omschrijving']} | norm: {k['bron_verwachting']}")
print(f"kpi-orders.json {(BRONNEN / 'kpi-orders.json').stat().st_size/1024:.1f} kB")
