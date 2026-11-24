'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import '@/styles/consent.css';

const KEY = 'mx-consent';
const VERSION = 1;
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 182; // ask again after about 6 months
const LI_ID = '11424329';
const META_ID = '2519011108507099';
export const OPEN_EVENT = 'mx-open-consent';

type Stored = { v: number; marketing: boolean; ts: number };

function read(): Stored | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Stored;
    if (p && p.v === VERSION && typeof p.marketing === 'boolean' && Date.now() - p.ts < MAX_AGE_MS) return p;
    return null;
  } catch {
    return null;
  }
}

function write(marketing: boolean) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ v: VERSION, marketing, ts: Date.now() } satisfies Stored));
  } catch {
    /* storage blocked: the choice only lasts for this page view */
  }
}

function loadLinkedIn() {
  if (document.getElementById('li-insight')) return;
  const w = window as unknown as Record<string, unknown>;
  w._linkedin_partner_id = LI_ID;
  const ids = (w._linkedin_data_partner_ids as string[] | undefined) || [];
  if (!ids.includes(LI_ID)) ids.push(LI_ID);
  w._linkedin_data_partner_ids = ids;
  if (!w.lintrk) {
    const q: unknown[] = [];
    const fn = (a: unknown, b: unknown) => { q.push([a, b]); };
    (fn as unknown as { q: unknown[] }).q = q;
    w.lintrk = fn;
  }
  const s = document.createElement('script');
  s.id = 'li-insight';
  s.async = true;
  s.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
  document.head.appendChild(s);
}

function loadMeta() {
  if (document.getElementById('meta-pixel')) return;
  const w = window as unknown as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  if (!w.fbq) {
    const n: any = function (...args: unknown[]) { // eslint-disable-line @typescript-eslint/no-explicit-any
      if (n.callMethod) n.callMethod(...args); else n.queue.push(args);
    };
    w.fbq = n;
    if (!w._fbq) w._fbq = n;
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
  }
  const s = document.createElement('script');
  s.id = 'meta-pixel';
  s.async = true;
  s.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(s);
  w.fbq('init', META_ID);
  w.fbq('track', 'PageView');
}

function loadMarketing() {
  loadLinkedIn();
  loadMeta();
}

export default function ConsentBanner() {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const granted = useRef(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = read();
    if (saved) {
      setMarketing(saved.marketing);
      if (saved.marketing) { loadMarketing(); granted.current = true; }
    } else {
      setOpen(true);
    }
    setReady(true);
    const reopen = () => {
      setMarketing(read()?.marketing ?? false);
      setDetails(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  useEffect(() => {
    if (open && ready && details) box.current?.focus();
  }, [open, ready, details]);

  const save = useCallback((m: boolean) => {
    write(m);
    setMarketing(m);
    setOpen(false);
    setDetails(false);
    if (m) {
      loadMarketing();
      granted.current = true;
    } else if (granted.current) {
      // A script that is already running cannot be unloaded: reload so it stops.
      window.location.reload();
    }
  }, []);

  if (!ready || !open) return null;

  return (
    <div className="cc" role="region" aria-label="Cookie consent" ref={box} tabIndex={-1}>
      <p className="cc-t">Cookies and your privacy</p>
      <p className="cc-p">
        We use essential storage to run this site. With your permission we also use the LinkedIn Insight Tag and the Meta Pixel to
        measure our advertising. Nothing optional loads until you choose. Details in our{' '}
        <Link href="/cookies">Cookie Policy</Link> and <Link href="/privacy">Privacy Policy</Link>.
      </p>
      {details && (
        <div className="cc-list">
          <div className="cc-row">
            <div>
              <b>Essential</b>
              <span>Remembers your cookie choice on this device. Always on.</span>
            </div>
            <input type="checkbox" checked disabled aria-label="Essential, always on" />
          </div>
          <div className="cc-row">
            <div>
              <b>Advertising measurement</b>
              <span>LinkedIn Insight Tag and Meta Pixel: conversion tracking and audience reports for our LinkedIn, Facebook and Instagram campaigns.</span>
            </div>
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
              aria-label="Advertising measurement"
            />
          </div>
        </div>
      )}
      <div className="cc-btns">
        <button type="button" className="cc-b" onClick={() => save(false)}>Refuse optional</button>
        {details ? (
          <button type="button" className="cc-b" onClick={() => save(marketing)}>Save choices</button>
        ) : (
          <button type="button" className="cc-b" onClick={() => setDetails(true)}>Customize</button>
        )}
        <button type="button" className="cc-b cc-main" onClick={() => save(true)}>Accept all</button>
      </div>
    </div>
  );
}
