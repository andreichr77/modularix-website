import type { MetadataRoute } from 'next';
import { SITE } from '@/data/site';
import { SOLUTIONS } from '@/data/solutions';

export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/journey', '/projects', '/configure', '/configurator', '/company', ...SOLUTIONS.map((x) => `/solutions/${x.slug}`)].map((p) => ({ url: `${SITE.url}${p}`, changeFrequency: 'monthly', priority: p === '' ? 1 : 0.7 }));
}
