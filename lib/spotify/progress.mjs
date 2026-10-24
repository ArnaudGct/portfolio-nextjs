const clamp = (value, duration) => Math.max(0, Math.min(duration, value));

export function progressAt(clock, now) {
  const elapsed = Math.max(0, now - clock.at);
  const fraction = clock.settleMs ? Math.min(1, elapsed / clock.settleMs) : 1;
  const eased = fraction * fraction * (3 - 2 * fraction);
  return clamp(clock.from + (clock.target - clock.from) * eased +
    (clock.playing ? elapsed : 0), clock.duration);
}

export function syncProgress(previous, sample, now) {
  const duration = Math.max(0, sample.duration || 0);
  const target = clamp(sample.progress || 0, duration);
  const from = previous ? progressAt(previous, now) : target;
  const difference = Math.abs(target - from);
  return {
    from, target, at: now, duration, playing: sample.isPlaying,
    // Les petites dérives ralentissent/accélèrent légèrement le compteur.
    // Un vrai déplacement dans le morceau glisse vers la nouvelle position.
    settleMs: !previous ? 0 : difference > 2000 ? 700 : Math.max(1000, difference * 3),
  };
}
