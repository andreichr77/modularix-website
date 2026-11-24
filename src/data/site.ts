export const SITE = {
  name: 'Modularix',
  email: 'office@synotech.com',
  url: 'https://modularix.world',
  configuratorUrl: 'https://capable-pudding-030435.netlify.app/',
  registerUrl: 'https://uptimeinstitute.com/tier-certification/tier-certification-list',
  description:
    'Modularix builds prefabricated modular data centers in a factory and delivers them finished to your pad. A Synotech company.',
};

export const NAV = [
  { key: 'module', href: '/', label: 'Module' },
  { key: 'journey', href: '/journey', label: 'Journey' },
  { key: 'solutions', href: '/#configs', label: 'Solutions' },
  { key: 'projects', href: '/projects', label: 'Projects' },
  { key: 'configure', href: '/configure', label: 'Configure' },
  { key: 'company', href: '/company', label: 'Company' },
  { key: 'contact', href: '/#contact', label: 'Contact' },
] as const;

export type NavKey = (typeof NAV)[number]['key'];

export type Cert = {
  city: string;
  tier: 'iv' | 'iii';
  scope: string;
  code: string;
  year: string;
  client: string;
};

export const CERTS: Cert[] = [
  { city: 'Bucharest', tier: 'iv', scope: 'Design + Constructed Facility', code: 'TCDD + TCCF', year: 'May 2025', client: 'Governmental Cloud' },
  { city: 'Bucharest', tier: 'iv', scope: 'Design + Constructed Facility', code: 'TCDD + TCCF', year: 'Dec 2025', client: 'Governmental Cloud' },
  { city: 'Timiș', tier: 'iv', scope: 'Design + Constructed Facility', code: 'TCDD + TCCF', year: '2025', client: 'Governmental Cloud' },
  { city: 'Timiș', tier: 'iv', scope: 'Design + Constructed Facility', code: 'TCDD + TCCF', year: '2025', client: 'Ministry of Justice' },
  { city: 'Brașov', tier: 'iii', scope: 'Design + Constructed Facility', code: 'TCDD + TCCF', year: '2024', client: 'Governmental Cloud' },
  { city: 'Brașov', tier: 'iii', scope: 'Design + Constructed Facility', code: 'TCDD + TCCF', year: '2024', client: 'Ministry of Justice' },
  { city: 'Sibiu', tier: 'iii', scope: 'Design documents', code: 'TCDD', year: '2024', client: 'Governmental Cloud' },
];

export type Config = {
  id: string;
  slug: string;
  kind: string;
  title: string;
  text: string;
  tags: string[];
  emsec?: boolean;
};

export const CONFIGS: Config[] = [
  { id: 'CFG-01', slug: 'legacy', kind: 'Standard', title: 'Legacy', text: 'Air-cooled modules for standard enterprise workloads. Proven, efficient, dependable.', tags: ['Air cooling', 'N+1 / 2N'] },
  { id: 'CFG-02', slug: 'ai-hpc', kind: 'High density', title: 'AI & HPC Ready', text: 'High-density compute with direct-to-chip liquid cooling. Built for GPUs at scale.', tags: ['Direct-to-chip', 'Chilled water'] },
  { id: 'CFG-03', slug: 'expandable', kind: 'Grows', title: 'Expandable', text: 'Standard transport width in transit, full working width on site. Grow module by module without interrupting live operations.', tags: ['13.2 m transit', '3.2 m deployed'] },
  { id: 'CFG-04', slug: 'emsec-ready', kind: 'Emission security', title: 'EMSEC Ready', text: 'Shielded, filtered and sealed so no readable signal leaves the module. For classified and defence-grade environments.', tags: ['Shielded', 'Filtered', 'Sealed'], emsec: true },
  { id: 'CFG-05', slug: 'custom', kind: 'Bespoke', title: 'Custom', text: 'Bespoke modules engineered to your specification, from the shell inward.', tags: ['Your spec'] },
  { id: 'CFG-06', slug: 'power-cooling', kind: 'Plant', title: 'Power & Cooling Skids', text: 'Factory-built power and cooling modules that pair with any configuration, or with your existing facility.', tags: ['Pairs with any', 'Existing sites'] },
];

/**
 * Legal identity used on the Privacy, Cookies and Terms pages.
 * Keep in sync with the company registration.
 */
export const LEGAL = {
  entity: 'MODULARIX.WORLD S.R.L.',
  address: 'Str. Știrbei Vodă nr. 104-106, Sector 1, Bucharest, Romania',
  regNo: 'J2021002952401',
  vat: 'RO43764389',
  email: 'office@synotech.com',
  updated: '24 November 2026',
  linkedInPartnerId: '11424329',
  metaPixelId: '2519011108507099',
} as const;
