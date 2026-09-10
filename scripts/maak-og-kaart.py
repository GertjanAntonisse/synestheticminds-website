#!/usr/bin/env python3
"""Bouwt de deelkaarten voor de boekpagina, per taal.

Wat LinkedIn, Facebook of WhatsApp laat zien is de kaart, niet de pagina. De
algemene SM-kaart zegt niets over de boeken, dus krijgt /boek een eigen kaart:
zelfde grammatica (cremegrond, inktletter, teal streepje) met de reeksnaam en
de spiraal.

Chrome drukt de HTML af op dubbele schaal, sips schaalt terug naar 1200x630.
Zo blijft de letter scherp zonder dat er een beeldbibliotheek bij komt.

Gebruik:  python scripts/maak-og-kaart.py
"""

import subprocess
import tempfile
from pathlib import Path

HIER = Path(__file__).resolve().parent
WORTEL = HIER.parent
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
SPIRAAL = WORTEL / "public" / "boek" / "lvw-logo.png"

TALEN = {
    "nl": {
        "titel": "De logica van werk",
        "vraag": "Klopt het beeld dat we hebben van ons werk met het werk zelf?",
        "voet": "Twee delen &middot; vrij te downloaden",
    },
    "en": {
        "titel": "The Logic of Work",
        "vraag": "Does the picture we hold of our work match the work itself?",
        # De Engelse delen zitten tot eind november 2026 in KDP Select en zijn
        # dus nog niet vrij te downloaden. Een kaart die dat wel belooft, breekt
        # die belofte al bij de klik. Wordt "free to download" zodra de
        # inschrijving afloopt en de vlag op de boekpagina omgaat.
        "voet": "Two parts &middot; out now",
    },
}

SJABLOON = """<!doctype html>
<meta charset="utf-8"/>
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{
    width: 1200px; height: 630px; overflow: hidden; position: relative;
    background: #f6f3ec; color: #1f2937;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", system-ui, sans-serif;
  }}
  .spiraal {{
    position: absolute; right: -110px; top: 50%; transform: translateY(-50%);
    width: 620px; height: 620px; opacity: 0.34;
  }}
  .tekst {{ position: relative; padding: 96px 0 0 90px; width: 760px; }}
  .reeks {{
    font-size: 22px; letter-spacing: 0.16em; text-transform: uppercase;
    color: #0f766e; margin-bottom: 26px;
  }}
  h1 {{ font-size: 82px; line-height: 1.04; font-weight: 700; letter-spacing: -0.02em; }}
  .streep {{ width: 88px; height: 4px; background: #0f766e; margin: 34px 0 30px; border-radius: 2px; }}
  .vraag {{ font-size: 34px; line-height: 1.35; color: #4b5563; max-width: 660px; }}
  .voet {{
    position: absolute; left: 90px; bottom: 66px;
    font-size: 22px; color: #667085; letter-spacing: 0.02em;
  }}
</style>
<img class="spiraal" src="{spiraal}" alt=""/>
<div class="tekst">
  <div class="reeks">Synesthetic Minds</div>
  <h1>{titel}</h1>
  <div class="streep"></div>
  <p class="vraag">{vraag}</p>
</div>
<div class="voet">{voet}</div>
"""


def bouw(taal: str, waarden: dict) -> Path:
    uit = WORTEL / "public" / "boek" / f"og-boek-{taal}.png"
    with tempfile.TemporaryDirectory() as tmp:
        pagina = Path(tmp) / "kaart.html"
        pagina.write_text(SJABLOON.format(spiraal=SPIRAAL.as_uri(), **waarden), encoding="utf-8")
        groot = Path(tmp) / "2x.png"
        subprocess.run(
            [CHROME, "--headless", "--disable-gpu", "--hide-scrollbars",
             "--force-device-scale-factor=2", "--window-size=1200,630",
             f"--screenshot={groot}", "--virtual-time-budget=6000", pagina.as_uri()],
            check=True, capture_output=True,
        )
        subprocess.run(["sips", "-z", "630", "1200", str(groot), "--out", str(uit)],
                       check=True, capture_output=True)
    print(f"Klaar: {uit.relative_to(WORTEL)}  ({uit.stat().st_size // 1024} kB)")
    return uit


if __name__ == "__main__":
    for taal, waarden in TALEN.items():
        bouw(taal, waarden)
