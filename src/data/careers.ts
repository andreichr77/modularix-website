
export type Job = {
  slug: string;
  title: string;
  openings: number;
  education: string;
  experience: string;
};

export const CAREERS = {
  email: 'office@synotech.com',
  deadline: '21 December 2026',
  employer: 'Synotech Global Services Romania SRL',
  address: 'Strada Știrbei Vodă 104-106, Bucharest',
  phone: '021 420 0222',
  web: 'https://synotech.com',
} as const;

export const JOBS: Job[] = [
  { slug: 'project-director', title: 'Project Director', openings: 3, education: 'Engineering degree (civil, building services, electrical or automation). Project management courses.', experience: '3 to 5 years on large-scale projects. International projects.' },
  { slug: 'site-manager', title: 'Site Manager', openings: 3, education: 'Engineering degree (civil, building services, electrical or automation).', experience: '3 to 5 years' },
  { slug: 'electrical-design-engineer', title: 'Electrical Design Engineer', openings: 3, education: 'Engineering degree (civil, building services, electrical or automation).', experience: '2 to 3 years' },
  { slug: 'hvac-design-engineer', title: 'HVAC Design Engineer', openings: 3, education: 'Engineering degree (civil, building services, electrical or automation). Heating, ventilation and air conditioning design.', experience: '2 to 3 years' },
  { slug: 'electrician', title: 'Electrician', openings: 10, education: 'Electrician qualification. ANRE authorisation (any grade) is an advantage.', experience: 'Entry level up to 3 years' },
  { slug: 'refrigeration-technician', title: 'Refrigeration Technician', openings: 10, education: 'Refrigeration technician qualification. AGFR certification is an advantage.', experience: '2 to 3 years' },
  { slug: 'welder', title: 'Welder', openings: 6, education: 'Professional welder qualification (ANC).', experience: '2 to 3 years' },
];

export const TOTAL_OPENINGS = JOBS.reduce((a, j) => a + j.openings, 0);

export function applyHref(title?: string) {
  const subject = title ? `Application - ${title}` : 'Application - Modularix / Synotech';
  const body = [
    'Hello,',
    '',
    title ? `I would like to apply for the position of ${title}.` : 'I would like to apply to join your team.',
    '',
    'My CV is attached, together with copies of my diplomas, certifications and references.',
    '',
    'Full name:',
    'Phone:',
    'City:',
  ].join('\n');
  return `mailto:${CAREERS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

