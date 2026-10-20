import { href } from '../lib/router';
import type { BlindSpot } from '../lib/stats';

export function BlindSpotCards({ spots }: { spots: BlindSpot[] }) {
  return (
    <div className="spots">
      {spots.map((s) => (
        <a
          key={s.id}
          className={`spot is-${s.tone}`}
          href={href.journal(s.filter.area ? { area: s.filter.area, status: 'resolved' } : { mood: s.filter.mood!, status: 'resolved' })}
        >
          <span className="spot-kicker">{s.kicker}</span>
          <span className="spot-title">{s.title}</span>
          <span className="spot-body">{s.body}</span>
          <span className="spot-foot">
            {s.foot} · See them →
          </span>
        </a>
      ))}
    </div>
  );
}
