import fs from 'node:fs/promises';
import path from 'node:path';

export type Scanregel = {
  event_id: string; medewerker_id: string; locatie: string; tijdstip_start: string; piktijd_seconden: number;
  route_index_verwacht: number; route_index_actueel: number; voor_scan: boolean; na_scan: boolean; route_wissel: boolean;
  picks_in_ronde: number; periode: 'A' | 'B'; week: string; afwijkt: Record<string, string>;
};

let geheugen: Promise<Scanregel[]> | null = null;

function laad(): Promise<Scanregel[]> {
  if (!geheugen) {
    geheugen = fs.readFile(path.join(process.cwd(), 'grond-regels', 'scanregels.json'), 'utf8').then((tekst) => JSON.parse(tekst));
  }
  return geheugen;
}

export type Filter = { instructie?: string; periode?: string; medewerker?: string; locatie?: string; week?: string };

export async function zoekRegels(filter: Filter, limiet = 25) {
  const alle = await laad();
  const passend = alle.filter((r) => {
    if (filter.periode && r.periode !== filter.periode) return false;
    if (filter.medewerker && r.medewerker_id !== filter.medewerker) return false;
    if (filter.locatie && r.locatie !== filter.locatie) return false;
    if (filter.week && r.week !== filter.week) return false;
    if (filter.instructie && !(filter.instructie in r.afwijkt)) return false;
    return true;
  });
  return {
    totaal: passend.length,
    regels: passend.slice(0, limiet).map((r) => ({
      event_id: r.event_id, medewerker_id: r.medewerker_id, locatie: r.locatie, tijdstip_start: r.tijdstip_start,
      piktijd_seconden: r.piktijd_seconden, wat_viel_op: filter.instructie ? r.afwijkt[filter.instructie] : Object.values(r.afwijkt).join('; '),
    })),
  };
}
