import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage from '@/components/LegalPage';
import { LEGAL } from '@/data/site';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'The terms that apply when you use the Modularix website and configurator.',
};

export default function TermsPage() {
  return (
    <LegalPage sheet="Legal - Terms" legend="Legal - Terms" title="Terms of Use">
      <p>These terms apply to your use of the Modularix website and configurator (the "Site"). By using the Site you accept them. If you do not agree, please do not use it.</p>

      <h2>1. Who we are</h2>
      <p>The Site is operated by <strong>{LEGAL.entity}</strong>, {LEGAL.address}, trade register {LEGAL.regNo}, tax ID {LEGAL.vat}. Contact: <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>.</p>

      <h2>2. Information only, not an offer</h2>
      <p>Content on the Site, including descriptions, dimensions, capacities, ratings, images and renderings, is general information. It is not an offer capable of acceptance. Illustrations and videos may show configurations, options or concepts that differ from the delivered product. Specifications can change without notice. Binding terms exist only in a written quotation or contract signed by us.</p>

      <h2>3. The configurator</h2>
      <p>The configurator gives indicative figures to help you scope a project. Results are estimates, they are not a quotation, a guarantee of performance or an engineering design, and they must be confirmed with us before you rely on them. Sending a quote request does not create a contract.</p>

      <h2>4. Acceptable use</h2>
      <p>You agree not to interfere with the Site or its security, attempt unauthorised access, scrape it at a scale that harms its operation, introduce malware, or use it for unlawful purposes. You must give accurate information when you contact us.</p>

      <h2>5. Intellectual property</h2>
      <p>The Site, its text, drawings, designs, images, videos, software, names and logos belong to us or our licensors and are protected by copyright and trademark law. You may view the Site and print or share pages for your own business evaluation. Any other use, including copying, adapting or republishing, needs our written permission. "Synotech" and "Modularix" and related marks are our marks.</p>

      <h2>6. Third-party links</h2>
      <p>The Site links to third-party sites such as the Uptime Institute register. We do not control them and are not responsible for their content or practices.</p>

      <h2>7. Disclaimer and liability</h2>
      <p>We work to keep the Site accurate and available, but it is provided "as is" without warranties of any kind, to the extent the law allows. We are not liable for loss arising from your use of or reliance on the Site, for interruptions, or for third-party content, except where the law does not allow us to exclude liability, for example for intent, gross negligence, or death or personal injury caused by negligence. Nothing in these terms limits your statutory rights as a consumer, where you are one.</p>

      <h2>8. Personal data and cookies</h2>
      <p>How we handle personal data is described in the <Link href="/privacy">Privacy Policy</Link> and the <Link href="/cookies">Cookie Policy</Link>.</p>

      <h2>9. Changes</h2>
      <p>We may update the Site and these terms at any time. The version published here, with the date above, applies from the day it is posted.</p>

      <h2>10. Governing law</h2>
      <p>These terms are governed by Romanian law. The competent courts of Bucharest have jurisdiction, without affecting any mandatory consumer rights to bring a claim in your country of residence.</p>
    </LegalPage>
  );
}
