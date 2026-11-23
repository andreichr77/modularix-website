/**
 * Solution pages. Technical data is taken from the live Modularix site (modularix.world/solutions/...).
 * Where that page publishes nothing, the page says so instead of inventing numbers.
 */
export type Spec = { label: string; value: string };
export type Solution = {
  slug: string;
  id: string;
  title: string;
  kind: string;
  tagline: string;
  intro: string;
  tags: string[];
  groups: { title?: string; specs: Spec[] }[];
  notes?: string[];
  source?: string;
};

export const SOLUTIONS: Solution[] = [
  {
    slug: 'legacy',
    id: 'CFG-01',
    title: 'Legacy',
    kind: 'Standard',
    tagline: 'Modernize aging infrastructure with zero disruption.',
    intro: 'Air-cooled modules for standard enterprise workloads. Proven, efficient, dependable. Legacy upgrades older data center capacity into modern, efficient systems through assessed, phased migrations that limit downtime while improving performance, security and cost.',
    tags: ['Air cooling', 'N+1 / 2N'],
    groups: [{ specs: [
      { label: 'Cooling type', value: 'Air cooling (N+1)' },
      { label: 'Power capacity', value: 'Up to 2 MW' },
      { label: 'Rack density', value: 'Up to 10 kW per rack' },
      { label: 'Deployment time', value: '8 to 16 weeks' },
      { label: 'PUE', value: 'Below 1.5' },
      { label: 'Tier level', value: 'Tier II / III' },
      { label: 'Availability', value: '99.982% (Tier III)' },
      { label: 'Compliance', value: 'ISO 9001, ISO 27001' },
      { label: 'Management', value: 'DCIM-ready' },
    ] }],
    notes: ['Reference module: the Legacy container is 8.50 x 3.20 x 3.20 m.'],
  },
  {
    slug: 'ai-hpc',
    id: 'CFG-02',
    title: 'AI & HPC Ready',
    kind: 'High density',
    tagline: 'High-density compute for AI and HPC workloads.',
    intro: 'High-density compute with direct-to-chip liquid cooling. Built for GPU clusters, machine learning pipelines and high-performance computing, with high power density, precision cooling and low-latency networking.',
    tags: ['Direct-to-chip', 'Chilled water'],
    groups: [{ specs: [
      { label: 'Cooling', value: 'Liquid, direct-to-chip' },
      { label: 'Power density', value: 'Up to 100 kW per rack' },
      { label: 'Network', value: '400G InfiniBand' },
      { label: 'PUE', value: 'Below 1.2' },
      { label: 'GPU support', value: 'NVIDIA H100 and A100' },
      { label: 'Deployment time', value: '6 to 12 weeks' },
      { label: 'Storage', value: 'NVMe and parallel file system' },
      { label: 'Availability', value: '99.999% (Tier IV)' },
      { label: 'Management', value: 'AI-optimized DCIM' },
    ] }],
    notes: ['Standalone module: up to 300 kW. Up to 1,200 kW when combined with separate power and cooling skids or modules.'],
  },
  {
    slug: 'expandable',
    id: 'CFG-03',
    title: 'Expandable',
    kind: 'Grows',
    tagline: 'Scale on demand. No interruptions, no limits.',
    intro: 'Standard transport width in transit, full working width on site. Capacity is added in stages, module by module, without interrupting live operations.',
    tags: ['13.2 m transit', '3.2 m deployed'],
    groups: [{ specs: [
      { label: 'Starting capacity', value: '100 kW' },
      { label: 'Maximum capacity', value: '10+ MW' },
      { label: 'Expansion increments', value: '250 kW modules' },
      { label: 'Cooling', value: 'Air and hybrid liquid' },
      { label: 'Downtime during expansion', value: 'Zero' },
      { label: 'Tier level', value: 'Tier III / IV' },
      { label: 'Rack density', value: 'Up to 20 kW per rack' },
      { label: 'Availability', value: '99.982% (Tier III+)' },
      { label: 'Management', value: 'Full DCIM integration' },
    ] }],
    notes: ['Transit length 13.2 m. Deployed width 3.2 m.'],
  },
  {
    slug: 'emsec-ready',
    id: 'CFG-04',
    title: 'EMSEC Ready',
    kind: 'Emission security',
    tagline: 'Emission security for sensitive environments.',
    intro: 'Shielded, filtered and sealed so no readable signal leaves the module. For classified and defence-grade environments.',
    tags: ['Shielded', 'Filtered', 'Sealed'],
    groups: [{ specs: [
      { label: 'Shielding', value: 'Shielded enclosure' },
      { label: 'Power and signal lines', value: 'Filtered' },
      { label: 'Penetrations', value: 'Sealed' },
    ] }],
    notes: ['Attenuation values, zoning and test standards are project specific. Ask the engineering team for the full technical data.'],
  },
  {
    slug: 'custom',
    id: 'CFG-05',
    title: 'Custom',
    kind: 'Bespoke',
    tagline: 'Fully bespoke infrastructure tailored to your exact requirements.',
    intro: 'When off-the-shelf options do not fit, Modularix works with you to design, validate and deploy a data center that meets your power, cooling, security and compliance needs, engineered from the shell inward.',
    tags: ['Your spec'],
    groups: [{ specs: [
      { label: 'Power range', value: '50 kW to 50+ MW' },
      { label: 'Cooling', value: 'Any, per design' },
      { label: 'Tier level', value: 'Tier I to IV' },
      { label: 'Rack density', value: 'Any, per design' },
      { label: 'Redundancy', value: 'N, N+1, 2N, 2N+1' },
      { label: 'Lead time', value: 'Per engineering scope' },
      { label: 'Compliance', value: 'Full certification support' },
      { label: 'Support', value: '24/7 SLA' },
      { label: 'Management', value: 'Any DCIM platform' },
    ] }],
  },
  {
    slug: 'power-cooling',
    id: 'CFG-06',
    title: 'Power & Cooling Skids',
    kind: 'Plant',
    tagline: 'Pre-engineered power and cooling modules. Rapid deployment, plug-and-play integration.',
    intro: 'Factory-built, fully tested units that pair with any configuration or fit into an existing facility. Options range from UPS and PDU assemblies to precision chiller and cooling tower skids, each sized to specific electrical and thermal loads and shipped ready for commissioning.',
    tags: ['Pairs with any', 'Existing sites'],
    groups: [
      { title: 'Power skid', specs: [
        { label: 'Power range', value: '100 kVA to 5 MVA' },
        { label: 'Cooling capacity', value: 'Up to 2 MW per unit' },
        { label: 'Cooling types', value: 'Air, chilled water or adiabatic' },
        { label: 'PUE', value: 'Below 1.3' },
        { label: 'Factory testing', value: 'FAT included' },
        { label: 'Lead time', value: '8 to 14 weeks' },
        { label: 'Redundancy', value: 'N+1 or 2N' },
        { label: 'Monitoring', value: 'Remote SCADA' },
        { label: 'Standards', value: 'IEC 62271, EN 60439' },
      ] },
      { title: 'Cooling skid', specs: [
        { label: 'Cooling capacity', value: 'Up to 2 MW per unit' },
        { label: 'Cooling types', value: 'Air, chilled water or adiabatic' },
        { label: 'Supply temperature', value: '12 to 18 °C' },
        { label: 'Delta T', value: '5 to 10 K' },
        { label: 'PUE', value: 'Below 1.3' },
        { label: 'Refrigerants', value: 'R410A, R32, R744' },
        { label: 'IP rating', value: 'IP54' },
        { label: 'Monitoring', value: 'Remote SCADA' },
        { label: 'Lead time', value: '10 to 16 weeks' },
      ] },
    ],
  },
];

export const bySlug = (s: string) => SOLUTIONS.find((x) => x.slug === s);
