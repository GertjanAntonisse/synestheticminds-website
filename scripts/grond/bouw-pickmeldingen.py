"""
Bouwt de pickmeldingen voor de speeltuin: wat een picker meldde bij een artikel dat niet te vinden was of niet genoeg aanwezig,
en wat de controle daarover vastlegde. Verzonnen, op de dagen uit bezetting.json en op de artikelen en voorraadlocaties uit voorraad.json.
Niet gekoppeld aan de 120 orders.

Twee verhalen zitten erin:
- ART-005 heeft in de voorraad geen locatie (ook in picks.json is die bij 32 van 33 picks leeg). Pickers zoeken het en vinden het meestal op R3-V2-L2.
  Op een aantal dagen meldt de ene picker dat hij het daar vond en gepickt heeft, en de andere dat hij het niet vond en 0 pickte. De controle bevestigt beide.
- ART-002 heeft maar 3 stuks op R3-V1-L1. Bij bestellingen van meer pickt de picker wat er is.

Uitvoeren (na bouw-afdelingen.py): /Users/gertjan/ai-projects/.venv/bin/python -I scripts/grond/bouw-pickmeldingen.py
"""
import json
import random
from collections import Counter
from pathlib import Path

BRONNEN = Path(__file__).resolve().parents[2] / "grond-bronnen"
PICKERS = ["MW-001", "MW-002", "MW-003", "MW-004", "MW-005"]
dagen = sorted({r["datum"] for r in json.load(open(BRONNEN / "bezetting.json", encoding="utf-8"))["bezetting"]})
rng = random.Random("grond-pickmeldingen-1")

meldingen = []
def voeg(datum, picker, artikel, verwacht, gescand, gevraagd, gepickt, soort):
    meldingen.append({"datum": datum, "medewerker_id": picker, "artikel_id": artikel, "locatie_in_voorraad": verwacht, "gescande_locatie": gescand,
                      "gevraagd": gevraagd, "gepickt": gepickt, "melding": soort, "controle": "bevestigd"})

# ART-005: twee pickers, dezelfde dag, een andere melding.
tegenstrijdig = sorted(rng.sample(dagen, 12))
for datum in tegenstrijdig:
    a, b = rng.sample(PICKERS, 2)
    gevraagd = rng.randint(2, 6)
    voeg(datum, a, "ART-005", None, "R3-V2-L2", gevraagd, gevraagd, "gevonden op andere locatie")
    voeg(datum, b, "ART-005", None, None, rng.randint(2, 6), 0, "niet gevonden")
# ART-005: losse meldingen.
for datum in rng.sample([d for d in dagen if d not in tegenstrijdig], 16):
    gevraagd = rng.randint(2, 6)
    plek = "R3-V2-L2" if rng.random() < 0.8 else rng.choice(["R2-V2-L1", "R3-V2-L1", "R4-V1-L2"])
    voeg(datum, rng.choice(PICKERS), "ART-005", None, plek, gevraagd, gevraagd, "gevonden op andere locatie")
for datum in rng.sample([d for d in dagen if d not in tegenstrijdig], 5):
    voeg(datum, rng.choice(PICKERS), "ART-005", None, None, rng.randint(2, 6), 0, "niet gevonden")
# ART-002: te weinig aanwezig.
for datum in rng.sample(dagen, 14):
    gevraagd = rng.randint(4, 7)
    voeg(datum, rng.choice(PICKERS), "ART-002", "R3-V1-L1", "R3-V1-L1", gevraagd, rng.randint(1, 3), "te weinig aanwezig")

meldingen.sort(key=lambda m: (m["datum"], m["medewerker_id"]))
for i, m in enumerate(meldingen, 1):
    m["melding_id"] = f"MLD-{i:03d}"
meldingen = [{"melding_id": m["melding_id"], **{k: v for k, v in m.items() if k != "melding_id"}} for m in meldingen]

regels = ",\n".join(json.dumps(m, ensure_ascii=False, separators=(",", ":")) for m in meldingen)
toelichting = "Meldingen van pickers bij een artikel dat niet te vinden was of niet genoeg aanwezig, en wat de controle daarover vastlegde. Verzonnen voor de speeltuin en niet gekoppeld aan de 120 orders. De scans en de piktijd laten hier niets van zien."
(BRONNEN / "pickmeldingen.json").write_text(f'{{"toelichting":{json.dumps(toelichting, ensure_ascii=False)},\n"meldingen":[\n{regels}\n]}}\n', encoding="utf-8")
print(len(meldingen), Counter((m["artikel_id"], m["melding"]) for m in meldingen), f"{(BRONNEN / 'pickmeldingen.json').stat().st_size / 1024:.1f} kB")
