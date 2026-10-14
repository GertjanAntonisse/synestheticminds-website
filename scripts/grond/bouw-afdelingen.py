"""
Bouwt de gegevens voor bezetting, ordercontrole en verzending van het gesimuleerde magazijn.

Alles hierin is verzonnen, behalve wat uit de scanregels komt (wie er per dag pickte en hoeveel pickregels).
De orders, picks en zendingen in de Invariant Design-demo hebben geen dagindeling die bij de scanregels past,
daarom hebben controle en verzending hier hun eigen dagwerk. Ze zijn niet gekoppeld aan de 120 orders.

Uitvoeren: /Users/gertjan/ai-projects/.venv/bin/python -I scripts/grond/bouw-afdelingen.py
"""
import json
import random
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from pathlib import Path

BRON = Path("/Users/gertjan/ai-projects/invariant-design-demo")
BRONNEN = Path(__file__).resolve().parents[2] / "grond-bronnen"
VERSCHUIVING = timedelta(days=30)  # zelfde verschuiving van periode B als in bouw-scanbronnen.py
SEED = "grond-afdelingen-1"

GEPLAND = {"picken": 5, "controle": 2, "verzending": 2}
CONTROLE_SECONDEN_PLANNING = 240            # INS-08
PRODUCTIEVE_SECONDEN = 20160                # 8 uur, 70 procent productief
CAPACITEIT_PER_CONTROLEUR = PRODUCTIEVE_SECONDEN // CONTROLE_SECONDEN_PLANNING  # 84 orders per dag
DAGDOEL_PICKREGELS = 45                     # INS-11, per picker per dag
VERVOERDERS = [("DHL", 0.36, "16:00"), ("DPD", 0.34, "16:30"), ("PostNL", 0.30, "17:00")]
ROUTES_VAST_NORM = "15:00"                  # INS-09

# 1. Dagen en pickers uit de scanregels (met periode B 30 dagen opgeschoven).
events = json.load(open(BRON / "data" / "scanner_events.json", encoding="utf-8"))
pickers_per_dag = defaultdict(set)
regels_per_dag = Counter()
periode_per_dag = {}
for e in events:
    t = datetime.fromisoformat(e["tijdstip_start"])
    if e["periode"] == "B":
        t += VERSCHUIVING
    dag = str(t.date())
    pickers_per_dag[dag].add(e["medewerker_id"])
    regels_per_dag[dag] += 1
    periode_per_dag[dag] = e["periode"]
dagen = sorted(periode_per_dag)

def tijd(minuten):
    minuten = int(round(minuten))
    return f"{minuten // 60:02d}:{minuten % 60:02d}"

def minuten(hhmm):
    uur, minuut = hhmm.split(":")
    return int(uur) * 60 + int(minuut)

# 2. Bezetting per dag per afdeling.
bezetting, controle_log, verzend_log = [], [], []
for dag in dagen:
    periode = periode_per_dag[dag]
    rng = random.Random(f"{SEED}-{dag}")
    aanwezig = {"picken": len(pickers_per_dag[dag])}
    uitval = {"picken": {"ziek": 0, "verlof": 0, "inval": 0}}
    for afdeling, kans in (("controle", 0.16), ("verzending", 0.12)):
        weg = 1 if rng.random() < kans else 0
        aanwezig[afdeling] = GEPLAND[afdeling] - weg
        reden = rng.choice(["ziek", "ziek", "verlof"]) if weg else None
        uitval[afdeling] = {"ziek": int(reden == "ziek"), "verlof": int(reden == "verlof"), "inval": 0}
    for afdeling in GEPLAND:
        extra = {"pickregels": regels_per_dag[dag]} if afdeling == "picken" else {}
        bezetting.append({"datum": dag, "periode": periode, "afdeling": afdeling, "gepland": GEPLAND[afdeling], **extra,
                          "aanwezig": aanwezig[afdeling], **{f"afwezig_{k}": v for k, v in uitval[afdeling].items() if k != "inval"}, "inval": uitval[afdeling]["inval"]})

    # 3. Ordercontrole: volledig tot de capaciteit op is, de rest krijgt een steekproef.
    orders = rng.randint(90, 150)
    capaciteit = int(aanwezig["controle"] * CAPACITEIT_PER_CONTROLEUR * rng.uniform(0.92, 1.08))
    volledig = min(orders, capaciteit)
    steekproef = orders - volledig
    seconden = round((volledig * rng.uniform(225, 255) + steekproef * rng.uniform(80, 110)) / orders)
    controle_log.append({"datum": dag, "periode": periode, "orders": orders, "controleurs_aanwezig": aanwezig["controle"],
                         "volledig_gecontroleerd": volledig, "alleen_steekproef": steekproef, "afgekeurd": 0,
                         "gemiddelde_seconden_per_order": seconden})

    # 4. Verzending: routes en containers per vervoerder.
    onderbezet = aanwezig["verzending"] < GEPLAND["verzending"]
    for naam, aandeel, cutoff in VERVOERDERS:
        orders_v = round(orders * aandeel * rng.uniform(0.9, 1.1))
        vast = minuten("14:00") + rng.uniform(-25, 25) + (rng.uniform(45, 85) if onderbezet else 0) + max(0, orders - 120) * 0.5
        klaar = vast + rng.uniform(55, 100) + (rng.uniform(20, 55) if onderbezet else 0)
        gemist = klaar > minuten(cutoff)
        naar_morgen = round(orders_v * rng.uniform(0.15, 0.5)) if gemist else 0
        verzend_log.append({"datum": dag, "periode": periode, "vervoerder": naam, "orders": orders_v, "verzendmedewerkers_aanwezig": aanwezig["verzending"],
                            "routes_vastgesteld_om": tijd(vast), "container_klaar_om": tijd(klaar), "cutoff": cutoff,
                            "orders_naar_volgende_dag": naar_morgen})

def schrijf_rijen(naam, toelichting, lijstnaam, rijen):
    regels = ",\n".join(json.dumps(r, ensure_ascii=False, separators=(",", ":")) for r in rijen)
    (BRONNEN / naam).write_text(f'{{"toelichting":{json.dumps(toelichting, ensure_ascii=False)},\n"{lijstnaam}":[\n{regels}\n]}}\n', encoding="utf-8")

schrijf_rijen("bezetting.json",
    "Bezetting per dag en afdeling in het gesimuleerde magazijn: hoeveel mensen er gepland waren en hoeveel er aanwezig waren, zonder namen. Voor picken komt de aanwezigheid uit de scanregels, voor controle en verzending is ze verzonnen. Elke dag is een werkdag.",
    "bezetting", bezetting)
schrijf_rijen("controle-log.json",
    "Dagwerk van de ordercontrole voor het inpakken, verzonnen voor de speeltuin en niet gekoppeld aan de 120 orders. Per dag: orders, aanwezige controleurs, hoeveel orders volledig werden gecontroleerd (alle regels gescand) en hoeveel alleen met een steekproef, en de gemiddelde tijd per order. Afgekeurd is altijd 0, zoals in de verzendcontrole van de orders.",
    "dagen", controle_log)
schrijf_rijen("verzend-log.json",
    "Dagwerk van de verzendafdeling per vervoerder, verzonnen voor de speeltuin. Per dag en vervoerder: orders, wanneer de routes waren vastgesteld, wanneer de container klaar was, de cut-off van de vervoerder en hoeveel orders daardoor een dag later meegingen.",
    "dagen", verzend_log)

# 5. Het werk op papier voor controle, verzending en bezetting.
instructies = {
    "versie": "1.0",
    "geldig_vanaf": "2026-01-01",
    "toelichting": "Aanvulling op werkinstructies.json: wat op papier staat voor bezetting, ordercontrole en verzending in het gesimuleerde magazijn. Verzonnen voor de speeltuin.",
    "instructies": [
        {"id": "INS-06", "titel": "Bezetting per afdeling", "omschrijving": "De dagplanning gaat uit van 5 pickers, 2 controleurs en 2 verzendmedewerkers per dag.",
         "aannames": ["Het werk van een dag past bij de geplande bezetting", "Uitval wordt binnen de afdeling opgevangen", "Het aantal orders per dag blijft binnen 90 tot 150"], "raakt": ["INS-08", "INS-09", "INS-11"]},
        {"id": "INS-07", "titel": "Volledige ordercontrole", "omschrijving": "Elke order wordt voor het inpakken regel voor regel gecontroleerd. Een order met een verschil gaat niet door naar het inpakken.",
         "aannames": ["De controleur heeft per order de tijd voor alle regels (INS-08)", "Een verschil is zichtbaar bij het scannen"], "raakt": ["INS-08"]},
        {"id": "INS-08", "titel": "Controletijd", "omschrijving": "De planning rekent op 4 minuten per order, dus 84 orders per controleur per dag.",
         "aannames": ["Er zijn twee controleurs (INS-06)", "Een order heeft gemiddeld twee regels"], "raakt": ["INS-06", "INS-07"]},
        {"id": "INS-09", "titel": "Routes en containers", "omschrijving": "De routeindeling en de containers per vervoerder zijn om 15:00 vastgesteld.",
         "aannames": ["De orders van de dag zijn dan gecontroleerd", "Er zijn twee verzendmedewerkers (INS-06)"], "raakt": ["INS-06", "INS-10"]},
        {"id": "INS-10", "titel": "Cut-off vervoerder", "omschrijving": "Elke container is klaar voor de cut-off van de vervoerder: DHL 16:00, DPD 16:30, PostNL 17:00. Wat later komt, gaat de volgende dag mee.",
         "aannames": ["Routes zijn om 15:00 vastgesteld (INS-09)", "De vervoerder houdt de cut-off aan"], "raakt": ["INS-09"]},
        {"id": "INS-11", "titel": "Dagdoel pickregels", "omschrijving": "Een picker haalt per dag minstens 45 pickregels.",
         "aannames": ["Er zijn vijf pickers (INS-06)", "De piktijd blijft tussen 60 en 120 seconden (INS-02)"], "raakt": ["INS-02", "INS-06"]},
    ],
}
(BRONNEN / "werkinstructies-afdelingen.json").write_text(json.dumps(instructies, ensure_ascii=False, indent=1), encoding="utf-8")

# 6. KPI's met de verwachting, het cijfer en het bewijs.
def kpi(kid, naam, verwachting, bron, teller, noemer, omschrijving, bewijs_titel, bewijs):
    return {"id": kid, "naam": naam, "verwachting": verwachting, "bron_verwachting": bron,
            "cijfer": {"teller": teller, "noemer": noemer, "omschrijving": omschrijving}, "bewijs_titel": bewijs_titel, "bewijs_totaal": len(bewijs), "bewijs": bewijs[:30]}

def onderbezet(afdeling):
    return [r for r in bezetting if r["afdeling"] == afdeling and r["aanwezig"] < r["gepland"]]

def paar(rij):
    return {"datum": rij["datum"], "gepland": rij["gepland"], "aanwezig": rij["aanwezig"]}

onder_controle = {r["datum"] for r in onderbezet("controle")}
onder_verzending = {r["datum"] for r in onderbezet("verzending")}
beide = sorted(onder_controle & onder_verzending)

tekort_dagen = [c for c in controle_log if c["orders"] > c["controleurs_aanwezig"] * CAPACITEIT_PER_CONTROLEUR]
steekproef_dagen = [c for c in controle_log if c["alleen_steekproef"] > 0]
orders_totaal = sum(c["orders"] for c in controle_log)
orders_volledig = sum(c["volledig_gecontroleerd"] for c in controle_log)
orders_steekproef = orders_totaal - orders_volledig
steekproef_bij_onderbezet = sum(c["alleen_steekproef"] for c in controle_log if c["datum"] in onder_controle)

vast_laat = [v for v in verzend_log if minuten(v["routes_vastgesteld_om"]) > minuten(ROUTES_VAST_NORM)]
cutoff_gemist = [v for v in verzend_log if minuten(v["container_klaar_om"]) > minuten(v["cutoff"])]
naar_morgen = sum(v["orders_naar_volgende_dag"] for v in verzend_log)
orders_verzend = sum(v["orders"] for v in verzend_log)
gemist_bij_onderbezet = [v for v in cutoff_gemist if v["datum"] in onder_verzending]

pickregels_per_picker = {d: regels_per_dag[d] / len(pickers_per_dag[d]) for d in dagen}
onder_dagdoel = [d for d in dagen if pickregels_per_picker[d] < DAGDOEL_PICKREGELS]

kpi_afdelingen = {
    "toelichting": "KPI's voor bezetting, ordercontrole, verzending en pickregels in het gesimuleerde magazijn. De bezetting van het picken en de pickregels komen uit de scanregels. De rest is verzonnen voor de speeltuin en niet gekoppeld aan de 120 orders. Waar op papier niets is afgesproken, staat dat erbij.",
    "orderpick_aanvulling": [
        kpi("P7", "Pickregels per picker per dag onder het dagdoel", "Een picker haalt per dag minstens 45 pickregels.", "INS-11", len(onder_dagdoel), len(dagen), "dagen",
            "De dagen met gemiddeld minder dan 45 pickregels per picker", [{"datum": d, "pickregels_per_picker": round(pickregels_per_picker[d], 1), "pickers": len(pickers_per_dag[d])} for d in onder_dagdoel]),
    ],
    "ordercontrole_aanvulling": [
        kpi("C4", "Orders alleen met een steekproef gecontroleerd", "Elke order wordt voor het inpakken regel voor regel gecontroleerd.", "INS-07", orders_steekproef, orders_totaal, "orders in totaal",
            "De dagen waarop een deel van de orders alleen een steekproef kreeg", [{"datum": c["datum"], "orders": c["orders"], "controleurs": c["controleurs_aanwezig"], "alleen_steekproef": c["alleen_steekproef"], "seconden_per_order": c["gemiddelde_seconden_per_order"]} for c in steekproef_dagen]),
        kpi("C5", "Dagen met meer orders dan de aanwezige controleurs in 4 minuten per order aankunnen", "De planning rekent op 4 minuten per order, dus 84 orders per controleur per dag.", "INS-08", len(tekort_dagen), len(controle_log), "dagen",
            "De dagen waarop de planning niet haalbaar was met de aanwezige controleurs", [{"datum": c["datum"], "orders": c["orders"], "controleurs": c["controleurs_aanwezig"], "capaciteit": c["controleurs_aanwezig"] * CAPACITEIT_PER_CONTROLEUR} for c in tekort_dagen]),
        kpi("C6", "Orders afgekeurd door de controle", None, None, sum(c["afgekeurd"] for c in controle_log), orders_totaal, "orders in totaal",
            "Per dag het aantal afgekeurde orders: elke dag 0", [{"datum": c["datum"], "afgekeurd": c["afgekeurd"], "alleen_steekproef": c["alleen_steekproef"]} for c in controle_log if c["alleen_steekproef"] > 0]),
    ],
    "verzending": [
        kpi("V1", "Routes en containers om 15:00 vastgesteld", "De routeindeling en de containers per vervoerder zijn om 15:00 vastgesteld.", "INS-09", len(verzend_log) - len(vast_laat), len(verzend_log), "dagen per vervoerder",
            "De dagen en vervoerders waarvoor de routes later waren vastgesteld", [{"datum": v["datum"], "vervoerder": v["vervoerder"], "vastgesteld_om": v["routes_vastgesteld_om"], "verzendmedewerkers": v["verzendmedewerkers_aanwezig"]} for v in vast_laat]),
        kpi("V2", "Containers klaar voor de cut-off", "Elke container is klaar voor de cut-off van de vervoerder.", "INS-10", len(verzend_log) - len(cutoff_gemist), len(verzend_log), "dagen per vervoerder",
            "De dagen en vervoerders waarvoor de container na de cut-off klaar was", [{"datum": v["datum"], "vervoerder": v["vervoerder"], "klaar_om": v["container_klaar_om"], "cutoff": v["cutoff"], "orders_naar_volgende_dag": v["orders_naar_volgende_dag"], "verzendmedewerkers": v["verzendmedewerkers_aanwezig"]} for v in cutoff_gemist]),
        kpi("V3", "Orders die een dag later meegingen", None, None, naar_morgen, orders_verzend, "orders in totaal",
            "De dagen en vervoerders met orders die een dag later meegingen", [{"datum": v["datum"], "vervoerder": v["vervoerder"], "orders_naar_volgende_dag": v["orders_naar_volgende_dag"]} for v in cutoff_gemist]),
    ],
    "bezetting": [
        kpi("B1", "Dagen met minder pickers dan gepland", "De dagplanning gaat uit van 5 pickers per dag.", "INS-06", len(onderbezet("picken")), len(dagen), "dagen",
            "De dagen met minder pickers aanwezig dan gepland (uit de scanregels)", [paar(r) for r in onderbezet("picken")]),
        kpi("B2", "Dagen met minder controleurs dan gepland", "De dagplanning gaat uit van 2 controleurs per dag.", "INS-06", len(onderbezet("controle")), len(dagen), "dagen",
            "De dagen met minder controleurs aanwezig dan gepland", [{**paar(r), "ziek": r["afwezig_ziek"], "verlof": r["afwezig_verlof"]} for r in onderbezet("controle")]),
        kpi("B3", "Dagen met minder verzendmedewerkers dan gepland", "De dagplanning gaat uit van 2 verzendmedewerkers per dag.", "INS-06", len(onderbezet("verzending")), len(dagen), "dagen",
            "De dagen met minder verzendmedewerkers aanwezig dan gepland", [{**paar(r), "ziek": r["afwezig_ziek"], "verlof": r["afwezig_verlof"]} for r in onderbezet("verzending")]),
        kpi("B4", "Dagen met minder mensen dan gepland bij controle én verzending", None, None, len(beide), len(dagen), "dagen",
            "De dagen waarop beide afdelingen onderbezet waren", [{"datum": d} for d in beide]),
        kpi("B5", "Gemiste cut-offs op dagen met minder verzendmedewerkers", None, None, len(gemist_bij_onderbezet), len(cutoff_gemist), "gemiste cut-offs in totaal",
            "De gemiste cut-offs op dagen met één verzendmedewerker", [{"datum": v["datum"], "vervoerder": v["vervoerder"], "klaar_om": v["container_klaar_om"], "cutoff": v["cutoff"]} for v in gemist_bij_onderbezet]),
        kpi("B6", "Orders alleen met steekproef op dagen met minder controleurs", None, None, steekproef_bij_onderbezet, orders_steekproef, "orders met alleen een steekproef in totaal",
            "De dagen met één controleur en wat dat voor de controle betekende", [{"datum": c["datum"], "orders": c["orders"], "alleen_steekproef": c["alleen_steekproef"], "seconden_per_order": c["gemiddelde_seconden_per_order"]} for c in controle_log if c["datum"] in onder_controle]),
    ],
}
def compact(kpis):
    return "[\n" + ",\n".join(json.dumps(k, ensure_ascii=False, separators=(",", ":")) for k in kpis) + "\n]"
(BRONNEN / "kpi-afdelingen.json").write_text(
    "{\n" + json.dumps("toelichting") + ":" + json.dumps(kpi_afdelingen["toelichting"], ensure_ascii=False) + ",\n"
    + ",\n".join(f'{json.dumps(sleutel)}:{compact(kpis)}' for sleutel, kpis in kpi_afdelingen.items() if sleutel != "toelichting") + "\n}\n", encoding="utf-8")
json.loads((BRONNEN / "kpi-afdelingen.json").read_text(encoding="utf-8"))

# 7. Een samenvatting per week, klein genoeg om bij een vraag mee te geven.
weken = defaultdict(lambda: {"dagen": 0, "periode": "", "controle_onderbezet": 0, "verzending_onderbezet": 0, "orders": 0, "alleen_steekproef": 0, "gemist": 0, "orders_naar_volgende_dag": 0})
for c in controle_log:
    w = weken[str(datetime.fromisoformat(c["datum"]).date() - timedelta(days=datetime.fromisoformat(c["datum"]).weekday()))]
    w["dagen"] += 1; w["periode"] = c["periode"]; w["orders"] += c["orders"]; w["alleen_steekproef"] += c["alleen_steekproef"]
    w["controle_onderbezet"] += int(c["controleurs_aanwezig"] < GEPLAND["controle"])
for r in bezetting:
    if r["afdeling"] == "verzending" and r["aanwezig"] < r["gepland"]:
        d = datetime.fromisoformat(r["datum"]); weken[str(d.date() - timedelta(days=d.weekday()))]["verzending_onderbezet"] += 1
for v in verzend_log:
    d = datetime.fromisoformat(v["datum"]); w = weken[str(d.date() - timedelta(days=d.weekday()))]
    w["gemist"] += int(minuten(v["container_klaar_om"]) > minuten(v["cutoff"])); w["orders_naar_volgende_dag"] += v["orders_naar_volgende_dag"]
schrijf_rijen("afdelingen-per-week.json",
    "Per week (maandag als begin): hoeveel dagen controle of verzending minder mensen had dan gepland, hoeveel orders alleen een steekproef kregen en hoeveel containers na de cut-off klaar waren. Verzonnen voor de speeltuin.",
    "per_week", [{"week_vanaf": k, **v} for k, v in sorted(weken.items())])

for sectie in ("orderpick_aanvulling", "ordercontrole_aanvulling", "verzending", "bezetting"):
    for k in kpi_afdelingen[sectie]:
        print(f"{k['id']}: {k['cijfer']['teller']} van {k['cijfer']['noemer']} {k['cijfer']['omschrijving']} | norm: {k['bron_verwachting']}")
for naam in ("bezetting", "controle-log", "verzend-log", "kpi-afdelingen", "afdelingen-per-week", "werkinstructies-afdelingen"):
    print(f"{naam}.json {(BRONNEN / (naam + '.json')).stat().st_size / 1024:.1f} kB")
