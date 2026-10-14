'use client';

import { useEffect, useState, type ReactNode } from 'react';
import styles from './grond.module.css';

// Een tabblad is ook te kiezen met ?tab=pick, ?tab=controle of ?tab=keten, zodat je ernaar kunt verwijzen.
export default function GrondTabs({ tabs, ids, panelen }: { tabs: string[]; ids: string[]; panelen: ReactNode[] }) {
  const [actief, setActief] = useState(0);
  useEffect(() => {
    const gekozen = ids.indexOf(new URLSearchParams(window.location.search).get('tab') || '');
    if (gekozen >= 0) setActief(gekozen);
  }, [ids]);
  return (
    <div>
      <div className={styles.tabs} role="tablist">
        {tabs.map((naam, i) => (
          <button key={naam} type="button" role="tab" aria-selected={i === actief} className={i === actief ? styles.tabActief : styles.tab} onClick={() => setActief(i)}>
            {naam}
          </button>
        ))}
      </div>
      {panelen.map((paneel, i) => (
        <div key={i} role="tabpanel" hidden={i !== actief}>{paneel}</div>
      ))}
    </div>
  );
}
