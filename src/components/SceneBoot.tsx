'use client';

import { useEffect } from 'react';

/** Starts the scroll-driven WebGL scene after hydration and tears it down on unmount. */
export default function SceneBoot({ scene }: { scene: 'home' | 'journey' }) {
  useEffect(() => {
    let dead = false;
    let stop: (() => void) | undefined;
    const load = scene === 'home'
      ? import('@/scenes/home-scene').then((m) => m.initHomeScene)
      : import('@/scenes/journey-scene').then((m) => m.initJourneyScene);
    load.then((init) => {
      if (!dead) stop = init();
    });
    return () => {
      dead = true;
      stop?.();
    };
  }, [scene]);
  return null;
}
