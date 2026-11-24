/**
 * Projects are anonymised under NDA: no client names, countries or sites.
 * Specs come from the offer documents, with identifying details removed.
 * Drop a real model at public/models/projects/<id>.glb and the viewer uses it
 * instead of the parametric preview.
 */
export type Project = {
  id: string;
  name: string;
  kind: string;
  summary: string;
  stats: { label: string; value: string }[];
  tags: string[];
  /** Set true once public/models/projects/<id>.glb exists. */
  glb?: boolean;
  /** Parametric preview layout (metres). */
  model: {
    L: number; W: number; H: number;
    body: [number, number];      // enclosed section, x from 0..L
    racks: number;               // total IT racks
    rackH: number;
    inrow: number;
    ups: number;
    chillers: number[];          // x centres of outdoor units
    gens: number;
    preview?: boolean;           // true when dimensions are placeholders
  };
};

export const PROJECTS: Project[] = [
  {
    id: 'project-1023',
    name: 'Project 1023',
    kind: 'AI & HPC',
    summary: 'High-density compute with in-row chilled-water cooling, dual power paths and two generator sets. Steel space frame, outdoor chillers at both ends.',
    stats: [
      { label: 'IT load', value: '120 kW' },
      { label: 'Racks', value: '4 x 48U, up to 30 kW each' },
      { label: 'Envelope', value: '16.35 x 3.2 x 3.2 m' },
      { label: 'Power', value: '2N, 2 x 150 kW UPS' },
    ],
    tags: ['Tier III Ready', 'Chilled water', 'Li-ion storage'],
    model: { L: 16.35, W: 3.2, H: 3.2, body: [3.3, 13.05], racks: 4, rackH: 2.26, inrow: 6, ups: 2, chillers: [1.6, 14.75], gens: 0 },
  },
  {
    id: 'project-1047',
    name: 'Project 1047',
    kind: 'Legacy',
    summary: 'Seven-module enterprise hall: three white-space modules, two for electrical and UPS, one office, one sheltering the outdoor condensers. 2N cooling and power.',
    stats: [
      { label: 'IT load', value: '120 kW' },
      { label: 'Racks', value: '24 x 42U, 5 kW each' },
      { label: 'Envelope', value: '12.19 x 2.44 x 2.90 m' },
      { label: 'Cooling', value: '10 x 25 kW in-row DX, 2N' },
    ],
    tags: ['Tier III Ready', 'Air cooled', '7 modules'],
    model: { L: 12.19, W: 2.44, H: 2.9, body: [0.4, 11.79], racks: 24, rackH: 2.0, inrow: 10, ups: 2, chillers: [], gens: 0 },
  },
  {
    id: 'project-1068',
    name: 'Project 1068',
    kind: 'Open container',
    summary: 'Open-plan data hall with a central rack line, in-row cooling, a UPS and battery pair, and an outdoor chiller at each end. Two generator sets alongside.',
    stats: [
      { label: 'Footprint', value: '13.2 m + 4.6 m plant' },
      { label: 'Hall', value: '7.7 x 3.2 m' },
      { label: 'Cooling', value: '2 outdoor chillers, in-row units' },
      { label: 'Plant', value: '2 generator sets' },
    ],
    tags: ['In-row cooling', 'Generator ready', 'Open plan'],
    model: { L: 13.2, W: 3.2, H: 3.0, body: [2.75, 10.45], racks: 14, rackH: 2.0, inrow: 6, ups: 2, chillers: [1.35, 11.85], gens: 2 },
  },
  {
    id: 'project-1092',
    name: 'Project 1092',
    kind: 'Mobile container',
    summary: 'Mobile container data center. Model preview shown while the full design model is prepared for the web.',
    stats: [
      { label: 'Type', value: 'Mobile container' },
      { label: 'Status', value: 'Model in preparation' },
    ],
    tags: ['Mobile', 'Containerised'],
    model: { L: 12.2, W: 2.44, H: 2.6, body: [0, 12.2], racks: 10, rackH: 2.0, inrow: 4, ups: 1, chillers: [], gens: 0, preview: true },
  },
  {
    id: 'project-1115',
    name: 'Project 1115',
    kind: 'Transportable',
    summary: 'Open-plan data hall built to travel: the finished module rides on a low-bed trailer with its two outdoor chillers in the end bays and two generator sets on the same trailer. Delivered as one road load.',
    stats: [
      { label: 'Transport length', value: '21.7 m with tractor' },
      { label: 'Width', value: '3.2 m' },
      { label: 'Module', value: '8.5 m hall + 2 x 2.35 m chiller bays' },
      { label: 'Plant', value: '2 generator sets on the trailer' },
    ],
    tags: ['Transportable', 'In-row cooling', 'Generator ready'],
    model: { L: 13.2, W: 3.2, H: 3.0, body: [2.75, 10.45], racks: 14, rackH: 2.0, inrow: 6, ups: 2, chillers: [1.35, 11.85], gens: 2 },
  },
];
